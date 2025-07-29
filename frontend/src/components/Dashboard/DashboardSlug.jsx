import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import DiscordIntegration from '../Discord/DiscordIntegration';
import ProjectDiscordSetup from '../Discord/ProjectDiscordSetup';
import PublicDiscordIntegration from '../Discord/PublicDiscordIntegration';
import {
  ArrowLeftIcon,
  UserGroupIcon,
  StarIcon,
  CalendarIcon,
  TagIcon,
  CodeBracketIcon,
  ChatBubbleLeftIcon,
  UserPlusIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

const DashboardSlug = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isParticipant, setIsParticipant] = useState(false);
  const [joining, setJoining] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [discordStatus, setDiscordStatus] = useState(null);

  // Helper function to format profile picture URL
  const formatProfilePicture = (profilePicture) => {
    if (!profilePicture) return null;
    
    // If it already has the data URL prefix, return as-is
    if (profilePicture.startsWith('data:image/')) {
      return profilePicture;
    }
    
    // If it's just base64 string, add the prefix
    return `data:image/jpeg;base64,${profilePicture}`;
  };

  useEffect(() => {
    fetchProject();
    if (user) {
      checkDiscordStatus();
    }
  }, [slug, user]);

  const checkDiscordStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/discord/status', {
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
      const response = await fetch(`/api/dashboard/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setProject(data.project);
        setIsParticipant(data.project.participants?.some(p => p.user_id === user?.id));
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

    if (!user.is_verified) {
      alert('Please verify your email address first');
      return;
    }

    setJoining(true);
    try {
      const response = await fetch(`/api/dashboard/${slug}/join`, {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
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
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-purple-300 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Back to Dashboard
        </motion.button>

        {/* Project Header Image */}
        {project.poster_image && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="aspect-video md:aspect-[21/9] bg-gradient-to-r from-purple-500 to-blue-500 relative overflow-hidden rounded-xl mb-8"
          >
            <img
              src={`data:image/jpeg;base64,${project.poster_image}`}
              alt={project.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">{project.title}</h1>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex flex-wrap items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                    {project.status.replace('_', ' ')}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(project.difficulty)}`}>
                    {project.difficulty}
                  </span>
                  <div className="flex items-center gap-2 text-white/90">
                    <StarIcon className="h-5 w-5" />
                    {project.xp_reward} XP
                  </div>
                </div>
                
                {/* Header Join Button */}
                {!isParticipant && project.status === 'open' && (
                  <motion.button
                    onClick={handleJoinProject}
                    disabled={joining}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white/20 hover:bg-white/30 disabled:opacity-50 backdrop-blur-sm border border-white/30 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 shadow-lg transition-colors text-lg"
                  >
                    {joining ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        <UserPlusIcon className="h-6 w-6" />
                        JOIN NOW
                      </>
                    )}
                  </motion.button>
                )}

                {isParticipant && (
                  <div className="bg-green-600 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 shadow-lg text-lg">
                    <CheckIcon className="h-6 w-6" />
                    YOU'RE IN!
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-8 mb-8"
            >
              <h2 className="text-2xl font-bold text-white mb-6">About This Project</h2>
              <p className="text-purple-200 mb-6">{project.description}</p>

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
              {project.custom_content?.sections && Array.isArray(project.custom_content.sections) && project.custom_content.sections.map((section, index) => (
                <motion.div
                  key={section.id || `section-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                  className="mb-8 p-8 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"
                >
                  <h2 className="text-2xl font-bold text-white mb-6">{section.title || 'Untitled Section'}</h2>
                  <p className="text-purple-200 leading-relaxed whitespace-pre-wrap">{section.content || 'No content'}</p>
                </motion.div>
              ))}

              {/* GitHub Link */}
              {project.github_repo && (
                <div className="mt-6">
                  <a
                    href={project.github_repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <CodeBracketIcon className="h-5 w-5" />
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
              
              <div className="space-y-4">
                {/* Comment Input - For all authenticated users */}
                {user ? (
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
                ) : (
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                    <p className="text-purple-200 mb-2">
                      <ChatBubbleLeftIcon className="h-5 w-5 inline mr-2" />
                      Sign in to join the discussion
                    </p>
                    <button
                      onClick={() => navigate('/login')}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Sign In
                    </button>
                  </div>
                )}
                
                {/* Comments Display - Public */}
                {project.comments && project.comments.length > 0 ? (
                  project.comments.map((comment, index) => (
                    <div key={comment.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center gap-3 mb-2">
                        {comment.profile_picture ? (
                          <img
                            src={formatProfilePicture(comment.profile_picture)}
                            alt={comment.display_name || comment.username}
                            className="w-8 h-8 rounded-full object-cover"
                            onError={(e) => {
                              console.log('Comment profile picture failed to load for user:', comment.username);
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        {!comment.profile_picture && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                            {(comment.display_name || comment.username)?.charAt(0)?.toUpperCase()}
                          </div>
                        )}
                        <span className="text-white font-medium">{comment.display_name || comment.username}</span>
                        <span className="text-purple-300 text-sm">{new Date(comment.created_at).toLocaleDateString()}</span>
                        {/* Show member badge if comment author is a project participant */}
                        {project.participants?.some(p => p.username === comment.username) && (
                          <span className="bg-purple-600/30 text-purple-200 text-xs px-2 py-1 rounded-full">
                            Member
                          </span>
                        )}
                      </div>
                      <p className="text-purple-200">{comment.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 bg-white/5 rounded-lg border border-white/10">
                    <ChatBubbleLeftIcon className="h-12 w-12 text-purple-300 mx-auto mb-3 opacity-50" />
                    <p className="text-purple-200 mb-2">No comments yet</p>
                    <p className="text-purple-300 text-sm">
                      {user 
                        ? "Be the first to share your thoughts!" 
                        : "Sign in to start the conversation!"
                      }
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 lg:sticky lg:top-24"
            >
              {/* Join Button */}
              {!isParticipant && project.status === 'open' && (
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
                <PublicDiscordIntegration 
                  project={project}
                  user={user}
                  discordStatus={discordStatus}
                  isParticipant={isParticipant}
                  onDiscordStatusChange={setDiscordStatus}
                />
              </div>

              {/* Creator Info */}
              <div className="border-t border-white/20 pt-6">
                <h3 className="text-lg font-bold text-white mb-4">Project Creator</h3>
                <div className="flex items-center gap-3 mb-4">
                  {project.creator_avatar ? (
                    <img
                      src={formatProfilePicture(project.creator_avatar)}
                      alt={project.creator_display_name || project.creator_username}
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => {
                        console.log('Creator avatar failed to load for user:', project.creator_username);
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  {!project.creator_avatar && (
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
                            src={formatProfilePicture(participant.profile_picture)}
                            alt={participant.display_name || participant.username}
                            className="w-8 h-8 rounded-full object-cover"
                            onError={(e) => {
                              console.log('Participant profile picture failed to load for user:', participant.username);
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        {!participant.profile_picture && (
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

export default DashboardSlug;
