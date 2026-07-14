import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Header, PageTransition } from '../../components/layout';
import Grid7 from '../../components/dashboard/AllDonations';

const DeveloperDonations = () => {
  const location = useLocation();


  return (
    <PageTransition locationKey={location.pathname} className={`dashboard wrapper mt-5 content-center space-y-6 px-2 lg:px-8`}>
      <header className='header mb-4'>
        <Header
          title="Manage Donations"
          description="Filter, sort and access detailed Donation's"
        />
      </header>
      <Grid7 />
    </PageTransition>
  );
};

export default DeveloperDonations;
