import { createSlice } from "@reduxjs/toolkit";
import { getNotifications, markNotificationAsRead, getUnreadNotificationCount, markAllNotificationsAsRead } from "../../actions/notificationAction";

const initialState = {
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    isError: false,
    message: "",
    notificationsFetched: false
};

const notificationSlice = createSlice({
    name: "notification",
    initialState,
    reducers: {
        resetNotifications: () => initialState,
        addNewNotification: (state, action) => {
            state.notifications.unshift(action.payload);
            if (!action.payload.read) {
                state.unreadCount += 1;
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // Get Notifications
            .addCase(getNotifications.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getNotifications.fulfilled, (state, action) => {
                state.isLoading = false;
                state.notifications = action.payload.notifications;
                state.notificationsFetched = true;
            })
            .addCase(getNotifications.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload?.message || "Failed to fetch notifications";
            })
            
            // Mark Notification as Read
            .addCase(markNotificationAsRead.fulfilled, (state, action) => {
                const notificationId = action.payload.notificationId;
                const notification = state.notifications.find(n => n._id === notificationId);
                if (notification && !notification.read) {
                    notification.read = true;
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            })
            
            // Get Unread Count
            .addCase(getUnreadNotificationCount.fulfilled, (state, action) => {
                state.unreadCount = action.payload.count;
            })
            
            // Mark All as Read
            .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
                state.notifications.forEach(notification => {
                    notification.read = true;
                });
                state.unreadCount = 0;
            });
    }
});

export const { resetNotifications, addNewNotification } = notificationSlice.actions;
export default notificationSlice.reducer;