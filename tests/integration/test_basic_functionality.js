// Test basic functionality without tags
// Run this with: node test_basic_functionality.js

const BACKEND = "http://localhost:5000";

async function testBasicFunctionality() {
  console.log('🔍 Testing Basic Functionality (No Tags)...\n');

  // Replace with your actual JWT token
  const TOKEN = 'your_jwt_token_here';
  
  if (TOKEN === 'your_jwt_token_here') {
    console.log('❌ Please replace TOKEN with your actual JWT token');
    console.log('   Get it from browser localStorage after logging in');
    return;
  }

  try {
    // Test 1: Create a basic post without tags
    console.log('1. Testing basic post creation (no tags)...');
    const basicPost = {
      title: 'Basic Test Post',
      body: 'This is a basic test post without tags',
      is_draft: false
    };

    console.log('   Sending:', basicPost);

    const createRes = await fetch(`${BACKEND}/api/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify(basicPost)
    });

    console.log('   Response status:', createRes.status);
    
    if (createRes.ok) {
      const data = await createRes.json();
      console.log('✅ Basic post creation works');
      console.log('   Created post:', data);
      
      // Test 2: Fetch posts with old API
      console.log('\n2. Testing old API fetch...');
      const oldFetchRes = await fetch(`${BACKEND}/api/posts/me`, {
        headers: { 'Authorization': `Bearer ${TOKEN}` }
      });

      console.log('   Old API status:', oldFetchRes.status);
      
      if (oldFetchRes.ok) {
        const oldData = await oldFetchRes.json();
        console.log('✅ Old API works');
        console.log('   Posts count:', Array.isArray(oldData) ? oldData.length : 'Not array');
        
        if (Array.isArray(oldData) && oldData.length > 0) {
          console.log('   Sample post keys:', Object.keys(oldData[0]));
        }
      } else {
        console.log('❌ Old API failed');
      }

      // Test 3: Fetch posts with new API
      console.log('\n3. Testing new paginated API...');
      const newFetchRes = await fetch(`${BACKEND}/api/posts/me?page=1&limit=5`, {
        headers: { 'Authorization': `Bearer ${TOKEN}` }
      });

      console.log('   New API status:', newFetchRes.status);
      
      if (newFetchRes.ok) {
        const newData = await newFetchRes.json();
        console.log('✅ New API works');
        console.log('   Response structure:', Object.keys(newData));
        console.log('   Has pagination:', !!newData.pagination);
        console.log('   Posts count:', newData.data?.length || 0);
      } else {
        const error = await newFetchRes.text();
        console.log('❌ New API failed:', error);
      }

    } else {
      const error = await createRes.text();
      console.log('❌ Basic post creation failed:', error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testBasicFunctionality();