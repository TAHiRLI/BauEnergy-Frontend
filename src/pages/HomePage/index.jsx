// import React, { useEffect, useState } from 'react';
// import { BarChart } from '@mui/x-charts/BarChart';
// import { projectService } from '../../APIs/Services/project.service';
// import { instrumentTagService } from '../../APIs/Services/instrumentTag.service';

// function HomePage() {
//   const [projects, setProjects] = useState([]);
//   const [tags, setTags] = useState([]);
//   const [chartData, setChartData] = useState({ xLabels: [], series: [] });

//   useEffect(() => {
//     async function fetchData() {
//       try {
//         // Fetch projects and tags concurrently
//         const [projectResponse, tagResponse] = await Promise.all([
//           projectService.getAll(),
//           instrumentTagService.getAll(),
//         ]);
//         console.log(tagResponse)
//         const projects = projectResponse.data;
//         const tags = tagResponse.data;

//         setProjects(projects);
//         setTags(tags);

//         // Process chart data
//         const xLabels = projects.map((project) => project.name); // X-axis labels (project names)
//         const tagData = {};

//         // Initialize tag data
//         tags.forEach((tag) => {
//           tagData[tag.name] = Array(projects.length).fill(0); // Fill with 0 for all projects initially
//         });

//         // Populate tag data with project values
//         // projects.forEach((project, index) => {
//         //   project.instrumentTags.forEach((tag) => {
//         //     if (tagData[tag.name] !== undefined) {
//         //       tagData[tag.name][index] = tag.value || 0; // Use the `value` property for the data point
//         //     }
//         //   });
//         // });

//         // Convert tagData into series format
//         const series = Object.keys(tags).map((tagName) => ({
//           data: 3,
//           label: tagName,
//           id: tagName,
//         }));

//         setChartData({ xLabels, series });
//       } catch (error) {
//         console.error('Error fetching data:', error);
//       }
//     }

//     fetchData();
//   }, []);

//   return (
//     <div>
//       <h2>HomePage</h2>
//       {chartData.series.length > 0 ? (
//         <BarChart
//           width={700}
//           height={400}
//           series={chartData.series}
//           xAxis={[
//             {
//               data: chartData.xLabels,
//               scaleType: 'band',
//               label: 'Projects',
//             },
//           ]}
//           yAxis={[{ id: 'defaultAxis', label: 'Values' }]}
//         />
//       ) : (
//         <p>Loading chart...</p>
//       )}
//     </div>
//   );
// }

// export default HomePage;
import React, { useEffect, useState } from 'react';
function HomePage() {

  return (
    <div>
      <h2>HomePage</h2>
    </div>
  );
}
export default HomePage;

