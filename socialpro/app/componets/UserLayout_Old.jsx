import React from 'react';
import Navbar from './Navbar';

function UserLayout({children}) {
  return (
    <div className="user-layout">
        <Navbar />
        {children}
    </div>
  )
}

export default UserLayout
