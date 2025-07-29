import React from 'react';
import { motion } from 'framer-motion';

const Integration = () => {
  const integrations = [
    { name: "Discord", logo: "💬", description: "Seamless team communication" },
    { name: "GitHub", logo: "🐙", description: "Version control integration" },
    { name: "Slack", logo: "💼", description: "Workplace messaging" },
    { name: "Notion", logo: "📝", description: "Documentation & notes" },
    { name: "Figma", logo: "🎨", description: "Design collaboration" },
    { name: "Jira", logo: "📊", description: "Project management" },
    { name: "VS Code", logo: "💻", description: "Code editor integration" },
    { name: "Zoom", logo: "📹", description: "Video conferencing" }
  ];

  return (
    <section id="integration" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
            Seamless
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Integrations</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Connect with your favorite tools and platforms to create the perfect development workflow.
          </p>
        </motion.div>

        {/* Discord Integration Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 lg:p-12 mb-16 text-white"
        >
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">
                  💬
                </div>
                <div>
                  <h3 className="text-3xl font-bold">Discord Integration</h3>
                  <p className="text-indigo-100">Automatic channel creation for every project</p>
                </div>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span>Instant private channels for project teams</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span>Automated role assignment based on project participation</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span>Real-time notifications for project updates</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span>Voice channels for team meetings and pair programming</span>
                </div>
              </div>

              <button className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-medium hover:bg-indigo-50 transition-colors">
                Connect Discord Server
              </button>
            </div>

            <div className="relative">
              {/* Discord Interface Mockup */}
              <div className="bg-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="bg-slate-700 px-4 py-3 flex items-center space-x-3">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-slate-300 text-sm ml-4">ProdigiousHub Server</span>
                </div>
                
                <div className="p-4 space-y-3">
                  <div className="text-slate-300 text-sm font-medium">🏠 GENERAL</div>
                  <div className="pl-4 space-y-2">
                    <div className="text-slate-400 text-sm"># welcome</div>
                    <div className="text-slate-400 text-sm"># announcements</div>
                  </div>
                  
                  <div className="text-slate-300 text-sm font-medium">🚀 ACTIVE PROJECTS</div>
                  <div className="pl-4 space-y-2">
                    <div className="text-blue-400 text-sm"># ai-task-manager</div>
                    <div className="text-green-400 text-sm"># mobile-ecommerce</div>
                    <div className="text-purple-400 text-sm"># discord-bot-framework</div>
                  </div>
                  
                  <div className="text-slate-300 text-sm font-medium">🔊 VOICE CHANNELS</div>
                  <div className="pl-4 space-y-2">
                    <div className="text-slate-400 text-sm">🔊 Team Meeting</div>
                    <div className="text-slate-400 text-sm">🔊 Pair Programming</div>
                  </div>
                </div>
              </div>

              {/* Floating notification */}
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-4 -right-4 bg-green-500 rounded-lg p-3 text-white text-sm shadow-lg"
              >
                New channel created! 🎉
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Other Integrations Grid */}
        <div>
          <h3 className="text-2xl font-semibold text-slate-900 text-center mb-12">
            Works with all your favorite tools
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {integrations.map((integration, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="text-4xl mb-4">{integration.logo}</div>
                <h4 className="font-semibold text-slate-900 mb-2">{integration.name}</h4>
                <p className="text-slate-600 text-sm">{integration.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Integration CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-slate-50 rounded-2xl p-8 lg:p-12">
            <h3 className="text-3xl font-bold text-slate-900 mb-4">
              Don't see your favorite tool?
            </h3>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              Request new integrations or build your own using our comprehensive API and webhook system.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Request Integration
              </button>
              <button className="border border-slate-300 text-slate-700 px-6 py-3 rounded-lg font-medium hover:border-slate-400 transition-colors">
                View API Docs
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Integration;
