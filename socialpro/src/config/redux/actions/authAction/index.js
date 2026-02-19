import { createAsyncThunk } from "@reduxjs/toolkit";

import clientServer from "../../../index.jsx";


export const loginUser = createAsyncThunk(
    "user/login",
    async(userData, thunkAPI) => {
        try{
            const response = await clientServer.post("/login",{
                email: userData.email,
                password: userData.password,
            });
            if(response.data.token){
                localStorage.setItem("token",response.data.token)
            }
            else{
                return thunkAPI.rejectWithValue({
                    message: "Token not found",
                })
            }

            return thunkAPI.fulfillWithValue(response.data.token);

        }
        catch(error){
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);


export const registerUser = createAsyncThunk(
    "user/register",
    async(userData, thunkAPI) => {
        try{
            const request = await clientServer.post("/register",{
                name: userData.name,
                username: userData.username,
                email: userData.email,
                password: userData.password,
            });
            return request.data;
        }
        catch(error){
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);


export const fetchUserProfile = createAsyncThunk(
    "user/getAboutUser",
    async(user, thunkAPI) => { 
        try{
            const response = await clientServer.get("/get_user_and_profile",{
                params:{
                    token: user.token
                }
            });
            return thunkAPI.fulfillWithValue(response.data);
        }
        catch(error){
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
)

export const getAllUsers = createAsyncThunk(
    "user/getAllUsers",
    async(_,thunkAPI) => {  
        try{
            const response = await clientServer.get("/user/get_all_users");
            return thunkAPI.fulfillWithValue(response.data);
        }  
        catch(error){
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
)

export const sendConnectionRequest = createAsyncThunk(
    "user/sendConnectionRequest",
    async(user, thunkAPI) => {

        try{
            const response = await clientServer.post("/user/send_connection_request",{
                connectToUserId: user.userId,
                token: user.token    
                
            });

            thunkAPI.dispatch(getMyConnectionRequests({token: user.token}));
            return thunkAPI.fulfillWithValue(response.data);
        }
        catch(error){
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
)

export const getConnectionRequests = createAsyncThunk(
    "user/getConnectionRequests",
    async(user, thunkAPI) => {
        try{
            const response = await clientServer.get("/user/getConnectionRequests",{
                params:{    
                    token: user.token
                }
            });
            return thunkAPI.fulfillWithValue(response.data);
        }
        catch(error){
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }   
)

export const getMyConnectionRequests = createAsyncThunk(
    "user/getMyConnectionRequests",
    async(user, thunkAPI) => {  
        try{
            const response = await clientServer.get("/user/user_connection-requests",{
                params:{
                    token: user.token
                }
            });
            return thunkAPI.fulfillWithValue(response.data);
        }
        catch(error){
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
)

export const getMySentRequests = createAsyncThunk(
    "user/getMySentRequests",
    async(user, thunkAPI) => {  
        try{
            const response = await clientServer.get("/user/getConnectionRequests",{
                params:{
                    token: user.token
                }
            });
            return thunkAPI.fulfillWithValue(response.data);
        }
        catch(error){
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
)

export const getAllMyConnections = createAsyncThunk(
    "user/getAllMyConnections",
    async(user, thunkAPI) => {
        try{
            const response = await clientServer.get("/user/get_all_connections",{
                params:{    
                    token: user.token
                }
            });
            return thunkAPI.fulfillWithValue(response.data);
        }
        catch(error){
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }   
)

export const acceptConnectionrequest = createAsyncThunk(
    "user/acceptConnectionrequest",
    async(user, thunkAPI) => {
        try{
            const response = await clientServer.post("/user/accept_connection_request",{
                requestId: user.connectionId,
                accept: user.accept,
                token: user.token
            });
            return thunkAPI.fulfillWithValue(response.data);
        }
        catch(error){
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }   
)

export const updateProfilePicture = createAsyncThunk(
    "user/updateProfilePicture",
    async(userData, thunkAPI) => {
        try{
            const formData = new FormData();
            formData.append('profile_picture', userData.profilePicture);
            formData.append('token', userData.token);
            
            const response = await clientServer.post("/update_profile_picture", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return thunkAPI.fulfillWithValue(response.data);
        }
        catch(error){
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
)

export const updateProfileData = createAsyncThunk(
    "user/updateProfileData",
    async(userData, thunkAPI) => {
        try{
            const response = await clientServer.post("/update_profile", userData);
            return thunkAPI.fulfillWithValue(response.data);
        }
        catch(error){
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
)