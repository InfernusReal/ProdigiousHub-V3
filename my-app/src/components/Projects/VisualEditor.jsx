import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PaintBrushIcon,
  PhotoIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  EyeIcon,
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  Square3Stack3DIcon,
  UserGroupIcon,
  StarIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';

// Import custom components
import ThemePanel from './ThemePanel';
import ContentPanel from './ContentPanel';
import MediaPanel from './MediaPanel';
import LayoutPanel from './LayoutPanel';
import DraggableSection from './DraggableSection';
import ProtectedElements from './ProtectedElements';

const VisualEditor = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = localStorage.getItem('token'); // Get token directly from localStorage
  const canvasRef = useRef(null);

  // Editor state
  const [editorData, setEditorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [draggedElement, setDraggedElement] = useState(null);
  const [sidebarTab, setSidebarTab] = useState('theme');
  const [previewMode, setPreviewMode] = useState(false);
  const [themes, setThemes] = useState([]);

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetchEditorData();
    fetchThemes();
  }, [slug]);

  const fetchEditorData = async () => {
    try {
      const response = await fetch(`/api/editor/${slug}/editor-data`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEditorData(data);
      } else {
        console.error('Failed to fetch editor data, status:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        // Don't navigate immediately, let's see the error first
        // navigate('/projects');
      }
    } catch (error) {
      console.error('Error fetching editor data:', error);
      // Don't navigate immediately, let's see the error first
      // navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchThemes = async () => {
    try {
      const response = await fetch('/api/editor/themes');
      if (response.ok) {
        const themesData = await response.json();
        setThemes(themesData);
      } else {
        console.error('Failed to fetch themes, status:', response.status);
        const errorText = await response.text();
        console.error('Themes error response:', errorText);
      }
    } catch (error) {
      console.error('Error fetching themes:', error);
    }
  };

  const saveEditorData = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/editor/${slug}/editor-data`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          theme_settings: editorData.theme_settings,
          layout_config: editorData.layout_config,
          custom_sections: editorData.custom_sections,
          navbar_theme: editorData.navbar_theme,
          background_config: editorData.background_config
        })
      });

      if (response.ok) {
        console.log('✅ Editor data saved successfully');
      } else {
        console.error('Failed to save editor data');
      }
    } catch (error) {
      console.error('Error saving editor data:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateTheme = (newTheme) => {
    setEditorData(prev => ({
      ...prev,
      theme_settings: { ...prev.theme_settings, ...newTheme }
    }));
  };

  const updateNavbarTheme = (navbarTheme) => {
    setEditorData(prev => ({
      ...prev,
      navbar_theme: { ...prev.navbar_theme, ...navbarTheme }
    }));
  };

  const updateBackground = (backgroundConfig) => {
    setEditorData(prev => ({
      ...prev,
      background_config: { ...prev.background_config, ...backgroundConfig }
    }));
  };

  const handleBannerUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target.result.split(',')[1]; // Remove data:image/...;base64, prefix
        
        // Update the editor data
        setEditorData(prev => ({
          ...prev,
          poster_image: base64
        }));

        // Save to backend
        await saveBannerToBackend(base64);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading banner:', error);
      alert('Failed to upload banner');
    }
  };

  const saveBannerToBackend = async (base64Image) => {
    try {
      const response = await fetch(`http://localhost:3001/api/editor/${slug}/project-data`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          poster_image: base64Image
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save banner');
      }

      console.log('Banner saved successfully');
    } catch (error) {
      console.error('Error saving banner:', error);
      alert('Failed to save banner');
    }
  };

  const saveDescriptionToBackend = async (description) => {
    try {
      const response = await fetch(`http://localhost:3001/api/editor/${slug}/project-data`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          description: description
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save description');
      }

      console.log('Description saved successfully');
    } catch (error) {
      console.error('Error saving description:', error);
      alert('Failed to save description');
    }
  };

  const addCustomSection = (sectionType) => {
    const newSection = {
      id: `section_${Date.now()}`,
      type: sectionType,
      position: { x: 100, y: 200 },
      size: { width: 400, height: 200 },
      rotation: 0,
      z_index: editorData.custom_sections.length + 1,
      content: getSectionDefaultContent(sectionType),
      styling: {
        background: editorData.theme_settings.secondary_color || '#f3f4f6',
        border: `2px solid ${editorData.theme_settings.primary_color || '#3b82f6'}`,
        border_radius: '8px',
        padding: '20px'
      }
    };

    setEditorData(prev => ({
      ...prev,
      custom_sections: [...prev.custom_sections, newSection]
    }));
  };

  const removeCustomSection = (sectionId) => {
    setEditorData(prev => ({
      ...prev,
      custom_sections: prev.custom_sections.filter(section => section.id !== sectionId)
    }));
    setSelectedElement(null);
  };

  const updateSectionPosition = (sectionId, newPosition) => {
    setEditorData(prev => ({
      ...prev,
      custom_sections: prev.custom_sections.map(section =>
        section.id === sectionId 
          ? { ...section, position: newPosition }
          : section
      )
    }));
  };

  const getSectionDefaultContent = (type) => {
    switch (type) {
      case 'text':
        return 'Click to edit this text block';
      case 'heading':
        return 'Your Heading Here';
      case 'image':
        return { src: '', alt: 'Custom image' };
      case 'button':
        return { text: 'Click Me', link: '#' };
      default:
        return '';
    }
  };

  // Handle drag and drop
  const handleMouseDown = (e, section) => {
    if (previewMode) return;
    
    setIsDragging(true);
    setDraggedElement(section.id);
    setSelectedElement(section.id);
    
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !draggedElement || previewMode) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const canvasRect = canvas.getBoundingClientRect();
    const newX = e.clientX - canvasRect.left - dragOffset.x;
    const newY = e.clientY - canvasRect.top - dragOffset.y;
    
    updateSectionPosition(draggedElement, { x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedElement(null);
  };

  // Auto-save functionality
  useEffect(() => {
    if (editorData && !loading) {
      const timeoutId = setTimeout(() => {
        saveEditorData();
      }, 2000); // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [editorData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!editorData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Project not found</h2>
          <button
            onClick={() => navigate('/projects')}
            className="text-blue-600 hover:text-blue-800"
          >
            Return to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Transparent Tool Sidebar */}
      {!previewMode && (
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          className="fixed left-0 top-0 h-full w-80 bg-white/90 backdrop-blur-lg border-r border-gray-200 z-50 overflow-y-auto"
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Visual Editor</h2>
              <button
                onClick={() => navigate(`/projects/${slug}`)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {[
                { id: 'theme', icon: PaintBrushIcon, label: 'Theme' },
                { id: 'content', icon: DocumentTextIcon, label: 'Content' },
                { id: 'media', icon: PhotoIcon, label: 'Media' },
                { id: 'layout', icon: Cog6ToothIcon, label: 'Layout' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSidebarTab(tab.id)}
                  className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    sidebarTab === tab.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <tab.icon className="h-4 w-4 mr-1" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="p-4">
            {sidebarTab === 'theme' && (
              <ThemePanel
                themes={themes}
                currentTheme={editorData.theme_settings}
                onUpdateTheme={updateTheme}
                navbarTheme={editorData.navbar_theme}
                onUpdateNavbarTheme={updateNavbarTheme}
                backgroundConfig={editorData.background_config}
                onUpdateBackground={updateBackground}
              />
            )}

            {sidebarTab === 'content' && (
              <ContentPanel
                onAddSection={addCustomSection}
                selectedElement={selectedElement}
                sections={editorData.custom_sections}
                onRemoveSection={removeCustomSection}
              />
            )}

            {sidebarTab === 'media' && (
              <MediaPanel slug={slug} token={token} />
            )}

            {sidebarTab === 'layout' && (
              <LayoutPanel
                layoutConfig={editorData.layout_config}
                onUpdateLayout={(config) => setEditorData(prev => ({
                  ...prev,
                  layout_config: { ...prev.layout_config, ...config }
                }))}
              />
            )}
          </div>

          {/* Save Status */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className={`text-sm text-center py-2 px-3 rounded-lg ${
              saving 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-green-100 text-green-700'
            }`}>
              {saving ? 'Saving...' : 'All changes saved'}
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Canvas Area */}
      <div className={`flex-1 ${!previewMode ? 'ml-80' : ''}`}>
        {/* Top Toolbar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">{editorData.title}</h1>
            <span className="text-sm text-gray-500">Visual Editor</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                previewMode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              {previewMode ? 'Exit Preview' : 'Preview'}
            </button>
            
            <button
              onClick={() => window.open(`/dashboard/${slug}`, '_blank')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              View Live
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div 
          ref={canvasRef}
          className="relative min-h-screen overflow-hidden"
          style={{
            background: getCanvasBackground(editorData.background_config),
            fontFamily: 'Inter, system-ui, sans-serif'
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Custom Navbar */}
          <div 
            className="sticky top-0 z-40"
            style={{
              background: editorData.navbar_theme.background,
              color: editorData.navbar_theme.text_color,
              height: editorData.navbar_theme.height,
              opacity: editorData.navbar_theme.transparency
            }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
              <div className="flex items-center">
                {editorData.navbar_theme.logo_url && (
                  <img 
                    src={editorData.navbar_theme.logo_url} 
                    alt="Logo" 
                    className="h-8 w-auto mr-4"
                  />
                )}
                <span className="text-xl font-bold">{editorData.title}</span>
              </div>
              <nav className="flex space-x-6">
                <a href="#about" className="hover:opacity-75 transition-opacity">About</a>
                <a href="#team" className="hover:opacity-75 transition-opacity">Team</a>
                <a href="#comments" className="hover:opacity-75 transition-opacity">Comments</a>
              </nav>
            </div>
          </div>

          {/* Main Project Content - Editable Version of Dashboard */}
          <div className="relative">
            {/* Project Banner Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="aspect-video md:aspect-[21/9] bg-gradient-to-r from-purple-500 to-blue-500 relative overflow-hidden rounded-xl mb-8 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => document.getElementById('banner-upload').click()}
            >
              {editorData.poster_image ? (
                <img
                  src={`data:image/jpeg;base64,${editorData.poster_image}`}
                  alt={editorData.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <div className="text-center">
                    <PhotoIcon className="h-16 w-16 opacity-50 mx-auto mb-4" />
                    <span className="text-xl">Click to add project banner</span>
                    <p className="text-sm opacity-75 mt-2">Recommended: 1920x1080 or 16:9 ratio</p>
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-black/30" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">{editorData.title}</h1>
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-500 text-white">
                      {editorData.status?.replace('_', ' ') || 'open'}
                    </span>
                    <span className="px-3 py-1 rounded-full text-sm font-medium border border-green-400 text-green-400">
                      {editorData.difficulty || 'beginner'}
                    </span>
                    <div className="flex items-center gap-2 text-white/90">
                      <StarIcon className="h-5 w-5" />
                      {editorData.xp_reward || 100} XP
                    </div>
                  </div>
                  
                  {/* Join Button - Protected Element */}
                  <div className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 shadow-lg text-lg">
                    <UserGroupIcon className="h-6 w-6" />
                    JOIN NOW
                  </div>
                </div>
              </div>
              {/* Edit Banner Overlay */}
              <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-lg text-sm">
                <PhotoIcon className="h-4 w-4 inline mr-1" />
                Edit Banner
              </div>
            </motion.div>

            {/* Hidden file input for banner upload */}
            <input
              id="banner-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleBannerUpload}
            />

            {/* Main Content Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content Column */}
              <div className="lg:col-span-2 space-y-8">
                {/* About Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 relative group"
                >
                  <h2 className="text-2xl font-bold text-white mb-4">About This Project</h2>
                  <textarea
                    value={editorData.description || ""}
                    onChange={(e) => setEditorData(prev => ({ ...prev, description: e.target.value }))}
                    onBlur={() => saveDescriptionToBackend(editorData.description)}
                    className="w-full bg-transparent text-purple-200 leading-relaxed resize-none border-none outline-none focus:bg-white/5 rounded p-2 transition-colors"
                    placeholder="Click to edit project description..."
                    rows={4}
                  />
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 text-white px-2 py-1 rounded text-xs">
                    Click to edit
                  </div>
                </motion.div>

                {/* Comments Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6"
                >
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <ChatBubbleLeftIcon className="h-6 w-6" />
                    Project Discussion
                  </h3>
                  <div className="space-y-4">
                    <div className="text-purple-200 text-center py-8">
                      <ChatBubbleLeftIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Comments will appear here when the project is live</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Project Stats */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6"
                >
                  <h3 className="text-lg font-bold text-white mb-4">Project Details</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-purple-200">
                      <span>Participants</span>
                      <span>{editorData.current_participants || 1}/{editorData.max_participants || 5}</span>
                    </div>
                    <div className="flex items-center justify-between text-purple-200">
                      <span>Difficulty</span>
                      <span className="capitalize">{editorData.difficulty || 'beginner'}</span>
                    </div>
                    <div className="flex items-center justify-between text-purple-200">
                      <span>XP Reward</span>
                      <span>{editorData.xp_reward || 100} XP</span>
                    </div>
                  </div>
                </motion.div>

                {/* Team Members */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6"
                >
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <UserGroupIcon className="h-5 w-5" />
                    Team Members
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                        {user?.display_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm">{user?.display_name || user?.username || 'Project Creator'}</p>
                        <p className="text-purple-300 text-xs">Creator</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Custom Sections */}
          {editorData.custom_sections?.map((section) => (
            <DraggableSection
              key={section.id}
              section={section}
              isSelected={selectedElement === section.id}
              isDragging={draggedElement === section.id}
              previewMode={previewMode}
              onMouseDown={(e) => handleMouseDown(e, section)}
              onSelect={() => setSelectedElement(section.id)}
              editorData={editorData}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper function to get canvas background
const getCanvasBackground = (config) => {
  if (!config) return '#ffffff';
  
  switch (config.type) {
    case 'gradient':
      return config.gradient || '#ffffff';
    case 'image':
      return config.image_url 
        ? `url(${config.image_url}) center/cover no-repeat`
        : config.color || '#ffffff';
    case 'solid':
    default:
      return config.color || '#ffffff';
  }
};

export default VisualEditor;
