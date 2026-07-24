import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "./api";

const RestablecerPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // Captura el token de la URL
  const navigate = useNavigate();

  const [nuevaPassword, setNuevaPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      alert("❌ Token no válido o ausente en la URL.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/api/jugadores/actualizar-password-token", {
        token,
        nuevaPassword,
      });
      alert("✅ " + res.data.message);
      navigate("/"); // Te redirige al login una vez actualizada
    } catch (err) {
      alert(
        "❌ Error: " +
          (err.response?.data?.error || "No se pudo actualizar la contraseña"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0f172a",
        margin: 0,
        padding: "16px",
        boxSizing: "border-box",
        width: "100%",
      }}
    >
      <div
        style={{
          backgroundColor: "#1e293b",
          padding: "clamp(20px, 5vw, 32px)",
          borderRadius: "24px",
          border: "1px solid #334155",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          width: "100%",
          maxWidth: "380px",
          boxSizing: "border-box",
          textAlign: "center",
        }}
      >
        <div style={{ marginBottom: "24px" }}>
          <div
            style={{
              backgroundColor: "#3b82f6",
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              fontWeight: "900",
              fontSize: "24px",
              color: "white",
            }}
          >
            MVP
          </div>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "900",
              textTransform: "uppercase",
              color: "#ffffff",
              margin: "12px 0 8px 0",
            }}
          >
            Nueva <span style={{ color: "#60a5fa" }}>Contraseña</span>
          </h2>
        </div>

        <form onSubmit={handleSubmit} style={{ textAlign: "left", width: "100%" }}>
          <p
            style={{
              color: "#94a3b8",
              fontSize: "12px",
              marginBottom: "16px",
              lineHeight: "1.4",
            }}
          >
            Ingresa tu nueva contraseña segura para acceder a tu cuenta.
          </p>

          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                color: "#64748b",
                fontSize: "10px",
                fontWeight: "900",
                textTransform: "uppercase",
                marginBottom: "8px",
                display: "block",
              }}
            >
              Nueva Contraseña
            </label>
            <input
              type="password"
              style={{
                width: "100%",
                backgroundColor: "#0f172a",
                padding: "14px 16px",
                borderRadius: "16px",
                border: "1px solid #334155",
                color: "white",
                outline: "none",
                fontWeight: "600",
                boxSizing: "border-box",
                fontSize: "16px",
              }}
              placeholder="••••••••"
              value={nuevaPassword}
              onChange={(e) => setNuevaPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "16px",
              border: "none",
              backgroundColor: "#16a34a",
              color: "white",
              fontWeight: "900",
              textTransform: "uppercase",
              cursor: loading ? "wait" : "pointer",
              fontSize: "14px",
              boxSizing: "border-box",
            }}
          >
            {loading ? "Actualizando..." : "Guardar Contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RestablecerPassword;