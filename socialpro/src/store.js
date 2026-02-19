
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./config/redux/reducer/authReducer";
import postReducer from "./config/redux/reducer/postReducer";
import messageReducer from "./config/redux/reducer/messageReducer";
import notificationReducer from "./config/redux/reducer/notificationReducer";

/**
 * 
 * 
 * STEPS FOR state MAnagement using REDUX TOOLKIT
 * Submit Action
 * Handle action in it's Reducer
 * Register Here -> Reducer
 */

export const store  = configureStore({
    reducer: {
        auth: authReducer,
        posts: postReducer,
        messages: messageReducer,
        notifications: notificationReducer
    }
});
