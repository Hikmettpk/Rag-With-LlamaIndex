from pathlib import Path
from typing import List
from llama_index.core import Document
from llama_index.readers.file import PyMuPDFReader

def load_pdfs(dir_path: str) -> List[Document]:
    reader = PyMuPDFReader()
    all_docs: List[Document] = []
    for pdf in Path(dir_path).glob("*.pdf"):
        docs = reader.load_data(pdf)
        # ✅ metadata sağlamlaştırma
        for d in docs:
            md = d.metadata or {}
            md.setdefault("file_name", pdf.name)
            # bazı sürümlerde "page_label" gelmeyebilir; "page" varsa onu kullan
            if "page_label" not in md and "page" in md:
                md["page_label"] = str(md["page"])
            d.metadata = md
        all_docs.extend(docs)
    return all_docs
