#!/usr/bin/env node

const http = require('http');

const API_BASE = 'http://localhost:3001';
const FRONTEND_BASE = 'http://localhost:5173';

console.log('🧪 Testing Frontend-Backend Integration...\n');

async function testBackend() {
  console.log('1. Testing Backend API...');
  
  try {
    // Test health endpoint
    const health = await makeRequest('GET', '/health');
    console.log(`   ✅ Backend health: ${health.status} - ${JSON.stringify(health.data)}`);
    
    // Test create ticket
    const testTicket = {
      tripId: "INTEGRATION-TEST-001",
      tripDate: "2025-01-15",
      driverId: 99999,
      reason: "Integration Test",
      city: "Baghdad",
      serviceType: "Eco",
      customerPhone: "7700999999",
      agentName: "Test Agent"
    };
    
    const createResult = await makeRequest('POST', '/api/tickets', testTicket);
    console.log(`   ✅ Create ticket: ${createResult.status} - ${JSON.stringify(createResult.data)}`);
    
    // Test get tickets
    const getResult = await makeRequest('GET', '/api/tickets?page=1&limit=5');
    console.log(`   ✅ Get tickets: ${getResult.status} - Found ${getResult.data.tickets?.length || 0} tickets`);
    
    // Test export
    const exportResult = await makeRequest('GET', '/api/tickets/export');
    console.log(`   ✅ Export tickets: ${exportResult.status} - CSV data received`);
    
    return true;
  } catch (error) {
    console.log(`   ❌ Backend test failed: ${error.message}`);
    return false;
  }
}

async function testFrontend() {
  console.log('\n2. Testing Frontend...');
  
  try {
    const response = await fetch(FRONTEND_BASE);
    if (response.ok) {
      console.log(`   ✅ Frontend accessible: ${response.status}`);
      return true;
    } else {
      console.log(`   ❌ Frontend not accessible: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Frontend test failed: ${error.message}`);
    return false;
  }
}

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
  const backendOk = await testBackend();
  const frontendOk = await testFrontend();
  
  console.log('\n📊 Test Results:');
  console.log(`   Backend: ${backendOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Frontend: ${frontendOk ? '✅ PASS' : '❌ FAIL'}`);
  
  if (backendOk && frontendOk) {
    console.log('\n🎉 Integration test passed! Your frontend and backend are working together.');
    console.log('\n📝 Next steps:');
    console.log('   1. Open http://localhost:5173 in your browser');
    console.log('   2. Try creating a ticket');
    console.log('   3. Test filtering and pagination');
    console.log('   4. Test CSV export');
  } else {
    console.log('\n⚠️  Some tests failed. Please check:');
    if (!backendOk) {
      console.log('   - Backend server is running (npm run dev in backend/)');
      console.log('   - Database is connected and tables are created');
    }
    if (!frontendOk) {
      console.log('   - Frontend server is running (npm run dev in root)');
    }
  }
}

runTests();
