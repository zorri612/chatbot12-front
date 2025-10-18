import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function SelectSession() {
  const [language, setLanguage] = useState("");
  const [level, setLevel] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleStartSession = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem("userId");

    if (!language || !level) {
      setError("Selecciona idioma y nivel");
      return;
    }

    try {
      const res = await API.post("/sessions", { userId, language, level });
      const { sessionId } = res.data;
      navigate(`/chat/${sessionId}`);
      console.log("🟢 Sesión creada con ID:", sessionId);

    } catch (err) {
      console.error(err);
      setError("Error al iniciar sesión de práctica");
    }
  };

  return (
    <div className="container">
      <h2 style={{ textAlign: "center" }}>🌐 Nueva sesión</h2>
      <p style={{ textAlign: "center", fontSize: "0.9rem", color: "#a5b4fc" }}>
        Elige el idioma y tu nivel para comenzar a practicar.
      </p>

      <form onSubmit={handleStartSession}>
        <label>Idioma</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          required
        >
          <option value="">Seleccionar idioma</option>
          <option value="en">🇺🇸 Inglés</option>
          <option value="es">🇪🇸 Español</option>
          <option value="fr">🇫🇷 Francés</option>
        </select>

        <label>Nivel</label>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          required
        >
          <option value="">Seleccionar nivel</option>
          <option value="beginner">🟢 Principiante</option>
          <option value="intermediate">🟡 Intermedio</option>
          <option value="advanced">🔵 Avanzado</option>
        </select>

        <button type="submit" style={{ marginTop: "1rem" }}>
          Iniciar práctica 🚀
        </button>
      </form>

      {error && <p style={{ color: "tomato" }}>{error}</p>}
    </div>
  );
}
