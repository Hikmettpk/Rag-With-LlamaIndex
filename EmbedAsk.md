PDF Gömme (Tek PDF)
Bu komut, belirtilen PDF dosyasını okur, parçalara ayırır ve vektör temsillerini oluşturarak veritabanına kaydeder. Aşağıdaki kod bloğunda TABLO_ADI ve PDF_YOLU kısımlarını kendi bilgilerinizle güncelleyiniz.


```bash
cd /Users/hikmettopak/Desktop/Indisol/rag-finreports
PYTHONPATH=$PWD ./.rag-env311/bin/python - <<'PY'
from pathlib import Path
from llama_index.core import Settings, VectorStoreIndex, StorageContext
from llama_index.core.node_parser import SentenceSplitter
from llama_index.readers.file import PyMuPDFReader
from src.embed import get_embedding_model
from src.db import get_pg_store
from src.config import settings

# ↓↓ BU SATIRI DÜZENLEYİN ↓↓
settings.table_name = "TABLO_ADI"      # ör: fin_reports_idx_bge_new
settings.embed_dim  = 1024             # BGE-M3
splitter = SentenceSplitter(chunk_size=800, chunk_overlap=120)

# ↓↓ BU SATIRI DÜZENLEYİN ↓↓
pdf_path = Path("PDF_YOLU")            # ör: data/pdfs/Handbook_of_Petroleum_Refining-1 (1).pdf
docs = PyMuPDFReader().load_data(pdf_path)
for d in docs:
    md = d.metadata or {}
    md.setdefault("file_name", pdf_path.name)
    if "page_label" not in md and "page" in md:
        md["page_label"] = str(md["page"])
    d.metadata = md

Settings.embed_model = get_embedding_model()
nodes = [n for doc in docs for n in splitter.get_nodes_from_documents([doc])]
vector_store = get_pg_store()
storage_context = StorageContext.from_defaults(vector_store=vector_store)
VectorStoreIndex(nodes, storage_context=storage_context)
print("OK")
PY
```

Soru Sorma
Yukarıdaki adımla veritabanına eklediğiniz döküman içeriği hakkında soru sormak için bu komutu kullanın. Aşağıdaki kod bloğunda TABLO_ADI ve SORU_METNİ kısımlarını kendi bilgilerinizle güncelleyiniz.

```bash
cd /Users/hikmettopak/Desktop/Indisol/rag-finreports
PYTHONPATH=$PWD ./.rag-env311/bin/python - <<'PY'
from src.config import settings
from src.query.ask import main

# ↓↓ BU SATIRI DÜZENLEYİN ↓↓
settings.table_name = "TABLO_ADI"      # ör: fin_reports_idx_bge_new

# ↓↓ BU SATIRI DÜZENLEYİN ↓↓
main("SORU_METNİ")                     # ör: "total condenser nedir"
PY
```

Önemli Not
Veritabanında (DB) gerçek tablo isimleri data_TABLO_ADI ve index_TABLO_ADI olarak oluşturulur. Ancak yukarıdaki komutlarda settings.table_name değişkenine değer atarken "data_" ön ekini eklemeyin. Kod, bu ön eki otomatik olarak yönetmektedir.