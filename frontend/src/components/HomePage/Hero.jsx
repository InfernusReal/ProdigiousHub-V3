import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';

const Hero = () => {
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline();
    
    tl.fromTo(titleRef.current, 
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
    )
    .fromTo(subtitleRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
      "-=0.5"
    )
    .fromTo(ctaRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
      "-=0.3"
    );
  }, []);

  return (
    <div ref={heroRef} className="relative bg-black min-h-screen flex items-center">
      {/* Subtle geometric patterns */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-40 h-40 border border-white/10 rounded-full"></div>
        <div className="absolute bottom-1/4 -right-20 w-60 h-60 border border-white/5 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-white/5 rounded-full"></div>
      </div>

      {/* Hero Content */}
      <div className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        <div className="space-y-8">
          <h1 ref={titleRef} className="text-5xl lg:text-6xl font-bold text-white leading-tight">
            Gamified Project
            <span className="text-gray-300"> Collaboration</span>
          </h1>
          
          <p ref={subtitleRef} className="text-xl text-gray-400 leading-relaxed">
            Level up your team's productivity with ProdigiousHub. Join projects, earn XP, 
            climb leaderboards, and collaborate seamlessly with Discord integration.
          </p>
          
          <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4">
            <button className="bg-white text-black px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-100 transition-all hover:scale-105 border-2 border-white">
              Start Building
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-white hover:text-black transition-all">
              Watch Demo
            </button>
          </div>

          {/* Stats */}
          <div className="flex space-x-8 pt-8">
            <div>
              <div className="text-2xl font-bold text-white">10K+</div>
              <div className="text-gray-400">Active Projects</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">50K+</div>
              <div className="text-gray-400">Developers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">99.9%</div>
              <div className="text-gray-400">Uptime</div>
            </div>
          </div>
        </div>

        {/* Hero Mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="relative"
        >
          {/* Dashboard Mockup */}
          <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
            {/* Mockup Header */}
            <div className="bg-black px-6 py-4 border-b border-gray-700 flex items-center space-x-3">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
              <div className="text-gray-300 text-sm">ProdigiousHub Dashboard</div>
            </div>
            
            {/* Mockup Content */}
            <div className="p-6 space-y-6">
              {/* Level Progress */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black font-bold">
                  15
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-medium">Level 15 Developer</span>
                    <span className="text-gray-400 text-sm">2,450 XP</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-white h-2 rounded-full w-3/4"></div>
                  </div>
                </div>
              </div>

              {/* Project Cards */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-black rounded-lg border border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                      <span className="text-black text-xs">✓</span>
                    </div>
                    <div>
                      <div className="font-medium text-white">E-commerce Platform</div>
                      <div className="text-gray-400 text-sm">+250 XP earned</div>
                    </div>
                  </div>
                  <div className="text-white font-medium">Completed</div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-600">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-lg flex items-center justify-center">
                      <span className="text-black text-xs">⚡</span>
                    </div>
                    <div>
                      <div className="font-medium text-white">Mobile App UI</div>
                      <div className="text-gray-400 text-sm">In progress • 3 days left</div>
                    </div>
                  </div>
                  <div className="text-gray-300 font-medium">Active</div>
                </div>
              </div>

              {/* Live Feed */}
              <div className="space-y-2">
                <h3 className="font-medium text-white">Live Project Feed</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2 text-gray-300">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>Sarah joined "AI Assistant Bot"</span>
                    <span className="text-gray-500">2m ago</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span>New project "React Dashboard" posted</span>
                    <span className="text-gray-500">5m ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Elements */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -top-4 -right-4 bg-black border border-white rounded-lg shadow-lg p-3"
          >
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-black text-xs">🎮</span>
              </div>
              <div>
                <div className="text-sm font-medium text-white">Achievement Unlocked!</div>
                <div className="text-xs text-gray-400">Project Master</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: 1 }}
            className="absolute -bottom-4 -left-4 bg-black border border-white rounded-lg shadow-lg p-3"
          >
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-black text-xs">💬</span>
              </div>
              <div>
                <div className="text-sm font-medium text-white">Discord Channel</div>
                <div className="text-xs text-gray-400">Auto-created</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
