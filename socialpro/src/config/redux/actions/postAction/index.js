import { createAsyncThunk } from "@reduxjs/toolkit";

import clientServer from "../../../index.jsx";



export const getAllPosts = createAsyncThunk(
    "posts/getAllPosts",
    async (_,thunkAPI)=>{
        try{
            const response = await clientServer.get('/posts');

            return thunkAPI.fulfillWithValue(response.data)
        }
        catch(err){
            return thunkAPI.rejectWithValue(err.message);
        }
    }
)

export const createPost = createAsyncThunk(
    "posts/createPost",
    async (userData, thunkAPI)=>{
        try{
            const {file,body} = userData;
            const formData = new FormData();
            formData.append('token',localStorage.getItem('token'));
            formData.append('body',body);
            formData.append('media',file);

            const response = await clientServer.post('/post', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }); 
            if(response.status === 200){
                return thunkAPI.fulfillWithValue(response.data);
            }
            else{
                return thunkAPI.rejectWithValue("Failed to create post");
            }
        } 
        catch(err){
            return thunkAPI.rejectWithValue(err.message);
        }  
    }
)

export const deletePost = createAsyncThunk(
    "posts/deletePost",
    async (postId, thunkAPI)=>{
        try{
           const response = await clientServer.delete('/delete_post',{
                data: {
                    token: localStorage.getItem('token'),
                    postId: postId
                }
           });
           if(response.status === 200){
                return thunkAPI.fulfillWithValue(response.data);
            }
            else{
                return thunkAPI.rejectWithValue("Failed to delete post");
            }
        }
        catch(err){
            return thunkAPI.rejectWithValue(err.message);
        }
    }
)


export const incrementLikes = createAsyncThunk(
    "post/incrementLike",
    async ({ postId }, thunkAPI) => {
        try{
            // console.log("post id in action", postId);
            const response = await clientServer.post(`/increment_likes`,{
                postId: postId
            })
            return thunkAPI.fulfillWithValue(response.data)
        }
        catch(err){
            return thunkAPI.rejectWithValue(err.message)
        }
    }
)

export const getAllComments = createAsyncThunk(
    "posts/getAllComments",
    async (postData, thunkAPI)=>{ 
        try{
            const response = await clientServer.get('/get_comments',{
                params :{
                    postId: postData.postId
                }
            });

            return thunkAPI.fulfillWithValue({comments: response.data.comments, postId: postData.postId})
        }   
        catch(err){
            return thunkAPI.rejectWithValue(err.message);
        }
    }
)

export const postComment = createAsyncThunk(
    "post/postComment",
    async (commentData , thunkAPI) => {
        try{
            const response = await clientServer.post(`/comment_post`,{
                token: localStorage.getItem('token'),
                postId: commentData.postId,
                comment: commentData.body
            })
            return thunkAPI.fulfillWithValue({comment: response.data.comment, postId: commentData.postId})
        }
        catch(err){
            return thunkAPI.rejectWithValue(err.message)
        }
    }
)

export const getUserPostsByUsername = createAsyncThunk(
    "posts/getUserPostsByUsername",
    async (username, thunkAPI) => {
        try {
            const response = await clientServer.get('/posts_by_username', {
                params: {
                    username: username
                }
            });
            return thunkAPI.fulfillWithValue(response.data);
        }
        catch (err) {
            return thunkAPI.rejectWithValue(err.message);
        }
    }
)
