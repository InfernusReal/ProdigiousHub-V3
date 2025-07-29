import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProfileSetup = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState({
    display_name: '',
    bio: '',
    skills: [],
    profile_picture: '',
    location: '',
    github_username: '',
    linkedin_url: '',
    portfolio_url: ''
  });
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState('');

  const { updateProfile, user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const totalSteps = 3;

  // Check authentication and verification status
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        console.log('User not authenticated, redirecting to login');
        navigate('/login');
        return;
      }
      
      // Check if user is verified - handle both boolean and string values
      const isVerified = user?.is_verified === true || user?.is_verified === 1 || user?.is_verified === '1';
      
      if (!isVerified) {
        console.log('User not verified, redirecting to email verification', { 
          is_verified: user?.is_verified, 
          user_id: user?.id 
        });
        navigate('/verify-email', {
          state: {
            email: user?.email,
            needsVerification: true,
            message: 'Please verify your email before completing your profile setup.'
          }
        });
        return;
      }

      console.log('User authenticated and verified, proceeding with profile setup');
    }
  }, [isAuthenticated, user, authLoading, navigate]);

  // Don't render if still loading auth or user is not authenticated/verified
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user?.is_verified) {
    return null; // Will redirect via useEffect
  }

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !profileData.skills.includes(skillInput.trim())) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageFile(files[0]);
    }
  };

  const handleImageDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleImageDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleImageFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageFile(file);
    }
  };

  const handleImageFile = (file) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result;
      setProfileImagePreview(base64);
      setProfileData(prev => ({
        ...prev,
        profile_picture: base64
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeProfileImage = () => {
    setProfileImagePreview('');
    setProfileData(prev => ({
      ...prev,
      profile_picture: ''
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await updateProfile(profileData);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        // Check if the error is about email verification
        if (result.message && result.message.includes('Email verification required')) {
          navigate('/verify-email', {
            state: {
              email: user?.email,
              needsVerification: true,
              message: 'Please verify your email before completing your profile setup.'
            }
          });
        } else {
          setError(result.message || 'Failed to update profile');
        }
      }
    } catch (err) {
      console.error('Profile update error:', err);
      
      // Check if it's a 403 error (likely verification required)
      if (err.response?.status === 403) {
        navigate('/verify-email', {
          state: {
            email: user?.email,
            needsVerification: true,
            message: 'Please verify your email before completing your profile setup.'
          }
        });
      } else {
        setError('An error occurred while updating your profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Complete Your Profile
          </h1>
          <p className="text-gray-600 text-lg">
            Let's set up your ProdigiousHub profile to get started!
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-gray-500">{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Form Container */}
        <motion.div
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name *
                </label>
                <input
                  type="text"
                  value={profileData.display_name}
                  onChange={(e) => handleInputChange('display_name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="How you want to be known"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={profileData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="City, Country"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Picture
                </label>
                
                {/* Profile Picture Upload Area */}
                <div
                  className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 ${
                    isDragging 
                      ? 'border-blue-500 bg-blue-50' 
                      : profileImagePreview || profileData.profile_picture
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDrop={handleImageDrop}
                  onDragOver={handleImageDragOver}
                  onDragLeave={handleImageDragLeave}
                >
                  {profileImagePreview || profileData.profile_picture ? (
                    // Image Preview
                    <div className="relative">
                      <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg">
                        <img
                          src={profileImagePreview || profileData.profile_picture}
                          alt="Profile preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={removeProfileImage}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                      <p className="mt-4 text-sm text-gray-600">
                        Drop a new image to replace, or{' '}
                        <label className="text-blue-500 hover:text-blue-600 cursor-pointer">
                          click here to browse
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageFileSelect}
                            className="hidden"
                          />
                        </label>
                      </p>
                    </div>
                  ) : (
                    // Upload Prompt
                    <div>
                      <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <p className="text-gray-600 mb-2">
                        {isDragging ? 'Drop your image here!' : 'Drag & drop your profile picture'}
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        or{' '}
                        <label className="text-blue-500 hover:text-blue-600 cursor-pointer">
                          click here to browse
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageFileSelect}
                            className="hidden"
                          />
                        </label>
                      </p>
                      <p className="text-xs text-gray-400">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Skills & Expertise */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Skills & Expertise</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Skills
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="e.g., React, Python, UI/UX Design"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {profileData.skills.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Skills
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills.map((skill, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                      >
                        <span>{skill}</span>
                        <button
                          onClick={() => removeSkill(skill)}
                          className="text-blue-600 hover:text-red-500 transition-colors"
                        >
                          ×
                        </button>
                      </motion.span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 3: Social Links */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Social Links</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GitHub Username
                </label>
                <input
                  type="text"
                  value={profileData.github_username}
                  onChange={(e) => handleInputChange('github_username', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="your-github-username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  value={profileData.linkedin_url}
                  onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Portfolio Website
                </label>
                <input
                  type="url"
                  value={profileData.portfolio_url}
                  onChange={(e) => handleInputChange('portfolio_url', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="https://yourportfolio.com"
                />
              </div>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700"
            >
              {error}
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handlePrev}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Previous
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                disabled={currentStep === 1 && !profileData.display_name.trim()}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  (currentStep === 1 && !profileData.display_name.trim())
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
                }`}
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || !profileData.display_name.trim()}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  loading || !profileData.display_name.trim()
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600'
                }`}
              >
                {loading ? 'Saving...' : 'Complete Setup'}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileSetup;
