import React from 'react';
import Navbar from './Navbar';

function UserLayout({children}) {
  return (
    <div className="user-layout">
        <Navbar />
        <main style={{ paddingTop: '52px', minHeight: '100vh', background: 'var(--background-primary)' }}>
          {children}
        </main>
    </div>
  )
}

export default UserLayout