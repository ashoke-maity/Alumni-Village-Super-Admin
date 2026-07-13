import React, { useState, useEffect } from 'react';
import {
  AccumulationChartComponent,
  AccumulationSeriesCollectionDirective,
  AccumulationSeriesDirective,
  PieSeries,
  AccumulationLegend,
  AccumulationTooltip,
  AccumulationDataLabel,
  Inject
} from '@syncfusion/ej2-react-charts';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Toast } from '../../../utils';

const JobOpeningsChart = () => {
  const [jobData, setJobData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalJobs, setTotalJobs] = useState(0);
  const [jobs, setJobs] = useState([]); // Store all job details
  const developerRoute = import.meta.env.VITE_DEVELOPER_ROUTE;

  useEffect(() => {
    const fetchJobData = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("developerAuthToken");

        // Fetch job data from API
        const res = await axios.get(
          `${import.meta.env.VITE_DEVELOPER_API_URL}/developer/jobs`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.data && res.data.jobs) {
          const jobs = res.data.jobs;
          setJobs(jobs); // Save all jobs for details table
          setTotalJobs(jobs.length);

          // Process job data to group by job type
          const jobTypeMap = {};
          jobs.forEach(job => {
            const type = job.jobType || 'Other';
            if (jobTypeMap[type]) {
              jobTypeMap[type] += 1;
            } else {
              jobTypeMap[type] = 1;
            }
          });

          // Convert to array format for chart
          const chartData = Object.entries(jobTypeMap).map(([category, count]) => ({
            category,
            count
          }));

          setJobData(chartData.length > 0 ? chartData : [
            { category: 'No Jobs', count: 1 }
          ]);
        } else {
          setJobData([{ category: 'No Jobs', count: 1 }]);
        }
      } catch (error) {
        console.error("Error fetching job data:", error);
        setError("Failed to load job data");
        Toast.error("Failed to load job data");

        // Fallback data
        setJobData([{ category: 'Error Loading Data', count: 1 }]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobData();
  }, []);

  // Customizing tooltip
  const tooltip = { enable: true, format: '${point.x}: <b>${point.y}</b>' };

  // Data label settings
  const dataLabel = {
    visible: true,
    position: 'Inside',
    name: 'text',
    font: {
      fontWeight: '600',
      color: '#ffffff'
    }
  };

  // Legend settings
  const legendSettings = {
    visible: true,
    position: 'Right',
    height: '70%',
    width: '30%'
  };

  const palette = ['#5E81F4', '#8676FF', '#FF9066', '#F7B84B', '#13D8AA'];

  return (
    <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2"/>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>Jobs by Category</h3>
            <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>Distribution of open positions</p>
          </div>
        </div>
        <Link to={`${developerRoute}/developer/dashboard/jobs`} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#7c3aed', fontSize: '12px', fontWeight: 600, textDecoration: 'none', padding: '5px 10px', borderRadius: '8px', background: '#faf5ff', border: '1px solid #ddd6fe' }}>
          Manage Jobs
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </Link>
      </div>
      <div style={{ padding: '16px 8px' }}>
      {loading ? (
        <div style={{ padding: '16px' }}><div style={{ height: '260px', background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)', borderRadius: '8px', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} /><style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style></div>
      ) : error ? (
        <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', background: '#fff1f2', borderRadius: '8px', margin: '16px' }}><p>{error}</p></div>
      ) : (
        <>
          <div style={{ textAlign: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>Total Jobs: <strong style={{ color: '#0f172a' }}>{totalJobs}</strong></span>
          </div>
          <AccumulationChartComponent
            id="job-categories-chart"
            legendSettings={legendSettings}
            tooltip={tooltip}
            height="300px"
            palettes={palette}
            enableSmartLabels={true}
            enableAnimation={true}
          >
            <Inject services={[PieSeries, AccumulationLegend, AccumulationTooltip, AccumulationDataLabel]} />
            <AccumulationSeriesCollectionDirective>
              <AccumulationSeriesDirective
                dataSource={jobData}
                xName='category'
                yName='count'
                radius='80%'
                dataLabel={dataLabel}
                explode={true}
                explodeOffset="10%"
                explodeIndex={0}
              />
            </AccumulationSeriesCollectionDirective>
          </AccumulationChartComponent>
        </>
      )}
      </div>
    </div>
  );
};

export default JobOpeningsChart;