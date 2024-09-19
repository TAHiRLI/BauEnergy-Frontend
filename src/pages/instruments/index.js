import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { InstrumentActions, useInstruments } from '../../context/instrumentContext';
import { instrumentService } from '../../APIs/Services/instrument.service';
import { useErrorModal } from '../../hooks/useErrorModal';
import DeleteIcon from '@mui/icons-material/Delete';

export const Instruments = () => {
    const [isUpdated, forceUpdate] = useState(false);
    const { state, dispatch } = useInstruments();
    const showError = useErrorModal();

    // Fetch data from API
    useEffect(() => {
        (async () => {
            dispatch({ type: InstrumentActions.start });
            try {
                const res = await instrumentService.getAll();
                console.log("Fetched Instruments:", res);
                dispatch({ type: InstrumentActions.success, payload: res.data });
            } catch (err) {
                console.error("Error fetching instruments:", err);
                dispatch({ type: InstrumentActions.failure, payload: err });
            }
        })();
    }, [dispatch, isUpdated]);

    const handleDelete = async (id) => {
        try {
            await instrumentService.remove(id);
            forceUpdate(x => !x);
        } catch (err) {
            console.error("Error deleting instrument:", err);
            showError();
        }
    };

    if (!state.data || state.data.length === 0) {
        return <div>No instruments found</div>;
    }

    const rows = state.data.map(instrument => ({
        id: instrument.id,
        name: instrument.name,
        isActive: instrument.isActive ? 'Inactive' : 'Active',
        shortDesc: instrument.shortDesc,
        image: instrument.image,
    }));

    const columns = [
        { field: 'id', headerName: 'ID', flex: 0.5, disableColumnMenu: true },
        {
            field: 'image',
            headerName: 'Image',
            flex: 1,
            disableColumnMenu: true,
            renderCell: (params) => (
                <img src={params.value} alt={params.row.name} style={{ width: '100%', height: 'auto' }} />
            ),
        },
        { field: 'name', headerName: 'Name', flex: 1, disableColumnMenu: true },
        { field: 'isActive', headerName: 'Status', flex: 0.5, disableColumnMenu: true },
        { field: 'shortDesc', headerName: 'Description', flex: 2, disableColumnMenu: true },
        {
            field: 'actions',
            headerName: 'Actions',
            type: 'actions',
            flex: 0.5,
            disableColumnMenu: true,
            getActions: (params) => [
                <GridActionsCellItem
                    icon={<DeleteIcon />}
                    label="Delete"
                    onClick={() => handleDelete(params.id)}
                />,
            ],
        },
    ];

    return (
        <Box m={"20px"}>
            <div style={{ width: '100%', overflowX: 'auto' }}>
                <div style={{ minWidth: 1000 }}>
                    <DataGrid
                        sx={{ minWidth: 200 }}
                        density='standard'
                        rowCount={state.data?.totalItems}
                        rows={rows}
                        columns={columns}
                        getRowId={(param) => param.id}
                        checkboxSelection={false} // Make sure checkbox selection is disabled
                        disableColumnSelector // Disable the column selector
                        disableRowSelectionOnClick // Disable row selection when clicking
                        autoHeight // Adjust height based on content
                        aotoWidth
                    />
                </div>
            </div>
        </Box>
    );
};
