// /pages/admin/catalog.js
import AdminLayout from "../../components/AdminLayout/AdminLayout";
import { useEffect, useState } from "react";
import styles from "./AdminPage.module.scss";

export default function CatalogPage() {
  const [form, setForm] = useState({
    type: "",
    typeName: "",
    brand: "",
    name: "",
    description: "",
    priceMin: "",
    priceMax: "",
  });
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [catalogItems, setCatalogItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({});
  const [editingImage, setEditingImage] = useState({});
  const [editingFile, setEditingFile] = useState({});
  const [expandedTypes, setExpandedTypes] = useState({});

  const fetchCatalog = async () => {
    const res = await fetch("/api/catalog/get");
    const data = await res.json();
    setCatalogItems(data);
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const handleUpload = async () => {
    if (!file) return alert("Select a file.");
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    setImageUrl(data.url);
    alert("Image uploaded!");
  };

  const handleSubmit = async () => {
    if (!imageUrl) return alert("Upload an image first.");

    const res = await fetch("/api/catalog/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, imageUrl }),
    });

    if (res.ok) {
      alert("Item saved!");
      setForm({ type: "", typeName: "", brand: "", name: "", description: "", priceMin: "", priceMax: "" });
      setFile(null);
      setImageUrl("");
      fetchCatalog();
    } else {
      alert("Failed to save item.");
    }
  };

  const handleEditUpload = async (id) => {
    if (!editingFile[id]) return alert("Select a file.");
    const formData = new FormData();
    formData.append("file", editingFile[id]);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    setEditingImage((prev) => ({ ...prev, [id]: data.url }));
    alert("New image uploaded!");
  };

  const handleUpdate = async (id) => {
    const res = await fetch("/api/catalog/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...editingData[id], imageUrl: editingImage[id] }),
    });

    if (res.ok) {
      alert("Item updated!");
      setEditingId(null);
      fetchCatalog();
    } else {
      alert("Update failed.");
    }
  };

  const handleDelete = async (id) => {
    const res = await fetch(`/api/catalog/delete?id=${id}`, { method: "DELETE" });
    if (res.ok) fetchCatalog();
    else alert("Delete failed.");
  };

  const groupedItems = catalogItems.reduce((acc, item) => {
    const key = item.type || "Other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const toggleExpanded = (type) => {
    setExpandedTypes((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const renderGroup = (type, items) => {
    const sorted = [...items].sort((a, b) => {
      const brandCompare = a.brand.localeCompare(b.brand);
      return brandCompare !== 0 ? brandCompare : a.name.localeCompare(b.name);
    });

    return (
      <div key={type}>
        <h2
          style={{ cursor: "pointer", marginTop: "1.5rem" }}
          onClick={() => toggleExpanded(type)}
        >
          {type} {expandedTypes[type] ? "▲" : "▼"}
        </h2>
        {expandedTypes[type] && (
          <div>
            {sorted.map((item) => (
              <div key={item._id} style={{ marginBottom: "2rem" }}>
                {editingId === item._id ? (
                  <>
                    <div className={styles.formGroup}>
                      <label>Brand:</label>
                      <input
                        type="text"
                        value={editingData[item._id]?.brand || ""}
                        onChange={(e) =>
                          setEditingData((prev) => ({
                            ...prev,
                            [item._id]: {
                              ...prev[item._id],
                              brand: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Name:</label>
                      <input
                        type="text"
                        value={editingData[item._id]?.name || ""}
                        onChange={(e) =>
                          setEditingData((prev) => ({
                            ...prev,
                            [item._id]: {
                              ...prev[item._id],
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
                        value={editingData[item._id]?.description || ""}
                        onChange={(e) =>
                          setEditingData((prev) => ({
                            ...prev,
                            [item._id]: {
                              ...prev[item._id],
                              description: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Price Minimum:</label>
                      <input
                        type="number"
                        value={editingData[item._id]?.priceMin || ""}
                        onChange={(e) =>
                          setEditingData((prev) => ({
                            ...prev,
                            [item._id]: {
                              ...prev[item._id],
                              priceMin: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Price Maximum:</label>
                      <input
                        type="number"
                        value={editingData[item._id]?.priceMax || ""}
                        onChange={(e) =>
                          setEditingData((prev) => ({
                            ...prev,
                            [item._id]: {
                              ...prev[item._id],
                              priceMax: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>New Image (optional):</label>
                      <input
                        type="file"
                        onChange={(e) =>
                          setEditingFile((prev) => ({
                            ...prev,
                            [item._id]: e.target.files?.[0] || null,
                          }))
                        }
                      />
                      <button
                        onClick={() => handleEditUpload(item._id)}
                        className={styles.button}
                      >
                        Upload Image
                      </button>
                      {editingImage[item._id] && (
                        <img src={editingImage[item._id]} className={styles.imagePreview} />
                      )}
                    </div>
                    <button onClick={() => handleUpdate(item._id)} className={styles.button}>
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
                    <h3>{item.brand} - {item.name}</h3>
                    <p>{item.description}</p>
                    <p><strong>Price:</strong> {item.priceMin ? `$${item.priceMin}` : ""}{item.priceMax ? ` - $${item.priceMax}` : ""}</p>
                    <img src={item.imageUrl} alt={item.name} className={styles.imagePreview} />
                    <button
                      className={styles.button}
                      onClick={() => {
                        setEditingId(item._id);
                        setEditingData((prev) => ({
                          ...prev,
                          [item._id]: {
                            brand: item.brand,
                            name: item.name,
                            description: item.description,
                            priceMin: item.priceMin || "",
                            priceMax: item.priceMax || "",
                            typeName: item.typeName,
                            type: item.type,
                          },
                        }));
                        setEditingImage((prev) => ({
                          ...prev,
                          [item._id]: item.imageUrl,
                        }));
                      }}
                      style={{ marginTop: "0.5rem", marginRight: "0.5rem" }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className={styles.button}
                      style={{ background: "#c53030" }}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className={styles.page}>
        <h1>Add Garage Door/Gate</h1>

        <div className={styles.formGroup}>
          <label>Image:</label>
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <button onClick={handleUpload} className={styles.button}>Upload Image</button>
          {imageUrl && <img src={imageUrl} className={styles.imagePreview} alt="Preview" />}
        </div>

        <div className={styles.formGroup}>
          <label>Type:</label>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value, typeName: e.target.options[e.target.selectedIndex].text })}>
            <option value="">Select Type</option>
            <option value="Garage Doors">Garage Door</option>
            <option value="Gates">Gate</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Brand:</label>
          <input type="text" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
        </div>

        <div className={styles.formGroup}>
          <label>Name:</label>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>

        <div className={styles.formGroup}>
          <label>Description:</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} />
        </div>

        <div className={styles.formGroup}>
          <label>Price Minimum:</label>
          <input type="number" value={form.priceMin} onChange={(e) => setForm({ ...form, priceMin: e.target.value })} />
        </div>

        <div className={styles.formGroup}>
          <label>Price Maximum:</label>
          <input type="number" value={form.priceMax} onChange={(e) => setForm({ ...form, priceMax: e.target.value })} />
        </div>

        <button onClick={handleSubmit} className={styles.button}>Save Catalog Item</button>

        <hr style={{ margin: "2rem 0" }} />
        <h2>Catalog Items</h2>
        {Object.entries(groupedItems).map(([type, items]) => renderGroup(type, items))}
      </div>
    </AdminLayout>
  );
}
