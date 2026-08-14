"""
测试 DeepSeek API key 是否有效
运行: python test_api.py
"""
import requests
import json

API_KEY = "sk-f37d4c886ea24ff48512f008b059df2a"
URL = "https://api.deepseek.com/chat/completions"

def test():
    print("正在测试 DeepSeek API key...")
    print(f"Key: {API_KEY[:10]}...{API_KEY[-4:]}")
    print("-" * 50)
    
    payload = {
        "model": "deepseek-chat",
        "messages": [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Hello! Please reply with 'API works!' in one sentence."}
        ],
        "stream": False,
        "max_tokens": 50
    }
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }
    
    try:
        resp = requests.post(URL, json=payload, headers=headers, timeout=15)
        
        if resp.status_code == 200:
            data = resp.json()
            reply = data.get("choices", [{}])[0].get("message", {}).get("content", "")
            print(f"✅ API 连接成功！")
            print(f"   回复: {reply}")
            print(f"   Token 使用: {data.get('usage', {})}")
        else:
            print(f"❌ 请求失败，状态码: {resp.status_code}")
            print(f"   错误信息: {resp.text}")
            
    except requests.exceptions.Timeout:
        print("❌ 请求超时，请检查网络连接")
    except requests.exceptions.ConnectionError:
        print("❌ 无法连接到 API 服务器")
    except Exception as e:
        print(f"❌ 发生错误: {e}")

if __name__ == "__main__":
    test()
