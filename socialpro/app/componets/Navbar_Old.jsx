"use client";

import React from 'react';
import styles from '../styles/Navbar.module.css';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { reset } from '../../src/config/redux/reducer/authReducer/index.js';


function Navbar() {
    const router = useRouter();

    const authState = useSelector((state) => state.auth); 
    const dispatch = useDispatch();   
  return (
    <div className={styles.container}>
        <nav className={styles.navBar}>
            <h2 style={{cursor: "pointer"}} onClick={()=>{
                router.push("/")
            }}>Pro Connect</h2>
            <div className={styles.navBarOptionContainer}>

                {authState.profileFetched && <div>
                    <div style={{display:"flex",gap:"1.2rem"}}>
                        <p>Hey, {authState.user.userId.name}</p>
                        <p style={{fontWeight:"bold",cursor:"pointer"}}>Profile</p>
                        <p style={{fontWeight:"bold",cursor:"pointer"}} onClick={()=>{
                            localStorage.removeItem("token");
                            router.push("/login");
                            dispatch(reset());
                        }}>Logout</p>
                    </div>
                    
                </div>}

                {!authState.profileFetched && <div onClick={()=>{
                    router.push("/login")
                }} className={styles.buttonJoin}>
                    <p>Be a part</p>
                </div>}

            </div>
        </nav>
    </div>
  )
}

export default Navbar
