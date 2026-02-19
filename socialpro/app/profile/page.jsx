"use client";
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import UserLayout from '../componets/UserLayout';
import DashBoardLayout from '../componets/DashBoardLayout';
import { fetchUserProfile, updateProfileData, updateProfilePicture } from '../../src/config/redux/actions/authAction';
import { BASE_URL } from '../../src/config';
import styles from './styles.module.css';

function ProfilePage() {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const [editMode, setEditMode] = useState(null); // null, 'bio', 'work', 'picture'
  const [formData, setFormData] = useState({
    bio: '',
    currentPost: '',
    pastWork: [],
    profilePicture: null
  });
  const [newWork, setNewWork] = useState({ company: '', position: '', years: '' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(fetchUserProfile({ token }));
    }
  }, [dispatch]);

  useEffect(() => {
    if (authState.user) {
      setFormData({
        bio: authState.user.bio || '',
        currentPost: authState.user.currentPost || '',
        pastWork: authState.user.pastWork || [],
        profilePicture: null
      });
    }
  }, [authState.user]);

  const handleEditToggle = (section) => {
    setEditMode(editMode === section ? null : section);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleWorkChange = (field, value) => {
    setNewWork(prev => ({ ...prev, [field]: value }));
  };

  const addWorkExperience = () => {
    if (newWork.company && newWork.position && newWork.years) {
      setFormData(prev => ({
        ...prev,
        pastWork: [...prev.pastWork, { ...newWork, id: Date.now() }]
      }));
      setNewWork({ company: '', position: '', years: '' });
    }
  };

  const removeWorkExperience = (id) => {
    setFormData(prev => ({
      ...prev,
      pastWork: prev.pastWork.filter(work => work.id !== id)
    }));
  };

  const handleSave = async (section) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      let dataToSave = {
        token,
        ...formData
      };

      await dispatch(updateProfileData(dataToSave));
      
      // Refresh user profile after update
      dispatch(fetchUserProfile({ token }));
      
      setEditMode(null);
    } catch (error) {
      console.error('Error saving profile data:', error);
    }
  };

  const handleProfilePictureChange = async (event) => {
    const file = event.target.files[0];
    const token = localStorage.getItem('token');
    
    if (file && token) {
      try {
        await dispatch(updateProfilePicture({
          profilePicture: file,
          token: token
        }));
        
        // Refresh user profile after picture update
        dispatch(fetchUserProfile({ token }));
        
        setEditMode(null);
      } catch (error) {
        console.error('Error updating profile picture:', error);
      }
    }
  };

  if (!authState.user) {
    return (
      <UserLayout>
        <DashBoardLayout>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading profile...</p>
          </div>
        </DashBoardLayout>
      </UserLayout>
    );
  }

  const user = authState.user.userId;
  const profile = authState.user;

  return (
    <UserLayout>
      <DashBoardLayout>
        <div className={styles.profileContainer}>
          {/* Cover Photo Section */}
          <div className={styles.coverSection}>
            <div className={styles.coverPhoto}></div>
            
            {/* Profile Picture */}
            <div className={styles.profilePictureSection}>
              <div 
                className={styles.profilePictureContainer}
                onMouseEnter={() => setEditMode('picture-hover')}
                onMouseLeave={() => setEditMode(editMode === 'picture-hover' ? null : editMode)}
              >
                <img
                  src={`${BASE_URL}/${user.profilePicture || 'default.jpeg'}`}
                  alt={user.name}
                  className={styles.profilePicture}
                />
                {editMode === 'picture-hover' && (
                  <div className={styles.editOverlay}>
                    <input
                      type="file"
                      id="profilePicture"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className={styles.hiddenInput}
                    />
                    <label htmlFor="profilePicture" className={styles.editButton}>
                      <svg className={styles.editIcon} viewBox="0 0 24 24">
                        <path fill="currentColor" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      Edit
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Info Section */}
          <div className={styles.profileInfo}>
            <div className={styles.basicInfo}>
              <h1 className={styles.userName}>{user.name}</h1>
              <p className={styles.userEmail}>{user.email}</p>
              <p className={styles.userUsername}>@{user.username}</p>
            </div>

            <div className={styles.profileStats}>
              <div className={styles.statItem}>
                <span className={styles.statValue}>150</span>
                <span className={styles.statLabel}>Connections</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>2.5K</span>
                <span className={styles.statLabel}>Profile views</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>89</span>
                <span className={styles.statLabel}>Posts</span>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>About</h2>
              <button 
                className={styles.editBtn}
                onClick={() => handleEditToggle('bio')}
              >
                {editMode === 'bio' ? 'Cancel' : 'Edit'}
              </button>
            </div>
            
            {editMode === 'bio' ? (
              <div className={styles.editForm}>
                <textarea
                  className={styles.bioTextarea}
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
                <div className={styles.formActions}>
                  <button 
                    className={styles.saveBtn}
                    onClick={() => handleSave('bio')}
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <p className={styles.bioText}>
                {profile.bio || 'No bio available. Click edit to add one.'}
              </p>
            )}
          </div>

          {/* Current Position Section */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Current Position</h2>
              <button 
                className={styles.editBtn}
                onClick={() => handleEditToggle('current')}
              >
                {editMode === 'current' ? 'Cancel' : 'Edit'}
              </button>
            </div>
            
            {editMode === 'current' ? (
              <div className={styles.editForm}>
                <input
                  type="text"
                  className={styles.input}
                  value={formData.currentPost}
                  onChange={(e) => handleInputChange('currentPost', e.target.value)}
                  placeholder="Current position"
                />
                <div className={styles.formActions}>
                  <button 
                    className={styles.saveBtn}
                    onClick={() => handleSave('current')}
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <p className={styles.currentPosition}>
                {profile.currentPost || 'No current position listed. Click edit to add one.'}
              </p>
            )}
          </div>

          {/* Work Experience Section */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Work Experience</h2>
              <button 
                className={styles.editBtn}
                onClick={() => handleEditToggle('work')}
              >
                {editMode === 'work' ? 'Cancel' : 'Edit'}
              </button>
            </div>
            
            {editMode === 'work' ? (
              <div className={styles.editForm}>
                <div className={styles.addWorkForm}>
                  <input
                    type="text"
                    className={styles.input}
                    value={newWork.company}
                    onChange={(e) => handleWorkChange('company', e.target.value)}
                    placeholder="Company name"
                  />
                  <input
                    type="text"
                    className={styles.input}
                    value={newWork.position}
                    onChange={(e) => handleWorkChange('position', e.target.value)}
                    placeholder="Position"
                  />
                  <input
                    type="text"
                    className={styles.input}
                    value={newWork.years}
                    onChange={(e) => handleWorkChange('years', e.target.value)}
                    placeholder="Years (e.g., 2020-2023)"
                  />
                  <button 
                    className={styles.addBtn}
                    onClick={addWorkExperience}
                  >
                    Add Experience
                  </button>
                </div>
                
                <div className={styles.workList}>
                  {formData.pastWork.map((work, index) => (
                    <div key={work.id || index} className={styles.workItem}>
                      <div className={styles.workDetails}>
                        <h4>{work.position}</h4>
                        <p>{work.company}</p>
                        <span>{work.years}</span>
                      </div>
                      <button 
                        className={styles.removeBtn}
                        onClick={() => removeWorkExperience(work.id || index)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className={styles.formActions}>
                  <button 
                    className={styles.saveBtn}
                    onClick={() => handleSave('work')}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.workExperience}>
                {(profile.pastWork && profile.pastWork.length > 0) ? (
                  profile.pastWork.map((work, index) => (
                    <div key={index} className={styles.workItem}>
                      <div className={styles.workDetails}>
                        <h4 className={styles.workPosition}>{work.position}</h4>
                        <p className={styles.workCompany}>{work.company}</p>
                        <span className={styles.workYears}>{work.years}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className={styles.noData}>No work experience listed. Click edit to add your experience.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </DashBoardLayout>
    </UserLayout>
  );
}

export default ProfilePage;
