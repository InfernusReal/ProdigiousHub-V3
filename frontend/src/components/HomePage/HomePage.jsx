import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { useAuth } from '../../contexts/AuthContext';
import AuthPopup from '../Auth/AuthPopup';
import Hero from './Hero';
import Features from './Features';
import LiveFeed from './LiveFeed';
import Dashboard from './Dashboard';
import Integration from './Integration';
import Testimonials from './Testimonials';
import CTA from './CTA';

const HomePage = () => {
  const containerRef = useRef(null);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // GSAP scroll-triggered animations
    gsap.fromTo(
      containerRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1, ease: "power2.out" }
    );

    // Show auth popup for non-authenticated users after 3 seconds
    if (!isAuthenticated) {
      const timer = setTimeout(() => {
        setShowAuthPopup(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  return (
    <>
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="min-h-screen bg-white"
      >
        <Hero />
        <Features />
        <LiveFeed />
        <Dashboard />
        <Integration />
        <Testimonials />
        <CTA />
      </motion.div>

      {/* Auth Popup for non-authenticated users */}
      <AuthPopup 
        isOpen={showAuthPopup} 
        onClose={() => setShowAuthPopup(false)} 
      />
    </>
  );
};

export default HomePage;
