// Test script to verify search, pagination, and sorting functionality
// Run this with: node test_search_pagination.js

const BACKEND = "http://localhost:5000";

async function testSearchPagination() {
  console.log('🔍 Testing Search, Pagination & Sorting...\n');

  // Replace with your actual JWT token
  const TOKEN = 'your_jwt_token_here';
  
  if (TOKEN === 'your_jwt_token_here') {
    console.log('❌ Please replace TOKEN with your actual JWT token');
    return;
  }

  try {
    // Test 1: Basic pagination
    console.log('1. Testing basic pagination...');
    const paginationRes = await fetch(`${BACKEND}/api/posts/me?page=1&limit=5`, {
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    });

    if (paginationRes.ok) {
      const data = await paginationRes.json();
      console.log('✅ Pagination works');
      console.log('   Total notes:', data.pagination.total);
      console.log('   Current page:', data.pagination.page);
      console.log('   Has more:', data.pagination.hasMore);
      console.log('   Notes returned:', data.data.length);
    } else {
      console.log('❌ Pagination failed:', paginationRes.status);
    }

    // Test 2: Search functionality
    console.log('\n2. Testing search...');
    const searchRes = await fetch(`${BACKEND}/api/posts/me?search=test&limit=10`, {
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    });

    if (searchRes.ok) {
      const data = await searchRes.json();
      console.log('✅ Search works');
      console.log('   Search results:', data.data.length);
      data.data.forEach(note => {
        console.log(`   - "${note.title}" (contains "test": ${note.title.toLowerCase().includes('test') || note.body.toLowerCase().includes('test')})`);
      });
    } else {
      console.log('❌ Search failed:', searchRes.status);
    }

    // Test 3: Sorting
    console.log('\n3. Testing sorting...');
    const sortRes = await fetch(`${BACKEND}/api/posts/me?sort_by=title&sort_order=asc&limit=5`, {
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    });

    if (sortRes.ok) {
      const data = await sortRes.json();
      console.log('✅ Sorting works');
      console.log('   Sorted by title (ascending):');
      data.data.forEach(note => {
        console.log(`   - "${note.title}"`);
      });
    } else {
      console.log('❌ Sorting failed:', sortRes.status);
    }

    // Test 4: Tag filtering
    console.log('\n4. Testing tag filtering...');
    const tagRes = await fetch(`${BACKEND}/api/posts/me?tag=Work&limit=10`, {
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    });

    if (tagRes.ok) {
      const data = await tagRes.json();
      console.log('✅ Tag filtering works');
      console.log('   Notes with "Work" tag:', data.data.length);
      data.data.forEach(note => {
        console.log(`   - "${note.title}" (tags: ${note.tags?.join(', ') || 'none'})`);
      });
    } else {
      console.log('❌ Tag filtering failed:', tagRes.status);
    }

    // Test 5: Get available tags
    console.log('\n5. Testing tags endpoint...');
    const tagsRes = await fetch(`${BACKEND}/api/posts/me/tags`, {
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    });

    if (tagsRes.ok) {
      const tags = await tagsRes.json();
      console.log('✅ Tags endpoint works');
      console.log('   Available tags:', tags.join(', '));
    } else {
      console.log('❌ Tags endpoint failed:', tagsRes.status);
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
console.log('4. Create some test notes with different tags');
console.log('5. Run: node test_search_pagination.js\n');

testSearchPagination();