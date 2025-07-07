// Test script to verify API keys work
const https = require('https');

// Test Gemini API key
async function testGeminiAPI() {
  const apiKey = 'AIzaSyBr-154TjyAOxdACdrgzhnuNWdROygjTgI';
  const prompt = 'Hello, this is a test message.';
  
  const data = JSON.stringify({
    contents: [{
      parts: [{
        text: prompt
      }]
    }]
  });

  const options = {
    hostname: 'generativelanguage.googleapis.com',
    port: 443,
    path: `/v1/models/gemini-pro:generateContent?key=${apiKey}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log('Gemini API Response Status:', res.statusCode);
        console.log('Gemini API Response:', responseData);
        resolve({ status: res.statusCode, data: responseData });
      });
    });

    req.on('error', (error) => {
      console.error('Gemini API Error:', error);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Test DeepSeek API key
async function testDeepSeekAPI() {
  const apiKey = 'sk-1ad99b5f12174c749770dbe684a6d37c';
  const prompt = 'Hello, this is a test message.';
  
  const data = JSON.stringify({
    model: 'deepseek-chat',
    messages: [{
      role: 'user',
      content: prompt
    }],
    max_tokens: 100
  });

  const options = {
    hostname: 'api.deepseek.com',
    port: 443,
    path: '/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'Content-Length': data.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log('DeepSeek API Response Status:', res.statusCode);
        console.log('DeepSeek API Response:', responseData);
        resolve({ status: res.statusCode, data: responseData });
      });
    });

    req.on('error', (error) => {
      console.error('DeepSeek API Error:', error);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Run tests
async function runTests() {
  console.log('Testing API keys...\n');
  
  console.log('=== Testing Gemini API ===');
  try {
    await testGeminiAPI();
  } catch (error) {
    console.error('Gemini test failed:', error.message);
  }
  
  console.log('\n=== Testing DeepSeek API ===');
  try {
    await testDeepSeekAPI();
  } catch (error) {
    console.error('DeepSeek test failed:', error.message);
  }
}

runTests(); 