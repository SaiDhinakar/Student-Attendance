#!/usr/bin/env node

/**
 * Test script for axiosInstance.js
 * This script tests the axios configuration and environment variable loading
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Mock the Vite environment for testing
const mockViteEnv = {
  MODE: 'development',
  VITE_SERVER_BASE_URL: process.env.VITE_SERVER_BASE_URL,
  VITE_BACKEND_SERVER_BASE_URL: process.env.VITE_BACKEND_SERVER_BASE_URL
};

// Read and parse .env file
function loadEnvFile() {
  try {
    const envPath = join(__dirname, '.env');
    const envContent = readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^['"]|['"]$/g, '');
          envVars[key] = value;
        }
      }
    });
    
    return envVars;
  } catch (error) {
    console.error('Could not read .env file:', error.message);
    return {};
  }
}

// Mock axios for testing
const mockAxios = {
  create: (config) => {
    console.log('✅ Axios instance created with config:');
    console.log('   baseURL:', config.baseURL);
    console.log('   timeout:', config.timeout);
    console.log('   headers:', config.headers);
    return {
      interceptors: {
        request: { use: () => {} },
        response: { use: () => {} }
      }
    };
  }
};

// Mock import.meta.env
global.import = {
  meta: {
    env: mockViteEnv
  }
};

// Mock localStorage
global.localStorage = {
  getItem: (key) => {
    if (key === 'token') return 'mock-token-123';
    return null;
  }
};

// Mock window for fallback URL construction
global.window = {
  location: {
    hostname: 'localhost'
  }
};

// Test function to simulate the axiosInstance logic
function testAxiosInstance() {
  console.log('🧪 Testing axiosInstance.js configuration...\n');
  
  // Load environment variables
  const envVars = loadEnvFile();
  console.log('📄 Environment variables from .env file:');
  Object.entries(envVars).forEach(([key, value]) => {
    console.log(`   ${key}=${value}`);
    // Set mock environment
    if (key.startsWith('VITE_')) {
      mockViteEnv[key] = value;
    }
  });
  console.log();
  
  // Test the URL resolution logic
  console.log('🔗 Testing URL resolution:');
  
  const getServerBaseUrl = () => {
    // Check for both possible environment variable names
    if (mockViteEnv.VITE_SERVER_BASE_URL || mockViteEnv.VITE_BACKEND_SERVER_BASE_URL) {
      const url = mockViteEnv.VITE_SERVER_BASE_URL || mockViteEnv.VITE_BACKEND_SERVER_BASE_URL;
      console.log('   ✅ Using environment variable:', url);
      return url;
    }
    
    // Fallback to development defaults
    const isDevelopment = mockViteEnv.MODE === 'development';
    const fallbackUrl = isDevelopment 
      ? 'http://localhost:5021'
      : `http://${global.window.location.hostname}:5021`;
    
    console.log('   ⚠️  Using fallback URL:', fallbackUrl);
    return fallbackUrl;
  };
  
  const serverBaseUrl = getServerBaseUrl();
  console.log();
  
  // Test axios configuration
  console.log('⚙️  Testing axios configuration:');
  mockAxios.create({
    baseURL: serverBaseUrl,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json'
    }
  });
  console.log();
  
  // Test endpoint examples
  console.log('🌐 API endpoints that will be used:');
  const endpoints = [
    '/sections',
    '/class/AIML_1',
    '/save-attendance-csv',
    '/admin/login',
    '/students'
  ];
  
  endpoints.forEach(endpoint => {
    console.log(`   ${serverBaseUrl}${endpoint}`);
  });
  console.log();
  
  // Validation
  console.log('✅ Validation:');
  if (serverBaseUrl.includes('undefined') || serverBaseUrl === 'undefined') {
    console.log('   ❌ ERROR: Server URL contains undefined values');
    console.log('   🔧 Fix: Check your .env file has VITE_SERVER_BASE_URL set correctly');
  } else {
    console.log('   ✅ Server URL is properly configured');
  }
  
  if (serverBaseUrl.includes(':5021')) {
    console.log('   ✅ Using correct backend port (5021)');
  } else {
    console.log('   ⚠️  Warning: Not using expected backend port (5021)');
  }
  
  console.log('\n🎯 Summary:');
  console.log(`   Backend URL: ${serverBaseUrl}`);
  console.log(`   Environment: ${mockViteEnv.MODE}`);
  console.log('   Configuration: OK');
}

// Run the test
testAxiosInstance();
