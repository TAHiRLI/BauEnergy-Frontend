import * as React from 'react';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import InstrumentTab from '../../components/ProjectsDetails/ProjectInstrumentTab';
import { useLocation } from 'react-router-dom';
import TeamMember from '../../components/ProjectsDetails/ProjectTeamMembers';

function CustomTabPanel(props) {
  const { children, value, index } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function BasicTabs() {
  const location = useLocation();
  
  const [project, setProject] = useState(location.state?.project || null);
  const [value, setValue] = React.useState(0);

  useEffect(() => {
    if (location.state?.project) {
      setProject(location.state.project); 
    }
  }, [location.state?.project]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Overview" {...a11yProps(0)} />
          <Tab label="Used Instruments" {...a11yProps(1)} />
          <Tab label="Team members" {...a11yProps(2)} />
        </Tabs>
      </Box>

      <CustomTabPanel value={value} index={0}>
        {project ? project.description : 'No project description available'}
      </CustomTabPanel>

      <CustomTabPanel value={value} index={1}>
        <InstrumentTab project={project} />
      </CustomTabPanel>

      <CustomTabPanel value={value} index={2}>
        <TeamMember project={project} />
      </CustomTabPanel>
    </Box>
  );
}
