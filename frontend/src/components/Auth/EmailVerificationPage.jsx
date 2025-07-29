import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const EmailVerificationPage = () => {
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendSuccess, setResendSuccess] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isCheckingVerification, setIsCheckingVerification] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { sendVerification, checkVerificationStatus } = useAuth();
  
  // Get email from navigation state or localStorage
  const email = location.state?.email || localStorage.getItem('pendingVerificationEmail');
  const needsVerification = location.state?.needsVerification || false;
  const verificationMessage = location.state?.message || '';

  useEffect(() => {
    // If no email, redirect to signup
    if (!email) {
      navigate('/signup');
      return;
    }

    // Start countdown for resend button
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate]);

  // Poll for verification status every 5 seconds
  useEffect(() => {
    if (!email) return;

    const pollVerification = async () => {
      setIsCheckingVerification(true);
      try {
        const result = await checkVerificationStatus(email);
        if (result.success && result.isVerified) {
          // User is now verified! Redirect to login
          localStorage.removeItem('pendingVerificationEmail');
          navigate('/login', {
            state: {
              message: 'Email verified successfully! Please login to continue.',
              email: email,
              verified: true
            }
          });
        }
      } catch (error) {
        console.error('Error checking verification:', error);
      } finally {
        setIsCheckingVerification(false);
      }
    };

    // Check immediately
    pollVerification();

    // Then check every 5 seconds
    const pollInterval = setInterval(pollVerification, 5000);

    return () => clearInterval(pollInterval);
  }, [email, navigate, checkVerificationStatus]);

  const handleResendEmail = async () => {
    setIsResending(true);
    setResendMessage('');
    setResendSuccess(false);

    try {
      const result = await sendVerification();

      if (result.success) {
        setResendSuccess(true);
        setResendMessage('Verification email sent successfully!');
        setCanResend(false);
        setCountdown(60);
        
        // Start new countdown
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              setCanResend(true);
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setResendSuccess(false);
        setResendMessage(result.message || 'Failed to send verification email');
      }
    } catch (error) {
      setResendSuccess(false);
      setResendMessage('Network error. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 w-full max-w-md text-center"
      >
        {/* Header */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6"
        >
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-gray-900 mb-4"
        >
          Check Your Email
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-600 mb-6 leading-relaxed"
        >
          {verificationMessage || (
            <>
              We've sent a verification link to:
              <br />
              <strong className="text-gray-900">{email}</strong>
            </>
          )}
        </motion.p>

        {/* Email Icon Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 2, -2, 0]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="inline-block p-4 bg-blue-50 rounded-full"
          >
            <motion.svg 
              className="w-12 h-12 text-blue-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              animate={{ strokeDasharray: [0, 100, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </motion.svg>
          </motion.div>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-blue-50 rounded-xl p-4 mb-6 text-left"
        >
          <h3 className="font-semibold text-gray-900 mb-2">Next Steps:</h3>
          <ul className="space-y-1 text-sm text-gray-600">
            <li className="flex items-center">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
              Check your inbox and spam folder
            </li>
            <li className="flex items-center">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
              Click the verification link
            </li>
            <li className="flex items-center">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
              Return to login and access your account
            </li>
          </ul>
        </motion.div>

        {/* Verification Status Indicator */}
        {isCheckingVerification && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 rounded-xl p-4 mb-4 text-center border border-green-200"
          >
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
              <span className="text-green-700 font-medium">Checking for verification...</span>
            </div>
            <p className="text-sm text-green-600 mt-1">
              We'll automatically redirect you once verified!
            </p>
          </motion.div>
        )}

        {/* Resend Email Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="space-y-4"
        >
          {/* Resend Message */}
          <AnimatePresence>
            {resendMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className={`p-3 rounded-lg ${
                  resendSuccess 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {resendMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Resend Button */}
          <button
            onClick={handleResendEmail}
            disabled={!canResend || isResending}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
              canResend && !isResending
                ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                : 'bg-gray-50 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isResending ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </span>
            ) : canResend ? (
              'Resend Verification Email'
            ) : (
              `Resend available in ${countdown}s`
            )}
          </button>

          {/* Back to Login */}
          <Link to="/login">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg"
            >
              Back to Login
            </motion.button>
          </Link>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-sm text-gray-500 mt-6"
        >
          Having trouble? Contact our{' '}
          <a href="mailto:support@prodigioushub.com" className="text-blue-500 hover:underline">
            support team
          </a>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default EmailVerificationPage;
