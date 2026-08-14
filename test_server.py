"""
测试开发服务器是否能处理 POST 请求
"""
import http.server
import threading
import time
import urllib.request
import json

API_KEY = "sk-f37d4c886ea24ff48512f008b059df2a"

class TestHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'text/plain')
        self.end_headers()
        self.wfile.write(b'GET OK')
    
    def do_POST(self):
        print(f"[POST] 收到请求: {self.path}")
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        print(f"[POST] Body: {body.decode()}")
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({"status": "ok", "received": body.decode()}).encode())
    
    def log_message(self, format, *args):
        print(f"[LOG] {format % args}")

# 启动服务器
port = 9999
server = http.server.HTTPServer(('', port), TestHandler)
thread = threading.Thread(target=server.serve_forever, daemon=True)
thread.start()
print(f"测试服务器已启动在端口 {port}")

# 发送测试请求
time.sleep(1)
try:
    req = urllib.request.Request(
        f'http://localhost:{port}/test',
        data=json.dumps({"hello": "world"}).encode(),
        headers={'Content-Type': 'application/json'}
    )
    resp = urllib.request.urlopen(req)
    print(f"响应: {resp.read().decode()}")
    print("✅ POST 请求处理成功！")
except Exception as e:
    print(f"❌ 请求失败: {e}")

# 停止服务器
server.shutdown()
