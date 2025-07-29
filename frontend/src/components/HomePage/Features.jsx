import React from 'react';
import { motion } from 'framer-motion';

const Features = () => {
  const features = [
    {
      icon: "🎮",
      title: "Gamified Experience",
      description: "Earn XP, unlock achievements, and climb leaderboards as you complete projects and collaborate with your team.",
      color: "from-white to-gray-300"
    },
    {
      icon: "🚀",
      title: "Live Project Feed",
      description: "Discover new projects in real-time, join teams instantly, and start collaborating within minutes.",
      color: "from-gray-800 to-black"
    },
    {
      icon: "💬",
      title: "Discord Integration",
      description: "Automatic Discord channel creation for each project with seamless team communication and file sharing.",
      color: "from-white to-gray-200"
    },
    {
      icon: "📊",
      title: "Performance Dashboard",
      description: "Track your progress, analyze team performance, and showcase your project portfolio with detailed analytics.",
      color: "from-black to-gray-700"
    },
    {
      icon: "🏆",
      title: "Achievement System",
      description: "Unlock badges, earn titles, and showcase your expertise as you master different technologies and project types.",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: "👥",
      title: "Smart Team Matching",
      description: "AI-powered team formation based on skills, experience level, and project requirements for optimal collaboration.",
      color: "from-indigo-500 to-purple-500"
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6">
            Everything you need to
            <span className="text-gray-600"> level up</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Transform your project collaboration with gamification, real-time feeds, and seamless Discord integration.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="bg-gray-50 rounded-2xl p-8 shadow-sm border-2 border-black hover:shadow-lg transition-all duration-300 hover:border-gray-700"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-2xl mb-6 border-2 border-black`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-black mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Feature Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 lg:p-12 text-white"
        >
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl lg:text-4xl font-bold mb-6">
                Join the future of collaborative development
              </h3>
              <p className="text-blue-100 text-lg leading-relaxed mb-8">
                Experience the power of gamified project management where every contribution counts, 
                every milestone matters, and every team member thrives.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                  Start Free Trial
                </button>
                <button className="border border-white/30 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors">
                  Schedule Demo
                </button>
              </div>
            </div>
            <div className="relative">
              {/* Animated Stats */}
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center"
                >
                  <div className="text-2xl font-bold">15K+</div>
                  <div className="text-blue-100 text-sm">Projects Created</div>
                </motion.div>
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center"
                >
                  <div className="text-2xl font-bold">98%</div>
                  <div className="text-blue-100 text-sm">Team Satisfaction</div>
                </motion.div>
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center"
                >
                  <div className="text-2xl font-bold">50M+</div>
                  <div className="text-blue-100 text-sm">XP Earned</div>
                </motion.div>
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center"
                >
                  <div className="text-2xl font-bold">24/7</div>
                  <div className="text-blue-100 text-sm">Discord Support</div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
