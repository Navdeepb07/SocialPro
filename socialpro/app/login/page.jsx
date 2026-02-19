// Move the login page to the correct app directory structure
"use client";
import LoginComponent from "../componets/LoginComponent";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getValidToken, clearOldToken } from '../utils/tokenUtils';

export default function LoginPage() {
  const router = useRouter();
  
  useEffect(() => {
    const token = getValidToken();
    
    if (token) {
      // User has a valid token, redirect to dashboard
      router.push("/dashboard");
    } else {
      // Clear any invalid/old tokens
      clearOldToken();
    }
  }, [router]);

  return (
    <div>
      <LoginComponent />
    </div>
  );
}
