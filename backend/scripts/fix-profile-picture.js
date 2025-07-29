const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'prodigyhub'
};

async function fixProfilePicture() {
  let connection;
  
  try {
    console.log('🔄 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    // Find the InfernusReal account
    console.log('🔍 Looking for InfernusReal account...');
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE username = ?',
      ['InfernusReal']
    );
    
    if (users.length === 0) {
      console.log('❌ InfernusReal account not found!');
      return;
    }
    
    const user = users[0];
    console.log('✅ Found InfernusReal account:', {
      id: user.id,
      username: user.username,
      display_name: user.display_name,
      profile_picture: user.profile_picture ? 'Has profile_picture data' : 'No profile_picture',
      profile_picture_url: user.profile_picture_url || 'No profile_picture_url'
    });
    
    // Check if user has profile_picture data but no profile_picture_url
    if (user.profile_picture && !user.profile_picture_url) {
      console.log('🔧 User has profile_picture data but no profile_picture_url. Fixing...');
      
      // Create the profile picture URL path
      const fileName = `profile_${user.id}_${Date.now()}.jpg`;
      const uploadsDir = path.join(__dirname, '..', 'uploads');
      const filePath = path.join(uploadsDir, fileName);
      
      // Ensure uploads directory exists
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
        console.log('📁 Created uploads directory');
      }
      
      try {
        // Convert base64 to file if profile_picture is base64
        let imageData = user.profile_picture;
        
        if (imageData.startsWith('data:image/')) {
          // Remove data URL prefix
          imageData = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
        }
        
        // Write the image file
        fs.writeFileSync(filePath, imageData, 'base64');
        console.log('💾 Saved profile picture to:', filePath);
        
        // Update the database with the file URL
        const profilePictureUrl = `/uploads/${fileName}`;
        await connection.execute(
          'UPDATE users SET profile_picture_url = ? WHERE id = ?',
          [profilePictureUrl, user.id]
        );
        
        console.log('✅ Updated profile_picture_url in database:', profilePictureUrl);
        
      } catch (fileError) {
        console.log('⚠️ Could not save file, but will set a default URL');
        
        // If we can't save the file, at least set a URL that points to the base64 data
        // We'll update the backend to handle this case
        await connection.execute(
          'UPDATE users SET profile_picture_url = ? WHERE id = ?',
          [`/api/profile-picture/${user.id}`, user.id]
        );
        
        console.log('✅ Set profile_picture_url to API endpoint');
      }
      
    } else if (!user.profile_picture && !user.profile_picture_url) {
      console.log('ℹ️ User has no profile picture data. Setting default...');
      
      // Set a default profile picture URL
      await connection.execute(
        'UPDATE users SET profile_picture_url = ? WHERE id = ?',
        ['/account_circle_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.png', user.id]
      );
      
      console.log('✅ Set default profile picture URL');
      
    } else {
      console.log('ℹ️ Profile picture URL already exists:', user.profile_picture_url);
    }
    
    // Verify the fix
    console.log('🔍 Verifying fix...');
    const [updatedUsers] = await connection.execute(
      'SELECT username, profile_picture_url FROM users WHERE username = ?',
      ['InfernusReal']
    );
    
    if (updatedUsers.length > 0) {
      console.log('✅ Verification successful:', {
        username: updatedUsers[0].username,
        profile_picture_url: updatedUsers[0].profile_picture_url
      });
    }
    
    console.log('🎉 Profile picture fix completed!');
    
  } catch (error) {
    console.error('❌ Error fixing profile picture:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Also create an endpoint to serve profile pictures from base64 data
async function createProfilePictureEndpoint() {
  const endpointCode = `
// Add this to your server.js or routes
app.get('/api/profile-picture/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const [users] = await db.execute(
      'SELECT profile_picture FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0 || !users[0].profile_picture) {
      return res.status(404).json({ error: 'Profile picture not found' });
    }
    
    let imageData = users[0].profile_picture;
    
    // Handle base64 data
    if (imageData.startsWith('data:image/')) {
      const matches = imageData.match(/data:image\\/([a-zA-Z]*);base64,(.*)$/);
      if (matches && matches.length === 3) {
        const imageType = matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');
        
        res.set('Content-Type', \`image/\${imageType}\`);
        res.set('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
        return res.send(buffer);
      }
    }
    
    // If it's already binary data
    res.set('Content-Type', 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(imageData);
    
  } catch (error) {
    console.error('Error serving profile picture:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
`;

  console.log('\n📝 Add this endpoint to your server.js file:');
  console.log(endpointCode);
}

// Run the script
console.log('🚀 Starting profile picture fix script...');
fixProfilePicture().then(() => {
  createProfilePictureEndpoint();
});
