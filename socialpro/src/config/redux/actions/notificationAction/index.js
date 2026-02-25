import { createAsyncThunk } from "@reduxjs/toolkit";
import clientServer from "../../../index.jsx";

// Get all notifications
export const getNotifications = createAsyncThunk(
    "notification/getNotifications",
    async(userData, thunkAPI) => {
        try {
            const response = await clientServer.get("/notifications", {
                params: {
                    token: userData.token
                }
            });
            return thunkAPI.fulfillWithValue(response.data);
        } catch(error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

// Mark notification as read
export const markNotificationAsRead = createAsyncThunk(
    "notification/markAsRead",
    async(notificationData, thunkAPI) => {
        try {
            const response = await clientServer.post("/notifications/mark-read", {
                notificationId: notificationData.notificationId,
                token: notificationData.token
            });
            return thunkAPI.fulfillWithValue(response.data);
        } catch(error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

// Get unread notification count
export const getUnreadNotificationCount = createAsyncThunk(
    "notification/getUnreadCount",
    async(userData, thunkAPI) => {
        try {
            console.log('Sending getUnreadNotificationCount request with token:', {
                hasToken: !!userData.token,
                tokenLength: userData.token ? userData.token.length : 0
            });
            
            const response = await clientServer.get("/notifications/unread-count", {
                params: {
                    token: userData.token
                }
            });
            return thunkAPI.fulfillWithValue(response.data);
        } catch(error) {
            console.error('getUnreadNotificationCount error:', {
                status: error?.response?.status,
                message: error?.response?.data?.message || error?.message,
                fullError: error
            });
            
            // Handle JWT/auth errors specifically
            if (error?.response?.status === 401 || error?.response?.status === 500) {
                const errorMessage = error?.response?.data?.message || error?.message;
                if (errorMessage?.includes('JWT') || errorMessage?.includes('token')) {
                    // Clear invalid tokens
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            }
            
            return thunkAPI.rejectWithValue(error.response?.data || { message: error.message });
        }
    }
);

// Mark all notifications as read
export const markAllNotificationsAsRead = createAsyncThunk(
    "notification/markAllAsRead",
    async(userData, thunkAPI) => {
        try {
            const response = await clientServer.post("/notifications/mark-all-read", {
                token: userData.token
            });
            return thunkAPI.fulfillWithValue(response.data);
        } catch(error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);