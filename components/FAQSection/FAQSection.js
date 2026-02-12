import React, { useState, useEffect } from 'react';
import styles from './FAQSection.module.scss';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { marked } from 'marked';

const FAQSection = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await fetch('/api/faq/get');
        const data = await res.json();
        if (Array.isArray(data)) {
          setFaqs(data);
        }
      } catch (err) {
        console.error('Failed to fetch FAQs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, []);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  if (loading) return null;
  if (faqs.length === 0) return null;

  return (
    <section className={styles.faqSection}>
      <div className={styles.container}>
        <h2 className={styles.heading}>Frequently Asked Questions</h2>
        <div className={styles.faqList}>
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`${styles.faqItem} ${activeIndex === index ? styles.active : ''}`}
              onClick={() => toggleFAQ(index)}
            >
              <div className={styles.questionBox}>
                <h3 className={styles.question}>{faq.question}</h3>
                {activeIndex === index ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              {activeIndex === index && (
                <div className={styles.answerBox}>
                  <div 
                    className={styles.answer} 
                    dangerouslySetInnerHTML={{ __html: marked.parse(faq.answer || '') }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
