import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import ProjectDiscordSetup from '../Discord/ProjectDiscordSetup';
import ProjectDiscordInfo from '../ProjectDiscordInfo';
import DiscordIntegration from '../Discord/DiscordIntegration';
import {
  ArrowLeftIcon,
  UserGroupIcon,
  StarIcon,
  CalendarIcon,
  TagIcon,
  CodeBracketIcon,
  PlusIcon,
  ChatBubbleLeftIcon,
  UserPlusIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

const ProjectSlug = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isParticipant, setIsParticipant] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [joining, setJoining] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [customContent, setCustomContent] = useState({
    sections: []
  });
  const [discordStatus, setDiscordStatus] = useState(null);

  useEffect(() => {
    if (!authLoading) { // Wait for auth to finish loading
      fetchProject();
      checkDiscordStatus();
    }
  }, [slug, authLoading]);

  const checkDiscordStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/discord/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDiscordStatus(data);
      }
    } catch (error) {
      console.error('Error checking Discord status:', error);
    }
  };

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${slug}`);
      if (response.ok) {
        const data = await response.json();
        
        // Check if user is the creator (route protection)
        if (!user || data.project.creator_id !== user.id) {
          // Redirect to public view instead
          navigate(`/dashboard/${slug}`);
          return;
        }
        
        setProject(data.project);
        setIsCreator(data.project.creator_id === user?.id);
        setIsParticipant(data.project.participants?.some(p => p.user_id === user?.id));
        
        console.log('User ID:', user?.id);
        console.log('Creator ID:', data.project.creator_id);
        console.log('Is Creator:', data.project.creator_id === user?.id);
        console.log('Is Participant:', data.project.participants?.some(p => p.user_id === user?.id));
        console.log('Participants:', data.project.participants);
        
        // Ensure custom_content has proper structure
        const customContentData = data.project.custom_content || { sections: [] };
        if (!customContentData.sections) {
          customContentData.sections = [];
        }
        setCustomContent(customContentData);
        console.log('Loaded custom content:', customContentData);
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinProject = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setJoining(true);
    try {
      const response = await fetch(`/api/projects/${slug}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setIsParticipant(true);
        fetchProject(); // Refresh project data
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error joining project:', error);
      alert('Failed to join project');
    } finally {
      setJoining(false);
    }
  };

  const addCustomSection = () => {
    try {
      const newSection = {
        id: Date.now(),
        type: 'text',
        title: 'New Section',
        content: 'Enter your content here...'
      };
      
      setCustomContent(prev => ({
        ...prev,
        sections: [...(prev.sections || []), newSection]
      }));
      
      console.log('Added new section:', newSection);
    } catch (error) {
      console.error('Error adding section:', error);
    }
  };

  const updateCustomSection = (sectionId, updates) => {
    try {
      setCustomContent(prev => ({
        ...prev,
        sections: (prev.sections || []).map(section =>
          section.id === sectionId ? { ...section, ...updates } : section
        )
      }));
    } catch (error) {
      console.error('Error updating section:', error);
    }
  };

  const removeCustomSection = (sectionId) => {
    try {
      setCustomContent(prev => ({
        ...prev,
        sections: (prev.sections || []).filter(section => section.id !== sectionId)
      }));
    } catch (error) {
      console.error('Error removing section:', error);
    }
  };

  const saveCustomContent = async () => {
    try {
      console.log('Saving custom content:', customContent);
      
      const response = await fetch(`/api/projects/${slug}/manage`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ custom_content: customContent })
      });

      const data = await response.json();
      console.log('Save response:', data);
      
      if (data.success) {
        fetchProject();
        alert('Changes saved successfully!');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error saving custom content:', error);
      alert('Failed to save changes');
    }
  };

  const postComment = async () => {
    if (!newComment.trim()) {
      alert('Please enter a comment');
      return;
    }

    setIsPostingComment(true);
    try {
      const response = await fetch(`/api/projects/${slug}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newComment.trim() })
      });

      const data = await response.json();
      
      if (data.success) {
        setNewComment(''); // Clear the comment input
        await fetchProject(); // Refresh to show the new comment
        console.log('Comment posted successfully!');
      } else {
        console.error('Failed to post comment:', data);
        alert(data.message || 'Failed to post comment');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment: ' + error.message);
    } finally {
      setIsPostingComment(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-orange-100 text-orange-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Project Not Found</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-purple-300 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back to Dashboard
          </button>

          {/* Project Header Image */}
          {project.poster_image && (
            <div className="aspect-video md:aspect-[21/9] bg-gradient-to-r from-purple-500 to-blue-500 relative overflow-hidden rounded-xl mb-8">
              <img
                src={`data:image/jpeg;base64,${project.poster_image}`}
                alt={project.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">{project.title}</h1>
                <div className="flex flex-wrap items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                    {project.status.replace('_', ' ')}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(project.difficulty)}`}>
                    {project.difficulty}
                  </span>
                  <div className="flex items-center gap-2 text-white/90">
                    <StarIcon className="h-5 w-5" />
                    {project.xp_reward} XP
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-8 mb-8"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">About This Project</h2>
                  <p className="text-purple-200">{project.description}</p>
                </div>
              </div>

              {/* Tags */}
              {project.tags && project.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <TagIcon className="h-5 w-5" />
                    Technologies
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-600/30 text-purple-200 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Content Sections */}
              <AnimatePresence>
                {customContent?.sections && Array.isArray(customContent.sections) && customContent.sections.map((section, index) => (
                  <motion.div
                    key={section.id || `section-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="mb-8 p-8 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"
                  >
                    {isCreator ? (
                      <div>
                        <input
                          type="text"
                          value={section.title || ''}
                          onChange={(e) => updateCustomSection(section.id, { title: e.target.value })}
                          className="w-full mb-6 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-2xl font-bold placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent caret-white"
                          placeholder="Section Heading"
                        />
                        <textarea
                          value={section.content || ''}
                          onChange={(e) => updateCustomSection(section.id, { content: e.target.value })}
                          rows="6"
                          className="w-full mb-6 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-purple-200 placeholder-purple-300 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent caret-white"
                          placeholder="Write your content here..."
                        />
                        <button
                          onClick={() => removeCustomSection(section.id)}
                          className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                        >
                          Remove Section
                        </button>
                      </div>
                    ) : (
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-6">{section.title || 'Untitled Section'}</h2>
                        <p className="text-purple-200 leading-relaxed whitespace-pre-wrap">{section.content || 'No content'}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Add Section Controls - Always visible for creators */}
              {isCreator && (
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={addCustomSection}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <PlusIcon className="h-5 w-5" />
                    Add Section
                  </button>
                  <button
                    onClick={saveCustomContent}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <CheckIcon className="h-5 w-5" />
                    Save Changes
                  </button>
                </div>
              )}

              {/* GitHub Repo */}
              {project.github_repo && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <CodeBracketIcon className="h-5 w-5" />
                    Repository
                  </h3>
                  <a
                    href={project.github_repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    View on GitHub
                  </a>
                </div>
              )}
            </motion.div>

            {/* Comments Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-8"
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <ChatBubbleLeftIcon className="h-6 w-6" />
                Comments
              </h2>
              
              {/* Always show comments for creators in management view */}
              <div className="space-y-4">
                  <div>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your thoughts..."
                      rows="3"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent caret-white"
                    />
                    <button 
                      onClick={postComment}
                      disabled={isPostingComment || !newComment.trim()}
                      className="mt-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                    >
                      {isPostingComment ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          />
                          Posting...
                        </>
                      ) : (
                        'Post Comment'
                      )}
                    </button>
                  </div>
                  
                  {project.comments && project.comments.map((comment, index) => (
                    <div key={comment.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center gap-3 mb-2">
                        {comment.profile_picture ? (
                          <img
                            src={comment.profile_picture}
                            alt={comment.display_name || comment.username}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                            {(comment.display_name || comment.username)?.charAt(0)?.toUpperCase()}
                          </div>
                        )}
                        <span className="text-white font-medium">{comment.display_name || comment.username}</span>
                        <span className="text-purple-300 text-sm">{new Date(comment.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-purple-200">{comment.content}</p>
                    </div>
                  ))}
                </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 sticky top-24"
            >
              {/* Join Button */}
              {!isParticipant && !isCreator && project.status === 'open' && (
                <button
                  onClick={handleJoinProject}
                  disabled={joining}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-2 mb-6 transition-colors"
                >
                  {joining ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <>
                      <UserPlusIcon className="h-5 w-5" />
                      Join Project
                    </>
                  )}
                </button>
              )}

              {isParticipant && (
                <div className="w-full bg-green-600 text-white font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-2 mb-6">
                  <CheckIcon className="h-5 w-5" />
                  You're a member!
                </div>
              )}

              {/* Project Stats */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3">
                  <UserGroupIcon className="h-5 w-5 text-purple-300" />
                  <span className="text-white">
                    {project.participant_count || 0}/{project.max_participants} members
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <StarIcon className="h-5 w-5 text-yellow-400" />
                  <span className="text-white">{project.xp_reward} XP reward</span>
                </div>

                {project.deadline && (
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="h-5 w-5 text-purple-300" />
                    <span className="text-white">
                      Due {new Date(project.deadline).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Discord Integration */}
              <div className="mb-6">
                <ProjectDiscordSetup 
                  project={project} 
                  isCreator={isCreator}
                  userHasDiscord={discordStatus?.connected || false}
                />
              </div>

              {/* Creator Info */}
              <div className="border-t border-white/20 pt-6">
                <h3 className="text-lg font-bold text-white mb-4">Project Creator</h3>
                <div className="flex items-center gap-3 mb-4">
                  {project.creator_avatar ? (
                    <img
                      src={project.creator_avatar}
                      alt={project.creator_display_name || project.creator_username}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-lg font-bold">
                      {(project.creator_display_name || project.creator_username)?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-white font-medium">
                      {project.creator_display_name || project.creator_username}
                    </p>
                    <p className="text-purple-300 text-sm">@{project.creator_username}</p>
                  </div>
                </div>

                {/* Creator Links */}
                <div className="space-y-2">
                  {project.creator_github && (
                    <a
                      href={`https://github.com/${project.creator_github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-purple-300 hover:text-white transition-colors"
                    >
                      <CodeBracketIcon className="h-4 w-4" />
                      GitHub
                    </a>
                  )}
                  {project.creator_linkedin && (
                    <a
                      href={project.creator_linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-purple-300 hover:text-white transition-colors"
                    >
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>

              {/* Participants */}
              {project.participants && project.participants.length > 0 && (
                <div className="border-t border-white/20 pt-6 mt-6">
                  <h3 className="text-lg font-bold text-white mb-4">Team Members</h3>
                  <div className="space-y-3">
                    {project.participants.slice(0, 5).map((participant, index) => (
                      <div key={participant.id} className="flex items-center gap-3">
                        {participant.profile_picture ? (
                          <img
                            src={participant.profile_picture}
                            alt={participant.display_name || participant.username}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                            {(participant.display_name || participant.username)?.charAt(0)?.toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-white text-sm">
                            {participant.display_name || participant.username}
                          </p>
                          <p className="text-purple-300 text-xs capitalize">{participant.role}</p>
                        </div>
                      </div>
                    ))}
                    {project.participants.length > 5 && (
                      <p className="text-purple-300 text-sm">
                        +{project.participants.length - 5} more members
                      </p>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectSlug;
