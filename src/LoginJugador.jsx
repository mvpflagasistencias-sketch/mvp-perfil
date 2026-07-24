import { useState } from "react";
import api from "./api";

const LoginJugador = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Estados para solicitar el correo de recuperación
  const [isRecuperando, setIsRecuperando] = useState(false);
  const [correoRecuperacion, setCorreoRecuperacion] = useState("");
  const [loadingRecuperacion, setLoadingRecuperacion] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/api/jugadores/login", { correo, password });
      localStorage.setItem("atleta_token", res.data.token);
      localStorage.setItem("atleta_id", res.data.jugador.id);
      onLoginSuccess(res.data.jugador);
    } catch (err) {
      alert(
        "❌ Error: " +
          (err.response?.data?.error || "Credenciales incorrectas"),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSolicitarToken = async (e) => {
    e.preventDefault();
    setLoadingRecuperacion(true);
    try {
      const res = await api.post("/api/jugadores/solicitar-cambio-password", {
        correo: correoRecuperacion,
      });
      alert("✅ " + res.data.message);
      setIsRecuperando(false);
      setCorreoRecuperacion("");
    } catch (err) {
      alert(
        "❌ Error: " +
          (err.response?.data?.error || "No se pudo enviar el correo de recuperación"),
      );
    } finally {
      setLoadingRecuperacion(false);
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
            <span style={{ color: "#60a5fa" }}>
              {isRecuperando ? "Recuperar" : "Acceso"}
            </span>
          </h2>
        </div>

        {!isRecuperando ? (
          /* FORMULARIO DE LOGIN NORMAL */
          <form
            onSubmit={handleLogin}
            style={{ textAlign: "left", width: "100%" }}
          >
            <div style={{ marginBottom: "16px" }}>
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
                Correo Electrónico
              </label>
              <input
                type="email"
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
                placeholder="atleta@correo.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
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
                Contraseña
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* ENLACE DE ¿OLVIDASTE TU CONTRASEÑA? */}
            <div style={{ textAlign: "right", marginBottom: "20px" }}>
              <span
                onClick={() => setIsRecuperando(true)}
                style={{
                  color: "#60a5fa",
                  fontSize: "11px",
                  fontWeight: "700",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                ¿Olvidaste tu contraseña?
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "16px",
                border: "none",
                backgroundColor: "#2563eb",
                color: "white",
                fontWeight: "900",
                textTransform: "uppercase",
                cursor: loading ? "wait" : "pointer",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            >
              {loading ? "Ingresando..." : "Entrar al Sistema"}
            </button>
          </form>
        ) : (
          /* FORMULARIO PARA SOLICITAR CORREO DE RECUPERACIÓN */
          <form
            onSubmit={handleSolicitarToken}
            style={{ textAlign: "left", width: "100%" }}
          >
            <p
              style={{
                color: "#94a3b8",
                fontSize: "12px",
                marginBottom: "16px",
                lineHeight: "1.4",
              }}
            >
              Ingresa tu correo electrónico registrado y te enviaremos un enlace seguro para restablecer tu contraseña.
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
                Correo Registrado
              </label>
              <input
                type="email"
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
                placeholder="atleta@correo.com"
                value={correoRecuperacion}
                onChange={(e) => setCorreoRecuperacion(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loadingRecuperacion}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "16px",
                border: "none",
                backgroundColor: "#16a34a",
                color: "white",
                fontWeight: "900",
                textTransform: "uppercase",
                cursor: loadingRecuperacion ? "wait" : "pointer",
                fontSize: "14px",
                boxSizing: "border-box",
                marginBottom: "12px",
              }}
            >
              {loadingRecuperacion
                ? "Enviando correo..."
                : "Enviar Enlace de Recuperación"}
            </button>

            <button
              type="button"
              onClick={() => setIsRecuperando(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "#94a3b8",
                fontSize: "11px",
                fontWeight: "700",
                textTransform: "uppercase",
                cursor: "pointer",
                width: "100%",
                padding: "8px",
              }}
            >
              ← Volver al login
            </button>
          </form>
        )}

        {!isRecuperando && (
          <div style={{ marginTop: "20px" }}>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                if (onSwitchToRegister) onSwitchToRegister();
              }}
              style={{
                background: "transparent",
                border: "none",
                color: "#60a5fa",
                fontSize: "11px",
                fontWeight: "700",
                textTransform: "uppercase",
                cursor: "pointer",
                padding: "8px",
                width: "100%",
              }}
            >
              ¿No tienes cuenta? Regístrate aquí
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginJugador;