import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const SignupPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [availabilityCheck, setAvailabilityCheck] = useState({
    username: { available: null, message: '', checking: false },
    email: { available: null, message: '', checking: false },
    displayName: { available: null, message: '', checking: false }
  });

  // Debounced availability checking
  const checkAvailability = useCallback(
    debounce(async (field, value) => {
      if (!value || value.length < 3) return;

      setAvailabilityCheck(prev => ({
        ...prev,
        [field]: { ...prev[field], checking: true }
      }));

      try {
        const requestData = {};
        if (field === 'username') requestData.username = value;
        if (field === 'email') requestData.email = value;
        if (field === 'displayName') {
          requestData.firstName = formData.firstName;
          requestData.lastName = formData.lastName;
        }

        const response = await axios.post('http://localhost:5000/api/auth/check-availability', requestData);
        
        if (response.data.success) {
          const result = response.data.data[field];
          setAvailabilityCheck(prev => ({
            ...prev,
            [field]: {
              available: result.available,
              message: result.message,
              checking: false
            }
          }));
        }
      } catch (error) {
        setAvailabilityCheck(prev => ({
          ...prev,
          [field]: {
            available: null,
            message: 'Error checking availability',
            checking: false
          }
        }));
      }
    }, 500),
    [formData.firstName, formData.lastName]
  );

  // Debounce utility function
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  useEffect(() => {
    if (formData.username.length >= 3) {
      checkAvailability('username', formData.username);
    }
  }, [formData.username, checkAvailability]);

  useEffect(() => {
    if (formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      checkAvailability('email', formData.email);
    }
  }, [formData.email, checkAvailability]);

  useEffect(() => {
    if (formData.firstName.trim() && formData.lastName.trim()) {
      checkAvailability('displayName', `${formData.firstName} ${formData.lastName}`);
    }
  }, [formData.firstName, formData.lastName, checkAvailability]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const validateStep1 = () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('Please enter your full name');
      return false;
    }
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setError('Username can only contain letters, numbers, and underscores');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
      setError('Password must contain uppercase, lowercase, number, and special character');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep2()) return;
    
    setLoading(true);
    setError('');

    try {
      const result = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName
      });

      if (result.success) {
        // Store email for verification page
        localStorage.setItem('pendingVerificationEmail', formData.email);
        
        // Navigate to email verification page
        navigate('/verify-email', { 
          state: { 
            email: formData.email,
            message: 'Account created! Please check your email to verify your account.',
            fromSignup: true
          } 
        });
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-6">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-tr from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <img src="/Logo-removebg.png" alt="ProdigiousHub" className="w-10 h-10" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-gray-900 mb-2"
          >
            Join the Hub! 🚀
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600"
          >
            Start your gamified collaboration journey
          </motion.p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <motion.div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}
              animate={{ scale: currentStep === 1 ? 1.1 : 1 }}
            >
              1
            </motion.div>
            <div className={`w-16 h-1 mx-2 ${currentStep >= 2 ? 'bg-purple-600' : 'bg-gray-200'}`}></div>
            <motion.div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}
              animate={{ scale: currentStep === 2 ? 1.1 : 1 }}
            >
              2
            </motion.div>
          </div>
        </div>

        {/* Success Message */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6"
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 1: Personal Info */}
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 pl-11"
                    placeholder="johndoe123"
                  />
                  <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <p className="text-xs text-gray-500 mt-1">3+ characters, letters, numbers, and underscores only</p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleNext}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
              >
                Next Step →
              </motion.button>
            </motion.div>
          )}

          {/* Step 2: Account Info */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 pl-11"
                      placeholder="john@example.com"
                    />
                    <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 pl-11 pr-11"
                      placeholder="Create a strong password"
                    />
                    <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex space-x-1 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-2 w-full rounded ${
                              i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-600">
                        Strength: <span className={`font-medium ${passwordStrength >= 4 ? 'text-green-600' : passwordStrength >= 3 ? 'text-blue-600' : 'text-red-600'}`}>
                          {strengthLabels[passwordStrength - 1] || 'Very Weak'}
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 pl-11 pr-11 ${
                        formData.confirmPassword && formData.password
                          ? formData.password === formData.confirmPassword
                            ? 'border-green-300 bg-green-50'
                            : 'border-red-300 bg-red-50'
                          : 'border-gray-200'
                      }`}
                      placeholder="Confirm your password"
                    />
                    <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formData.confirmPassword && formData.password && (
                      <div className="absolute right-3 top-3.5">
                        {formData.password === formData.confirmPassword ? (
                          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Password Match Indicator */}
                  {formData.confirmPassword && formData.password && (
                    <div className="mt-2">
                      {formData.password === formData.confirmPassword ? (
                        <p className="text-xs text-green-600 flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Passwords match
                        </p>
                      ) : (
                        <p className="text-xs text-red-600 flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Passwords do not match
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200"
                  >
                    ← Back
                  </button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating...
                      </div>
                    ) : (
                      "Create Account 🎮"
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center"
        >
          <div className="border-t border-gray-200 pt-4">
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
              >
                Sign in here! 🚀
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SignupPage;
