import React from 'react';
import { Box, Grid, Paper, Typography, Divider } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';

export default function ProjectOverviewTab({ project }) {
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

  return (
    <Box className='!p-0'>
      <Grid container spacing={4} sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* Project Description */}
        <Grid item xs={12} md={8}>
          <Typography variant="h5" fontWeight="bold">
            Project Description
          </Typography>
          <Typography variant="body1" color="textSecondary" mt={2}>
            {project?.description}
          </Typography>
        </Grid>

        {/* Project Dates - Stays on the far right */}
        <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Paper elevation={1} sx={{ padding: 4, backgroundColor: '#f0f4f8', borderRadius: '16px', width: '100%' }}>
            <Typography variant="h6" fontWeight="bold" color="#1D34D8">
              Project Timeline
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              Start Date
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {formatDate(project?.startDate)}
            </Typography>

            <Typography variant="subtitle1" gutterBottom>
              End Date
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {formatDate(project?.endDate)}
            </Typography>
          </Paper>
        </Grid>

        {/* Team Members and Instruments Count */}
        <Grid item xs={12}>
          <Paper
            elevation={3}
            sx={{
              padding: 4,
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              backgroundColor: '#f0f4f8',
              borderRadius: '16px',
              marginBottom: "30px"
            }}
          >
            {/* Team Members Count */}
            <Box textAlign="center" > 
              <PeopleIcon sx={{ fontSize: 50, color: '#1D34D8' }} />
              <Typography variant="h6" fontWeight="bold" mt={2}>
                Team Members
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="#1D34D8" mt={1}>
                {project?.teamMembers?.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Members involved in this project
              </Typography>
            </Box>

            {/* Divider between counts */}
            <Divider orientation="vertical" flexItem />

            {/* Instruments Used Count */}
            <Box textAlign="center">
              <PrecisionManufacturingIcon sx={{ fontSize: 50, color: '#1D34D8' }} />
              <Typography variant="h6" fontWeight="bold" mt={2}>
                Instruments Used
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="#1D34D8" mt={1}>
                {project?.instruments?.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Instruments used in the project
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
