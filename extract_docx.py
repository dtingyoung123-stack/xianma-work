import zipfile
import xml.etree.ElementTree as ET

docx_path = r'D:\HermesVault\10_先马电商\06_会议\2026-07\20260721-客服IT周例会\01_原始材料\原始-20260721-客服IT周例会-会议转写.docx'

with zipfile.ZipFile(docx_path) as z:
    xml_content = z.read('word/document.xml')

tree = ET.fromstring(xml_content)
ns = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'

paragraphs = []
for p in tree.iter(f'{{{ns}}}p'):
    texts = []
    for t in p.iter(f'{{{ns}}}t'):
        if t.text:
            texts.append(t.text)
    if texts:
        paragraphs.append(''.join(texts))

output_path = r'D:\项目文件\xianma-work\meeting_transcript.txt'
with open(output_path, 'w', encoding='utf-8') as f:
    for para in paragraphs:
        f.write(para + '\n')

print(f'Written {len(paragraphs)} paragraphs to meeting_transcript.txt')
