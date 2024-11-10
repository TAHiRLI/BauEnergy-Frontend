import React, { useEffect, useState } from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { projectService } from '../../APIs/Services/project.service';
import { instrumentTagService } from '../../APIs/Services/instrumentTag.service';
import axios from 'axios';

function HomePage() {
  const [chartData, setChartData] = useState({ xLabels: [], seriesData: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get('http://localhost:7000/api/InstrumentTags/projects-tags-instruments'); // Adjust to your endpoint
        processChartData(data);
        console.log(data)
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const processChartData = (data) => {
      const xLabels = data.projects.map((project) => project.projectName);
      const tagNames = [...new Set(data.tags.map((tag) => tag))];
      
      const seriesData = tagNames.map((tag) => ({
        label: tag,
        data: xLabels.map((projectName) => {
          const project = data.projects.find(p => p.projectName === projectName);
          return project ? project.instruments.filter(inst => inst.tags.includes(tag)).length : 0;
        }),
        id: `tag-${tag}`,
      }));

      setChartData({ xLabels, seriesData });
      console.log(chartData)
    };

    fetchData();
  }, []);

  return (
    <BarChart
      width={600}
      height={400}
      series={chartData.seriesData}
      xAxis={[{ data: chartData.xLabels, scaleType: 'band' }]}
    />
  );
}

// export default HomePage;
// import React, { useEffect, useState } from 'react';
// function HomePage() {

//   return (
//     <div>
//       <h2>HomePage</h2>
//     </div>
//   );
// }
export default HomePage;

