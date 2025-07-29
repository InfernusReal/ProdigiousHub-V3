const { pool } = require('./db');

async function fixProjectData() {
  try {
    console.log('🔍 Checking project data for JSON parsing issues...');
    
    // Get all projects and check their tags
    const [projects] = await pool.query('SELECT id, title, tags FROM projects');
    
    console.log(`Found ${projects.length} projects to check:`);
    
    for (const project of projects) {
      console.log(`\nProject ${project.id}: "${project.title}"`);
      console.log(`Raw tags: "${project.tags}"`);
      console.log(`Tags type: ${typeof project.tags}`);
      console.log(`Tags length: ${project.tags ? project.tags.length : 'null'}`);
      
      // Try to parse the tags
      let needsUpdate = false;
      let newTags = '[]';
      
      if (!project.tags || project.tags === '' || (typeof project.tags === 'string' && project.tags.trim() === '')) {
        console.log('❌ Empty tags field - will update to empty array');
        needsUpdate = true;
      } else {
        try {
          // Convert to string if it's not already
          const tagsString = typeof project.tags === 'string' ? project.tags : String(project.tags);
          JSON.parse(tagsString);
          console.log('✅ Tags are valid JSON');
        } catch (error) {
          console.log(`❌ Invalid JSON: ${error.message} - will update to empty array`);
          needsUpdate = true;
        }
      }
      
      if (needsUpdate) {
        await pool.query(
          'UPDATE projects SET tags = ? WHERE id = ?',
          [newTags, project.id]
        );
        console.log(`✅ Updated project ${project.id} tags to empty array`);
      }
    }
    
    console.log('\n🎉 Project data check complete!');
    
  } catch (error) {
    console.error('❌ Error fixing project data:', error);
  } finally {
    process.exit(0);
  }
}

fixProjectData();
