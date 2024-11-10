import React, { useEffect, useState } from 'react';
import { notificationService } from '../../APIs/Services/notification.service';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from "../../context/authContext";
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { projectService } from '../../APIs/Services/project.service';

const NotificationModal = ({ open, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotificationIndex, setSelectedNotificationIndex] = useState(null); 
  const [openNotificationContent, setOpenNotificationContent] = useState(false); 

  const { user } = useAuth();
  const decodedToken = user?.token ? jwtDecode(user.token) : null;
  const userId = decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

  useEffect(() => {
    if (open) {
      const fetchNotifications = async () => {
        try {
          const response = await notificationService.getAll(userId);
          setNotifications(response.data);
        } catch (error) {
          console.error('Error fetching notifications:', error);
        }
      };
      fetchNotifications();
    }
  }, [open]);

  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (tabIndex) => {
    setSelectedTab(tabIndex);
  };

  const filteredNotifications = selectedTab === 0
    ? notifications
    : notifications.filter((n) => !n.isRead);

  const handleNotificationClick = async (index, id) => {
    setSelectedNotificationIndex(index);
    setOpenNotificationContent(true);
    onClose();

    try {
      await notificationService.markRead(id);
      const updatedNotifications = notifications.map((n, i) => 
        i === index ? { ...n, isRead: true } : n
      );
      setNotifications(updatedNotifications);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNextNotification = () => {
    if (selectedNotificationIndex < filteredNotifications.length - 1) {
      setSelectedNotificationIndex(selectedNotificationIndex + 1);
    }
  };

  const handlePreviousNotification = () => {
    if (selectedNotificationIndex > 0) {
      setSelectedNotificationIndex(selectedNotificationIndex - 1);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })} ${date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    })}`;
  };

  const selectedNotification = filteredNotifications[selectedNotificationIndex];

  const InstrumentApprovalStatus = {
    Approved: 1,
    Rejected: 2,
  };
  
  const handleDeleteNotification = async (id) => {
    try {
      await notificationService.remove(id); 
      setNotifications(notifications.filter(n => n.id !== id)); 
      setOpenNotificationContent(false); 
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };
  const handleMarkAsUnRead = async (id) => {
    try {
      await notificationService.markUnRead(id);
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === id ? { ...notification, isRead: false } : notification
        )
      ); 
    } catch (error) {
      console.error('Error marking notification as unread:', error);
    }
  };
  const handleApprove = async (instrumentId) => {
    try {
      const result = await projectService.approveOrRejectInstrument(instrumentId, InstrumentApprovalStatus.Approved);
      console.log(result); // Show success message or handle the response accordingly
      // Optionally, refetch notifications or update local state to reflect the change
    } catch (error) {
      console.error("Failed to approve instrument:", error);
    }
  };
  
  const handleReject = async (instrumentId) => {
    try {
      const result = await projectService.approveOrRejectInstrument(instrumentId, InstrumentApprovalStatus.Rejected);
      console.log(result); // Show success message or handle the response accordingly
      // Optionally, refetch notifications or update local state to reflect the change
    } catch (error) {
      console.error("Failed to reject instrument:", error);
    }
  };


  return (
    <>
      {/* First Modal */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 ${open ? '' : 'hidden'}`}
      >
        <div className="bg-white w-full max-w-xl rounded-2xl shadow-lg">
          <div className="flex items-center justify-between p-4 pb-0">
            <h2 className="text-lg font-medium">Notifications</h2>
            <IconButton className="!text-blue-700" aria-label="close" onClick={onClose}>
              <CancelOutlinedIcon />
            </IconButton>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <button
                onClick={() => handleTabChange(0)}
                className={`px-4 py-2 rounded-3xl text-black ${
                  selectedTab === 0 ? 'bg-blue-100' : 'border border-black'
                }`}
              >
                All
              </button>
              <button
                onClick={() => handleTabChange(1)}
                className={`px-4 py-2 rounded-3xl text-black ${
                  selectedTab === 1 ? 'bg-blue-100' : 'border border-black'
                }`}
              >
                Unread
              </button>
            </div>

            {/* Notification List or No Notifications Message */}
            {filteredNotifications.length === 0 ? (
  <div className="text-center text-gray-500">You have no notifications</div>
) : (
  <ul className="space-y-4 border rounded-xl overflow-y-auto max-h-96">
    {filteredNotifications
      .sort((a, b) => Number(a.isRead) - Number(b.isRead))
      .map((notification, index) => (
        <li
          key={notification.id}
          className="flex items-center justify-between p-2 cursor-pointer"
          onClick={() => handleNotificationClick(index, notification.id)}
        >
          <div className="flex items-center space-x-2 w-full">
            {!notification.isRead && (
              <span className="text-blue-500">
                <svg
                  className="w-2.5 h-2.5 fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="12" />
                </svg>
              </span>
            )}
            <div className="w-full">
              <div className="flex justify-between items-center">
                <div className="font-bold text-sm">{notification.title}</div>
                <div className="text-gray-400 text-xs">
                  {formatDate(notification.createdAt)}
                </div>
              </div>
              <p className="text-gray-500 text-xs">{notification.description}</p>

              {/* Conditionally render Approve and Reject icons if hasAction is true */}
              {notification.hasAction && (
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent the main click handler
                      handleApprove(notification.instrumentId);
                    }}
                    className="text-green-500 hover:text-green-600"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="w-5 h-5 fill-current"
                    >
                      <path d="M9 16.2l-3.5-3.5L4 14.2l5 5 10-10-1.5-1.5L9 16.2z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent the main click handler
                      handleReject(notification.instrumentId);
                    }}
                    className="text-red-500 hover:text-red-600"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="w-5 h-5 fill-current"
                    >
                      <path d="M18.3 5.71L16.89 4.3 12 9.17 7.11 4.3 5.7 5.71l4.88 4.88-4.88 4.88 1.41 1.41L12 11.99l4.89 4.88 1.41-1.41-4.88-4.88z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </li>
      ))}
  </ul>
)}

          </div>
        </div>
      </div>

      {/* Second Modal for Notification Content */}
      {openNotificationContent && selectedNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">Notification content</h2>
              <div className="flex items-center space-x-2">
                <div className="text-gray-500 text-sm">
                  {formatDate(selectedNotification.createdAt)}
                </div>
                {/* Delete Notification Button */}
                <IconButton className="!text-blue-700" onClick={() => handleDeleteNotification(selectedNotification.id)}>
                  <DeleteIcon />
                </IconButton>
                {/* Close Modal Button */}
                <IconButton className="!text-blue-700" onClick={() => setOpenNotificationContent(false)}>
                  <CancelOutlinedIcon />
                </IconButton>
              </div>
            </div>

            <div className="flex justify-between mb-4">
              <IconButton
                className={`border ${selectedNotificationIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handlePreviousNotification}
                disabled={selectedNotificationIndex === 0}
                style={{ borderRadius: "8px" }}
              >
                <ArrowBackIosNewIcon className="!text-sm" />
                <span className="text-sm ml-3 font-medium">Previous notice</span>
              </IconButton>

              <IconButton
                className={`relative border ${selectedNotificationIndex === filteredNotifications.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleNextNotification}
                disabled={selectedNotificationIndex === filteredNotifications.length - 1}
                style={{ borderRadius: "8px" }}
              >
                <span className="text-sm mr-3 font-medium">Next notice</span>
                <ArrowForwardIosIcon className="!text-sm" />
              </IconButton>
            </div>

            <div className="text-sm mb-4 border p-2 rounded-xl">
              {selectedNotification?.description}
            </div>

            {/* Mark as Unread Button */}
              <IconButton
                className="!text-blue-700"
                onClick={() => handleMarkAsUnRead(selectedNotification.id)}
              >
                <span className="text-sm font-medium">Mark as Unread</span>
              </IconButton>
          </div>
        </div>
      )}
    </>
  );
};

export default NotificationModal;
