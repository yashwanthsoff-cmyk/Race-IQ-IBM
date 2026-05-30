import os
from docling.document_converter import DocumentConverter
from supabase import create_client

SUPABASE_URL = "https://ckzggwokpwzgthybzumj.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNremdnd29rcHd6Z3RoeWJ6dW1qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTkzMjcxMiwiZXhwIjoyMDYxNTA4NzEyfQ.29rcHd6Z3RoeWJ6dW1j"

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def convert_and_store(file_path):
    print(f"Converting: {file_path}")
    converter = DocumentConverter()
    result = converter.convert(file_path)
    markdown = result.document.export_to_markdown()
    response = supabase.table("documents").insert({
        "filename": os.path.basename(file_path),
        "content": markdown
    }).execute()
    print("Stored in Supabase successfully")

convert_and_store("your_file.pdf")
