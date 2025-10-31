// Test script to check if labels API is working from frontend perspective
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

console.log('API_BASE:', API_BASE);

async function testLabelsAPI() {
  try {
    console.log('Testing labels API...');
    const response = await fetch(`${API_BASE}/labels`);
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Labels data:', data);
    console.log('Number of labels:', data.length);
    
    return data;
  } catch (error) {
    console.error('Error fetching labels:', error);
    return [];
  }
}

// Run the test
testLabelsAPI();