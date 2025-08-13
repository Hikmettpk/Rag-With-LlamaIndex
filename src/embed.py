from llama_index.embeddings.huggingface import HuggingFaceEmbedding

def get_embedding_model():
    return HuggingFaceEmbedding(
        model_name="BAAI/bge-m3",
        normalize=True,
        # İsteğe bağlı ama önerilir: M3 talimatları
        query_instruction="Represent this sentence for searching relevant passages:",
        text_instruction="Represent this passage for retrieval:",
    )
