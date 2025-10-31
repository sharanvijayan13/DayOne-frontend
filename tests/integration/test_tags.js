// Test script to verify tags functionality
// Run this with: node test_tags.js

const BACKEND = "http://localhost:5000";

async function testTags() {
  console.log('🏷️ Testing Tags Functionality...\n');

  // Replace with your actual JWT token
  const TOKEN = 'your_jwt_token_here';
  
  if (TOKEN === 'your_jwt_token_here') {
    console.log('❌ Please replace TOKEN with your actual JWT token');
    return;
  }

  try {
    // Test 1: Create a post with tags
    console.log('1. Creating a post with tags...');
    const testPost = {
      title: 'Test Post with Tags',
      body: 'This is a test post to verify tag functionality',
      tags: ['Work', 'Important', 'Test'],
      is_draft: false
    };

    console.log('   Sending post data:', testPost);

    const createRes = await fetch(`${BACKEND}/api/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify(testPost)
    });

    console.log('   Create response status:', createRes.status);
    
    if (createRes.ok) {
      const createdPost = await createRes.json();
      console.log('✅ Post created successfully');
      console.log('   Post ID:', createdPost.id);
      console.log('   Tags in response:', createdPost.tags);
      
      // Test 2: Fetch the post to verify tags are saved
      console.log('\n2. Fetching posts to verify tags...');
      const fetchRes = await fetch(`${BACKEND}/api/posts/me`, {
        headers: {
          'Authorization': `Bearer ${TOKEN}`
        }
      });

      if (fetchRes.ok) {
        const posts = await fetchRes.json();
        const testPostFromDB = posts.find(p => p.id === createdPost.id);
        
        if (testPostFromDB) {
          console.log('✅ Post found in database');
          console.log('   Tags from database:', testPostFromDB.tags);
          console.log('   Tags type:', typeof testPostFromDB.tags);
          console.log('   Is array:', Array.isArray(testPostFromDB.tags));
        } else {
          console.log('❌ Test post not found in database');
        }
      } else {
        console.log('❌ Failed to fetch posts');
      }

    } else {
      const error = await createRes.text();
      console.log('❌ Failed to create post:', error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Instructions
console.log('📋 Instructions:');
console.log('1. Make sure your backend is running on localhost:5000');
console.log('2. Run the database migration: add_tags_migration.sql');
console.log('3. Replace TOKEN variable with your actual JWT token');
console.log('4. Run: node test_tags.js\n');

testTags();