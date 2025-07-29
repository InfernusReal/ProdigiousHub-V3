import React from 'react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  return (
    <section id="dashboard" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
            Your Gaming
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Dashboard</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Track your progress, level up, and showcase your achievements with our comprehensive dashboard.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-xl">
                  📊
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">Performance Analytics</h3>
                  <p className="text-slate-600">Detailed insights into your project completion rates and team contributions.</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white text-xl">
                  🏆
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">Achievement Tracking</h3>
                  <p className="text-slate-600">Unlock badges and track your journey from beginner to expert developer.</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white text-xl">
                  📈
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">Skill Development</h3>
                  <p className="text-slate-600">Monitor your growth across different technologies and project types.</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white text-xl">
                  👥
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">Team Leaderboards</h3>
                  <p className="text-slate-600">Compete with peers and see how you rank among the community.</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Dashboard Mockup */}
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">Alex Johnson</h3>
                    <p className="text-blue-100">Level 24 • Senior Developer</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">12,450</div>
                    <div className="text-blue-100">Total XP</div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Level 24</span>
                    <span>Level 25</span>
                  </div>
                  <div className="w-full bg-blue-500/30 rounded-full h-3">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: "65%" }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                      className="bg-white h-3 rounded-full"
                    />
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="p-6 grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-slate-900">47</div>
                  <div className="text-slate-600 text-sm">Projects Completed</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">15</div>
                  <div className="text-slate-600 text-sm">Active Projects</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">23</div>
                  <div className="text-slate-600 text-sm">Achievements</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">#8</div>
                  <div className="text-slate-600 text-sm">Global Rank</div>
                </div>
              </div>

              {/* Recent Achievements */}
              <div className="px-6 pb-6">
                <h4 className="font-semibold text-slate-900 mb-4">Recent Achievements</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl">🏆</div>
                    <div>
                      <div className="font-medium text-slate-900">Code Master</div>
                      <div className="text-sm text-slate-600">Completed 5 advanced projects</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl">🚀</div>
                    <div>
                      <div className="font-medium text-slate-900">Team Player</div>
                      <div className="text-sm text-slate-600">Collaborated on 20+ projects</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Notifications */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-6 -right-6 bg-white rounded-xl shadow-lg p-4 border border-slate-200"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                  +150
                </div>
                <div>
                  <div className="font-medium text-slate-900">XP Gained!</div>
                  <div className="text-sm text-slate-600">Project completed</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: 1 }}
              className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 border border-slate-200"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm">
                  🎯
                </div>
                <div>
                  <div className="font-medium text-slate-900">New Badge!</div>
                  <div className="text-sm text-slate-600">React Expert</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
