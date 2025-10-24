#!/usr/bin/env python3
"""
Startup script for Cookify application
Runs both Flask backend and HTTP server for frontend
"""

import subprocess
import sys
import time
import threading
import os

def run_flask_server():
    """Run the Flask backend server"""
    print("Starting Flask backend server on port 5000...")
    try:
        subprocess.run([sys.executable, "app.py"], check=True)
    except subprocess.CalledProcessError as e:
        print(f"Flask server failed: {e}")
    except KeyboardInterrupt:
        print("Flask server stopped")

def run_frontend_server():
    """Run the frontend HTTP server"""
    print("Starting frontend server on port 8080...")
    try:
        subprocess.run([sys.executable, "-m", "http.server", "8080"], check=True)
    except subprocess.CalledProcessError as e:
        print(f"Frontend server failed: {e}")
    except KeyboardInterrupt:
        print("Frontend server stopped")

def main():
    print("=== Cookify Application Startup ===")
    print("This will start both the Flask backend (port 5000) and frontend (port 8080)")
    print("Press Ctrl+C to stop both servers")
    print()
    
    # Check if required files exist
    if not os.path.exists("app.py"):
        print("Error: app.py not found. Make sure you're in the correct directory.")
        return
    
    if not os.path.exists("requirements.txt"):
        print("Error: requirements.txt not found.")
        return
    
    # Check if Flask is installed
    try:
        import flask
        print("✓ Flask is installed")
    except ImportError:
        print("Error: Flask not installed. Please run: pip install -r requirements.txt")
        return
    
    # Start both servers in separate threads
    flask_thread = threading.Thread(target=run_flask_server, daemon=True)
    frontend_thread = threading.Thread(target=run_frontend_server, daemon=True)
    
    try:
        flask_thread.start()
        time.sleep(2)  # Give Flask time to start
        frontend_thread.start()
        
        print("\n=== Servers Started ===")
        print("Flask Backend: http://localhost:5000")
        print("Frontend: http://localhost:8080")
        print("Open http://localhost:8080/Cookify - Welcome.html in your browser")
        print("\nPress Ctrl+C to stop all servers")
        
        # Keep main thread alive
        while True:
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\n\nShutting down servers...")
        print("Goodbye!")

if __name__ == "__main__":
    main()
