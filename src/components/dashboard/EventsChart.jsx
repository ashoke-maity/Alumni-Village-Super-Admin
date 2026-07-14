import React, { useState, useEffect } from 'react';
import {
  ChartComponent,
  SeriesCollectionDirective,
  SeriesDirective,
  Inject,
  ColumnSeries,
  Category,
  DataLabel,
  Tooltip,
  Legend
} from '@syncfusion/ej2-react-charts';
import axios from "../../apis/axios";
import { Link } from 'react-router-dom';
import { Toast } from "../../utils";

const EventsChart = () => {
  const [eventsData, setEventsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalEvents, setTotalEvents] = useState(0);
  const [allEvents, setAllEvents] = useState([]); // Store all event details
  const developerRoute = import.meta.env.VITE_DEVELOPER_ROUTE;

  useEffect(() => {
    const fetchEventsData = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("developerAuthToken");

        // Fetch events data from API
        const res = await axios.get(
          `${import.meta.env.VITE_DEVELOPER_API_URL}/developer/events`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.data && res.data.events) {
          const events = res.data.events;
          setAllEvents(events); // Save all events for details table
          setTotalEvents(events.length);

          // Process event data by month and category
          const monthsMap = {};
          const now = new Date();
          const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

          // Initialize with last 6 months
          for (let i = 0; i < 6; i++) {
            const monthDate = new Date(sixMonthsAgo.getFullYear(), sixMonthsAgo.getMonth() + i, 1);
            const monthKey = monthDate.toLocaleString('default', { month: 'long' });
            monthsMap[monthKey] = { month: monthKey, workshops: 0, seminars: 0, reunions: 0, other: 0 };
          }

          // Populate with actual events
          events.forEach(event => {
            const eventDate = new Date(event.date);
            // Only include events from the last 6 months
            if (eventDate >= sixMonthsAgo) {
              const monthKey = eventDate.toLocaleString('default', { month: 'long' });
              if (monthsMap[monthKey]) {
                // Categorize by event type
                const type = (event.eventType || '').toLowerCase();
                if (type.includes('workshop')) {
                  monthsMap[monthKey].workshops += 1;
                } else if (type.includes('seminar')) {
                  monthsMap[monthKey].seminars += 1;
                } else if (type.includes('reunion')) {
                  monthsMap[monthKey].reunions += 1;
                } else {
                  monthsMap[monthKey].other += 1;
                }
              }
            }
          });

          // Convert to array for chart
          const chartData = Object.values(monthsMap);
          setEventsData(chartData);
        } else {
          // Use empty data with month labels if no events found
          const emptyData = getEmptyMonthsData();
          setEventsData(emptyData);
        }
      } catch (error) {
        console.error("Error fetching events data:", error);
        setError("Failed to load events data");
        Toast.error("Failed to load events data");

        // Use empty data with month labels
        const emptyData = getEmptyMonthsData();
        setEventsData(emptyData);
      } finally {
        setLoading(false);
      }
    };

    fetchEventsData();
  }, []);

  // Helper function to get empty data with month labels
  const getEmptyMonthsData = () => {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const emptyData = [];

    for (let i = 0; i < 6; i++) {
      const monthDate = new Date(sixMonthsAgo.getFullYear(), sixMonthsAgo.getMonth() + i, 1);
      const monthKey = monthDate.toLocaleString('default', { month: 'long' });
      emptyData.push({ month: monthKey, workshops: 0, seminars: 0, reunions: 0, other: 0 });
    }

    return emptyData;
  };

  const primaryxAxis = {
    valueType: 'Category',
    interval: 1,
    majorGridLines: { width: 0 }
  };

  const primaryyAxis = {
    minimum: 0,
    interval: 2,
    majorGridLines: { width: 1 },
    majorTickLines: { width: 0 },
    lineStyle: { width: 0 },
    labelFormat: '{value}'
  };

  const tooltipSettings = {
    enable: true,
    shared: true
  };

  const legendSettings = {
    visible: true,
    position: 'Top',
    padding: 10
  };

  const palette = ['#0096FF', '#FF7F50', '#77DD77', '#B19CD9'];

  return (
    <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg, #0891b2 0%, #22d3ee 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>Events by Month</h3>
            <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>Last 6 months breakdown</p>
          </div>
        </div>
        <Link to={`${developerRoute}/developer/dashboard/events`} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0891b2', fontSize: '12px', fontWeight: 600, textDecoration: 'none', padding: '5px 10px', borderRadius: '8px', background: '#ecfeff', border: '1px solid #a5f3fc' }}>
          Manage Events
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
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>Total Events: <strong style={{ color: '#0f172a' }}>{totalEvents}</strong></span>
          </div>
          <ChartComponent
            id="events-chart"
            primaryXAxis={primaryxAxis}
            primaryYAxis={primaryyAxis}
            tooltip={tooltipSettings}
            legendSettings={legendSettings}
            height="300px"
            palettes={palette}
          >
            <Inject services={[ColumnSeries, Tooltip, DataLabel, Category, Legend]} />
            <SeriesCollectionDirective>
              <SeriesDirective
                dataSource={eventsData}
                xName='month'
                yName='workshops'
                name='Workshops'
                type='Column'
                cornerRadius={{
                  topLeft: 5,
                  topRight: 5
                }}
              />
              <SeriesDirective
                dataSource={eventsData}
                xName='month'
                yName='seminars'
                name='Seminars'
                type='Column'
                cornerRadius={{
                  topLeft: 5,
                  topRight: 5
                }}
              />
              <SeriesDirective
                dataSource={eventsData}
                xName='month'
                yName='reunions'
                name='Reunions'
                type='Column'
                cornerRadius={{
                  topLeft: 5,
                  topRight: 5
                }}
              />
              <SeriesDirective
                dataSource={eventsData}
                xName='month'
                yName='other'
                name='Other'
                type='Column'
                cornerRadius={{
                  topLeft: 5,
                  topRight: 5
                }}
              />
            </SeriesCollectionDirective>
          </ChartComponent>
        </>
      )}
      </div>
    </div>
  );
};

export default EventsChart;