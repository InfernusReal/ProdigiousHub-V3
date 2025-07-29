-- Migration to add completed_at columns for project completion tracking
-- Run this SQL script in your MySQL database

-- Add completed_at column to projects table if it doesn't exist
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP NULL;

-- Add completed_at column to project_participants table if it doesn't exist
ALTER TABLE project_participants 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP NULL;

-- Verify the changes
DESCRIBE projects;
DESCRIBE project_participants;

-- Show any existing completed projects (for testing)
SELECT id, title, status, created_at, completed_at 
FROM projects 
WHERE status = 'completed';

-- Show project participants with completion info
SELECT pp.*, p.title as project_title 
FROM project_participants pp
JOIN projects p ON pp.project_id = p.id
WHERE p.status = 'completed';
