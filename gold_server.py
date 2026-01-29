import http.server
import socketserver
import urllib.request
import json
import ssl

PORT = 8000

class ProxyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # API Proxy endpoints
        if self.path.startswith('/api/phuquy'):
            self.proxy_request('https://be.phuquy.com.vn/jewelry/product-payment-service/api/products/get-price')
        elif self.path.startswith('/api/btmc'):
            self.proxy_request('http://api.btmc.vn/api/BTMCAPI/getpricebtmc?key=3kd8ub1llcg9t45hnoh8hmn7t5kc2v')
        else:
            # Serve static files (HTML, CSS, JS)
            super().do_GET()

    def proxy_request(self, target_url):
        try:
            # Create request with browser headers to avoid blocking
            req = urllib.request.Request(target_url)
            req.add_header('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
            req.add_header('Accept', 'application/json, text/plain, */*')
            
            # Create SSL context to ignore certificate errors if any
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE

            # Fetch data
            with urllib.request.urlopen(req, context=ctx, timeout=10) as response:
                content = response.read()
                
                # Send back to frontend
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(content)
                
        except Exception as e:
            # Error handling
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())

# Allow address reuse to avoid "Address already in use" errors
socketserver.TCPServer.allow_reuse_address = True

print(f"💰 Gold Price Server đang chạy tại: http://localhost:{PORT}")
print("Nhấn Ctrl+C để dừng server")

with socketserver.TCPServer(("", PORT), ProxyHTTPRequestHandler) as httpd:
    httpd.serve_forever()
