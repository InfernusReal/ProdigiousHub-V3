console.log('Starting test...');

const mysql = require('mysql2/promise');
require('dotenv').config();

console.log('Modules loaded, starting connection test...');

const testConnection = async () => {
  try {
    console.log('Environment variables:');
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_PORT:', process.env.DB_PORT);
    console.log('DB_USER:', process.env.DB_USER);
    console.log('DB_NAME:', process.env.DB_NAME);
    console.log('DB_PASSWORD exists:', !!process.env.DB_PASSWORD);
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ProdigiousHub'
    });
    
    console.log('Connected successfully!');
    
    const [tables] = await connection.execute(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = ?
    `, [process.env.DB_NAME || 'ProdigiousHub']);
    
    console.log('Tables found:', tables.length);
    tables.forEach(table => console.log(' -', table.table_name));
    
    await connection.end();
    console.log('Test completed successfully!');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};

testConnection();
