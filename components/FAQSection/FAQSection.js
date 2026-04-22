import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './FAQSection.module.scss';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { marked } from 'marked';

const FAQSection = ({ initialFaqs = [], limit }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [faqs, setFaqs] = useState(initialFaqs);
  const [loading, setLoading] = useState(initialFaqs.length === 0);

  useEffect(() => {
    if (initialFaqs.length > 0) {
      setFaqs(initialFaqs);
      setLoading(false);
      return;
    }

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

  const displayFaqs = limit ? faqs.slice(0, limit) : faqs;

  if (loading) return null;
  if (faqs.length === 0) return null;

  return (
    <section className={styles.faqSection}>
      <div className={styles.container}>
        <h2 className={styles.heading}>Frequently Asked Questions</h2>
        <div className={styles.faqList}>
          {displayFaqs.map((faq, index) => (
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
        {limit && faqs.length > limit && (
          <div className={styles.viewAllWrapper}>
            <Link href="/about/faq" className={styles.viewAllButton}>
              View All FAQs
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default FAQSection;
