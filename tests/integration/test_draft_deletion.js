// Test script to check draft deletion
const BACKEND = 'http://localhost:5000';

async function testDraftDeletion() {
  // You'll need to replace this with a real token from localStorage
  const token = 'YOUR_TOKEN_HERE';
  
  try {
    // First, fetch drafts to see what IDs we have
    console.log('📥 Fetching drafts...');
    const draftsRes = await fetch(`${BACKEND}/api/drafts/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!draftsRes.ok) {
      throw new Error(`Failed to fetch drafts: ${draftsRes.status}`);
    }
    
    const drafts = await draftsRes.json();
    console.log('📋 Available drafts:', drafts);
    
    if (drafts.length === 0) {
      console.log('No drafts to test deletion with');
      return;
    }
    
    // Try to delete the first draft
    const draftToDelete = drafts[0];
    console.log(`🗑️ Attempting to delete draft ID: ${draftToDelete.id}`);
    
    const deleteRes = await fetch(`${BACKEND}/api/posts/${draftToDelete.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Delete response status:', deleteRes.status);
    
    if (!deleteRes.ok) {
      const errorData = await deleteRes.json();
      console.error('Delete failed:', errorData);
    } else {
      const successData = await deleteRes.json();
      console.log('✅ Delete successful:', successData);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

// Uncomment and add your token to run this test
// testDraftDeletion();