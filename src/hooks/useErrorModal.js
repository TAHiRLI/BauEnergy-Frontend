import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';

export const useErrorModal = () => {
    //===================
    // translation
    //===================
    const { t } = useTranslation();

    return useCallback(() => {
        Swal.fire({
            title: t("messages:Error"),
            text: t("messages:ErrorMessage"),
            icon: 'error',
            confirmButtonText: 'Ok'
        });
    }, [t]);
};