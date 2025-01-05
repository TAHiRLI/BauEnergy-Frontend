
// import React, { useEffect, useState } from 'react';
// import { BarChart } from '@mui/x-charts/BarChart';
// import { instrumentTagService } from '../../APIs/Services/instrumentTag.service';
// import { useMediaQuery } from '@mui/material';

// function HomePage() {
//   const [chartData, setChartData] = useState({ xLabels: [], seriesData: [] });
//   const [isDataLoaded, setIsDataLoaded] = useState(false); // Added loading state
  
//   // Use `useMediaQuery` to dynamically adjust chart dimensions
//   const isMobile = useMediaQuery('(max-width: 768px)');
//   const chartWidth = isMobile ? 350 : 608;
//   const chartHeight = isMobile ? 250 : 400;

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const { data } = await instrumentTagService.GetProjectsTagsInstruments();
//         processChartData(data);
//         setIsDataLoaded(true); // Mark data as loaded
//       } catch (error) {
//         console.error('Error fetching data:', error);
//       }
//     };

//     const processChartData = (data) => {
//       const xLabels = data.projects.map((project) => project.projectName);
//       //const tagNames = [...new Set(data.tags.map((tag) => tag))];

//       const colors = [
//         '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
//         '#9B59B6', '#FA6546', '#34495E', '#FA1111', '#F39C12', '#2ECC71'
//       ];

//       const seriesData = tagNames.map((tag, index) => ({
//         label: "Used instruments",
//         data: xLabels.map((projectName) => {
//           const project = data.projects.find((p) => p.projectName === projectName);
//           return project ? project.instruments.length : 0;
//         }),
//         id: `tag-${tag}`,
//         color: colors[index % colors.length],
//       }));

//       setChartData({ xLabels, seriesData });
//     };

//     fetchData();
//   }, []);

//   return (
//     <div style={{ display: 'flex', justifyContent: 'center', padding:  '10px' }}>
//       {isDataLoaded ? (
//         <BarChart
//         className="!max-w-[80vw]"
//           width={chartWidth}
//           height={chartHeight}
//           series={chartData.seriesData}
//           xAxis={[{ data: chartData.xLabels, scaleType: 'band' }]}
//         />
//       ) : (
//         <p>Loading chart...</p> 
//       )}
//     </div>
//   );
// }

// export default HomePage;


import React, { useEffect, useState } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import { instrumentTagService } from "../../APIs/Services/instrumentTag.service";
import { useMediaQuery } from "@mui/material";
import { useTranslation } from "react-i18next";

function HomePage() {
  const [chartData, setChartData] = useState({ xLabels: [], seriesData: [] });
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const isMobile = useMediaQuery("(max-width: 768px)");
  const chartWidth = isMobile ? 350 : 608;
  const chartHeight = isMobile ? 250 : 400;

  const { t, i18n } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await instrumentTagService.GetProjectsTagsInstruments();
        processChartData(data);
        setIsDataLoaded(true);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    const processChartData = (data) => {
      const xLabels = data.projects.map((project) => project.projectName);

      const seriesData = [
        {
          label: t("columns:InstrumentsCount"), 
          data: data.projects.map((project) => project.instruments.length),
          color: "#36A2EB",
        },
      ];

      setChartData({ xLabels, seriesData });
    };

    fetchData();
  }, [i18n.language]); 

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "10px" }}>
      {isDataLoaded ? (
        <BarChart
          className="!max-w-[80vw]"
          width={chartWidth}
          height={chartHeight}
          series={chartData.seriesData}
          xAxis={[{ data: chartData.xLabels, scaleType: "band" }]}
        />
      ) : (
        <p>{t("loading")}</p> 
      )}
    </div>
  );
}

export default HomePage;
