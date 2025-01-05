import { IconButton, Menu, MenuItem } from '@mui/material';
import React from 'react';
import de from "../../../assets/images/de.png";
import en from "../../../assets/images/en.png";
import { useTranslation } from 'react-i18next';

export const LangInput = () => {
    const { i18n } = useTranslation();

    const options = [
        { image: de, value: "de", text: "Deutsch" },
        { image: en, value: "en", text: "English" },
    ];

    // Find initial index or default to 0
    const initialIndex = options.findIndex(x => x.value === i18n.language);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [selectedIndex, setSelectedIndex] = React.useState(
        initialIndex !== -1 ? initialIndex : 0
    );

    const open = Boolean(anchorEl);

    const handleClickListItem = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuItemClick = (event, index) => {
        setSelectedIndex(index);
        i18n.changeLanguage(options[index].value);
        setAnchorEl(null);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <IconButton
                id="basic-button"
                aria-controls={open ? 'basic-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClickListItem}
                className='sidebar-button'
            >
                {options[selectedIndex] && (
                    <img src={options[selectedIndex].image} alt={options[selectedIndex].text} width={30} />
                )}
            </IconButton>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                    role: 'listbox',
                }}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                classes={{ paper: 'menu-paper' }}
            >
                {options.map((option, index) => (
                    <MenuItem
                        key={index}
                        selected={index === selectedIndex}
                        onClick={(event) => handleMenuItemClick(event, index)}
                    >
                        <div className='flex items-center'>
                            <img src={option.image} alt={option.text} width={25} />
                            <span className='ms-3 text-sm'>{option.text}</span>
                        </div>
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};
