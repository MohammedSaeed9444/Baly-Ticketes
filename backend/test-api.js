#!/usr/bin/env node

const http = require('http');

const API_BASE = 'http://localhost:3001';

// Test data
const testTicket = {
  tripId: "TEST-251011-08622-5442",
  tripDate: "2025-10-12",
  driverId: 12345,
  reason: "Test Complaint",
  city: "Test City",
  serviceType: "Eco",
  customerPhone: "7700123456",
  agentName: "Test Agent"
};

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: jsonBody });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing CRM Ticketing API...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health check...');
    const health = await makeRequest('GET', '/health');
    console.log(`   Status: ${health.status} ${health.status === 200 ? '✅' : '❌'}`);
    console.log(`   Response: ${JSON.stringify(health.data)}\n`);

    // Test 2: Create ticket
    console.log('2. Testing create ticket...');
    const createResult = await makeRequest('POST', '/api/tickets', testTicket);
    console.log(`   Status: ${createResult.status} ${createResult.status === 201 ? '✅' : '❌'}`);
    console.log(`   Response: ${JSON.stringify(createResult.data)}\n`);

    // Test 3: Get tickets
    console.log('3. Testing get tickets...');
    const getResult = await makeRequest('GET', '/api/tickets');
    console.log(`   Status: ${getResult.status} ${getResult.status === 200 ? '✅' : '❌'}`);
    console.log(`   Response: ${JSON.stringify(getResult.data)}\n`);

    // Test 4: Get tickets with filters
    console.log('4. Testing get tickets with filters...');
    const filterResult = await makeRequest('GET', '/api/tickets?reason=Test%20Complaint&page=1&limit=10');
    console.log(`   Status: ${filterResult.status} ${filterResult.status === 200 ? '✅' : '❌'}`);
    console.log(`   Response: ${JSON.stringify(filterResult.data)}\n`);

    // Test 5: Export tickets
    console.log('5. Testing export tickets...');
    const exportResult = await makeRequest('GET', '/api/tickets/export');
    console.log(`   Status: ${exportResult.status} ${exportResult.status === 200 ? '✅' : '❌'}`);
    console.log(`   Response: ${typeof exportResult.data === 'string' ? 'CSV data received' : JSON.stringify(exportResult.data)}\n`);

    console.log('🎉 All tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the server is running: npm run dev');
  }
}

runTests();
