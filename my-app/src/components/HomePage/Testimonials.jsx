import React from 'react';
import { motion } from 'framer-motion';

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Senior Frontend Developer",
      company: "TechCorp",
      level: "Level 28",
      image: "👩‍💻",
      quote: "ProdigiousHub transformed how our team collaborates. The gamification aspect makes project work genuinely exciting, and the Discord integration keeps everyone connected.",
      xp: "45,230 XP",
      projects: "89 projects completed"
    },
    {
      name: "Alex Rodriguez",
      role: "Full Stack Engineer",
      company: "StartupXYZ",
      level: "Level 22",
      image: "👨‍💻",
      quote: "I've leveled up my skills faster than ever before. The live project feed helped me discover amazing collaborations I never would have found otherwise.",
      xp: "32,150 XP",
      projects: "67 projects completed"
    },
    {
      name: "Emily Johnson",
      role: "Product Manager",
      company: "InnovateLabs",
      level: "Level 19",
      image: "👩‍💼",
      quote: "Managing cross-functional teams has never been easier. The achievement system motivates everyone, and the analytics help us track progress beautifully.",
      xp: "28,940 XP",
      projects: "45 projects completed"
    }
  ];

  const stats = [
    { number: "50K+", label: "Active Developers" },
    { number: "15K+", label: "Projects Completed" },
    { number: "98%", label: "User Satisfaction" },
    { number: "24/7", label: "Discord Support" }
  ];

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
            Loved by developers
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> worldwide</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Join thousands of developers who are already leveling up their careers with ProdigiousHub.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-4xl lg:text-5xl font-bold text-slate-900 mb-2"
              >
                {stat.number}
              </motion.div>
              <div className="text-slate-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Testimonials */}
        <div className="grid lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-3xl">
                  {testimonial.image}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">{testimonial.name}</h4>
                  <p className="text-slate-600 text-sm">{testimonial.role}</p>
                  <p className="text-slate-500 text-sm">{testimonial.company}</p>
                </div>
              </div>

              <blockquote className="text-slate-700 leading-relaxed mb-6">
                "{testimonial.quote}"
              </blockquote>

              <div className="border-t border-slate-200 pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {testimonial.level.split(' ')[1]}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900">{testimonial.level}</div>
                      <div className="text-xs text-slate-600">{testimonial.xp}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-slate-900">{testimonial.projects.split(' ')[0]}</div>
                    <div className="text-xs text-slate-600">projects</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Community Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 lg:p-12 text-white text-center"
        >
          <h3 className="text-3xl lg:text-4xl font-bold mb-6">
            Join the ProdigiousHub Community
          </h3>
          <p className="text-blue-100 text-lg leading-relaxed mb-8 max-w-3xl mx-auto">
            Connect with like-minded developers, share your projects, learn new skills, 
            and build amazing things together. Your next great collaboration is just one click away.
          </p>
          
          {/* Community Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-3xl mb-4">🎮</div>
              <h4 className="font-semibold mb-2">Gamified Learning</h4>
              <p className="text-blue-100 text-sm">Level up while building real projects</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-3xl mb-4">🌍</div>
              <h4 className="font-semibold mb-2">Global Network</h4>
              <p className="text-blue-100 text-sm">Connect with developers worldwide</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-3xl mb-4">🚀</div>
              <h4 className="font-semibold mb-2">Career Growth</h4>
              <p className="text-blue-100 text-sm">Build portfolio & gain experience</p>
            </div>
          </div>

          <button className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-50 transition-colors">
            Join the Community
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
