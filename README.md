# Resumidor de Texto com IA

Aplicação fullstack que gera resumos automáticos de texto utilizando IA (Hugging Face), com histórico persistido em banco de dados.

---

## Tecnologias

### Backend
- FastAPI
- Python
- Hugging Face Inference API
- SQL Server (pyodbc)

### Frontend
- React
- Vite

---

## Funcionalidades

- Gerar resumo de texto com IA
- Histórico de resumos armazenado em banco
- Paginação de histórico
- Interface simples e interativa

---

## Como rodar o projeto

### Backend

```bash
pip install -r requirements.txt
uvicorn main:app --reload
