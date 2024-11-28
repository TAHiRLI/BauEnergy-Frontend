import React, { useEffect, useState } from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { instrumentTagService } from '../../APIs/Services/instrumentTag.service';
import axios from 'axios';

function HomePage() {
  const [chartData, setChartData] = useState({ xLabels: [], seriesData: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await instrumentTagService.GetProjectsTagsInstruments();
        processChartData(data);
        //console.log(data)
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

const processChartData = (data) => {
  const xLabels = data.projects.map((project) => project.projectName);
  const tagNames = [...new Set(data.tags.map((tag) => tag))];
  
  const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#9B59B6', "#FA6546", "#34495E", "FA1111", "#F39C12", "#2ECC71"];

  const seriesData = tagNames.map((tag, index) => ({
    label: tag,
    data: xLabels.map((projectName) => {
      const project = data.projects.find(p => p.projectName === projectName);
      return project ? project.instruments.filter(inst => inst.tags.includes(tag)).length : 0;
    }),
    id: `tag-${tag}`,
    color: colors[index % colors.length] 
  }));

  setChartData({ xLabels, seriesData });
};

    fetchData();
  }, []);

  return (
    <BarChart
      width={800}
      height={400}
      series={chartData.seriesData}
      xAxis={[{ data: chartData.xLabels, scaleType: 'band' }]}
    />
  );
}

export default HomePage;

