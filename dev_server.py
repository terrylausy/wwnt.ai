"""
本地开发服务器 - 代理 DeepSeek API
运行: python dev_server.py
然后访问 http://localhost:8080
AI chat 功能就能正常使用了
"""
import http.server
import urllib.request
import urllib.error
import json
import os

API_KEY = "sk-f37d4c886ea24ff48512f008b059df2a"
DEEPSEEK_URL = "https://api.deepseek.com/chat/completions"
MODEL = "deepseek-chat"

SYSTEM_PROMPT = """You are the official AI support assistant for WWNT Robotics.
Answer questions about WWNT Robotics products, pricing, shipping, and support.
If question is unrelated, politely decline."""


class DevServer(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        """Serve static files for GET requests"""
        # Map path to file
        path = self.path
        if path == '/':
            path = '/index.html'
        
        file_path = os.path.join(os.getcwd(), path.lstrip('/'))
        
        if os.path.isfile(file_path):
            self.serve_file(file_path)
        else:
            self.send_error(404, "File not found")
    
    def do_POST(self):
        """Handle POST requests"""
        if self.path == "/.netlify/functions/chat":
            self.handle_chat()
        else:
            self.send_error(404)
    
    def do_OPTIONS(self):
        """Handle CORS preflight"""
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def serve_file(self, filepath):
        """Serve a static file"""
        try:
            with open(filepath, 'rb') as f:
                content = f.read()
            
            # Determine content type
            ext = os.path.splitext(filepath)[1].lower()
            content_types = {
                '.html': 'text/html',
                '.css': 'text/css',
                '.js': 'application/javascript',
                '.json': 'application/json',
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.gif': 'image/gif',
                '.svg': 'image/svg+xml',
                '.ico': 'image/x-icon',
                '.webm': 'video/webm',
                '.mp4': 'video/mp4',
                '.webp': 'image/webp',
            }
            content_type = content_types.get(ext, 'application/octet-stream')
            
            self.send_response(200)
            self.send_header('Content-Type', content_type)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(content)
        except Exception as e:
            self.send_error(500, str(e))
    
    def handle_chat(self):
        """Proxy chat request to DeepSeek API"""
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        
        try:
            data = json.loads(body)
            user_messages = data.get("messages", [])
        except:
            self.send_json({"error": "Invalid JSON"}, 400)
            return
        
        # Build messages with system prompt
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            *user_messages[-10:]
        ]
        
        payload = {
            "model": MODEL,
            "messages": messages,
            "stream": False,
            "temperature": 0.4,
            "max_tokens": 600
        }
        
        req = urllib.request.Request(
            DEEPSEEK_URL,
            data=json.dumps(payload).encode('utf-8'),
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {API_KEY}"
            }
        )
        
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                result = json.loads(resp.read().decode('utf-8'))
                reply = result.get("choices", [{}])[0].get("message", {}).get("content", "Sorry, I didn't catch that.")
                self.send_json({"reply": reply})
        except urllib.error.HTTPError as e:
            print(f"API Error: {e.code} - {e.read().decode()}")
            self.send_json({"error": "upstream_error"}, 502)
        except Exception as e:
            print(f"Error: {e}")
            self.send_json({"error": "network_error"}, 502)
    
    def send_json(self, data, status=200):
        """Send JSON response"""
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))
    
    def log_message(self, format, *args):
        """Override to add prefix"""
        print(f"[Server] {format % args}")


if __name__ == "__main__":
    port = 8080
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    server = http.server.HTTPServer(('', port), DevServer)
    print(f"=" * 50)
    print(f"  开发服务器已启动")
    print(f"  访问地址: http://localhost:{port}")
    print(f"  AI Chat 代理已就绪")
    print(f"  按 Ctrl+C 停止")
    print(f"=" * 50)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n服务器已停止")
