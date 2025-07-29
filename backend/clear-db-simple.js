const mysql = require('mysql2/promise');
require('dotenv').config();

async function clearDB() {
  console.log('🔥 CLEARING DATABASE NOW...');
  
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3001,
    user: 'root',
    password: 'F4D1BD8Bs@1234',
    database: 'ProdigiousHub'
  });
  
  console.log('✅ Connected!');
  
  // Turn off foreign key checks
  await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
  
  // Clear tables
  await connection.execute('DELETE FROM user_sessions');
  console.log('🗑️ Cleared user_sessions');
  
  await connection.execute('DELETE FROM activity_feed');
  console.log('🗑️ Cleared activity_feed');
  
  await connection.execute('DELETE FROM users');
  console.log('🗑️ Cleared users');
  
  // Turn foreign key checks back on
  await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
  
  await connection.end();
  console.log('🎉 DATABASE IS CLEAN!');
}

clearDB().catch(console.error);
