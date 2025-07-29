const mysql = require('mysql2/promise');
require('dotenv').config();

async function addMissingColumns() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'F4D1BD8Bs@1234',
    database: 'ProdigiousHub',
    port: 3001
  });

  try {
    console.log('Adding missing columns to projects table...');
    
    // Check if columns exist first, then add them if they don't
    const columns = [
      'theme_settings',
      'layout_config', 
      'custom_sections',
      'navbar_theme',
      'background_config'
    ];
    
    for (const column of columns) {
      try {
        await connection.execute(`ALTER TABLE projects ADD COLUMN ${column} JSON DEFAULT NULL`);
        console.log(`✅ Added column: ${column}`);
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log(`⚠️  Column ${column} already exists`);
        } else {
          console.error(`❌ Error adding column ${column}:`, error.message);
        }
      }
    }
    
    console.log('🚀 Columns update complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

addMissingColumns();
