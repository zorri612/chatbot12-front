import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/summary.css"; // 👈 importa el css puro

// Parser simple para **negritas**
function mdBold(html = "") {
  return html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
}

export default function Summary() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const idToFetch = useMemo(
    () => sessionId || localStorage.getItem("lastSummarySession"),
    [sessionId]
  );

  useEffect(() => {
    const load = async () => {
      try {
        if (!idToFetch) {
          setErr("No se encontró sessionId para el resumen.");
          setLoading(false);
          return;
        }
        const res = await axios.get(
          `http://localhost:5000/api/sessions/summary/${idToFetch}`
        );
        setData(res.data);
      } catch (e) {
        setErr(e?.response?.data?.message || "Error cargando resumen");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [idToFetch]);

  if (loading) {
    return (
      <div className="summary-page">
        <div className="summary-container">
          <div className="loader">Generando resumen…</div>
        </div>
      </div>
    );
  }

  if (err || !data) {
    return (
      <div className="summary-page">
        <div className="summary-container">
          <div className="card">
            <p className="error-text">{err || "Sin datos"}</p>
            <button className="btn btn-primary" onClick={() => navigate("/select")}>
              Iniciar nueva práctica
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { metrics, summary } = data;
  const topics = metrics?.topics || [];
  const language = metrics?.language || "—";
  const level = metrics?.level || "—";
  const mins = metrics?.durationMinutes ?? 0;
  const msgs = metrics?.totalMessages ?? 0;

  return (
    <div className="summary-page">
      <header className="summary-header">
        <div className="header-row">
          <button className="pill" onClick={() => navigate(-2)}>← Volver</button>
          <div className="badges">
            <span className="pill">{language}</span>
            <span className="pill">{level}</span>
          </div>
        </div>
        <h1 className="title">Resumen de tu práctica</h1>
        <p className="subtitle">Feedback generado automáticamente por LangMatch.</p>
      </header>

      <main className="summary-container">
        <section className="card">
          <div
            className="summary-text"
            dangerouslySetInnerHTML={{ __html: mdBold(summary) }}
          />
        </section>

        <section className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label">Mensajes</div>
            <div className="metric-value">{msgs}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Duración</div>
            <div className="metric-value">
              {Number(mins).toFixed(1)} <span className="metric-unit">min</span>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="section-title">Temas</div>
          {topics.length ? (
            <div className="chips">
              {topics.map((t, i) => (
                <span key={`${t}-${i}`} className="chip">{t}</span>
              ))}
            </div>
          ) : (
            <div className="muted">—</div>
          )}
        </section>

        <div className="actions">
          <button className="btn btn-primary" onClick={() => navigate("/select")}>
            Iniciar nueva práctica
          </button>
          <button className="btn btn-ghost" onClick={() => navigate("/")}>
            Ir al inicio
          </button>
        </div>
      </main>
    </div>
  );
}
