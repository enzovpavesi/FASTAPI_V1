from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import requests
from fastapi.middleware.cors import CORSMiddleware
import pyodbc

# Carrega .env
load_dotenv("D:/Enzo/api/FastAPI_v1/.env")

# Token do Hugging Face
HF_TOKEN = os.getenv("HF_TOKEN")

API_URL = "https://router.huggingface.co/hf-inference/models/facebook/bart-large-cnn"
headers = {"Authorization": f"Bearer {HF_TOKEN}"}

# Inicializa AP
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # libera tudo (ok para projeto)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelo de entrada
class TextoInput(BaseModel):
    texto: str

# Função para se conectar ao banco de dados
def conectar_bd():
    conn = pyodbc.connect(
        "DRIVER={ODBC Driver 17 for SQL Server};"
        "SERVER=localhost;"
        "DATABASE=Resumidor;"
        "Trusted_Connection=yes;"
    )
    return conn

# Função para salvar na base
def salvar_resumo(texto, resumo):
    conn = conectar_bd()
    try:
        cursor = conn.cursor()
        cursor.execute("INSERT INTO resumos (texto_original, resumo) VALUES (?, ?)", texto, resumo)
        conn.commit()
    finally:
        conn.close()

# Função que chama a LLM
def gerar_resumo(texto: str):
    payload = {"inputs": texto}

    response = requests.post(API_URL, headers=headers, json=payload)

    # verifica se veio resposta válida
    if response.status_code != 200:
        return f"Erro HTTP: {response.status_code}"

    try:
        resultado = response.json()
    except Exception as e:
        print(f"Erro ao parsear JSON: {e}")
        return "Erro: resposta inválida da API (não é JSON)"

    # tratamento
    if isinstance(resultado, list):
        return resultado[0].get("summary_text", "Erro ao gerar resumo")

    if "error" in resultado:
        return f"Erro da API: {resultado['error']}"

    return "Erro desconhecido"

# GET geral
@app.get("/")
def home():
    return {"mensagem": "API funcionando"}

# GET historico
@app.get("/historico")
def historico(page: int = 1, limit: int = 5):
    offset = (page - 1) * limit

    conn = conectar_bd()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT * FROM resumos
        ORDER BY id DESC
        OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
    """, offset, limit)

    dados = cursor.fetchall()

    return {
        "dados": [
            {
                "id": row[0],
                "texto": row[1],
                "resumo": row[2],
                "data": str(row[3]) if len(row) > 3 else ""
            }
            for row in dados
        ]
    }

# POST
@app.post("/resumir")
def resumir(input: TextoInput):
    resumo = gerar_resumo(input.texto)

    # salva no banco
    salvar_resumo(input.texto, resumo)

    return {"resumo": resumo}

# Para rodar, use: uvicorn main:app --reload