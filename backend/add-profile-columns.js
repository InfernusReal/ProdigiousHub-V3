const { pool } = require('./db');

const addProfileColumns = async () => {
  try {
    console.log('Adding profile columns to users table...');
    
    // Add columns if they don't exist
    const columnsToAdd = [
      'bio TEXT NULL',
      'portfolio_url VARCHAR(500) NULL',
      'linkedin_url VARCHAR(500) NULL',
      'location VARCHAR(255) NULL',
      'skills JSON NULL'
    ];
    
    for (const column of columnsToAdd) {
      const columnName = column.split(' ')[0];
      try {
        await pool.execute(`ALTER TABLE users ADD COLUMN ${column}`);
        console.log(`✅ Added column: ${columnName}`);
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log(`⚠️  Column ${columnName} already exists, skipping`);
        } else {
          console.error(`❌ Error adding column ${columnName}:`, error.message);
        }
      }
    }
    
    console.log('🎉 Profile columns setup complete!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error setting up profile columns:', error);
    process.exit(1);
  }
};

addProfileColumns();
