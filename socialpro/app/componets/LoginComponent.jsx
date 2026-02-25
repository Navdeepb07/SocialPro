import React from "react";
import UserLayout from "./UserLayout";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector,useDispatch } from "react-redux";
import styles from "../styles/Login.module.css";
import { useState } from "react";
import { registerUser ,loginUser} from "../../src/config/redux/actions/authAction";
import {emptyMessage,reset} from "../../src/config/redux/reducer/authReducer/index.js";

function LoginComponent() {
  const authState = useSelector((state) => state.auth);
  const router = useRouter();

  const [isLoginMethod, setIsLoginMethod] = useState(false);
  const dispatch = useDispatch();

  const[email,setEmail]=useState("");
  const [password,setPassword] =useState("");
  const[name,setName]=useState("");
  const[username,setUsername]=useState("");

  useEffect(() => {
    if (authState.loggedIn) {
      router.push("/dashboard");
    }
  }, [authState.loggedIn]);

  useEffect(() => {
    dispatch(emptyMessage());
  }, [isLoginMethod]);

  useEffect(() => {
  if (localStorage.getItem("token")) {
    router.push("/dashboard");
  }
  }, []);

  const handleRegister = async()=>{
    // console.log("Register clicked");
    dispatch(registerUser({
      name,
      username,
      email,
      password
    }))
  }

  const handleLogin = async()=>{
    console.log("Login clicked");
    dispatch(loginUser({
      email,
      password
    }))
  }

  return (
    <UserLayout>
      <div className={styles.container}>
        <div className={styles.authWrapper}>
          {/* Logo Section - Mobile Only */}
          <div className={styles.logoSection}>
            <div className={styles.logoIcon}>
              <svg viewBox="0 0 24 24" className={styles.logoSvg}>
                <path fill="currentColor" d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"></path>
              </svg>
            </div>
            <h1 className={styles.logoTitle}>Pro Connect</h1>
          </div>

          <div className={styles.cardContainer}>
            {/* Main Auth Form */}
            <div className={styles.cardHeader}>
              <h1 className={styles.cardleft_heading}>
                {isLoginMethod ? "Sign in" : "Join Pro Connect today"}
              </h1>
              {!isLoginMethod && (
                <p className={styles.cardSubtitle}>
                  Connect with professionals and grow your network
                </p>
              )}
            </div>

            {/* Message Display */}
            <div className={styles.messageContainer}>
              {authState.message && (
                <p className={`${styles.messageText} ${authState.isError ? styles.error : styles.success}`}>
                  {typeof authState.message === 'object' ? authState.message.message || authState.message : authState.message}
                </p>
              )}
            </div>

            {/* Form Fields */}
            <div className={styles.inputContainers}>
              {!isLoginMethod && (
                <div className={styles.inputRow}>
                  <input
                    onChange={(e) => setName(e.target.value)}
                    value={name}
                    className={styles.inputField}
                    type="text"
                    placeholder="First and last name"
                    required
                  />
                  <input
                    onChange={(e) => setUsername(e.target.value)}
                    value={username}
                    className={styles.inputField}
                    type="text"
                    placeholder="Username"
                    required
                  />
                </div>
              )}
              
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                className={styles.inputField}
                type="email"
                placeholder="Email"
                required
              />
              
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                className={styles.inputField}
                type="password"
                placeholder="Password"
                required
              />
              
              {/* Submit Button */}
              <button 
                className={styles.submitButton}
                onClick={() => {
                  if (isLoginMethod) {
                    handleLogin();
                  } else {
                    handleRegister();
                  }
                }}
                disabled={authState.isLoading}
              >
                {authState.isLoading ? (
                  <>
                    <span className={styles.loadingSpinner}></span>
                    {isLoginMethod ? "Signing in..." : "Creating account..."}
                  </>
                ) : (
                  <>{isLoginMethod ? "Sign in" : "Agree & Join"}</>
                )}
              </button>
            </div>

            {/* Mode Switch */}
            <div className={styles.switchModeContainer}>
              <p className={styles.switchModeText}>
                {isLoginMethod ? "New to Pro Connect?" : "Already on Pro Connect?"}
              </p>
              <button 
                className={styles.switchModeButton}
                onClick={() => {
                  setIsLoginMethod(!isLoginMethod);
                  // Clear form fields when switching
                  setName('');
                  setUsername('');
                  setEmail('');
                  setPassword('');
                }}
              >
                {isLoginMethod ? "Join now" : "Sign in"}
              </button>
            </div>
          </div>

          {/* Right Side - Desktop Only */}
          <div className={styles.cardContainer_right}>
            <div className={styles.rightContent}>
              <h2 className={styles.rightTitle}>
                {isLoginMethod ? "Welcome back!" : "Connect with professionals"}
              </h2>
              <p className={styles.rightSubtitle}>
                {isLoginMethod 
                  ? "Sign in to continue your professional journey and connect with your network."
                  : "Join millions of professionals who use Pro Connect to grow their careers and build meaningful connections."
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}

export default LoginComponent;
