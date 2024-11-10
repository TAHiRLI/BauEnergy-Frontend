import * as React from 'react';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import InstrumentTab from '../../components/ProjectsDetails/ProjectInstrumentTab';
import { useLocation } from 'react-router-dom';
import TeamMember from '../../components/ProjectsDetails/ProjectTeamMembers';
import ProjectOverview from '../../components/ProjectsDetails/ProjectOverviewTab';
import { Button, useMediaQuery } from '@mui/material';
import { Add as AddIcon, Share as ShareIcon } from '@mui/icons-material';
import Swal from 'sweetalert2';
import InstrumentTabResponsive from '../../components/ProjectsDetails/InstrumentTabResponsive';
import TeamMemberTabResponsive from '../../components/ProjectsDetails/TeamMemberTabResponsive';
import ProjectDocuments from '../../components/ProjectsDetails/ProjectDocuments';
import LocationOnIcon from '@mui/icons-material/LocationOn';

function CustomTabPanel(props) {
  const { children, value, index } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
    >
      {value === index && <Box sx={{ p: 1, pt: 3 }}>{children}</Box>}
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
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (location.state?.project) {
      setProject(location.state.project); 
    }
  }, [location.state?.project]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const formatDate = (date) => {
    if(!date){
      return
    }
    return new Intl.DateTimeFormat('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  };

  const handleShare = () => {
    const shareData = {
      title: project.name,
      text: `Check out this project: ${project.name}`,
      url: window.location.href,
    };

    if (navigator.share) {
      navigator.share(shareData).catch((err) => {
        console.error('Error sharing:', err);
      });
    } else {
      Swal.fire({
        icon: 'info',
        title: 'Share Link',
        text: `Your browser doesn't support sharing. Please copy the link manually.`,
        footer: `<a href="${window.location.href}" target="_blank">Copy Link</a>`,
      });
    }
  };

  const isSmallScreen = useMediaQuery('(max-width:800px)');
  console.log(project)
  return (
    <Box sx={{ width: '100%' }}>
      
      <div className='sm:flex sm:flex-row flex-col  justify-between items-center pl-2 pr-6 pt-4 sm:pt-0'>

        <div>
          <div className='text-2xl font-semibold'>
            • {project?.name}
          </div>
          <div className='text-gray-600 text-sm mt-2'>
            {formatDate(project?.startDate)} - {formatDate(project?.endDate)}
          </div>
        </div>

        <div className='flex items-center py-3 '>
          <Button
            className='!rounded-2xl !bg-slate-200 !text-black !px-4 mr-0 sm:mr-1'
            startIcon={<ShareIcon />}
            variant="contained"
            sx={{
              textTransform: 'none',
            }}
            onClick={handleShare} // Share button click event
          >
            Share project link
          </Button>
        </div>
      </div>
      <div className='text-gray-500 text-lg mt-1'>
          <LocationOnIcon/> {project?.address}
      </div>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example" variant="scrollable"
        >
          <Tab label="Overview" {...a11yProps(0)} />
          <Tab label="Used Instruments" {...a11yProps(1)} />
          <Tab label="Team members" {...a11yProps(2)} />
          <Tab label="Documents" {...a11yProps(3)} />
        </Tabs>
      </Box>

      <CustomTabPanel value={value} index={0} >
        <ProjectOverview project={project} />
      </CustomTabPanel>

      <CustomTabPanel value={value} index={1}>
      {isSmallScreen ? (
          <InstrumentTabResponsive project={project} />
        ) : (
          <InstrumentTab project={project} />
        )}
      </CustomTabPanel>

      <CustomTabPanel value={value} index={2}>
      {isSmallScreen ? (
          <TeamMemberTabResponsive project={project} />
        ) : (
          <TeamMember project={project} />
        )}
      </CustomTabPanel>
      <CustomTabPanel value={value} index={3}>
        <ProjectDocuments project={project} />
      </CustomTabPanel>
    </Box>
  );
}
