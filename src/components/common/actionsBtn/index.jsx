import { Delete, Edit } from '@mui/icons-material';
import { IconButton} from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';


export const ActionsBtn = ({ EditLink, DeleteItem }) => {

    const {t} = useTranslation();
    const hadleDelete = () => {

        Swal.fire({
            title: t("messages:Are_you_sure"),
            text: t("messages:You won't be able to revert this"),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: t("messages:Yes delete it")
        }).then((result) => {
            if (result.isConfirmed) {
                DeleteItem();
            }
        });

    };
    return (
        <div>
            <Link to={EditLink}>
                <IconButton title={t('Edit')}>
                    <Edit fontSize="small" color='info'/>
                </IconButton>
            </Link>
            <IconButton onClick={hadleDelete} title={t('Delete')}>
                <Delete fontSize="small" color='error' />
            </IconButton>
        </div>
    );
};