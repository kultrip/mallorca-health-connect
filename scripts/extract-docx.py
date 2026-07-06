import zipfile
import re

def docx_to_txt_regex(docx_path):
    try:
        with zipfile.ZipFile(docx_path) as z:
            xml_content = z.read('word/document.xml').decode('utf-8')
            
            # Find all <w:t>...</w:t> blocks
            pattern = re.compile(r'<w:t[^>]*>(.*?)</w:t>', re.DOTALL)
            text_runs = pattern.findall(xml_content)
            
            # Since document.xml also has paragraph markers like </w:p>, 
            # let's replace </w:p> with a newline to preserve paragraph structure.
            # We can split the xml by </w:p> and extract text runs from each paragraph.
            paragraphs = xml_content.split('</w:p>')
            result_paragraphs = []
            
            for p in paragraphs:
                runs = pattern.findall(p)
                if runs:
                    result_paragraphs.append(''.join(runs))
            
            return '\n'.join(result_paragraphs)
    except Exception as e:
        return f"Error: {str(e)}"

if __name__ == '__main__':
    path = "/Users/charles.santana/Downloads/Comentarios_Nadege.docx"
    txt = docx_to_txt_regex(path)
    output_path = "/Users/charles.santana/Kultrip/gemini-dev/mallorca-health-connect/scripts/extracted_nadege.txt"
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(txt)
    print(f"Extracted {len(txt)} chars to {output_path}")
