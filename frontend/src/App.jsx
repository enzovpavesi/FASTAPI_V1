import { useState } from "react";
import { useEffect } from "react";

function App() {
  // Estado para armazenar o texto digitado pelo usuário
  const [texto, setTexto] = useState("");

  // Estado para armazenar o resumo retornado pela API
  const [resumo, setResumo] = useState("");

  // Estado para controlar o loading (UX)
  const [loading, setLoading] = useState(false);

  // Estado para poder exibir historico
  const [historico, setHistorico] = useState([]);
  
  // Paginação para o histórico
  const [page, setPage] = useState(1);

  // Estado para validar se há histórico na prox pag
  const [hasNext, setHasNext] = useState(true);

  // Função para buscar histórico
  const buscarHistorico = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/historico?page=${page}&limit=5`);
      const data = await response.json();

      setHistorico(data.dados);

      // 🔥 lógica da próxima página
      setHasNext(data.dados.length === 5);

    } catch (error) {
      console.error("Erro ao buscar histórico");
    }
  };

  useEffect(() => {
    buscarHistorico();
  }, [page]);

  // Função que envia o texto para a API
  const enviarTexto = async () => {
    setLoading(true); // ativa loading

    try {
      // Requisição para o backend (FastAPI)
      const response = await fetch("http://127.0.0.1:8000/resumir", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Envia o texto como JSON
        body: JSON.stringify({ texto }),
      });

      // Converte resposta para JSON
      const data = await response.json();

      // Atualiza estado com o resumo retornado
      setResumo(data.resumo);
      buscarHistorico();
    } catch (error) {
      // Tratamento de erro de conexão
      setResumo("Erro ao conectar com a API");
    }

    setLoading(false); // desativa loading
  };

  return(
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Resumo com IA</h1>

      {/* Área de texto */}
      <textarea
        rows="6"
        placeholder="Digite ou cole seu texto aqui..."
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        style={{
          width: "100%",
          maxWidth: "700px",
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          fontFamily: "Arial",
          fontSize: "14px",
          resize: "vertical",
        }}
      />
      <br /><br />

      {/* Botão */}
      <button
        onClick={enviarTexto}
        style={{
          backgroundColor: "#d3d3d3",
          color: "#16171d",
          padding: "10px 20px",
          border: "none",
          cursor: "pointer",
          transition: "0.3s",
        }}
        onMouseEnter={(e) => (e.target.style.backgroundColor = "#bcbcbc")}
        onMouseLeave={(e) => (e.target.style.backgroundColor = "#d3d3d3")}
      >
        {loading ? "Processando..." : "Gerar Resumo"}
      </button>

      <br /><br />

      {/* RESULTADO */}
      <h2>Resultado:</h2>
      <p>{resumo}</p>

      {/* HISTÓRICO COMEÇA AQUI */}
      <div style={{ marginTop: "40px" }}>
        <h2>Histórico</h2>

        <div
          style={{
            backgroundColor: "#1e1e1e",
            padding: "20px",
            borderRadius: "10px",
            maxWidth: "700px",
          }}
        >
          {historico.map((item) => (
            <div
              key={item.id}
              style={{
                backgroundColor: "#2a2a2a",
                padding: "15px",
                marginBottom: "15px",
                borderRadius: "8px",
                textAlign: "left",
              }}
            >
              {/* TEXTO */}
              <div style={{ marginBottom: "10px" }}>
                <strong style={{ color: "#9cdcfe" }}>Texto:</strong>
                <p
                  style={{
                    marginLeft: "15px",
                    borderLeft: "3px solid #9cdcfe",
                    paddingLeft: "10px",
                    color: "#ffffff",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {item.texto}
                </p>
              </div>

              {/* RESUMO */}
              <div>
                <strong style={{ color: "#ce9178" }}>Resumo:</strong>
                <p
                  style={{
                    marginLeft: "15px",
                    borderLeft: "3px solid #ce9178",
                    paddingLeft: "10px",
                    color: "#ffffff",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {item.resumo}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* PAGINAÇÃO */}
        <div style={{ marginTop: "10px" }}>
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            style={{
              backgroundColor: "#d3d3d3",
              color: "#16171d",
              padding: "10px 20px",
              border: "none",
              cursor: page === 1 ? "not-allowed" : "pointer",
              opacity: page === 1 ? 0.5 : 1,
              marginRight: "10px",
            }}
          >
            Anterior
          </button>

          <button
            onClick={() => setPage(page + 1)}
            disabled={!hasNext}
            style={{
              backgroundColor: "#d3d3d3",
              color: "#16171d",
              padding: "10px 20px",
              border: "none",
              cursor: !hasNext ? "not-allowed" : "pointer",
              opacity: !hasNext ? 0.5 : 1,
            }}
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;

/* para rodar, use: npm run dev */