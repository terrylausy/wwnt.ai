import os
import re

# 项目根目录
root_dir = r"c:\Users\23121\Downloads\6a61e01320d97b40f2b198bd-1c222945ee1ca59f"

# 新版本号
NEW_VERSION = "20260900"

# 获取所有 HTML 文件
html_files = []
for file in os.listdir(root_dir):
    if file.endswith('.html'):
        html_files.append(os.path.join(root_dir, file))

print(f"找到 {len(html_files)} 个 HTML 文件")

updated_count = 0
for file_path in html_files:
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # 替换版本号 (v=后面的数字)
        content = re.sub(r'\?v=\d+', f'?v={NEW_VERSION}', content)
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"已更新: {os.path.basename(file_path)}")
            updated_count += 1
        else:
            print(f"无需修改: {os.path.basename(file_path)}")
            
    except Exception as e:
        print(f"错误处理 {os.path.basename(file_path)}: {e}")

print(f"\n完成！共更新 {updated_count} 个文件")
