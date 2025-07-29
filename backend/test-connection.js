const mysql = require('mysql2/promise');
require('dotenv').config();

const testConnection = async () => {
  console.log('Testing MySQL connection...');
  
  try {
    console.log('Attempting connection with:');
    console.log('Host:', process.env.DB_HOST);
    console.log('Port:', process.env.DB_PORT);
    console.log('User:', process.env.DB_USER);
    console.log('Database:', process.env.DB_NAME);
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      connectTimeout: 5000
    });
    
    console.log('✅ Connection successful!');
    
    const [result] = await connection.execute('SELECT 1 as test');
    console.log('✅ Query successful:', result);
    
    await connection.end();
    console.log('✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error code:', error.code);
  }
};

// Set a timeout
setTimeout(() => {
  console.error('Test timed out');
  process.exit(1);
}, 10000);

testConnection();
