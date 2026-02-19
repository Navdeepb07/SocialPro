import { createSlice } from "@reduxjs/toolkit";
import { sendMessage, getConversations, getMessages, markMessagesAsRead, getUnreadMessageCount } from "../../actions/messageAction";

const initialState = {
    conversations: [],
    currentConversation: null,
    messages: [],
    unreadCount: 0,
    isLoading: false,
    isError: false,
    message: "",
    conversationsFetched: false
};

const messageSlice = createSlice({
    name: "message",
    initialState,
    reducers: {
        resetMessages: () => initialState,
        setCurrentConversation: (state, action) => {
            state.currentConversation = action.payload;
        },
        clearMessages: (state) => {
            state.messages = [];
        },
        addNewMessage: (state, action) => {
            state.messages.push(action.payload);
        }
    },
    extraReducers: (builder) => {
        builder
            // Send Message
            .addCase(sendMessage.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(sendMessage.fulfilled, (state, action) => {
                state.isLoading = false;
                state.messages.push(action.payload.message);
            })
            .addCase(sendMessage.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload?.message || "Failed to send message";
            })
            
            // Get Conversations
            .addCase(getConversations.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getConversations.fulfilled, (state, action) => {
                state.isLoading = false;
                state.conversations = action.payload.conversations;
                state.conversationsFetched = true;
            })
            .addCase(getConversations.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload?.message || "Failed to fetch conversations";
            })
            
            // Get Messages
            .addCase(getMessages.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getMessages.fulfilled, (state, action) => {
                state.isLoading = false;
                state.messages = action.payload.messages;
            })
            .addCase(getMessages.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload?.message || "Failed to fetch messages";
            })
            
            // Mark Messages as Read
            .addCase(markMessagesAsRead.fulfilled, (state, action) => {
                // Update unread count
                state.unreadCount = Math.max(0, state.unreadCount - action.payload.markedCount);
            })
            
            // Get Unread Count
            .addCase(getUnreadMessageCount.fulfilled, (state, action) => {
                state.unreadCount = action.payload.count;
            });
    }
});

export const { resetMessages, setCurrentConversation, clearMessages, addNewMessage } = messageSlice.actions;
export default messageSlice.reducer;