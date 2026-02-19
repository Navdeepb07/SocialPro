"use client";

import React, { use, useEffect } from "react";
import UserLayout from "../componets/UserLayout";
import DashBoardLayout from "../componets/DashBoardLayout";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers } from "../../src/config/redux/actions/authAction";
import styles from "./styles.module.css";
import { BASE_URL } from "../../src/config";
import { useRouter } from "next/navigation";

function Discover() {
  const authState = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!authState.all_profiles_fetched) {
      dispatch(getAllUsers());
    }
  }, [authState.all_profiles_fetched, dispatch]);

  const router = useRouter();

  return (
    <div>
      <UserLayout>
        <DashBoardLayout>
          <div>
            <h1>Discover</h1>
          </div>
          <div className={styles.allUserProfiles}>
            {authState.all_profiles_fetched &&
              authState.all_users.map((user) => (
                <div key={user._id} className={styles.userProfileCard}
                onClick={() => router.push(`/view_profile/${user.userId.username}`)}
                  >
                  <img
                    className={styles.profilePicture}
                    src={`${BASE_URL}/${user.userId.profilePicture}`}
                    alt="Profile"
                  />
                  <div>
                    <h3>{user.userId.name}</h3>
                    <p>@{user.userId.username}</p>
                  </div>
                  
                </div>
              ))}
          </div>
        </DashBoardLayout>
      </UserLayout>
    </div>
  );
}

export default Discover;
