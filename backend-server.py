#!/usr/bin/env python3
"""
Backend Server for Fiber Tester Controller
Runs on separate port (8000) for realistic testing
"""

import json
import time
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import sys
import os

# Import our fiber tester logic
from fiber_tester import FiberTesterController

class FiberTesterHandler(BaseHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        self.controller = FiberTesterController()
        super().__init__(*args, **kwargs)
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_GET(self):
        """Handle GET requests"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        query_params = parse_qs(parsed_path.query)
        
        # CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Type', 'application/json')
        
        try:
            if path == '/api/status':
                response = self.controller.get_status()
                self.send_response(200)
                self.end_headers()
                self.wfile.write(json.dumps(response).encode())
                
            elif path == '/api/health':
                self.send_response(200)
                self.end_headers()
                self.wfile.write(json.dumps({
                    'status': 'healthy',
                    'message': 'Fiber Tester Backend Running',
                    'port': 8000,
                    'timestamp': time.time()
                }).encode())
                
            else:
                self.send_response(404)
                self.end_headers()
                self.wfile.write(json.dumps({
                    'error': 'Endpoint not found',
                    'path': path
                }).encode())
                
        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(json.dumps({
                'error': str(e),
                'message': 'Internal server error'
            }).encode())
    
    def do_POST(self):
        """Handle POST requests"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        # CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Type', 'application/json')
        
        try:
            # Read request body
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode()) if post_data else {}
            
            if path == '/api/set-color':
                color = data.get('color')
                response = self.controller.set_color(color)
                self.send_response(200)
                self.end_headers()
                self.wfile.write(json.dumps(response).encode())
                
            elif path == '/api/set-number':
                number = data.get('number')
                response = self.controller.set_number(number)
                self.send_response(200)
                self.end_headers()
                self.wfile.write(json.dumps(response).encode())
                
            elif path == '/api/prepare':
                response = self.controller.prepare_transmission()
                self.send_response(200)
                self.end_headers()
                self.wfile.write(json.dumps(response).encode())
                
            elif path == '/api/complete':
                response = self.controller.complete_transmission()
                self.send_response(200)
                self.end_headers()
                self.wfile.write(json.dumps(response).encode())
                
            elif path == '/api/clear':
                response = self.controller.clear_selection()
                self.send_response(200)
                self.end_headers()
                self.wfile.write(json.dumps(response).encode())
                
            else:
                self.send_response(404)
                self.end_headers()
                self.wfile.write(json.dumps({
                    'error': 'Endpoint not found',
                    'path': path
                }).encode())
                
        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(json.dumps({
                'error': str(e),
                'message': 'Internal server error'
            }).encode())
    
    def log_message(self, format, *args):
        """Custom log format"""
        print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] {format % args}")

def run_server(port=8000):
    """Run the backend server"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, FiberTesterHandler)
    
    print(f"=== Fiber Tester Backend Server ===")
    print(f"Starting server on port {port}")
    print(f"Frontend should run on port 3000")
    print(f"Backend API: http://localhost:{port}")
    print(f"Health check: http://localhost:{port}/api/health")
    print("Press Ctrl+C to stop")
    print("=" * 40)
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        httpd.server_close()

if __name__ == "__main__":
    port = 8000
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print("Invalid port number, using default 8000")
    
    run_server(port)