import { useState, useEffect } from "react";
import api from "./api";

const RegistroJugador = ({ onRegistroExitoso }) => {
  const [esOtro, setEsOtro] = useState(false);
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    equipo: "", // 👈 Volvemos al campo de equipo individual para el select clásico
    genero: "Masculino",
    categoria: "",
    numero_jersey: "",
    password: "",
    edad: "",
    nombre_tutor: "",
    foto_perfil: null,
  });

  useEffect(() => {
    const fetchEquipos = async () => {
      try {
        const res = await api.get("/api/equipos");
        setEquipos(res.data);
      } catch (err) {
        console.error("Error cargando equipos", err);
      }
    };
    fetchEquipos();
  }, []);

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () =>
        setFormData((prev) => ({ ...prev, foto_perfil: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const regexCorreo = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!regexCorreo.test(formData.correo)) {
      alert(
        "⚠️ Por favor, introduce un correo electrónico válido (ej. usuario@gmail.com). No se permiten formatos incompletos.",
      );
      return;
    }

    setLoading(true);
    try {
      // Convertimos el equipo escrito o seleccionado en un array 'equipos_ids' o enviamos el texto según lo maneje tu backend
      // Si el backend espera un array, buscamos el ID del equipo o lo mandamos procesado
      let equipoEncontrado = equipos.find(
        (eq) => eq.nombre_equipo.toUpperCase() === formData.equipo.toUpperCase()
      );

      // Preparamos los datos con la estructura que espera el servidor
      const payload = {
        ...formData,
        equipos_ids: equipoEncontrado ? [equipoEncontrado.id] : [],
        nombre_equipo_manual: !equipoEncontrado ? formData.equipo : null
      };

      await api.post("/api/jugadores/registro", payload);
      alert("✅ ¡Registro exitoso!");
      if (onRegistroExitoso) onRegistroExitoso();
    } catch (err) {
      // 🟢 AQUÍ ESTÁ LA MAGIA: Capturamos el mensaje exacto que envía el backend
      const mensajeError = err.response?.data?.error || "Error al registrar, intenta de nuevo.";
      alert(`❌ ${mensajeError}`);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    wrapper: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#0f172a",
      margin: 0,
      padding: "12px",
      boxSizing: "border-box",
      width: "100%",
    },
    container: {
      maxWidth: "48rem",
      margin: "0 auto",
      padding: "0",
      fontFamily: "system-ui, sans-serif",
      width: "100%",
    },
    card: {
      backgroundColor: "#1e293b",
      padding: "1.5rem",
      borderRadius: "1.5rem",
      border: "1px solid #374151",
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
      width: "100%",
      boxSizing: "border-box",
    },
    header: {
      display: "flex",
      justifyContent: "between",
      alignItems: "center",
      marginBottom: "2rem",
      borderBottom: "1px solid #374151",
      paddingBottom: "1.25rem",
    },
    title: {
      fontSize: "1.5rem",
      fontWeight: "700",
      color: "#ffffff",
      margin: 0,
      letterSpacing: "-0.025em",
    },
    subtitle: {
      fontSize: "0.875rem",
      color: "#60a5fa",
      fontWeight: "500",
      margin: "0.25rem 0 0 0",
    },
    sectionBlock: {
      backgroundColor: "#141b2e",
      padding: "1.25rem",
      borderRadius: "1rem",
      border: "1px solid #1f2937",
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      gap: "1.25rem",
      width: "100%",
      boxSizing: "border-box",
      marginBottom: "1.5rem",
    },
    avatarContainer: {
      width: "5.5rem",
      height: "5rem",
      backgroundColor: "#0f172a",
      borderRadius: "50%",
      border: "2px dashed #374151",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      margin: "0 auto",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
      gap: "1.25rem",
      width: "100%",
    },
    fullWidth: { gridColumn: "1 / -1" },
    label: {
      display: "block",
      color: "#9ca3af",
      fontSize: "0.875rem",
      fontWeight: "700",
      marginBottom: "0.5rem",
      marginLeft: "0.25rem",
      textAlign: "left",
    },
    input: {
      width: "100%",
      backgroundColor: "#0f172a",
      border: "1px solid #334155",
      padding: "0.875rem",
      borderRadius: "1rem",
      color: "#ffffff",
      outline: "none",
      fontSize: "0.95rem",
      boxSizing: "border-box",
      fontWeight: "600",
    },
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <div style={styles.card}>
          <div
            style={{
              ...styles.header,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div style={{ textAlign: "left" }}>
              <h2 style={styles.title}>Registro de Atleta</h2>
              <p style={styles.subtitle}></p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={styles.sectionBlock}>
              <div style={styles.avatarContainer}>
                {formData.foto_perfil ? (
                  <img
                    src={formData.foto_perfil}
                    alt="Previsualización"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span
                    style={{
                      fontSize: "10px",
                      color: "#4b5563",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      textAlign: "center",
                      padding: "0.5rem",
                    }}
                  >
                    Sin Foto
                  </span>
                )}
              </div>
              <div
                style={{
                  width: "100%",
                  textAlign: "left",
                  minWidth: "200px",
                  flex: "1",
                }}
              >
                <label
                  style={{
                    display: "block",
                    color: "#ffffff",
                    fontSize: "0.875rem",
                    fontWeight: "700",
                    margin: 0,
                  }}
                >
                  Foto Oficial de Credencial
                </label>
                <p
                  style={{
                    color: "#6b7280",
                    fontSize: "10px",
                    textTransform: "uppercase",
                    fontWeight: "600",
                    margin: "0.25rem 0 0.5rem 0",
                  }}
                >
                  Carga la imagen del rostro para la verificación contra
                  "Cachirules" en el campo móvil
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFotoChange}
                  style={{
                    color: "#9ca3af",
                    fontSize: "0.75rem",
                    width: "100%",
                  }}
                />
              </div>
            </div>

            <div style={styles.grid}>
              <div style={styles.fullWidth}>
                <label style={styles.label}>Nombre del Jugador</label>
                <input
                  type="text"
                  style={styles.input}
                  placeholder="Ej. Juan Pérez"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nombre: e.target.value.toUpperCase(),
                    })
                  }
                  required
                />
              </div>

              <div style={styles.fullWidth}>
                <label style={styles.label}>Correo Electrónico</label>
                <input
                  type="email"
                  style={styles.input}
                  placeholder="ejemplo@correo.com"
                  value={formData.correo}
                  onChange={(e) =>
                    setFormData({ ...formData, correo: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label style={styles.label}>Edad</label>
                <input
                  type="number"
                  placeholder="00"
                  style={styles.input}
                  onChange={(e) =>
                    setFormData({ ...formData, edad: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label style={styles.label}>Género</label>
                <select
                  style={styles.input}
                  value={formData.genero}
                  onChange={(e) =>
                    setFormData({ ...formData, genero: e.target.value })
                  }
                  required
                >
                  <option value="Masculino" style={{ backgroundColor: "#0f172a" }}>
                    Masculino
                  </option>
                  <option value="Femenil" style={{ backgroundColor: "#0f172a" }}>
                    Femenil
                  </option>
                </select>
              </div>

              <div>
                <label style={styles.label}>Categoría</label>
                <select
                  style={styles.input}
                  onChange={(e) =>
                    setFormData({ ...formData, categoria: e.target.value })
                  }
                  required
                  value={formData.categoria}
                >
                  <option value="" style={{ backgroundColor: "#0f172a" }}>
                    -- Elige rama --
                  </option>
                  <option value="VARONIL" style={{ backgroundColor: "#0f172a" }}>
                    VARONIL
                  </option>
                  <option value="FEMENIL" style={{ backgroundColor: "#0f172a" }}>
                    FEMENIL
                  </option>
                  <option value="MIXTO" style={{ backgroundColor: "#0f172a" }}>
                    MIXTO
                  </option>
                  <option value="JUVENIL" style={{ backgroundColor: "#0f172a" }}>
                    JUVENIL
                  </option>
                </select>
              </div>

              {/* 🟢 Selector Clásico de Equipo actualizado con la categoría */}
              <div>
                <label style={styles.label}>Equipo</label>
                <select
                  style={styles.input}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "OTRO_EQUIPO") {
                      setEsOtro(true);
                      setFormData({ ...formData, equipo: "" });
                    } else {
                      setEsOtro(false);
                      setFormData({ ...formData, equipo: val });
                    }
                  }}
                  value={esOtro ? "OTRO_EQUIPO" : formData.equipo}
                  required
                >
                  <option value="">-- Elige un equipo --</option>
                  {equipos.map((eq) => {
                    // 🟢 Unificamos el nombre y le agregamos la categoría entre paréntesis
                    const nombreConCategoria = eq.categoria 
                      ? `${eq.nombre_equipo} (${eq.categoria})`.toUpperCase() 
                      : eq.nombre_equipo.toUpperCase();

                    return (
                      <option key={eq.id} value={eq.nombre_equipo.toUpperCase()}>
                        {nombreConCategoria}
                      </option>
                    );
                  })}
                  <option value="OTRO_EQUIPO">
                    + OTRO (Escribir manualmente)
                  </option>
                </select>

                {esOtro && (
                  <>
                    {equipos.some(
                      (eq) =>
                        eq.nombre_equipo.toUpperCase() === formData.equipo,
                    ) && (
                      <p
                        style={{
                          color: "#ef4444",
                          fontSize: "0.75rem",
                          marginTop: "5px",
                        }}
                      >
                        ⚠️ ¡Este equipo ya existe! Selecciónalo en la lista
                        superior para ahorrar tiempo.
                      </p>
                    )}
                    <input
                      type="text"
                      style={{
                        ...styles.input,
                        marginTop: "8px",
                        border: "2px solid #2563eb",
                      }}
                      placeholder="ESCRIBE EL NOMBRE DEL EQUIPO"
                      value={formData.equipo}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase();
                        setFormData({ ...formData, equipo: val });
                      }}
                      autoComplete="off"
                      required
                    />
                  </>
                )}
              </div>

              <div>
                <label style={styles.label}>Teléfono de Contacto</label>
                <input
                  type="tel"
                  placeholder="10 dígitos"
                  style={styles.input}
                  onChange={(e) =>
                    setFormData({ ...formData, telefono: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label style={styles.label}>Número de Jersey (#)</label>
                <input
                  type="number"
                  placeholder="Ej. 07"
                  style={styles.input}
                  onChange={(e) =>
                    setFormData({ ...formData, numero_jersey: e.target.value })
                  }
                />
              </div>

              <div>
                <label style={styles.label}>Contraseña de Acceso</label>
                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  style={styles.input}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
              </div>

              <div style={styles.fullWidth}>
                <label style={styles.label}>Nombre del Tutor (Opcional)</label>
                <input
                  type="text"
                  placeholder="En caso de ser menor de edad"
                  style={styles.input}
                  onChange={(e) =>
                    setFormData({ ...formData, tutor: e.target.value })
                  }
                />
              </div>

              <div
                style={{
                  ...styles.fullWidth,
                  backgroundColor: "#141b2e",
                  padding: "12px",
                  borderRadius: "12px",
                  border: "1px solid #1f2937",
                  marginBottom: "1rem",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                  }}
                >
                  <input
                    type="checkbox"
                    id="privacidad"
                    required
                    style={{
                      marginTop: "3px",
                      cursor: "pointer",
                      width: "18px",
                      height: "18px",
                    }}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        acepta_privacidad: e.target.checked,
                      })
                    }
                  />
                  <label
                    htmlFor="privacidad"
                    style={{
                      color: "#9ca3af",
                      fontSize: "11px",
                      lineHeight: "1.4",
                      cursor: "pointer",
                    }}
                  >
                    Acepto que mis datos personales y fotografía sean
                    recolectados y utilizados exclusivamente para fines
                    internos, control de asistencia y validación de identidad
                    dentro de{" "}
                    <strong style={{ color: "#ffffff" }}>
                      MVP FLAG LEAGUE
                    </strong>
                    .
                  </label>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  width: "100%",
                  marginTop: "1rem",
                }}
              >
                <button
                  type="submit"
                  disabled={
                    loading ||
                    (esOtro &&
                      equipos.some(
                        (eq) =>
                          eq.nombre_equipo.toUpperCase() ===
                          formData.equipo.toUpperCase(),
                      ))
                  }
                  style={{
                    backgroundColor:
                      loading ||
                      (esOtro &&
                        equipos.some(
                          (eq) =>
                            eq.nombre_equipo.toUpperCase() ===
                            formData.equipo.toUpperCase(),
                        ))
                        ? "#4b5563"
                        : "#2563eb",
                    color: "#ffffff",
                    padding: "12px 24px",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    cursor:
                      loading ||
                      (esOtro &&
                        equipos.some(
                          (eq) =>
                            eq.nombre_equipo.toUpperCase() ===
                            formData.equipo.toUpperCase(),
                        ))
                        ? "not-allowed"
                        : "pointer",
                    width: "fit-content",
                  }}
                >
                  {loading ? "REGISTRANDO..." : "CONFIRMAR REGISTRO DE JUGADOR"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistroJugador;