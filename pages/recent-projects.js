// pages/recent-projects.js
import React, { useEffect } from 'react';
import RecentProjects from '@/components/RecetProjects/RecentProjects';
import Layout from '@/components/Layout/Layout';

const RecentProjectsPage = () => {
    return (
        <Layout>
          <RecentProjects />
        </Layout>
      );
}

export default RecentProjectsPage;
