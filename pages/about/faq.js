import React from 'react';
import FAQSection from '../../components/FAQSection/FAQSection';
import navData from '../../data/nav-data.json';
import styles from '../../styles/pageStyles/ServiceAreaCity.module.scss'; // Reusing some styles for consistency

export async function getStaticProps() {
  return {
    props: {
      faqs: navData.faqs || [],
    },
    revalidate: 86400, // Revalidate daily
  };
}

const FAQPage = ({ faqs }) => {
  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <h1 className={styles.title}>Frequently Asked Questions</h1>
        <p className={styles.subtext}>
          Find answers to common questions about garage door repair, installation, and maintenance.
        </p>
      </header>
      
      <main>
        <FAQSection initialFaqs={faqs} />
      </main>
      
      <style jsx>{`
        .wrapper {
          padding-top: 120px;
        }
      `}</style>
    </div>
  );
};

export default FAQPage;
