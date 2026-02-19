"use client";
import React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllPosts,
  deletePost,
} from "../../src/config/redux/actions/postAction";
import {
  fetchUserProfile,
  getAllUsers,
} from "../../src/config/redux/actions/authAction";
import UserLayout from "../componets/UserLayout";
import DashBoardLayout from "../componets/DashBoardLayout";
import styles from "./styles.module.css";
import { BASE_URL } from "../../src/config";

import { reset } from "../../src/config/redux/reducer/postReducer";

import Loader from "../componets/Loader";
import { createPost,incrementLikes, getAllComments,postComment } from "../../src/config/redux/actions/postAction";
import { getValidToken, handleAuthError, clearOldToken } from "../utils/tokenUtils";


function Dashboard() {
  const router = useRouter();
  const authState = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const [postContent, setPostContent] = useState("");
  const [fileContent, setFileContent] = useState();
  const[commentText,setCommentText] = useState('');

  const postState = useSelector((state) => state.posts);

  useEffect(() => {
    // Check for valid token on component mount
    const token = getValidToken();
    if (!token) {
      console.log('No valid token found, redirecting to login...');
      router.push('/login');
      return;
    }

    if (authState.isTokenThere) {
      dispatch(getAllPosts());
      dispatch(fetchUserProfile({ token }));

      if (!authState.all_profiles_fetched) {
        dispatch(getAllUsers());
      }
    }
  }, [authState.isTokenThere, router]);

  // Add error handling for API requests
  useEffect(() => {
    if (postState.error && handleAuthError(postState.error)) {
      router.push('/login');
    }
    if (authState.error && handleAuthError(authState.error)) {
      router.push('/login');
    }
  }, [postState.error, authState.error, router]);

  // Freeze background scroll when comments modal is open
  // useEffect(() => {
  //   if (postState.postId !== "") {
  //     document.body.style.overflow = "hidden";
  //   } else {
  //     document.body.style.overflow = "auto";
  //   }
  //   return () => {
  //     document.body.style.overflow = "auto";
  //   };
  // }, [postState.postId]);

  const handleUpload = async () => {
    await dispatch(createPost({ body: postContent, file: fileContent }));
    setPostContent("");
    setFileContent(null);
    dispatch(getAllPosts());
  };

  if (authState.user) {
    return (
      <UserLayout>
        <DashBoardLayout>
          <div className={styles.wrapper} style={{ padding: '0', maxWidth: '100%', margin: '0' }}>
            <div className={styles.scrollComponent}>
              <div className={styles.createPostContainer}>
                <img
                  className={styles.profilePicture}
                  src={`${BASE_URL}/${authState.user.userId.profilePicture}`}
                  alt="Profile"
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <textarea
                      name=""
                      id=""
                      className={styles.textareaOfContent}
                      placeholder="What's in your mind?"
                      onChange={(e) => setPostContent(e.target.value)}
                      value={postContent}
                      style={{ 
                        width: '100%',
                        paddingRight: '45px',
                        resize: 'none', 
                        height: '45px',
                        maxHeight: '100px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '25px',
                        padding: '12px 45px 12px 16px',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        transition: 'all 0.3s ease',
                        background: '#fafafa',
                        overflow: 'hidden'
                      }}
                      onInput={(e) => {
                        e.target.style.height = 'auto';
                        e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
                      }}
                    ></textarea>
                    <label 
                      htmlFor="fileInput" 
                      style={{ 
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        display: 'flex', 
                        alignItems: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <div className={styles.Fab} style={{ width: '30px', height: '30px' }}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          style={{ width: '16px', height: '16px' }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 4.5v15m7.5-7.5h-15"
                          />
                        </svg>
                      </div>
                    </label>
                  </div>
                  {postContent.length > 0 && (
                    <div 
                      className={styles.uploadButton} 
                      onClick={handleUpload}
                      style={{ 
                        padding: '8px 16px',
                        fontSize: '13px',
                        borderRadius: '20px',
                        minWidth: '60px'
                      }}
                    >
                      Post
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  id="fileInput"
                  hidden
                  onChange={(e) => setFileContent(e.target.files[0])}
                />
              </div>
            </div>
            <div className={styles.postsContainer}>
              {postState.posts.map((post) => {
                return (
                  <div key={post._id} className={styles.singleCardContainer}>
                    <div className={styles.singleCard__profileContainer}>
                      <img
                        className={styles.profilePicture}
                        src={`${BASE_URL}/${authState.user.userId.profilePicture}`}
                        alt="Profile"
                      />
                      <div>
                        <div
                          style={{
                            display: "flex",
                            gap: "1rem",
                            justifyContent: "space-between",
                          }}
                        >
                          <p style={{ fontWeight: "bold" }}>
                            {post.userId.name}
                          </p>
                          {post.userId._id === authState.user.userId._id && (
                            <div
                              style={{ cursor: "pointer" }}
                              onClick={async () => {
                                await dispatch(deletePost(post._id));
                                dispatch(getAllPosts());
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="size-6"
                                style={{ height: "1.4em", color: "red" }}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                        <p style={{ color: "gray" }}>@{post.userId.username}</p>
                        <p style={{ paddingTop: "1.3rem" }}>{post.body}</p>

                        <div className={styles.singleCard__image}>
                          {post.media && (
                            <img
                              src={`${BASE_URL}/${post.media}`}
                              alt="Post Image"
                              className={styles.postImage}
                            />
                          )}
                        </div>
                        <div className={styles.optionsContainer}>
                          <div className={styles.singleOption__optionContainer} onClick={async ()=>{
                            await dispatch(incrementLikes({postId: post._id}))
                            dispatch(getAllPosts());
                          }}>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="size-6"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z"
                              />
                            </svg>
                            <p>{post.likes}</p>
                          </div>
                          <div className={styles.singleOption__optionContainer} onClick={()=>{
                      
                            dispatch(getAllComments({postId: post._id}));
                          }}>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="size-6"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"
                              />
                            </svg>
                          </div>
                          <div className={styles.singleOption__optionContainer}>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="size-6"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {
            postState.postId !== "" && 
            <div className={styles.commentsContainer} onClick={()=>{
            dispatch(reset());
            dispatch(getAllPosts());
            }}>
              <div className={styles.allCommentsContainer} onClick={(e)=>{
                e.stopPropagation();
              }}>
                {postState.comments.length === 0 && <h2>No comments</h2>}
                
                {postState.comments.map((comment) => (
                  <div key={comment._id} style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img 
                        src={`${BASE_URL}/${comment.userId.ProfilePicture || authState.user.userId.profilePicture}`} 
                        alt="Profile" 
                        style={{ width: '30px', height: '30px', borderRadius: '50%' }}
                      />
                      <div>
                        <p style={{ fontWeight: 'bold', margin: '0' }}>{comment.userId.name}</p>
                        <p style={{ color: 'gray', margin: '0', fontSize: '12px' }}>@{comment.userId.username}</p>
                      </div>
                    </div>
                    <p style={{ margin: '5px 0 0 40px' }}>{comment.body}</p>
                  </div>
                ))}

                <div className={styles.postCommentContainer}>
                    <input type="" value={commentText} onChange={(e)=> setCommentText(e.target.value)} placeholder='Comment'/>

                    <div className={styles.postCommentContainer__commentBtn} onClick={async ()=>{
                      await dispatch(postComment({postId : postState.postId, body: commentText}))
                      setCommentText('');
                      await dispatch(getAllComments({postId : postState.postId}))
                    }}>
                      <p>Comment</p>
                    </div>
                    
                </div>
              </div>
            </div>
          }
        </DashBoardLayout>
      </UserLayout>
    );
  } else {
    return (
      <UserLayout>
        <DashBoardLayout>
          <Loader />
        </DashBoardLayout>
      </UserLayout>
    );
  }
}

export default Dashboard;
