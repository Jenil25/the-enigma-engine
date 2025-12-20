import os
from pypdf import PdfReader

pdf_files = [
    "DiyoraHMahyavanshiJ_ProjectProposal.pdf",
    "b26517f3-bf9e-423b-ae49-346b4bdd2950_Project_.pdf",
    "46788360-d4e6-40d7-8cb5-4e4dcb58acc2_Description.pdf",
    "Project Deliverable_ _CS 5200 Database Management Sys Merged Fall 2025_.pdf"
]

output_file = "extracted_requirements.txt"

with open(output_file, "w", encoding="utf-8") as out:
    for pdf_file in pdf_files:
        out.write(f"--- START OF {pdf_file} ---\n")
        try:
            reader = PdfReader(pdf_file)
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    out.write(text)
                    out.write("\n")
        except Exception as e:
            out.write(f"Error reading {pdf_file}: {e}\n")
        out.write(f"--- END OF {pdf_file} ---\n\n")

print(f"Text extracted to {output_file}")
