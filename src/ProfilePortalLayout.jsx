import React from 'react';
import ProfileSidebar from './ProfileSidebar';
import './dharmaKarthaDashboard.css';

export default function ProfilePortalLayout({ children, profile, god }) {
  return (
    <div className="sa-dk-portal-wrap">
      <div className="container sa-dk-layout">
        <ProfileSidebar profile={profile} god={god} />
        <main className="sa-dk-main-panel">
          {children}
        </main>
      </div>
    </div>
  );
}
