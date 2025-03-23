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
import { userSerivce } from '../../APIs/Services/user.service'
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import Swal from 'sweetalert2';
import { useTranslation } from "react-i18next";

const NotificationModal = ({ open, onClose }) => {
  const { t } = useTranslation();
  
  const [notifications, setNotifications] = useState([]);
  const [selectedNotificationIndex, setSelectedNotificationIndex] = useState(null); 
  const [openNotificationContent, setOpenNotificationContent] = useState(false); 

  const { user } = useAuth();
  const decodedToken = user?.token ? jwtDecode(user.token) : null;
  const userId = decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];


  const fetchNotifications = async () => {
    try {
      const response = await notificationService.getAll(userId);
      console.log(response)
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };
  useEffect(() => {
    if (open) {
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
      fetchNotifications()
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
  const handleApprove = async (instrumentId, notificationId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You are about to approve this instrument.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, approve it!",
      cancelButtonText: "Cancel",
    });
  
    if (result.isConfirmed) {
      try {
        const response = await projectService.approveOrRejectInstrument(
          instrumentId,
          InstrumentApprovalStatus.Approved,
          notificationId
        );
        Swal.fire({
          icon: "success",
          title: "Approved!",
          text: response?.message || "The instrument has been successfully approved.",
        });
        fetchNotifications();
      } catch (error) {
        console.error("Failed to approve instrument:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Something went wrong while approving the instrument.",
        });
      }
    }
  };
  
  const handleReject = async (instrumentId, notificationId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You are about to reject this instrument.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, reject it!",
      cancelButtonText: "Cancel",
    });
  
    if (result.isConfirmed) {
      try {
        const response = await projectService.approveOrRejectInstrument(
          instrumentId,
          InstrumentApprovalStatus.Rejected,
          notificationId
        );
        Swal.fire({
          icon: "success",
          title: t("messages:Rejected!"),
          text: response?.message || "The instrument has been successfully rejected.",
        });
        fetchNotifications();
      } catch (error) {
        console.error("Failed to reject instrument:", error);
        Swal.fire({
          icon: "error",
          title: t("messages:Error"),
          text: t("messages:Something went wrong while rejecting the instrument."),
        });
      }
    }
  };
  

  const handleUserApprove = async (userId, notificationId) => {
    try {
      var response = await userSerivce.approveUser(userId, true);
      await notificationService.markRead(notificationId);
      alert(response.data.message);
      console.log(response)
    } catch (error) {
      console.error("Error approving user:", error);
      alert("Failed to approve user.");
    }
  };
  
  const handleUserReject = async (userId, notificationId) => {
    try {
      var response = await userSerivce.approveUser(userId, false);
      await notificationService.markRead(notificationId);
      console.log(response)
      alert("User rejected and removed!");
    } catch (error) {
      console.error("Error rejecting user:", error);
      alert("Failed to reject user.");
    }
  };


  return (
    <>
      {/* First Modal */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 ${open ? '' : 'hidden'}`} onClick={onClose} >
        <div className="bg-white w-full max-w-xl rounded-2xl shadow-lg" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between p-4 pb-0">
            <h2 className="text-lg font-medium">{t("Notifications")}</h2>
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
                {t("PopUp:All")}
              </button>
              <button
                onClick={() => handleTabChange(1)}
                className={`px-4 py-2 rounded-3xl text-black ${
                  selectedTab === 1 ? 'bg-blue-100' : 'border border-black'
                }`}
              >
              {t("PopUp:Unread")}
              </button>
            </div>

            {/* Notification List or No Notifications Message */}
            {filteredNotifications.length === 0 ? (
              <div className="text-center text-gray-500">{t("PopUp:Youhavenonotifications")}</div>
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
                            <div className="text-gray-400 text-xs"> {formatDate(notification.createdAt)} </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <p className="text-gray-500 text-xs">{notification.description}</p>
                          {/* Conditionally render Approve and Reject icons if hasAction is true */}
                          {/* {notification.hasAction && notification.approvalStatus === 0 && (
                            <div className="flex space-x-2">
                              <div className="flex items-center justify-center w-10 h-10">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent the main click handler
                                    handleApprove(notification.instrumentId, notification.id);
                                  }}
                                  className="text-green-500 hover:text-green-600 rounded-lg bg-gray-200 hover:bg-gray-300 p-1"
                                >
                                  <CheckIcon className="w-4 h-4" />
                                </button>
                              </div>

                              <div className="flex items-center justify-center w-10 h-10">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent the main click handler
                                    handleReject(notification.instrumentId, notification.id);
                                  }}
                                  className="text-red-500 hover:text-red-600 rounded-lg bg-gray-200 hover:bg-gray-300 p-1"
                                >
                                  <CloseIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )} */}

{notification.hasAction && (

  <div className="flex space-x-2">
    {/* Handle Instrument Approvals */}
    {notification.approvalStatus === 0 && notification.instrumentId && (
      <>
        <div className="flex items-center justify-center w-10 h-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleApprove(notification.instrumentId, notification.id);
            }}
            className="text-green-500 hover:text-green-600 rounded-lg bg-gray-200 hover:bg-gray-300 p-1"
          >
            <CheckIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-center w-10 h-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleReject(notification.instrumentId, notification.id);
            }}
            className="text-red-500 hover:text-red-600 rounded-lg bg-gray-200 hover:bg-gray-300 p-1"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>
      </>
    )}

    {/* Handle User Approvals */}
    { notification.userId && (
      <>
        <div className="flex items-center justify-center w-10 h-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleUserApprove(notification.newUserId, notification.id);
            }}
            className="text-green-500 hover:text-green-600 rounded-lg bg-gray-200 hover:bg-gray-300 p-1"
          >
            <CheckIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-center w-10 h-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleUserReject(notification.userId, notification.id);
            }}
            className="text-red-500 hover:text-red-600 rounded-lg bg-gray-200 hover:bg-gray-300 p-1"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>
      </>
    )}
  </div>
)}

                          </div>


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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setOpenNotificationContent(false)}>
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-lg p-6" onClick={(e) => e.stopPropagation()}>
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
