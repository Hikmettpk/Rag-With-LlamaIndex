import sys
from src.query.retriever import get_query_engine


def main(q: str):
    qe = get_query_engine()
    resp = qe.query(q)
    print("\n=== ANSWER ===")
    print(str(resp))
    print("\n=== SOURCES ===")
    for s in resp.source_nodes:
        meta = s.node.metadata or {}
        fn = meta.get("file_name") or meta.get("filename") or (meta.get("file_path") or "").split("/")[-1] or "?"
        pg = meta.get("page_label") or meta.get("page") or "?"
        sc = getattr(s, "score", None)
        sc_txt = f"{sc:.3f}" if isinstance(sc, (int, float)) else sc
        print(f"- score={sc_txt} file={fn} page={pg}")

if __name__ == "__main__":
    question = " ".join(sys.argv[1:]) or "Sabancı Holdingte Alınan Temettüler kaç TL'dir"
    main(question)
#RUN KODU
"""
cd /Users/hikmettopak/Desktop/Indisol/rag-finreports
PYTHONPATH=$PWD ./.rag-env311/bin/python src/query/ask.py

Oyak çimentonun yıllık çimento kapasitesi ne kadardır?


Sabancı Holdingte Alınan Temettüler kaç TL'dir
=== ANSWER ===
Alınan Temettüler 2020'de 492 milyon TL, 2021'de 1.562 milyon TL, 2022'de 2.114 milyon TL, 2023'te 7.076 milyon TL ve 2024'te 9.414 milyon TL'dir.

=== SOURCES ===
- score=0.721 file=sabanci.pdf page=?
- score=0.716 file=sabanci.pdf page=?
- score=0.688 file=sabanci.pdf page=?
- score=0.687 file=sabanci.pdf page=?
- score=0.682 file=sabanci.pdf page=?
"""
