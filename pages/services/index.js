import React from 'react';
import clientPromise from '../../lib/mongodb';
import ServicesPage from '../../components/ServicesSection/ServicesPage/ServicesPage';

export async function getServerSideProps() {
  try {
    const client = await clientPromise;
    const db = client.db("garage_catalog");
    const services = await db.collection("services").find({}).sort({ createdAt: -1 }).toArray();

    return {
      props: {
        initialServices: JSON.parse(JSON.stringify(services)),
      },
    };
  } catch (err) {
    console.error("Failed to fetch services for SSR:", err);
    return {
      props: {
        initialServices: [],
      },
    };
  }
}

const LearnMore = ({ initialServices }) => {
  return (
      <ServicesPage initialServices={initialServices} />
  );
};

export default LearnMore;
