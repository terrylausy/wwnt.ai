import os
import re

# 项目根目录
root_dir = r"c:\Users\23121\Downloads\6a61e01320d97b40f2b198bd-1c222945ee1ca59f"

# 获取所有 HTML 文件
html_files = []
for file in os.listdir(root_dir):
    if file.endswith('.html'):
        html_files.append(os.path.join(root_dir, file))

print(f"找到 {len(html_files)} 个 HTML 文件")

fixed_count = 0
for file_path in html_files:
    try:
        with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()
        
        original_content = content
        
        # 1. 删除开头的问号/乱码字符（在 <!DOCTYPE 之前）
        content = re.sub(r'^[^<]+', '', content)
        
        # 2. 替换内容中的乱码字符
        # 删除单独的 ?? 
        content = re.sub(r'\?\?\s*', '', content)
        
        # 替换损坏的特殊字符
        content = content.replace('\ufffd', '')
        
        # 3. 清理多余的空行
        content = re.sub(r'\n{3,}', '\n\n', content)
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"已修复: {os.path.basename(file_path)}")
            fixed_count += 1
        else:
            print(f"无需修改: {os.path.basename(file_path)}")
            
    except Exception as e:
        print(f"错误处理 {os.path.basename(file_path)}: {e}")

print(f"\n完成！共修复 {fixed_count} 个文件")
