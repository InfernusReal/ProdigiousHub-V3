import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import {
  XMarkIcon,
  PhotoIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const CreateProjectModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'beginner',
    max_participants: 5,
    xp_reward: 100,
    tags: [],
    deadline: '',
    github_repo: '',
    poster_image: null
  });
  const [newTag, setNewTag] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState({});

  // XP limits based on difficulty
  const getXPLimits = (difficulty) => {
    const limits = {
      'beginner': { min: 50, max: 50 },
      'intermediate': { min: 50, max: 500 },
      'advanced': { min: 50, max: 1000 },
      'expert': { min: 50, max: 1500 }
    };
    return limits[difficulty] || limits['beginner'];
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle difficulty change to update XP reward limits
    if (name === 'difficulty') {
      const limits = getXPLimits(value);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        xp_reward: Math.min(prev.xp_reward, limits.max)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = (file) => {
    if (file && file.type.startsWith('image/')) {
      setFormData(prev => ({ ...prev, poster_image: file }));
      setErrors(prev => ({ ...prev, poster_image: '' }));
    } else {
      setErrors(prev => ({ ...prev, poster_image: 'Please select a valid image file' }));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Project title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Project description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }
    
    if (!formData.poster_image) {
      newErrors.poster_image = 'Poster image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (formData.max_participants < 2 || formData.max_participants > 20) {
      newErrors.max_participants = 'Max participants must be between 2 and 20';
    }
    
    const xpLimits = getXPLimits(formData.difficulty);
    if (formData.xp_reward < xpLimits.min || formData.xp_reward > xpLimits.max) {
      newErrors.xp_reward = `XP reward must be between ${xpLimits.min} and ${xpLimits.max} for ${formData.difficulty} difficulty`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    if (!user?.is_verified) {
      alert('Please verify your email address first');
      return;
    }

    setLoading(true);
    try {
      const submitData = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'tags') {
          submitData.append('tags', JSON.stringify(formData.tags));
        } else if (key === 'poster_image') {
          if (formData.poster_image) {
            submitData.append('poster_image', formData.poster_image);
          }
        } else if (formData[key]) {
          submitData.append(key, formData[key]);
        }
      });

      console.log('🚀 Submitting project data:');
      console.log('📝 Form data:', formData);
      console.log('📦 FormData entries:');
      for (let [key, value] of submitData.entries()) {
        console.log(`  ${key}:`, value);
      }

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: submitData
      });

      console.log('📡 Response status:', response.status);
      const data = await response.json();
      console.log('📨 Response data:', data);
      
      if (data.success) {
        onSuccess && onSuccess(data.project);
        onClose();
        // Reset form
        setFormData({
          title: '',
          description: '',
          difficulty: 'beginner',
          max_participants: 5,
          xp_reward: 100,
          tags: [],
          deadline: '',
          github_repo: '',
          poster_image: null
        });
        setStep(1);
        setErrors({});
      } else {
        setErrors({ submit: data.message || 'Failed to create project' });
      }
    } catch (error) {
      console.error('Error creating project:', error);
      setErrors({ submit: 'Failed to create project' });
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyDescription = (difficulty) => {
    const limits = getXPLimits(difficulty);
    switch (difficulty) {
      case 'beginner': 
        return `Perfect for newcomers and those learning the basics (XP: ${limits.min}-${limits.max})`;
      case 'intermediate': 
        return `Requires some experience and technical knowledge (XP: ${limits.min}-${limits.max})`;
      case 'advanced': 
        return `Challenging projects for experienced developers (XP: ${limits.min}-${limits.max})`;
      case 'expert': 
        return `Complex projects requiring deep expertise (XP: ${limits.min}-${limits.max})`;
      default: 
        return '';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-slate-800 rounded-xl border border-white/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/20">
            <div>
              <h2 className="text-2xl font-bold text-white">Create New Project</h2>
              <p className="text-purple-300">Step {step} of 3</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="px-6 pt-6">
            <div className="flex items-center mb-6">
              {[1, 2, 3].map((stepNum) => (
                <React.Fragment key={stepNum}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    stepNum <= step 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-600 text-gray-300'
                  }`}>
                    {stepNum}
                  </div>
                  {stepNum < 3 && (
                    <div className={`flex-1 h-2 mx-2 rounded ${
                      stepNum < step ? 'bg-purple-600' : 'bg-gray-600'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="px-6 pb-6 custom-scrollbar">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Basic Information</h3>
                </div>

                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-2">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter your project title"
                    className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.title ? 'border-red-500' : 'border-white/20'
                    }`}
                  />
                  {errors.title && (
                    <p className="text-red-400 text-sm mt-1">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-2">
                    Project Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your project, its goals, and what collaborators will work on"
                    rows="4"
                    className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-purple-300 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent custom-scrollbar ${
                      errors.description ? 'border-red-500' : 'border-white/20'
                    }`}
                  />
                  {errors.description && (
                    <p className="text-red-400 text-sm mt-1">{errors.description}</p>
                  )}
                </div>

                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-2">
                    Poster Image *
                  </label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragActive 
                        ? 'border-purple-500 bg-purple-500/10' 
                        : errors.poster_image
                          ? 'border-red-500 bg-red-500/10'
                          : 'border-white/30 hover:border-purple-500 bg-white/5'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {formData.poster_image ? (
                      <div className="space-y-4">
                        <img
                          src={URL.createObjectURL(formData.poster_image)}
                          alt="Preview"
                          className="max-h-32 mx-auto rounded-lg object-cover"
                        />
                        <p className="text-white">{formData.poster_image.name}</p>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, poster_image: null }))}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Remove Image
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <PhotoIcon className="h-12 w-12 text-purple-300 mx-auto" />
                        <div>
                          <p className="text-white">Drag and drop your poster image here</p>
                          <p className="text-purple-300 text-sm">or</p>
                          <label className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors mt-2">
                            Browse Files
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0])}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                  {errors.poster_image && (
                    <p className="text-red-400 text-sm mt-1">{errors.poster_image}</p>
                  )}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Project Settings</h3>
                </div>

                <div className="custom-select">
                  <label className="block text-purple-200 text-sm font-medium mb-2">
                    Difficulty Level
                  </label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none cursor-pointer
                               hover:border-purple-400 transition-colors duration-200"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23a855f7' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em'
                    }}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                  <p className="text-purple-300 text-sm mt-1">
                    {getDifficultyDescription(formData.difficulty)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-purple-200 text-sm font-medium mb-2">
                      Max Participants
                    </label>
                    <input
                      type="number"
                      name="max_participants"
                      value={formData.max_participants}
                      onChange={handleInputChange}
                      min="2"
                      max="20"
                      className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        errors.max_participants ? 'border-red-500' : 'border-white/20'
                      }`}
                    />
                    {errors.max_participants && (
                      <p className="text-red-400 text-sm mt-1">{errors.max_participants}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-purple-200 text-sm font-medium mb-2">
                      XP Reward
                    </label>
                    <input
                      type="number"
                      name="xp_reward"
                      value={formData.xp_reward}
                      onChange={handleInputChange}
                      min={getXPLimits(formData.difficulty).min}
                      max={getXPLimits(formData.difficulty).max}
                      step="25"
                      className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        errors.xp_reward ? 'border-red-500' : 'border-white/20'
                      }`}
                    />
                    <p className="text-purple-300 text-xs mt-1">
                      Range: {getXPLimits(formData.difficulty).min} - {getXPLimits(formData.difficulty).max} XP
                    </p>
                    {errors.xp_reward && (
                      <p className="text-red-400 text-sm mt-1">{errors.xp_reward}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-2">
                    Deadline (Optional)
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-2">
                    GitHub Repository (Optional)
                  </label>
                  <input
                    type="url"
                    name="github_repo"
                    value={formData.github_repo}
                    onChange={handleInputChange}
                    placeholder="https://github.com/username/repository"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Technologies & Tags</h3>
                </div>

                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-2">
                    Add Technologies/Tags
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      placeholder="e.g., React, Node.js, Python"
                      className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <PlusIcon className="h-5 w-5" />
                    </button>
                  </div>

                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-purple-600/30 text-purple-200 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="text-purple-300 hover:text-white"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Project Preview */}
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h4 className="text-white font-bold mb-3">Project Preview</h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-white"><strong>Title:</strong> {formData.title}</p>
                    <p className="text-white"><strong>Description:</strong> {formData.description}</p>
                    <p className="text-white"><strong>Difficulty:</strong> <span className="capitalize">{formData.difficulty}</span></p>
                    <p className="text-white"><strong>Max Participants:</strong> {formData.max_participants}</p>
                    <p className="text-white"><strong>XP Reward:</strong> {formData.xp_reward}</p>
                    {formData.tags.length > 0 && (
                      <p className="text-white"><strong>Tags:</strong> {formData.tags.join(', ')}</p>
                    )}
                  </div>
                </div>

                {errors.submit && (
                  <div className="bg-red-500/20 border border-red-500 rounded-lg p-3">
                    <p className="text-red-400 text-sm">{errors.submit}</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between pt-6 mt-6 border-t border-white/20">
              <button
                onClick={() => step > 1 ? setStep(step - 1) : onClose()}
                className="px-6 py-2 text-purple-300 hover:text-white transition-colors"
              >
                {step > 1 ? 'Previous' : 'Cancel'}
              </button>

              <div className="flex gap-3">
                {step < 3 ? (
                  <button
                    onClick={handleNext}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                        Creating...
                      </>
                    ) : (
                      'Create Project'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreateProjectModal;
