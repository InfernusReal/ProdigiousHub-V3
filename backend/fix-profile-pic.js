const mysql = require('mysql2/promise');
require('dotenv').config();

const fixProfilePictureColumn = async () => {
  let connection;
  
  try {
    console.log('🔧 Fixing profile_picture column size...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3001,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'F4D1BD8Bs@1234',
      database: process.env.DB_NAME || 'ProdigiousHub'
    });

    console.log('✅ Connected to database');

    // Change profile_picture column to LONGTEXT to handle base64 images
    await connection.execute(`
      ALTER TABLE users 
      MODIFY COLUMN profile_picture LONGTEXT DEFAULT NULL
    `);

    console.log('✅ Changed profile_picture column to LONGTEXT');

    await connection.end();
    console.log('🎉 Profile picture column fixed! You can now upload larger images.');
    
  } catch (error) {
    console.error('❌ Error fixing profile picture column:', error);
    if (connection) {
      await connection.end();
    }
    process.exit(1);
  }
};

fixProfilePictureColumn();
