import React from 'react';
import { Box, Grid, Paper, Typography, Divider } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import { useTranslation } from "react-i18next";

export default function ProjectOverviewTab({ project }) {
  const { t } = useTranslation();

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
              {t("columns:ProjectTimeline")} 
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              {t("columns:Start Date")} 
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {formatDate(project?.startDate)}
            </Typography>

            <Typography variant="subtitle1" gutterBottom>
              {t("columns:End Date")} 
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
      paddingY: 4,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'top',
      backgroundColor: '#f0f4f8',
      borderRadius: '16px',
      marginBottom: "30px",
    }}
  >
    {/* Team Members Count */}
    <Box textAlign="center" sx={{ width: "50%" }}> 
      <PeopleIcon sx={{ fontSize: 50, color: '#1D34D8' }} />
      <Typography variant="h6" fontWeight="bold" mt={2}>
        {t("TeamMembers")}
      </Typography>
      <Typography variant="h4" fontWeight="bold" color="#1D34D8" mt={1}>
        {project?.teamMembers?.length}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        {t("columns:Membersinvolvedinthisproject")}
      </Typography>
    </Box>

    {/* Divider between counts */}
    <Divider orientation="vertical" flexItem />

    {/* Instruments Used Count */}
    <Box textAlign="center" sx={{ width: "50%" }}>
      <PrecisionManufacturingIcon sx={{ fontSize: 50, color: '#1D34D8' }} />
      <Typography variant="h6" fontWeight="bold" mt={2}>
        {t("columns:InstrumentsUsed")}
      </Typography>
      <Typography variant="h4" fontWeight="bold" color="#1D34D8" mt={1}>
        {project?.instruments?.length}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        {t("columns:Instrumentsusedintheproject")}
      </Typography>
    </Box>
  </Paper>
</Grid>

      </Grid>
    </Box>
  );
}
