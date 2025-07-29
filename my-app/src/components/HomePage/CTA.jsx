import React from 'react';
import { motion } from 'framer-motion';

const CTA = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-4xl lg:text-6xl font-bold text-slate-900 mb-6">
            Ready to level up your
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> development journey?</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-12">
            Join thousands of developers who are already building amazing projects, 
            earning XP, and growing their careers with ProdigiousHub.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors shadow-lg"
            >
              Start Building Now - It's Free
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border border-slate-300 text-slate-700 px-8 py-4 rounded-lg text-lg font-medium hover:border-slate-400 transition-colors"
            >
              Watch Demo
            </motion.button>
          </motion.div>

          <div className="text-slate-500 text-sm mb-8">
            No credit card required • Free forever plan available
          </div>

          {/* Quick benefits */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              viewport={{ once: true }}
              className="flex items-center justify-center space-x-3"
            >
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <span className="text-slate-600">Instant Discord integration</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex items-center justify-center space-x-3"
            >
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <span className="text-slate-600">Gamified progress tracking</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              viewport={{ once: true }}
              className="flex items-center justify-center space-x-3"
            >
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <span className="text-slate-600">Live project collaboration</span>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-200 pt-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="font-semibold text-slate-900 text-xl">ProdigiousHub</span>
              </div>
              <p className="text-slate-600">
                The gamified project collaboration platform that helps developers level up their skills.
              </p>
              <div className="flex space-x-4">
                <button className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center hover:bg-slate-200 transition-colors">
                  <span className="text-slate-600">🐦</span>
                </button>
                <button className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center hover:bg-slate-200 transition-colors">
                  <span className="text-slate-600">📱</span>
                </button>
                <button className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center hover:bg-slate-200 transition-colors">
                  <span className="text-slate-600">💼</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-slate-900">Product</h4>
              <div className="space-y-2">
                <a href="#" className="block text-slate-600 hover:text-slate-900 transition-colors">Features</a>
                <a href="#" className="block text-slate-600 hover:text-slate-900 transition-colors">Dashboard</a>
                <a href="#" className="block text-slate-600 hover:text-slate-900 transition-colors">Integrations</a>
                <a href="#" className="block text-slate-600 hover:text-slate-900 transition-colors">API</a>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-slate-900">Community</h4>
              <div className="space-y-2">
                <a href="#" className="block text-slate-600 hover:text-slate-900 transition-colors">Discord Server</a>
                <a href="#" className="block text-slate-600 hover:text-slate-900 transition-colors">GitHub</a>
                <a href="#" className="block text-slate-600 hover:text-slate-900 transition-colors">Blog</a>
                <a href="#" className="block text-slate-600 hover:text-slate-900 transition-colors">Events</a>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-slate-900">Support</h4>
              <div className="space-y-2">
                <a href="#" className="block text-slate-600 hover:text-slate-900 transition-colors">Help Center</a>
                <a href="#" className="block text-slate-600 hover:text-slate-900 transition-colors">Contact Us</a>
                <a href="#" className="block text-slate-600 hover:text-slate-900 transition-colors">Privacy Policy</a>
                <a href="#" className="block text-slate-600 hover:text-slate-900 transition-colors">Terms of Service</a>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-slate-600">
              © 2025 ProdigiousHub. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-slate-600 hover:text-slate-900 transition-colors">Privacy</a>
              <a href="#" className="text-slate-600 hover:text-slate-900 transition-colors">Terms</a>
              <a href="#" className="text-slate-600 hover:text-slate-900 transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </section>
  );
};

export default CTA;
