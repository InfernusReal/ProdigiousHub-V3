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
    <div ref={heroRef} className="relative bg-gradient-to-br from-slate-50 to-white min-h-screen flex items-center">
      {/* Hero Content */}
      <div className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <h1 ref={titleRef} className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
            Gamified Project
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Collaboration</span>
          </h1>
          
          <p ref={subtitleRef} className="text-xl text-slate-600 leading-relaxed">
            Level up your team's productivity with ProdigiousHub. Join projects, earn XP, 
            climb leaderboards, and collaborate seamlessly with Discord integration.
          </p>
          
          <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4">
            <button className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-700 transition-all hover:scale-105">
              Start Building
            </button>
            <button className="border border-slate-300 text-slate-700 px-8 py-4 rounded-lg text-lg font-medium hover:border-slate-400 transition-colors">
              Watch Demo
            </button>
          </div>

          {/* Stats */}
          <div className="flex space-x-8 pt-8">
            <div>
              <div className="text-2xl font-bold text-slate-900">10K+</div>
              <div className="text-slate-600">Active Projects</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">50K+</div>
              <div className="text-slate-600">Developers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">99.9%</div>
              <div className="text-slate-600">Uptime</div>
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
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            {/* Mockup Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center space-x-3">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
              <div className="text-slate-600 text-sm">ProdigiousHub Dashboard</div>
            </div>
            
            {/* Mockup Content */}
            <div className="p-6 space-y-6">
              {/* Level Progress */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  15
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-900 font-medium">Level 15 Developer</span>
                    <span className="text-slate-600 text-sm">2,450 XP</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full w-3/4"></div>
                  </div>
                </div>
              </div>

              {/* Project Cards */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">E-commerce Platform</div>
                      <div className="text-slate-600 text-sm">+250 XP earned</div>
                    </div>
                  </div>
                  <div className="text-green-600 font-medium">Completed</div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs">⚡</span>
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">Mobile App UI</div>
                      <div className="text-slate-600 text-sm">In progress • 3 days left</div>
                    </div>
                  </div>
                  <div className="text-blue-600 font-medium">Active</div>
                </div>
              </div>

              {/* Live Feed */}
              <div className="space-y-2">
                <h3 className="font-medium text-slate-900">Live Project Feed</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2 text-slate-600">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Sarah joined "AI Assistant Bot"</span>
                    <span className="text-slate-400">2m ago</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-600">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>New project "React Dashboard" posted</span>
                    <span className="text-slate-400">5m ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Elements */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -top-4 -right-4 bg-white rounded-lg shadow-lg p-3 border border-slate-200"
          >
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">🎮</span>
              </div>
              <div>
                <div className="text-sm font-medium">Achievement Unlocked!</div>
                <div className="text-xs text-slate-600">Project Master</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: 1 }}
            className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-lg p-3 border border-slate-200"
          >
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">💬</span>
              </div>
              <div>
                <div className="text-sm font-medium">Discord Channel</div>
                <div className="text-xs text-slate-600">Auto-created</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
