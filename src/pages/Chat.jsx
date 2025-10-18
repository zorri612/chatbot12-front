import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Chat({ userId, selectedLanguage, selectedLevel }) {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [elapsed, setElapsed] = useState(0); // segundos
  const startRef = useRef(null);
  const navigate = useNavigate();

useEffect(() => {
  const createSession = async () => {
    try {
      localStorage.removeItem("sessionId");

      // 🔹 Toma el userId desde el almacenamiento si no viene por props
      const uid = userId || localStorage.getItem("userId");

      const res = await axios.post("http://localhost:5000/api/sessions/", {
        userId: uid, // <-- aquí debe ir siempre un valor válido
        language: selectedLanguage,
        level: selectedLevel,
      });

      console.log("🟢 Sesión creada con ID:", res.data.sessionId);
      setSessionId(res.data.sessionId);
      localStorage.setItem("sessionId", res.data.sessionId);
    } catch (error) {
      console.error("Error creando sesión:", error.response?.data || error.message);
    }
  };

  createSession();
}, [userId, selectedLanguage, selectedLevel]);



  // timer UI (el backend calculará el tiempo real al finalizar)
  useEffect(() => {
    const id = setInterval(() => {
      if (startRef.current) setElapsed(Math.floor((Date.now() - startRef.current)/1000));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !sessionId) return;

    setMessages(prev => [...prev, { role: "user", text: input }]);

    try {
      console.log("➡️ Usando sessionId:", sessionId);
      const res = await axios.post("http://localhost:5000/api/sessions/chat", {
        sessionId,
        message: input,
      });
      const botReply = res.data.reply;
      setMessages(prev => [...prev, { role: "bot", text: botReply }]);
      setInput("");
    } catch (err) {
      console.error("Error enviando mensaje:", err);
    }
  };

  // finalizar y ver resumen
const finishAndGoSummary = async () => {
  try {
    const uid = userId || localStorage.getItem("userId");
    const sid = sessionId || localStorage.getItem("sessionId");
    if (!uid) return alert("No hay usuario autenticado.");
    if (!sid) return alert("No hay sessionId para finalizar.");

    console.log("▶️ Finalizando sesión", { userId: uid, sessionId: sid });

    const res = await axios.post("http://localhost:5000/api/sessions/finish", {
      userId: uid,
      sessionId: sid,
    });

    // ✅ Guarda una copia local por si necesitas recargar el resumen
    localStorage.setItem("lastSummarySession", sid);

    // Limpia la sesión activa (ya no se usará para chatear)
    localStorage.removeItem("sessionId");

    // ✅ Usa el ID real para navegar
    navigate(`/summary/${sid}`);
  } catch (e) {
    console.error("Error finalizando sesión:", e?.response?.data || e.message);
    alert(e?.response?.data?.message || "No se pudo finalizar la sesión.");
  }
};




  const mm = String(Math.floor(elapsed/60)).padStart(2,"0");
  const ss = String(elapsed%60).padStart(2,"0");

  return (
    <div className="chat-container" style={{maxWidth: 480, margin: "0 auto"}}>
      <div className="flex items-center justify-between mb-2">
        <div>⏱️ {mm}:{ss}</div>
        <div>{selectedLanguage} · {selectedLevel}</div>
      </div>

      <div className="chat-box" style={{minHeight: 360, padding: 12, background:"#1e1e2f", borderRadius:12, overflowY:"auto"}}>
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role === "user" ? "user" : "bot"}`}>
            <p style={{
              maxWidth:"75%",
              padding:"8px 12px",
              borderRadius:12,
              margin:"6px 0",
              background: msg.role === "user" ? "#4f46e5" : "#2d2d44",
              color: "white",
              marginLeft: msg.role === "user" ? "auto" : 0
            }}>
              {msg.text}
            </p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="input-area" style={{display:"flex", gap:8, marginTop:12}}>
        <input
          type="text"
          value={input}
          placeholder="Escribe tu mensaje..."
          onChange={(e) => setInput(e.target.value)}
          style={{flex:1, padding:10, borderRadius:10, border:"none", background:"#2d2d44", color:"#fff"}}
        />
        <button type="submit" style={{background:"#4f46e5", color:"#fff", border:"none", borderRadius:10, padding:"10px 16px"}}>
          Enviar
        </button>
      </form>

      <button
        onClick={finishAndGoSummary}
        style={{marginTop:10, width:"100%", background:"#9333ea", color:"#fff", border:"none", borderRadius:10, padding:"10px 16px"}}
      >
        Finalizar sesión y ver resumen
      </button>
    </div>
  );
}
