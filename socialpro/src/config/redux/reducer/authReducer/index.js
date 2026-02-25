import { createSlice } from "@reduxjs/toolkit"
import { loginUser, registerUser,fetchUserProfile,getAllUsers,sendConnectionRequest,getConnectionRequests,getMyConnectionRequests,getMySentRequests,acceptConnectionrequest,getAllMyConnections,updateProfileData,updateProfilePicture } from "../../actions/authAction";
import { get } from "http";


const initialState = {
    user:undefined,
    isError:false,
    isSuccess:false,
    isLoading:false,
    loggedIn:false,
    message:"",
    isTokenThere : false,
    profileFetched:false,
    connections:[],
    connectionRequests:[],
    sentRequests:[],
    receivedRequests:[],
    all_users:[],
    all_profiles_fetched:false, 
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        reset:()=> initialState,
        handleLoginUser:(state)=>{
            state.message="Hello";
        },
        emptyMessage:(state)=>{
            state.message="";
        },
        setTokenIsThere:(state)=>{
            state.isTokenThere = true;
        },
        setTokenIsNotThere:(state)=>{
            state.isTokenThere = false;
        }
    },
    extraReducers:(builder)=>{
        builder
        .addCase(loginUser.pending,(state)=>{
            state.isLoading = true;
            state.message = "Knocking the door...";
        })
        .addCase(loginUser.fulfilled,(state,action)=>{
            state.isLoading = false;
            state.isSuccess = true;
            state.loggedIn = true;
            state.message = "Welcome Back!";
            state.user = action.payload;
            state.isError = false;
        })
        .addCase(loginUser.rejected,(state,action)=>{
            state.isLoading = false;
            state.isError = true;
            state.loggedIn = false;
            state.message = action.payload.message || "Unable to Login";
        }) 
        .addCase(registerUser.pending,(state)=>{
            state.isLoading = true;
            state.message = "Creating your account...";
        })
        .addCase(registerUser.fulfilled,(state,action)=>{
            state.isLoading = false;    
            state.isSuccess = true;
            state.message = "Registration Successful! Please Login to continue.";
            state.user = action.payload;
            state.isError = false;
        })
        .addCase(registerUser.rejected,(state,action)=>{
            state.isLoading = false;
            state.isError = true;
            state.message = (action.payload && action.payload.message) || "Unable to Register";
        })  
        .addCase(fetchUserProfile.fulfilled,(state,action)=>{ 
            state.isLoading = false;    
            state.isSuccess = true;  
            state.profileFetched = true;
            state.user = action.payload;
            state.isError = false;
        })
        .addCase(getAllUsers.fulfilled,(state,action)=>{ 
            state.isLoading = false;    
            state.isSuccess = true;  
            state.all_users = action.payload;
            state.all_profiles_fetched = true;
            state.isError = false;
        })
        .addCase(getConnectionRequests.fulfilled,(state,action)=>{
            state.isLoading = false;    
            state.isSuccess = true;  
            state.connections = action.payload;
            state.isError = false;
        })
        .addCase(getConnectionRequests.rejected,(state,action)=>{
            state.message = action.payload.message || "Unable to fetch connection requests";
        })
        
        .addCase(getMyConnectionRequests.fulfilled,(state,action)=>{
            state.isLoading = false;
            state.isSuccess = true;
            state.connectionRequests = action.payload;
            state.isError = false;
        })
        .addCase(getMyConnectionRequests.rejected,(state,action)=>{
            state.message = action.payload.message || "Unable to fetch connection requests";
        })
        
        .addCase(getMySentRequests.fulfilled,(state,action)=>{
            state.isLoading = false;
            state.isSuccess = true;
            state.sentRequests = action.payload;
            state.isError = false;
        })
        .addCase(getMySentRequests.rejected,(state,action)=>{
            state.message = action.payload.message || "Unable to fetch sent requests";
        })
        .addCase(acceptConnectionrequest.fulfilled,(state,action)=>{
            state.isLoading = false;
            state.isSuccess = true;
            state.message = action.payload.message;
            state.isError = false;
        })
        .addCase(sendConnectionRequest.pending,(state)=>{
            state.isLoading = true;
            state.message = "Sending connection request...";
        })
        .addCase(sendConnectionRequest.fulfilled,(state,action)=>{
            state.isLoading = false;
            state.isSuccess = true;
            state.message = action.payload.message;
            state.isError = false;
        })
        .addCase(sendConnectionRequest.rejected,(state,action)=>{
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload.message || "Failed to send connection request";
        })
        .addCase(getAllMyConnections.fulfilled,(state,action)=>{
            state.isLoading = false;
            state.isSuccess = true;
            state.sentRequests = action.payload.sentRequests;
            state.receivedRequests = action.payload.receivedRequests;
            state.isError = false;
        })
        .addCase(getAllMyConnections.rejected,(state,action)=>{
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload.message || "Failed to fetch connections";
        })
        .addCase(updateProfileData.pending,(state)=>{
            state.isLoading = true;
            state.message = "Updating profile...";
        })
        .addCase(updateProfileData.fulfilled,(state,action)=>{
            state.isLoading = false;
            state.isSuccess = true;
            state.message = "Profile updated successfully!";
            state.isError = false;
        })
        .addCase(updateProfileData.rejected,(state,action)=>{
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload.message || "Failed to update profile";
        })
        .addCase(updateProfilePicture.pending,(state)=>{
            state.isLoading = true;
            state.message = "Updating profile picture...";
        })
        .addCase(updateProfilePicture.fulfilled,(state,action)=>{
            state.isLoading = false;
            state.isSuccess = true;
            state.message = "Profile picture updated successfully!";
            state.isError = false;
        })
        .addCase(updateProfilePicture.rejected,(state,action)=>{
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload.message || "Failed to update profile picture";
        })
    }
})

export default authSlice.reducer;
export const {reset,emptyMessage,setTokenIsThere,setTokenIsNotThere} = authSlice.actions;