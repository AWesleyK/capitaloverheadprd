import { useState, useEffect } from "react";
import styles from "./FAQControl.module.scss";
import { FaTrash, FaEdit, FaPlus, FaSave, FaTimes, FaInfoCircle, FaChevronDown, FaChevronUp, FaUndo } from "react-icons/fa";
import { marked } from 'marked';

export default function FAQControl() {
  const [faqs, setFaqs] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");
  const [editOrder, setEditOrder] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [message, setMessage] = useState("");
  const [expandedIds, setExpandedIds] = useState(new Set());

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const res = await fetch("/api/admin/dashboard/faq/get");
      const data = await res.json();
      if (Array.isArray(data)) {
        setFaqs(data);
      }
    } catch (err) {
      console.error("Failed to load FAQs:", err);
    }
  };

  const toggleExpand = (id) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleRestoreDefaults = async () => {
    if (!confirm("This will restore the original preloaded FAQs that are missing. Existing custom FAQs will not be deleted. Continue?")) return;
    
    try {
      const res = await fetch("/api/admin/dashboard/faq/restore", {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        fetchFaqs();
        setMessage(`${data.restoredCount} FAQ(s) restored`);
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (err) {
      console.error("Failed to restore FAQs:", err);
      setMessage("Restore failed");
    }
  };

  const handleSave = async () => {
    if (!editQuestion.trim() || !editAnswer.trim()) return;
    
    const url = editingId 
      ? "/api/admin/dashboard/faq/update" 
      : "/api/admin/dashboard/faq/save";
    
    const payload = editingId 
      ? { id: editingId, question: editQuestion, answer: editAnswer, order: editOrder }
      : { question: editQuestion, answer: editAnswer, order: editOrder };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (res.ok) {
        fetchFaqs();
        resetForm();
        setMessage(editingId ? "FAQ updated" : "FAQ added");
        setTimeout(() => setMessage(""), 2000);
      } else {
        setMessage("Error saving FAQ");
      }
    } catch (err) {
      console.error("Failed to save FAQ:", err);
      setMessage("Save failed");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;
    try {
      const res = await fetch("/api/admin/dashboard/faq/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        fetchFaqs();
        setMessage("FAQ deleted");
        setTimeout(() => setMessage(""), 2000);
      }
    } catch (err) {
      console.error("Failed to delete FAQ:", err);
    }
  };

  const startEdit = (faq) => {
    setEditingId(faq._id);
    setEditQuestion(faq.question);
    setEditAnswer(faq.answer);
    setEditOrder(faq.order || 0);
    setIsAdding(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setEditQuestion("");
    setEditAnswer("");
    setEditOrder(0);
    setIsAdding(false);
  };

  const expandAll = () => {
    setExpandedIds(new Set(faqs.map(f => f._id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  return (
    <div className={styles.faqControl}>
      <div className={styles.header}>
        <h2 className={styles.title}>FAQ Manager</h2>
        <div className={styles.headerActions}>
          <button className={styles.restoreButton} onClick={handleRestoreDefaults} title="Restore missing default FAQs">
            <FaUndo /> Restore Defaults
          </button>
          {!isAdding && (
            <button className={styles.addButton} onClick={() => setIsAdding(true)}>
              <FaPlus /> Add FAQ
            </button>
          )}
        </div>
      </div>

      {message && <div className={styles.message}>{message}</div>}

      {isAdding && (
        <div className={styles.formCard}>
          <h3>{editingId ? "Edit FAQ" : "Add New FAQ"}</h3>
          <div className={styles.inputGroup}>
            <label>Question</label>
            <input 
              type="text" 
              value={editQuestion} 
              onChange={(e) => setEditQuestion(e.target.value)}
              placeholder="Enter question"
            />
          </div>
          <div className={styles.inputGroup}>
            <label>
              Answer 
              <span className={styles.hint}>
                <FaInfoCircle /> Use [text](url) for links
              </span>
            </label>
            <textarea 
              value={editAnswer} 
              onChange={(e) => setEditAnswer(e.target.value)}
              placeholder="Enter answer"
              rows={4}
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Sort Order</label>
            <input 
              type="number" 
              value={editOrder} 
              onChange={(e) => setEditOrder(parseInt(e.target.value) || 0)}
            />
          </div>
          <div className={styles.formActions}>
            <button className={styles.saveButton} onClick={handleSave}>
              <FaSave /> Save
            </button>
            <button className={styles.cancelButton} onClick={resetForm}>
              <FaTimes /> Cancel
            </button>
          </div>
        </div>
      )}

      <div className={styles.faqListHeader}>
        <h3>Existing FAQs</h3>
        {faqs.length > 0 && (
          <div className={styles.bulkActions}>
            <button onClick={expandAll}>Expand All</button>
            <button onClick={collapseAll}>Collapse All</button>
          </div>
        )}
      </div>

      <div className={styles.faqList}>
        {faqs.length === 0 ? (
          <p>No FAQs found.</p>
        ) : (
          faqs.map((faq) => {
            const isExpanded = expandedIds.has(faq._id);
            return (
              <div key={faq._id} className={`${styles.faqItem} ${isExpanded ? styles.expanded : ''}`}>
                <div className={styles.faqHeader} onClick={() => toggleExpand(faq._id)}>
                  <div className={styles.faqMainInfo}>
                    <span className={styles.faqOrder}>#{faq.order}</span>
                    <strong className={styles.faqQuestion}>{faq.question}</strong>
                  </div>
                  <div className={styles.faqHeaderActions}>
                    <div className={styles.faqActions}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); startEdit(faq); }} 
                        className={styles.editBtn} 
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(faq._id); }} 
                        className={styles.deleteBtn} 
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                    <span className={styles.expandIcon}>
                      {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                    </span>
                  </div>
                </div>
                
                {isExpanded && (
                  <div className={styles.faqBody}>
                    <div className={styles.answerPreview}>
                      <strong>Answer Preview:</strong>
                      <div 
                        className={styles.markdownContent} 
                        dangerouslySetInnerHTML={{ __html: marked.parse(faq.answer || '') }} 
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
