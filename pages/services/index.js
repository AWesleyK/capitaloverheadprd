import React from 'react';
import navData from '../../data/nav-data.json';
import ServicesPage from '../../components/ServicesSection/ServicesPage/ServicesPage';

export async function getStaticProps() {
  const services = navData.services;
  return {
    props: {
      initialServices: services,
    },
  };
}

const LearnMore = ({ initialServices }) => {
  return (
      <ServicesPage initialServices={initialServices} />
  );
};

export default LearnMore;
