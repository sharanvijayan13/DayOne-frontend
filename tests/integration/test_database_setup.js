// Test script to check if database is properly set up
// Run this with: node test_database_setup.js

const BACKEND = "http://localhost:5000";

async function testDatabaseSetup() {
  console.log('🔍 Testing Database Setup...\n');

  // Replace with your actual JWT token
  const TOKEN = 'your_jwt_token_here';
  
  if (TOKEN === 'your_jwt_token_here') {
    console.log('❌ Please replace TOKEN with your actual JWT token');
    console.log('   You can get this from your browser dev tools after logging in');
    return;
  }

  try {
    // Test 1: Try to create a simple post
    console.log('1. Testing post creation...');
    const testPost = {
      title: 'Database Test Post',
      body: 'This is a test to check if the database is working',
      tags: ['Test'],
      is_draft: false
    };

    console.log('   Sending:', testPost);

    const createRes = await fetch(`${BACKEND}/api/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify(testPost)
    });

    console.log('   Response status:', createRes.status);
    
    if (createRes.ok) {
      const data = await createRes.json();
      console.log('✅ Post creation works');
      console.log('   Created post:', data);
      
      // Test 2: Try to fetch posts with new API
      console.log('\n2. Testing new paginated API...');
      const fetchRes = await fetch(`${BACKEND}/api/posts/me?page=1&limit=10`, {
        headers: { 'Authorization': `Bearer ${TOKEN}` }
      });

      console.log('   Fetch response status:', fetchRes.status);
      
      if (fetchRes.ok) {
        const fetchData = await fetchRes.json();
        console.log('✅ New API works');
        console.log('   Response structure:', Object.keys(fetchData));
        console.log('   Has pagination:', !!fetchData.pagination);
        console.log('   Has data array:', !!fetchData.data);
        console.log('   Posts count:', fetchData.data?.length || 0);
      } else {
        const error = await fetchRes.text();
        console.log('❌ New API failed:', error);
      }

    } else {
      const error = await createRes.text();
      console.log('❌ Post creation failed:', error);
      console.log('\n🔧 Possible issues:');
      console.log('   - Database migration not run (add_tags_migration.sql)');
      console.log('   - Backend not updated with new API');
      console.log('   - Authentication issues');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Possible issues:');
    console.log('   - Backend server not running');
    console.log('   - Wrong backend URL');
    console.log('   - Network issues');
  }
}

// Instructions
console.log('📋 Instructions:');
console.log('1. Make sure your backend is running on localhost:5000');
console.log('2. Run the database migration: add_tags_migration.sql');
console.log('3. Get your JWT token from browser dev tools after logging in');
console.log('4. Replace TOKEN variable with your actual JWT token');
console.log('5. Run: node test_database_setup.js\n');

testDatabaseSetup();