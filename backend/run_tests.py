#!/usr/bin/env python3
"""
Test runner for AI Image Enhancer backend
"""

import subprocess
import sys
import os
from pathlib import Path

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"🔧 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to {description}: {e}")
        print(f"Error output: {e.stderr}")
        return False

def main():
    """Main test runner function"""
    print("🧪 Running AI Image Enhancer Backend Tests")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not Path("main.py").exists():
        print("❌ Please run this script from the backend directory")
        sys.exit(1)
    
    # Install test dependencies
    print("\n📦 Installing test dependencies...")
    test_deps = [
        "pytest==7.4.3",
        "pytest-asyncio==0.21.1",
        "httpx==0.25.2",
        "pytest-cov==4.1.0"
    ]
    
    for dep in test_deps:
        if not run_command(f"pip install {dep}", f"Installing {dep}"):
            print(f"⚠️  Failed to install {dep}, continuing...")
    
    # Run unit tests
    print("\n🧪 Running unit tests...")
    if not run_command("python -m pytest tests/ -v --cov=. --cov-report=html --cov-report=term", "Unit tests"):
        print("⚠️  Some tests failed, but continuing...")
    
    # Run API tests
    print("\n🌐 Running API tests...")
    if not run_command("python -m pytest tests/test_api.py -v", "API tests"):
        print("⚠️  Some API tests failed, but continuing...")
    
    # Run integration tests
    print("\n🔗 Running integration tests...")
    if not run_command("python -m pytest tests/test_integration.py -v", "Integration tests"):
        print("⚠️  Some integration tests failed, but continuing...")
    
    # Run performance tests
    print("\n⚡ Running performance tests...")
    if not run_command("python -m pytest tests/test_performance.py -v", "Performance tests"):
        print("⚠️  Some performance tests failed, but continuing...")
    
    # Generate test report
    print("\n📊 Generating test report...")
    if Path("htmlcov/index.html").exists():
        print("✅ Test coverage report generated: htmlcov/index.html")
    else:
        print("⚠️  Test coverage report not generated")
    
    print("\n🎉 Test run completed!")
    print("\nTo view the coverage report:")
    print("open htmlcov/index.html")

if __name__ == "__main__":
    main()