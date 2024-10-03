import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';

export default function ProjectOverviewTab({ project }) {

    const formatDate = (date) => {
        return new Intl.DateTimeFormat('en-GB', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }).format(new Date(date));
      };
    return (
        <Box className='!p-0'>
          <Grid container>
            <Grid item xs={12} md={8} >
              <span className='text-2xl font-semibold'>
                Project description
              </span>
              <div className='text-gray-500 mt-3'>
                {project.description}
              </div>
            </Grid>
    
            <Grid item xs={12} md={3.4}>
              <Paper elevation={3} sx={{ padding: 3 }} className='!bg-slate-100'>
                <Typography variant="subtitle1" gutterBottom>
                  Project ID
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {project.id}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  Start Date
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {formatDate(project.startDate)}
                </Typography>
    
                <Typography variant="subtitle1" gutterBottom>
                  End Date
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {formatDate(project.endDate)}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      );
    };


