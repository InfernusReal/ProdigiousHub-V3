import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import {
  UserGroupIcon,
  ClockIcon,
  StarIcon,
  CogIcon,
  EyeIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import CreateProjectModal from './CreateProjectModal';

const Projects = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState('owned');
  const [ownedProjects, setOwnedProjects] = useState([]);
  const [participatingProjects, setParticipatingProjects] = useState([]);
  const [completedProjects, setCompletedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completingProject, setCompletingProject] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    console.log('🎯 Current state:');
    console.log('- Owned projects:', ownedProjects.length);
    console.log('- Participating projects:', participatingProjects.length);
    console.log('- Completed projects:', completedProjects.length);
    console.log('- Active tab:', activeTab);
  }, [ownedProjects, participatingProjects, completedProjects, activeTab]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      
      // Fetch owned projects
      const ownedResponse = await fetch('/api/projects/my', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Fetch participating projects
      const participatingResponse = await fetch('/api/projects/participating', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Fetch completed projects
      console.log('🔍 Fetching completed projects...');
      const completedResponse = await fetch('/api/projects/completed', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      console.log('📡 Completed projects response status:', completedResponse.status);

      if (ownedResponse.ok && participatingResponse.ok && completedResponse.ok) {
        const ownedData = await ownedResponse.json();
        const participatingData = await participatingResponse.json();
        const completedData = await completedResponse.json();
        
        console.log('📊 Completed projects data:', completedData);
        console.log('📦 Completed projects count:', completedData.projects?.length || 0);
        
        setOwnedProjects(ownedData.projects || []);
        setParticipatingProjects(participatingData.projects || []);
        setCompletedProjects(completedData.projects || []);
      } else {
        console.error('❌ One or more API calls failed');
        if (!completedResponse.ok) {
          console.error('Completed projects API failed:', completedResponse.status, completedResponse.statusText);
        }
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeProject = async (projectSlug) => {
    try {
      setCompletingProject(projectSlug);
      
      const response = await fetch(`/api/projects/${projectSlug}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        // Show success notification
        addNotification({
          type: 'success',
          title: 'Project Completed!',
          message: `${data.xp_awarded} XP awarded to all participants.`
        });
        
        // Refresh projects to update the UI
        await fetchProjects();
      } else {
        addNotification({
          type: 'error',
          title: 'Error',
          message: data.message || 'Failed to complete project'
        });
      }
    } catch (error) {
      console.error('Error completing project:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to complete project. Please try again.'
      });
    } finally {
      setCompletingProject(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-green-500 text-white';
      case 'in_progress': return 'bg-blue-500 text-white';
      case 'completed': return 'bg-purple-500 text-white';
      case 'cancelled': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'border-green-400 text-green-400';
      case 'intermediate': return 'border-yellow-400 text-yellow-400';
      case 'advanced': return 'border-orange-400 text-orange-400';
      case 'expert': return 'border-red-400 text-red-400';
      default: return 'border-gray-400 text-gray-400';
    }
  };

  const ProjectCard = ({ project, isOwned, isCompleted = false, completeProject, completingProject }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 hover:bg-white/15 transition-colors ${
        isCompleted ? 'ring-2 ring-green-400/50' : ''
      }`}
    >
      {/* Project Image */}
      <div className={`aspect-video bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg mb-4 overflow-hidden relative ${
        isCompleted ? 'opacity-80' : ''
      }`}>
        {project.poster_image ? (
          <img
            src={`data:image/jpeg;base64,${project.poster_image}`}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white">
            <UserGroupIcon className="h-12 w-12" />
          </div>
        )}
        
        {/* Completed Badge */}
        {isCompleted && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <CheckCircleIcon className="h-3 w-3" />
            COMPLETED
          </div>
        )}
      </div>

      {/* Project Info */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-white truncate">{project.title}</h3>
        
        <p className="text-purple-200 text-sm line-clamp-2">{project.description}</p>

        {/* Status & Difficulty */}
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
            {project.status.replace('_', ' ')}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(project.difficulty)}`}>
            {project.difficulty}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-purple-200">
          <div className="flex items-center gap-1">
            <UserGroupIcon className="h-4 w-4" />
            {project.participant_count} members
          </div>
          <div className="flex items-center gap-1">
            <StarIcon className="h-4 w-4" />
            {project.xp_reward} XP {isCompleted ? 'earned' : ''}
          </div>
        </div>

        {/* Completion Date for completed projects */}
        {isCompleted && project.completed_at && (
          <div className="text-sm text-green-400 flex items-center gap-1">
            <ClockIcon className="h-4 w-4" />
            Completed on {new Date(project.completed_at).toLocaleDateString()}
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          {isCompleted ? (
            /* Completed project actions */
            <Link
              to={`/dashboard/${project.slug}`}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <CheckCircleIcon className="h-4 w-4" />
              View Completed Project
            </Link>
          ) : isOwned ? (
            <div className="space-y-2">
              {/* Complete Button - Only show for active projects */}
              {project.status !== 'completed' && (
                <button
                  onClick={() => completeProject(project.slug)}
                  disabled={completingProject === project.slug}
                  className={`w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                    completingProject === project.slug ? 'animate-pulse' : ''
                  }`}
                >
                  <CheckCircleIcon className="h-4 w-4" />
                  {completingProject === project.slug ? 'Completing...' : 'Complete Project'}
                </button>
              )}
              
              {/* Manage Button */}
              <Link
                to={`/projects/${project.slug}`}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <CogIcon className="h-4 w-4" />
                Manage Project
              </Link>
            </div>
          ) : (
            <Link
              to={`/dashboard/${project.slug}`}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <EyeIcon className="h-4 w-4" />
              View Project
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">My Projects</h1>
            <p className="text-purple-200">Manage your projects and collaborations</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white/10 backdrop-blur-sm rounded-lg p-1 mb-8 w-fit">
          <button
            onClick={() => setActiveTab('owned')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'owned'
                ? 'bg-purple-600 text-white'
                : 'text-purple-200 hover:text-white'
            }`}
          >
            My Projects ({ownedProjects.length})
          </button>
          <button
            onClick={() => setActiveTab('participating')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'participating'
                ? 'bg-purple-600 text-white'
                : 'text-purple-200 hover:text-white'
            }`}
          >
            Participating ({participatingProjects.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'completed'
                ? 'bg-purple-600 text-white'
                : 'text-purple-200 hover:text-white'
            }`}
          >
            Completed ({completedProjects.length})
          </button>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {activeTab === 'owned' ? (
            ownedProjects.length > 0 ? (
              ownedProjects.map((project) => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  isOwned={true} 
                  completeProject={completeProject}
                  completingProject={completingProject}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <UserGroupIcon className="h-16 w-16 text-purple-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No projects yet</h3>
                <p className="text-purple-200 mb-4">Create your first project to get started</p>
              </div>
            )
          ) : activeTab === 'participating' ? (
            participatingProjects.length > 0 ? (
              participatingProjects.map((project) => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  isOwned={false}
                  completeProject={completeProject}
                  completingProject={completingProject}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <ClockIcon className="h-16 w-16 text-purple-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No collaborations yet</h3>
                <p className="text-purple-200">Join projects from the dashboard to see them here</p>
              </div>
            )
          ) : (
            completedProjects.length > 0 ? (
              completedProjects.map((project) => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  isOwned={false}
                  isCompleted={true}
                  completeProject={completeProject}
                  completingProject={completingProject}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <CheckCircleIcon className="h-16 w-16 text-purple-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No completed projects yet</h3>
                <p className="text-purple-200">Complete some projects to see them here</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Projects;
