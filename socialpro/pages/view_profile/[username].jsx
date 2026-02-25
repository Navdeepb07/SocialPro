import React, { useEffect, useState } from "react";
import clientServer from "../../src/config";
import DashBoardLayout from "../../app/componets/DashBoardLayout";
import UserLayout from "../../app/componets/UserLayout";
import { BASE_URL } from "../../src/config";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUserProfile,
  getAllUsers,
  sendConnectionRequest,
  getAllMyConnections,
} from "../../src/config/redux/actions/authAction";
import { getUserPostsByUsername } from "../../src/config/redux/actions/postAction";
import { sendMessage } from "../../src/config/redux/actions/messageAction";
import styles from "../view_profile/profile.module.css";

export default function ViewProfilePage({ userProfile }) {
  const dispatch = useDispatch();
  const postState = useSelector((state) => state.posts);
  const authState = useSelector((state) => state.auth);
  const [isCurrentUserConnected, setIsCurrentUserConnected] = useState(false);
  const [hasRequestPending, setHasRequestPending] = useState(false);

  useEffect(() => {
    // Initialize user profile and data when component mounts
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(fetchUserProfile({ token }));
      dispatch(getAllUsers());
      dispatch(getAllMyConnections({ token })); // Gets all my connections in both directions
    }

    // Fetch user posts using Redux action
    if (userProfile && userProfile.userId && userProfile.userId.username) {
      dispatch(getUserPostsByUsername(userProfile.userId.username));
    }
  }, [dispatch, userProfile]);

  useEffect(() => {
    if (userProfile && userProfile.userId && authState.user) {
      let isConnected = false;
      let hasPendingRequest = false;

      const targetUserId = userProfile.userId._id;

      // Check sent requests (requests I sent to others)
      if (authState.sentRequests && authState.sentRequests.length > 0) {
        const sentToThisUser = authState.sentRequests.find((request) => {
          // Handle cases where connectionId might not be populated
          const connectionId =
            request.connectionId?._id || request.connectionId;
          return connectionId === targetUserId;
        });

        if (sentToThisUser) {
          if (sentToThisUser.status === true) {
            isConnected = true;
          } else {
            hasPendingRequest = true;
          }
        }
      }

      // Check received requests (requests others sent to me) - only if not already connected
      if (
        !isConnected &&
        authState.receivedRequests &&
        authState.receivedRequests.length > 0
      ) {
        const receivedFromThisUser = authState.receivedRequests.find(
          (request) => {
            // Handle cases where userId might not be populated
            const userId = request.userId?._id || request.userId;
            return userId === targetUserId && request.status === true;
          }
        );

        if (receivedFromThisUser) {
          isConnected = true;
        }
      }

      setIsCurrentUserConnected(isConnected);
      setHasRequestPending(hasPendingRequest);
    }
  }, [authState.sentRequests, authState.receivedRequests, userProfile]);

  // Handle send message functionality
  const handleSendMessage = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in to send messages");
        return;
      }

      // Instead of sending an automatic message, we'll trigger the messaging widget
      // and set up the conversation. We'll use a custom event to communicate with the messaging widget
      const messageEvent = new CustomEvent('openMessagingConversation', {
        detail: {
          userId: userProfile.userId._id,
          userName: userProfile.userId.name,
          userAvatar: userProfile.userId.profilePicture
        }
      });
      
      window.dispatchEvent(messageEvent);
      
    } catch (error) {
      console.error("Error opening conversation:", error);
      alert("Failed to open conversation. Please try again.");
    }
  };

  return (
    <UserLayout>
      <DashBoardLayout>
        <div className={styles.container}>
          <div className={styles.profileWrapper}>
            {/* Header Section with Cover and Profile Picture */}
            <div className={styles.backDropContainer}>
              <img
                src={`${BASE_URL}/${userProfile?.userId?.profilePicture || 'default.jpeg'}`}
                alt={`${userProfile?.userId?.name || 'User'}'s profile`}
                onError={(e) => {
                  e.target.src = `${BASE_URL}/default.jpeg`;
                }}
              />
            </div>

            {/* Profile Information Section */}
            <div className={styles.profileHeader}>
              <div className={styles.profileInfo}>
                <h1>{userProfile.userId.name}</h1>
                <p className={styles.username}>
                  @{userProfile.userId.username}
                </p>
                {userProfile.currentPost && (
                  <p className={styles.currentPost}>
                    {userProfile.currentPost}
                  </p>
                )}
                {userProfile.bio && (
                  <p className={styles.bio}>{userProfile.bio}</p>
                )}

                {/* Connect/Connected Button and Send Message */}
                <div
                  style={{
                    marginTop: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  {isCurrentUserConnected ? (
                    <>
                      <button
                        className={styles.connectedButton}
                        style={{
                          background: "#e8f4f8",
                          color: "#0077b5",
                          border: "2px solid #0077b5",
                          borderRadius: "25px",
                          padding: "10px 20px",
                          fontSize: "14px",
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                        }}
                      >
                        ✓ Connected
                      </button>
                      <button
                        className={styles.messageButton}
                        style={{
                          background: "linear-gradient(135deg, #0077b5, #005582)",
                          color: "white",
                          border: "none",
                          borderRadius: "25px",
                          padding: "10px 20px",
                          fontSize: "14px",
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                          boxShadow: "0 2px 8px rgba(0, 119, 181, 0.3)",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = "translateY(-2px)";
                          e.target.style.boxShadow = "0 4px 16px rgba(0, 119, 181, 0.4)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = "translateY(0)";
                          e.target.style.boxShadow = "0 2px 8px rgba(0, 119, 181, 0.3)";
                        }}
                        onClick={handleSendMessage}
                      >
                        💬 Message
                      </button>
                    </>
                  ) : hasRequestPending ? (
                    <button
                      className={styles.pendingButton}
                      style={{
                        background: "#fff3cd",
                        color: "#856404",
                        border: "2px solid #ffeaa7",
                        borderRadius: "25px",
                        padding: "10px 20px",
                        fontSize: "14px",
                        fontWeight: "600",
                        cursor: "not-allowed",
                        transition: "all 0.3s ease",
                      }}
                    >
                      ⏳ Request Sent
                    </button>
                  ) : (
                    <button
                      className={styles.connectButton}
                      style={{
                        background: "linear-gradient(135deg, #0077b5, #005582)",
                        color: "white",
                        border: "none",
                        borderRadius: "25px",
                        padding: "10px 20px",
                        fontSize: "14px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        boxShadow: "0 2px 8px rgba(0, 119, 181, 0.3)",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow =
                          "0 4px 16px rgba(0, 119, 181, 0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow =
                          "0 2px 8px rgba(0, 119, 181, 0.3)";
                      }}
                      onClick={async () => {
                        try {
                          const token = localStorage.getItem("token");

                          const result = await dispatch(
                            sendConnectionRequest({
                              token: token,
                              userId: userProfile.userId._id,
                            })
                          );

                          // Refresh connections after sending request
                          dispatch(getAllMyConnections({ token: token }));
                        } catch (error) {
                          console.error(
                            "Error sending connection request:",
                            error
                          );
                        }
                      }}
                    >
                      + Connect
                    </button>
                  )}
                  <svg
                    style={{
                      width: "24px",
                      height: "24px",
                      cursor: "pointer",
                      marginLeft: "10px",
                    }}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6"
                    onClick={async()=>{
                      const response = await clientServer.get(`/user/download_resume?id=${userProfile.userId._id}`)
                      window.open(`${BASE_URL}/${response.data.url}`,'_blank');
                    }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* About Section */}
            {userProfile.bio && (
              <div className={styles.aboutSection}>
                <h2 className={styles.sectionTitle}>About</h2>
                <p className={styles.aboutText}>{userProfile.bio}</p>
              </div>
            )}

            {/* Experience Section */}
            {userProfile.pastWork && userProfile.pastWork.length > 0 && (
              <div className={styles.sectionCard}>
                <h2 className={styles.sectionTitle}>Experience</h2>
                {userProfile.pastWork.map((work) => (
                  <div key={work._id} className={styles.experienceItem}>
                    <h3 className={styles.itemTitle}>{work.position}</h3>
                    <p className={styles.itemCompany}>{work.company}</p>
                    <p className={styles.itemDuration}>{work.years}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Education Section */}
            {userProfile.education && userProfile.education.length > 0 && (
              <div className={styles.sectionCard}>
                <h2 className={styles.sectionTitle}>Education</h2>
                {userProfile.education.map((edu) => (
                  <div key={edu._id} className={styles.educationItem}>
                    <h3 className={styles.itemTitle}>{edu.degree}</h3>
                    <p className={styles.itemSchool}>{edu.school}</p>
                    {edu.fieldOfStudy && (
                      <p className={styles.itemField}>
                        Field of Study: {edu.fieldOfStudy}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Posts Section */}
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>
                Posts ({postState.userPosts.length})
              </h2>
              {postState.userPostsLoading ? (
                <div className={styles.loadingState}>
                  <p>Loading posts...</p>
                </div>
              ) : postState.userPosts.length > 0 ? (
                <div className={styles.postsContainer}>
                  {postState.userPosts.map((post) => (
                    <div key={post._id} className={styles.postCard}>
                      <div className={styles.postHeader}>
                        <img
                          src={`${BASE_URL}/${userProfile.userId.profilePicture}`}
                          alt={`${userProfile.userId.name}'s profile`}
                          className={styles.postAvatar}
                        />
                        <div className={styles.postUserInfo}>
                          <h4 className={styles.postUserName}>
                            {post.userId.name}
                          </h4>
                          <p className={styles.postDate}>
                            {new Date(post.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <p className={styles.postContent}>{post.body}</p>

                      {post.media && (
                        <img
                          src={`${BASE_URL}/${post.media}`}
                          alt="Post content"
                          className={styles.postImage}
                        />
                      )}

                      <div className={styles.postStats}>
                        <div className={styles.postStat}>
                          <svg viewBox="0 0 24 24" className={styles.statIcon}>
                            <path
                              fill="currentColor"
                              d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z"
                            />
                          </svg>
                          <span>{post.likes || 0} likes</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <p>No posts yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DashBoardLayout>
    </UserLayout>
  );
}

export async function getServerSideProps(context) {
  const request = await clientServer.get("/user/get_profile_username", {
    params: {
      username: context.query.username,
    },
  });

  return {
    props: {
      userProfile: request.data,
    },
  };
}
