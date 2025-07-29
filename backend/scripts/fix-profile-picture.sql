-- SQL script to fix InfernusReal profile picture
-- Run this in your MySQL database

-- First, let's see the current state
SELECT id, username, display_name, 
       CASE 
         WHEN profile_picture IS NULL THEN 'No profile_picture'
         WHEN LENGTH(profile_picture) > 0 THEN CONCAT('Has profile_picture (', LENGTH(profile_picture), ' bytes)')
         ELSE 'Empty profile_picture'
       END as profile_picture_status,
       profile_picture_url
FROM users 
WHERE username = 'InfernusReal';

-- Update to use the API endpoint for serving profile pictures
UPDATE users 
SET profile_picture_url = CONCAT('/api/profile-picture/', id)
WHERE username = 'InfernusReal' 
  AND profile_picture IS NOT NULL 
  AND LENGTH(profile_picture) > 0
  AND (profile_picture_url IS NULL OR profile_picture_url = '');

-- Verify the update
SELECT id, username, display_name, profile_picture_url
FROM users 
WHERE username = 'InfernusReal';

-- If you want to see all users with profile picture issues:
-- SELECT id, username, display_name, 
--        CASE 
--          WHEN profile_picture IS NULL THEN 'No profile_picture'
--          WHEN LENGTH(profile_picture) > 0 THEN 'Has profile_picture'
--          ELSE 'Empty profile_picture'
--        END as profile_picture_status,
--        profile_picture_url
-- FROM users 
-- WHERE (profile_picture IS NOT NULL AND LENGTH(profile_picture) > 0) 
--   AND (profile_picture_url IS NULL OR profile_picture_url = '');
