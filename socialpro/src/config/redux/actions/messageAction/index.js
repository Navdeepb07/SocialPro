import { createAsyncThunk } from "@reduxjs/toolkit";
import clientServer from "../../../index.jsx";

// Send a message
export const sendMessage = createAsyncThunk(
    "message/sendMessage",
    async(messageData, thunkAPI) => {
        try {
            const response = await clientServer.post("/messages/send", {
                receiverId: messageData.receiverId,
                content: messageData.content,
                token: messageData.token
            });
            return thunkAPI.fulfillWithValue(response.data);
        } catch(error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

// Get all conversations
export const getConversations = createAsyncThunk(
    "message/getConversations", 
    async(userData, thunkAPI) => {
        try {
            const response = await clientServer.get("/messages/conversations", {
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

// Get messages in a conversation
export const getMessages = createAsyncThunk(
    "message/getMessages",
    async(messageData, thunkAPI) => {
        try {
            const response = await clientServer.get("/messages/conversation", {
                params: {
                    userId: messageData.userId,
                    token: messageData.token
                }
            });
            return thunkAPI.fulfillWithValue(response.data);
        } catch(error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

// Mark messages as read
export const markMessagesAsRead = createAsyncThunk(
    "message/markAsRead",
    async(messageData, thunkAPI) => {
        try {
            const response = await clientServer.post("/messages/mark-read", {
                conversationId: messageData.conversationId,
                token: messageData.token
            });
            return thunkAPI.fulfillWithValue(response.data);
        } catch(error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

// Get unread message count
export const getUnreadMessageCount = createAsyncThunk(
    "message/getUnreadCount",
    async(userData, thunkAPI) => {
        try {
            const response = await clientServer.get("/messages/unread-count", {
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