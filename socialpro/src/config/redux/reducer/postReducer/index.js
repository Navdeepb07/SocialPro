import { createSlice } from "@reduxjs/toolkit"
import { getAllComments, getAllPosts, getUserPostsByUsername } from "../../actions/postAction";

const initialState = {
  posts: [],
  userPosts: [],
  isError: false,
  postFetched: false,
  userPostsFetched: false,
  isLoading: false,
  userPostsLoading: false,
  loggedIn: false,
  message:"",
  comments: [],
  postId : "",
};

const postSlice = createSlice({
    name: "posts",
    initialState,
    reducers: { 
        reset:()=> initialState,
        resetPostId:(state)=>{
            state.postId="";
        },

    },
    extraReducers:(builder)=>{
        builder
       .addCase(getAllPosts.pending,(state)=>{
            state.isLoading = true;
            state.message = "Fetching posts...";
        })
        .addCase(getAllPosts.fulfilled,(state,action)=>{
            state.isLoading = false;
            state.postFetched = true;
            state.posts = action.payload.reverse();
            state.isError = false;
        })
        .addCase(getAllPosts.rejected,(state,action)=>{
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload;
        })
        .addCase(getAllComments.fulfilled,(state,action)=>{
            state.postId = action.payload.postId
            state.comments = action.payload.comments;
        })
        .addCase(getUserPostsByUsername.pending,(state)=>{
            state.userPostsLoading = true;
            state.message = "Fetching user posts...";
        })
        .addCase(getUserPostsByUsername.fulfilled,(state,action)=>{
            state.userPostsLoading = false;
            state.userPostsFetched = true;
            state.userPosts = action.payload;
            state.isError = false;
        })
        .addCase(getUserPostsByUsername.rejected,(state,action)=>{
            state.userPostsLoading = false;
            state.isError = true;
            state.message = action.payload;
        })
    }

});

export default postSlice.reducer;
export const {reset,resetPostId} = postSlice.actions;
