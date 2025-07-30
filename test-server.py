#!/usr/bin/env python3
import http.server
import socketserver
import os

PORT = 8888
os.chdir(os.path.dirname(os.path.abspath(__file__)))

Handler = http.server.SimpleHTTPRequestHandler

print(f"Starting test server on port {PORT}")
print(f"Access at: http://127.0.0.1:{PORT}")
print(f"Or try: http://localhost:{PORT}")
print("\nPress Ctrl+C to stop")

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    httpd.serve_forever()