import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LiveFeed = () => {
  const [activeProjects, setActiveProjects] = useState([
    {
      id: 1,
      title: "AI-Powered Task Manager",
      description: "Build an intelligent task management system with ML recommendations",
      tech: ["React", "Python", "TensorFlow"],
      difficulty: "Advanced",
      xp: 500,
      participants: 3,
      maxParticipants: 5,
      timeAgo: "2 min ago",
      author: "Sarah Chen",
      authorLevel: 18,
      status: "active"
    },
    {
      id: 2,
      title: "Mobile E-commerce App",
      description: "Create a full-stack mobile shopping experience with payment integration",
      tech: ["React Native", "Node.js", "Stripe"],
      difficulty: "Intermediate",
      xp: 350,
      participants: 2,
      maxParticipants: 4,
      timeAgo: "5 min ago",
      author: "Alex Kumar",
      authorLevel: 15,
      status: "new"
    },
    {
      id: 3,
      title: "Discord Bot Framework",
      description: "Develop a modular Discord bot with plugin architecture",
      tech: ["Discord.js", "Node.js", "MongoDB"],
      difficulty: "Beginner",
      xp: 200,
      participants: 4,
      maxParticipants: 4,
      timeAgo: "8 min ago",
      author: "Mike Rodriguez",
      authorLevel: 12,
      status: "full"
    }
  ]);

  const [feedActivity, setFeedActivity] = useState([
    { id: 1, type: "join", user: "Emma Wilson", project: "AI Task Manager", time: "1m ago" },
    { id: 2, type: "complete", user: "David Park", project: "Weather App", xp: 150, time: "3m ago" },
    { id: 3, type: "create", user: "Lisa Zhang", project: "Social Media Dashboard", time: "5m ago" },
    { id: 4, type: "achievement", user: "Tom Baker", achievement: "Code Master", time: "7m ago" }
  ]);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Add new activity every 10 seconds
      const activities = [
        { type: "join", user: "Anonymous User", project: "Random Project", time: "now" },
        { type: "complete", user: "Dev User", project: "Sample Project", xp: Math.floor(Math.random() * 200) + 100, time: "now" },
        { type: "create", user: "New User", project: "Fresh Project", time: "now" }
      ];
      
      const newActivity = {
        id: Date.now(),
        ...activities[Math.floor(Math.random() * activities.length)]
      };

      setFeedActivity(prev => [newActivity, ...prev.slice(0, 9)]);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'join': return '👋';
      case 'complete': return '✅';
      case 'create': return '🚀';
      case 'achievement': return '🏆';
      default: return '📝';
    }
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
            Live Project
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Feed</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Discover and join exciting projects in real-time. Connect with developers worldwide and start building together.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Active Projects */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-slate-900">Active Projects</h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-slate-600 text-sm">Live</span>
              </div>
            </div>

            <AnimatePresence>
              {activeProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-xl font-semibold text-slate-900">{project.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(project.difficulty)}`}>
                          {project.difficulty}
                        </span>
                      </div>
                      <p className="text-slate-600 mb-4">{project.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.tech.map((tech, i) => (
                          <span key={i} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-sm text-slate-700">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-blue-600">+{project.xp} XP</div>
                      <div className="text-sm text-slate-500">{project.timeAgo}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {project.authorLevel}
                        </div>
                        <span className="text-slate-700 font-medium">{project.author}</span>
                      </div>
                      <div className="text-slate-500 text-sm">
                        {project.participants}/{project.maxParticipants} members
                      </div>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={project.status === 'full'}
                      className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                        project.status === 'full' 
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {project.status === 'full' ? 'Full' : 'Join Project'}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Activity Feed */}
          <div className="bg-slate-50 rounded-2xl p-6 h-fit">
            <h3 className="text-xl font-semibold text-slate-900 mb-6">Recent Activity</h3>
            
            <div className="space-y-4">
              <AnimatePresence>
                {feedActivity.map((activity) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-slate-200"
                  >
                    <div className="text-lg">{getActivityIcon(activity.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm">
                        <span className="font-medium text-slate-900">{activity.user}</span>
                        {activity.type === 'join' && (
                          <span className="text-slate-600"> joined </span>
                        )}
                        {activity.type === 'complete' && (
                          <span className="text-slate-600"> completed </span>
                        )}
                        {activity.type === 'create' && (
                          <span className="text-slate-600"> created </span>
                        )}
                        {activity.type === 'achievement' && (
                          <span className="text-slate-600"> unlocked </span>
                        )}
                        <span className="font-medium text-slate-900">
                          {activity.project || activity.achievement}
                        </span>
                        {activity.xp && (
                          <span className="text-green-600 font-medium"> (+{activity.xp} XP)</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">{activity.time}</div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveFeed;
