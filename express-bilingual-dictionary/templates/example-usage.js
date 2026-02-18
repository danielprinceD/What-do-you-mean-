/**
 * Example usage of the Bilingual Dictionary API
 * Run this file with: node example-usage.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testDictionaryAPI() {
  console.log('Testing Bilingual Dictionary API\n');
  console.log('='.repeat(50));

  // Test 1: GET request
  try {
    console.log('\n1. Testing GET /api/dictionary/hello');
    const response1 = await axios.get(`${BASE_URL}/api/dictionary/hello`);
    console.log('Response:', JSON.stringify(response1.data, null, 2));
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }

  // Test 2: POST request
  try {
    console.log('\n2. Testing POST /api/dictionary');
    const response2 = await axios.post(`${BASE_URL}/api/dictionary`, {
      word: 'beautiful'
    });
    console.log('Response:', JSON.stringify(response2.data, null, 2));
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }

  // Test 3: Word not found
  try {
    console.log('\n3. Testing with non-existent word');
    const response3 = await axios.get(`${BASE_URL}/api/dictionary/xyzabc123`);
    console.log('Response:', JSON.stringify(response3.data, null, 2));
  } catch (error) {
    console.error('Error (expected):', error.response?.data || error.message);
  }

  // Test 4: Health check
  try {
    console.log('\n4. Testing health endpoint');
    const response4 = await axios.get(`${BASE_URL}/health`);
    console.log('Response:', JSON.stringify(response4.data, null, 2));
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }

  console.log('\n' + '='.repeat(50));
  console.log('Testing complete!');
}

// Run tests
testDictionaryAPI().catch(console.error);
