#!/usr/bin/env python3
"""
Concurrent API Test Script for Student Attendance System

This script tests the backend API's ability to handle multiple concurrent requests
without blocking or queuing.
"""

import asyncio
import aiohttp
import time
import json
from typing import List, Dict, Any
from datetime import datetime
import random
import sys

# Server configuration
BASE_URL = "http://192.168.223.86:5021"  # Update with your server URL
CONCURRENT_REQUESTS = 10  # Number of concurrent requests to send
TEST_DURATION = 30  # Duration to run the test in seconds

class ConcurrencyTester:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.session = None
        self.results = []
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def health_check(self) -> Dict[str, Any]:
        """Test basic health check endpoint"""
        try:
            start_time = time.time()
            async with self.session.get(f"{self.base_url}/health") as response:
                end_time = time.time()
                data = await response.json()
                return {
                    "success": True,
                    "status_code": response.status,
                    "response_time": end_time - start_time,
                    "data": data
                }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "response_time": None
            }
    
    async def test_concurrent_endpoint(self, request_id: str) -> Dict[str, Any]:
        """Test the dedicated concurrent test endpoint"""
        try:
            start_time = time.time()
            async with self.session.get(f"{self.base_url}/test-concurrent/{request_id}") as response:
                end_time = time.time()
                data = await response.json()
                return {
                    "success": True,
                    "status_code": response.status,
                    "response_time": end_time - start_time,
                    "request_id": request_id,
                    "data": data
                }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "response_time": None,
                "request_id": request_id
            }
    
    async def get_departments(self) -> Dict[str, Any]:
        """Test departments endpoint"""
        try:
            start_time = time.time()
            async with self.session.get(f"{self.base_url}/departments") as response:
                end_time = time.time()
                data = await response.json()
                return {
                    "success": True,
                    "status_code": response.status,
                    "response_time": end_time - start_time,
                    "endpoint": "departments",
                    "data": data
                }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "response_time": None,
                "endpoint": "departments"
            }
    
    async def get_time_blocks(self) -> Dict[str, Any]:
        """Test time blocks endpoint"""
        try:
            start_time = time.time()
            async with self.session.get(f"{self.base_url}/time-blocks") as response:
                end_time = time.time()
                data = await response.json()
                return {
                    "success": True,
                    "status_code": response.status,
                    "response_time": end_time - start_time,
                    "endpoint": "time-blocks",
                    "data": data
                }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "response_time": None,
                "endpoint": "time-blocks"
            }
    
    async def run_single_concurrent_test(self, test_id: int) -> Dict[str, Any]:
        """Run a single test with mixed endpoints"""
        request_id = f"test_{test_id}_{int(time.time())}"
        
        # Randomly choose an endpoint to test
        endpoints = [
            self.health_check,
            lambda: self.test_concurrent_endpoint(request_id),
            self.get_departments,
            self.get_time_blocks
        ]
        
        endpoint = random.choice(endpoints)
        result = await endpoint()
        result["test_id"] = test_id
        result["timestamp"] = datetime.now().isoformat()
        
        return result
    
    async def run_concurrent_batch(self, num_requests: int) -> List[Dict[str, Any]]:
        """Run a batch of concurrent requests"""
        print(f"Starting batch of {num_requests} concurrent requests...")
        
        # Create tasks for concurrent execution
        tasks = [
            self.run_single_concurrent_test(i) 
            for i in range(num_requests)
        ]
        
        # Wait for all tasks to complete
        start_time = time.time()
        results = await asyncio.gather(*tasks, return_exceptions=True)
        end_time = time.time()
        
        # Process results
        processed_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                processed_results.append({
                    "success": False,
                    "error": str(result),
                    "test_id": i,
                    "timestamp": datetime.now().isoformat()
                })
            else:
                processed_results.append(result)
        
        print(f"Batch completed in {end_time - start_time:.2f} seconds")
        return processed_results
    
    async def run_stress_test(self, duration: int, requests_per_batch: int = 5):
        """Run continuous stress test for specified duration"""
        print(f"Starting stress test for {duration} seconds...")
        
        start_time = time.time()
        all_results = []
        batch_count = 0
        
        while time.time() - start_time < duration:
            batch_count += 1
            print(f"\nRunning batch {batch_count}...")
            
            batch_results = await self.run_concurrent_batch(requests_per_batch)
            all_results.extend(batch_results)
            
            # Short pause between batches
            await asyncio.sleep(1)
        
        print(f"\nStress test completed. Total batches: {batch_count}")
        return all_results
    
    def analyze_results(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze test results and provide statistics"""
        total_requests = len(results)
        successful_requests = len([r for r in results if r.get("success", False)])
        failed_requests = total_requests - successful_requests
        
        # Calculate response time statistics
        response_times = [
            r["response_time"] for r in results 
            if r.get("response_time") is not None
        ]
        
        if response_times:
            avg_response_time = sum(response_times) / len(response_times)
            min_response_time = min(response_times)
            max_response_time = max(response_times)
        else:
            avg_response_time = min_response_time = max_response_time = 0
        
        # Group by endpoint
        endpoint_stats = {}
        for result in results:
            endpoint = result.get("endpoint", "unknown")
            if endpoint not in endpoint_stats:
                endpoint_stats[endpoint] = {"total": 0, "success": 0, "failed": 0}
            
            endpoint_stats[endpoint]["total"] += 1
            if result.get("success", False):
                endpoint_stats[endpoint]["success"] += 1
            else:
                endpoint_stats[endpoint]["failed"] += 1
        
        return {
            "total_requests": total_requests,
            "successful_requests": successful_requests,
            "failed_requests": failed_requests,
            "success_rate": (successful_requests / total_requests * 100) if total_requests > 0 else 0,
            "response_time_stats": {
                "average": avg_response_time,
                "minimum": min_response_time,
                "maximum": max_response_time,
                "count": len(response_times)
            },
            "endpoint_stats": endpoint_stats
        }
    
    def print_results(self, results: List[Dict[str, Any]]):
        """Print formatted test results"""
        analysis = self.analyze_results(results)
        
        print("\n" + "="*60)
        print("CONCURRENCY TEST RESULTS")
        print("="*60)
        
        print(f"Total Requests: {analysis['total_requests']}")
        print(f"Successful: {analysis['successful_requests']}")
        print(f"Failed: {analysis['failed_requests']}")
        print(f"Success Rate: {analysis['success_rate']:.2f}%")
        
        print(f"\nResponse Time Statistics:")
        stats = analysis['response_time_stats']
        print(f"  Average: {stats['average']:.3f}s")
        print(f"  Minimum: {stats['minimum']:.3f}s")
        print(f"  Maximum: {stats['maximum']:.3f}s")
        print(f"  Samples: {stats['count']}")
        
        print(f"\nEndpoint Statistics:")
        for endpoint, stats in analysis['endpoint_stats'].items():
            print(f"  {endpoint}: {stats['success']}/{stats['total']} successful")
        
        print("\nRecent Failed Requests:")
        failed_requests = [r for r in results if not r.get("success", False)]
        for i, failed in enumerate(failed_requests[-5:]):  # Show last 5 failures
            print(f"  {i+1}. {failed.get('error', 'Unknown error')} (Test ID: {failed.get('test_id', 'N/A')})")

async def main():
    """Main test function"""
    print("Student Attendance System - Concurrency Test")
    print("="*50)
    
    async with ConcurrencyTester(BASE_URL) as tester:
        # Test 1: Basic connectivity
        print("Testing basic connectivity...")
        health_result = await tester.health_check()
        if not health_result["success"]:
            print(f"❌ Server not accessible: {health_result.get('error', 'Unknown error')}")
            print("Please ensure the server is running on", BASE_URL)
            return
        
        print(f"✅ Server is accessible (Response time: {health_result['response_time']:.3f}s)")
        
        # Test 2: Small concurrent batch
        print(f"\nTest 1: Small concurrent batch ({CONCURRENT_REQUESTS} requests)")
        batch_results = await tester.run_concurrent_batch(CONCURRENT_REQUESTS)
        tester.print_results(batch_results)
        
        # Test 3: Stress test
        print(f"\nTest 2: Stress test ({TEST_DURATION} seconds)")
        stress_results = await tester.run_stress_test(TEST_DURATION, requests_per_batch=8)
        tester.print_results(stress_results)
        
        # Test 4: High concurrency burst
        print(f"\nTest 3: High concurrency burst (20 simultaneous requests)")
        burst_results = await tester.run_concurrent_batch(20)
        tester.print_results(burst_results)
        
        print("\n" + "="*60)
        print("ALL TESTS COMPLETED")
        print("="*60)
        
        # Overall statistics
        all_results = batch_results + stress_results + burst_results
        print(f"\nOverall Results ({len(all_results)} total requests):")
        overall_analysis = tester.analyze_results(all_results)
        print(f"Success Rate: {overall_analysis['success_rate']:.2f}%")
        print(f"Average Response Time: {overall_analysis['response_time_stats']['average']:.3f}s")
        
        if overall_analysis['success_rate'] >= 95:
            print("✅ EXCELLENT: Server handles concurrency very well!")
        elif overall_analysis['success_rate'] >= 80:
            print("✅ GOOD: Server handles concurrency well with minor issues")
        elif overall_analysis['success_rate'] >= 60:
            print("⚠️  FAIR: Server handles some concurrency but has issues")
        else:
            print("❌ POOR: Server has significant concurrency issues")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user")
    except Exception as e:
        print(f"\nError running tests: {e}")
        sys.exit(1)
