import { useEffect, useState } from "react";
import styles from "./styles/AdminPage.module.scss";
import { requireAuth } from "../api/auth/requireAuth";

export const getServerSideProps = (ctx) =>
  requireAuth(ctx, { roles: ["Admin"], minTier: 1 });

// Textarea (one item per line) -> trimmed array
const toLines = (s) =>
  String(s || "").split("\n").map((x) => x.trim()).filter(Boolean);

// Reusable FAQ editor used by both the create and edit forms.
function FaqEditor({ faqs = [], onChange }) {
  const update = (i, field, val) =>
    onChange(faqs.map((f, idx) => (idx === i ? { ...f, [field]: val } : f)));
  const add = () => onChange([...faqs, { question: "", answer: "" }]);
  const remove = (i) => onChange(faqs.filter((_, idx) => idx !== i));

  return (
    <div className={styles.formGroup}>
      <label>FAQs (optional) — added to the page with FAQ schema:</label>
      {faqs.map((f, i) => (
        <div key={i} style={{ border: "1px solid #ddd", borderRadius: 6, padding: "0.75rem", marginBottom: "0.5rem" }}>
          <input
            type="text"
            placeholder="Question"
            value={f.question || ""}
            onChange={(e) => update(i, "question", e.target.value)}
            style={{ width: "100%", marginBottom: "0.4rem" }}
          />
          <textarea
            rows={2}
            placeholder="Answer"
            value={f.answer || ""}
            onChange={(e) => update(i, "answer", e.target.value)}
            style={{ width: "100%" }}
          />
          <button type="button" onClick={() => remove(i)} className={styles.button} style={{ background: "#c53030", marginTop: "0.4rem" }}>
            Remove FAQ
          </button>
        </div>
      ))}
      <button type="button" onClick={add} className={styles.button}>+ Add FAQ</button>
    </div>
  );
}

export default function ServicesPage() {
  const [form, setForm] = useState({ name: "", description: "", metaTitle: "", metaDescription: "", highlights: "", faqs: [] });
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [services, setServices] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingForm, setEditingForm] = useState({});
  const [editingImage, setEditingImage] = useState({});
  const [editingFile, setEditingFile] = useState({});

  const fetchServices = async () => {
    const res = await fetch("/api/services/get");
    const data = await res.json();
    setServices(data);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleUpload = async () => {
    if (!file) return alert("Select an image.");
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    setImageUrl(data.url);
    alert("Image uploaded!");
  };

  const handleSubmit = async () => {
    if (!form.name || !form.description || !imageUrl)
      return alert("Fill out all fields and upload an image.");

    const res = await fetch("/api/services/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, imageUrl, highlights: toLines(form.highlights), faqs: form.faqs }),
    });

    if (res.ok) {
      alert("Service added!");
      setForm({ name: "", description: "", metaTitle: "", metaDescription: "", highlights: "", faqs: [] });
      setImageUrl("");
      setFile(null);
      fetchServices();
    } else {
      alert("Something went wrong.");
    }
  };

  const handleEditUpload = async (id) => {
    if (!editingFile[id]) return alert("Select an image.");
    const formData = new FormData();
    formData.append("file", editingFile[id]);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    setEditingImage((prev) => ({ ...prev, [id]: data.url }));
    alert("Image uploaded!");
  };

  const handleUpdate = async (id) => {
    const updated = {
      id,
      name: editingForm[id].name,
      description: editingForm[id].description,
      imageUrl: editingImage[id],
      metaTitle: editingForm[id].metaTitle || "",
      metaDescription: editingForm[id].metaDescription || "",
      highlights: toLines(editingForm[id].highlights),
      faqs: editingForm[id].faqs || [],
    };

    const res = await fetch("/api/services/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });

    if (res.ok) {
      alert("Service updated!");
      setEditingId(null);
      setEditingForm({});
      setEditingImage({});
      setEditingFile({});
      fetchServices();
    } else {
      alert("Update failed.");
    }
  };

  const handleDelete = async (id) => {
    const res = await fetch(`/api/services/delete?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      alert("Service deleted.");
      fetchServices();
    } else {
      alert("Delete failed.");
    }
  };

  return (
      <div className={styles.page}>
        <h1>Add New Service</h1>

        <div className={styles.formGroup}>
          <label>Image:</label>
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <button onClick={handleUpload} className={styles.button}>Upload Image</button>
          {imageUrl && <img src={imageUrl} className={styles.imagePreview} />}
        </div>

        <div className={styles.formGroup}>
          <label>Service Name:</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Description:</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div className={styles.formGroup}>
          <label>SEO Title (optional) — overrides the page &lt;title&gt;:</label>
          <input
            type="text"
            placeholder="e.g. Garage Door Repair in Oklahoma | Dino Doors"
            value={form.metaTitle}
            onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Meta Description (optional) — search snippet, ~155 chars:</label>
          <textarea
            rows={2}
            value={form.metaDescription}
            onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Highlights (optional) — one per line, shown as a checklist:</label>
          <textarea
            rows={4}
            placeholder={"Same-day service available\nUpfront, honest pricing\nAll major brands serviced"}
            value={form.highlights}
            onChange={(e) => setForm({ ...form, highlights: e.target.value })}
          />
        </div>

        <FaqEditor faqs={form.faqs} onChange={(faqs) => setForm({ ...form, faqs })} />

        <button onClick={handleSubmit} className={styles.button}>Add Service</button>

        <hr style={{ margin: "2rem 0" }} />

        <h2>Existing Services</h2>

        {services.length === 0 ? (
          <p>No services yet.</p>
        ) : (
          services.map((service) => {
            const isEditing = editingId === service._id;

            return (
              <div key={service._id} style={{ marginBottom: "2rem" }}>
                {isEditing ? (
                  <>
                    <div className={styles.formGroup}>
                      <label>Service Name:</label>
                      <input
                        type="text"
                        value={editingForm[service._id]?.name || ""}
                        onChange={(e) =>
                          setEditingForm((prev) => ({
                            ...prev,
                            [service._id]: {
                              ...prev[service._id],
                              name: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Description:</label>
                      <textarea
                        rows={3}
                        value={editingForm[service._id]?.description || ""}
                        onChange={(e) =>
                          setEditingForm((prev) => ({
                            ...prev,
                            [service._id]: {
                              ...prev[service._id],
                              description: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>SEO Title (optional):</label>
                      <input
                        type="text"
                        value={editingForm[service._id]?.metaTitle || ""}
                        onChange={(e) =>
                          setEditingForm((prev) => ({
                            ...prev,
                            [service._id]: { ...prev[service._id], metaTitle: e.target.value },
                          }))
                        }
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Meta Description (optional):</label>
                      <textarea
                        rows={2}
                        value={editingForm[service._id]?.metaDescription || ""}
                        onChange={(e) =>
                          setEditingForm((prev) => ({
                            ...prev,
                            [service._id]: { ...prev[service._id], metaDescription: e.target.value },
                          }))
                        }
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Highlights (optional) — one per line:</label>
                      <textarea
                        rows={4}
                        value={editingForm[service._id]?.highlights || ""}
                        onChange={(e) =>
                          setEditingForm((prev) => ({
                            ...prev,
                            [service._id]: { ...prev[service._id], highlights: e.target.value },
                          }))
                        }
                      />
                    </div>

                    <FaqEditor
                      faqs={editingForm[service._id]?.faqs || []}
                      onChange={(faqs) =>
                        setEditingForm((prev) => ({
                          ...prev,
                          [service._id]: { ...prev[service._id], faqs },
                        }))
                      }
                    />

                    <div className={styles.formGroup}>
                      <label>New Image (optional):</label>
                      <input
                        type="file"
                        onChange={(e) =>
                          setEditingFile((prev) => ({
                            ...prev,
                            [service._id]: e.target.files?.[0] || null,
                          }))
                        }
                      />
                      <button
                        onClick={() => handleEditUpload(service._id)}
                        className={styles.button}
                      >
                        Upload Image
                      </button>
                      {editingImage[service._id] && (
                        <img
                          src={editingImage[service._id]}
                          alt="New"
                          className={styles.imagePreview}
                        />
                      )}
                    </div>

                    <button
                      onClick={() => handleUpdate(service._id)}
                      className={styles.button}
                    >
                      Update
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className={styles.button}
                      style={{ background: "#6b7280", marginLeft: "0.5rem" }}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <h3>{service.name}</h3>
                    <p>{service.description}</p>
                    <img
                      src={service.imageUrl}
                      alt={service.name}
                      style={{
                        width: "100%",
                        maxHeight: 300,
                        objectFit: "cover",
                        borderRadius: 6,
                      }}
                    />
                    <button
                      onClick={() => {
                        setEditingId(service._id);
                        setEditingForm((prev) => ({
                          ...prev,
                          [service._id]: {
                            name: service.name,
                            description: service.description,
                            metaTitle: service.metaTitle || "",
                            metaDescription: service.metaDescription || "",
                            highlights: Array.isArray(service.highlights) ? service.highlights.join("\n") : "",
                            faqs: Array.isArray(service.faqs) ? service.faqs : [],
                          },
                        }));
                        setEditingImage((prev) => ({
                          ...prev,
                          [service._id]: service.imageUrl,
                        }));
                      }}
                      className={styles.button}
                      style={{ marginTop: "0.5rem", marginRight: "0.5rem" }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(service._id)}
                      className={styles.button}
                      style={{ background: "#c53030", marginTop: "0.5rem" }}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
  );
}
