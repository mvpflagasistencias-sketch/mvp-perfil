import { useState, useEffect } from "react";
import api from "./api";

const RegistroJugador = ({ onRegistroExitoso }) => {
  const [equipos, setEquipos] = useState([]);
  const [torneos, setTorneos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    genero: "Masculino",
    categoria: "",
    numero_jersey: "",
    password: "",
    edad: "",
    nombre_tutor: "",
    foto_perfil: null,
    inscripciones: [
      {
        torneo_id: "",
        equiposSeleccionados: [""],
        equiposManuales: [{}],
        colapsado: false, // 🟢 Estado para saber si está minimizado o abierto
      },
    ],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resEquipos, resTorneos] = await Promise.all([
          api.get("/api/equipos"),
          api.get("/api/torneos"),
        ]);
        console.log("📦 Equipos recibidos:", resEquipos.data);
        console.log("🏆 Torneos recibidos:", resTorneos.data);
        setEquipos(resEquipos.data);
        setTorneos(resTorneos.data);
      } catch (err) {
        console.error("Error cargando datos iniciales", err);
      }
    };
    fetchData();
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

    // 🟢 1. Validación de que existan inscripciones
    if (!formData.inscripciones || formData.inscripciones.length === 0) {
      alert("⚠️ Por favor, añade al menos un torneo.");
      return;
    }

    // 🟢 2. Validación de torneos, género y límites de equipos
    for (
      let indexTorneo = 0;
      indexTorneo < formData.inscripciones.length;
      indexTorneo++
    ) {
      const insc = formData.inscripciones[indexTorneo];
      const numTorneo = indexTorneo + 1;

      if (!insc.torneo_id) {
        alert(`⚠️ El Torneo #${numTorneo} no ha sido seleccionado.`);
        return;
      }

      const equiposSeleccionadosValidos = (
        insc.equiposSeleccionados || []
      ).filter((e) => e && e.trim() !== "");
      if (equiposSeleccionadosValidos.length === 0) {
        alert(
          `⚠️ El Torneo #${numTorneo} debe tener al menos un equipo seleccionado.`,
        );
        return;
      }

      // 🟢 DETECCIÓN DE GÉNERO Y CATEGORÍA A PRUEBA DE FALLOS
      const generoJugador = (formData.genero || "").trim().toUpperCase(); 
      // Si tu select guarda "MASCULINO" o "Masculino", esto lo normaliza a "MASCULINO"
      
      // Ajustamos la detección
      const esMasculino = generoJugador.includes("MASC");
      const esFemenino = generoJugador.includes("FEM");

      for (let i = 0; i < insc.equiposSeleccionados.length; i++) {
        const val = insc.equiposSeleccionados[i];
        if (!val || val === "") continue;

        let categoriaEquipo = "";
        // ... (tu lógica de búsqueda de categoriaEquipo igual que la tienes) ...
        
        const catUpper = categoriaEquipo.toUpperCase().trim();

        // 🟢 1. RESTRICCIÓN DE GÉNERO (Usando nuestras variables normalizadas)
        if (esMasculino && catUpper === "FEMENIL") {
          alert(`⚠️ Torneo #${numTorneo}: No puedes registrarte en categoría FEMENIL siendo masculino.`);
          return;
        }
        if (esFemenino && catUpper === "VARONIL") {
          alert(`⚠️ Torneo #${numTorneo}: No puedes registrarte en categoría VARONIL siendo femenino.`);
          return;
        }

        // 🟢 2. CONTADORES (Usando nuestras variables normalizadas)
        const esRamaPrincipal =
          (esMasculino && catUpper === "VARONIL") ||
          (esFemenino && catUpper === "FEMENIL");

        if (esRamaPrincipal) {
          contadorRamaPrincipal++;
        } else if (catUpper === "MIXTO") {
          contadorMixtos++;
        }
      }

      // 🟢 Validación de límites finales por torneo
      if (contadorRamaPrincipal > 2) {
        alert(
          `⚠️ En el Torneo #${numTorneo}, máximo 2 equipos de tu rama (${formData.genero.toUpperCase()}). Tienes ${contadorRamaPrincipal}.`,
        );
        return;
      }
      if (contadorMixtos > 2) {
        alert(
          `⚠️ En el Torneo #${numTorneo}, máximo 2 equipos MIXTOS. Tienes ${contadorMixtos}.`,
        );
        return;
      }
    }

    // 🟢 3. Validación de correo y envío
    const regexCorreo = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!regexCorreo.test(formData.correo)) {
      alert("⚠️ Correo electrónico inválido.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        inscripciones: formData.inscripciones.map((insc) => ({
          torneo_id: insc.torneo_id,
          equipos_seleccionados: (insc.equiposSeleccionados || []).filter(
            Boolean,
          ),
          equipos_manuales: (insc.equiposManuales || []).filter(
            (m) => m && m.nombre,
          ),
        })),
      };

      await api.post("/api/jugadores/registro", payload);
      alert("✅ ¡Registro exitoso!");
      if (onRegistroExitoso) onRegistroExitoso();
    } catch (err) {
      alert(`❌ ${err.response?.data?.error || "Error al registrar"}`);
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
      justifyContent: "space-between",
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
          <div style={styles.header}>
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
              {/* 🟢 SECCIÓN DE TARJETAS DINÁMICAS COLAPSABLES Y FILTRADAS POR TORNEO */}
              <div style={styles.fullWidth}>
                <label
                  style={{
                    ...styles.label,
                    fontSize: "1rem",
                    color: "#60a5fa",
                    marginBottom: "1rem",
                  }}
                >
                  Torneos y Equipos en los que participas
                </label>

                {(formData.inscripciones || []).map(
                  (inscripcion, indexTorneo) => {
                    // Obtenemos el nombre del torneo seleccionado para mostrarlo cuando esté minimizado
                    const torneoObj = torneos.find(
                      (t) => String(t.id) === String(inscripcion.torneo_id),
                    );
                    const nombreTorneoStr = torneoObj
                      ? torneoObj.nombre_torneo || torneoObj.nombre
                      : "Torneo sin seleccionar";

                    return (
                      <div
                        key={indexTorneo}
                        style={{
                          backgroundColor: "#141b2e",
                          padding: "1.25rem",
                          borderRadius: "1rem",
                          border: "1px solid #334155",
                          marginBottom: "1.25rem",
                        }}
                      >
                        {/* Cabecera de la tarjeta / Barra de Resumen */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{
                              color: "#fff",
                              fontWeight: "bold",
                              fontSize: "0.95rem",
                            }}
                          >
                            Torneo #{indexTorneo + 1}{" "}
                            {inscripcion.colapsado
                              ? `- (${nombreTorneoStr})`
                              : ""}
                          </span>

                          <div style={{ display: "flex", gap: "8px" }}>
                            {/* Botón Minimizar / Editar */}
                            <button
                              type="button"
                              onClick={() => {
                                const nuevas = [...formData.inscripciones];
                                nuevas[indexTorneo].colapsado =
                                  !nuevas[indexTorneo].colapsado;
                                setFormData({
                                  ...formData,
                                  inscripciones: nuevas,
                                });
                              }}
                              style={{
                                backgroundColor: "#334155",
                                color: "#60a5fa",
                                border: "none",
                                padding: "6px 12px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "12px",
                                fontWeight: "bold",
                              }}
                            >
                              {inscripcion.colapsado
                                ? "Editar ✏️"
                                : "Minimizar 🗕"}
                            </button>

                            {/* Botón Eliminar */}
                            {formData.inscripciones.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const nuevasInscripciones =
                                    formData.inscripciones.filter(
                                      (_, i) => i !== indexTorneo,
                                    );
                                  setFormData({
                                    ...formData,
                                    inscripciones: nuevasInscripciones,
                                  });
                                }}
                                style={{
                                  backgroundColor: "#ef4444",
                                  color: "#fff",
                                  border: "none",
                                  padding: "6px 12px",
                                  borderRadius: "8px",
                                  cursor: "pointer",
                                  fontSize: "12px",
                                  fontWeight: "bold",
                                }}
                              >
                                Eliminar ✕
                              </button>
                            )}
                          </div>
                        </div>

                        {/* 🟢 CONTENIDO DE LA TARJETA (Se oculta si 'colapsado' es true) */}
                        {!inscripcion.colapsado && (
                          <div style={{ marginTop: "15px" }}>
                            {/* Selector del Torneo */}
                            <select
                              style={styles.input}
                              value={inscripcion.torneo_id}
                              onChange={async (e) => {
                                const torneoIdSeleccionado = e.target.value;
                                const nuevasInscripciones = [
                                  ...formData.inscripciones,
                                ];
                                nuevasInscripciones[indexTorneo].torneo_id =
                                  torneoIdSeleccionado;
                                nuevasInscripciones[
                                  indexTorneo
                                ].equiposSeleccionados = [""];
                                nuevasInscripciones[
                                  indexTorneo
                                ].equiposDisponibles = [];
                                setFormData({
                                  ...formData,
                                  inscripciones: nuevasInscripciones,
                                });

                                // Si elige un torneo, pedimos sus equipos específicos a la API
                                if (torneoIdSeleccionado) {
                                  try {
                                    const res = await api.get(
                                      `/api/torneos/${torneoIdSeleccionado}/equipos`,
                                    );
                                    const actualizadas = [
                                      ...formData.inscripciones,
                                    ];
                                    actualizadas[
                                      indexTorneo
                                    ].equiposDisponibles = res.data;
                                    setFormData({
                                      ...formData,
                                      inscripciones: actualizadas,
                                    });
                                  } catch (err) {
                                    console.error(
                                      "Error al cargar equipos del torneo",
                                      err,
                                    );
                                  }
                                }
                              }}
                              required
                            >
                              <option
                                value=""
                                style={{ backgroundColor: "#0f172a" }}
                              >
                                -- Elige un torneo --
                              </option>
                              {Array.isArray(torneos) &&
                                torneos.map((t) => (
                                  <option
                                    key={t.id}
                                    value={t.id}
                                    style={{ backgroundColor: "#0f172a" }}
                                  >
                                    {t.nombre_torneo ||
                                      t.nombre ||
                                      `Torneo #${t.id}`}
                                  </option>
                                ))}
                            </select>

                            {/* Sección de Equipos específicos filtrados */}
                            <div
                              style={{
                                marginTop: "15px",
                                paddingLeft: "12px",
                                borderLeft: "2px solid #3b82f6",
                              }}
                            >
                              <label
                                style={{
                                  fontSize: "0.85rem",
                                  color: "#9ca3af",
                                  display: "block",
                                  marginBottom: "8px",
                                  fontWeight: "bold",
                                }}
                              >
                                Equipos para este torneo:
                              </label>

                              {(inscripcion.equiposSeleccionados || []).map(
                                (equipoActual, indexEq) => (
                                  <div
                                    key={indexEq}
                                    style={{ marginBottom: "12px" }}
                                  >
                                    <div
                                      style={{
                                        display: "flex",
                                        gap: "10px",
                                        alignItems: "center",
                                      }}
                                    >
                                      {/* 🟢 Selector de equipos usando estrictamente equiposDisponibles */}
                                      <select
                                        style={{ ...styles.input, flex: 1 }}
                                        value={equipoActual}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          const nuevasInscripciones = [
                                            ...formData.inscripciones,
                                          ];
                                          nuevasInscripciones[
                                            indexTorneo
                                          ].equiposSeleccionados[indexEq] = val;
                                          setFormData({
                                            ...formData,
                                            inscripciones: nuevasInscripciones,
                                          });
                                        }}
                                        required
                                      >
                                        <option value="">
                                          -- Elige un equipo --
                                        </option>

                                        {Array.isArray(
                                          inscripcion.equiposDisponibles,
                                        ) &&
                                          inscripcion.equiposDisponibles.map(
                                            (eq) => {
                                              if (!eq || !eq.nombre_equipo)
                                                return null;
                                              const nombreConCategoria =
                                                eq.categoria
                                                  ? `${eq.nombre_equipo} (${eq.categoria})`.toUpperCase()
                                                  : eq.nombre_equipo.toUpperCase();
                                              return (
                                                <option
                                                  key={eq.id}
                                                  value={eq.nombre_equipo.toUpperCase()}
                                                >
                                                  {nombreConCategoria}
                                                </option>
                                              );
                                            },
                                          )}

                                        <option value="OTRO_EQUIPO">
                                          + OTRO (Escribir manualmente)
                                        </option>
                                      </select>

                                      {inscripcion.equiposSeleccionados.length >
                                        1 && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const nuevasInscripciones = [
                                              ...formData.inscripciones,
                                            ];
                                            nuevasInscripciones[
                                              indexTorneo
                                            ].equiposSeleccionados =
                                              nuevasInscripciones[
                                                indexTorneo
                                              ].equiposSeleccionados.filter(
                                                (_, i) => i !== indexEq,
                                              );
                                            nuevasInscripciones[
                                              indexTorneo
                                            ].equiposManuales =
                                              nuevasInscripciones[
                                                indexTorneo
                                              ].equiposManuales.filter(
                                                (_, i) => i !== indexEq,
                                              );
                                            setFormData({
                                              ...formData,
                                              inscripciones:
                                                nuevasInscripciones,
                                            });
                                          }}
                                          style={{
                                            background: "#ef4444",
                                            color: "#fff",
                                            border: "none",
                                            padding: "10px 14px",
                                            borderRadius: "8px",
                                            cursor: "pointer",
                                            fontWeight: "bold",
                                          }}
                                        >
                                          ✕
                                        </button>
                                      )}
                                    </div>

                                    {/* Si elige OTRO_EQUIPO */}
                                    {equipoActual === "OTRO_EQUIPO" && (
                                      <div style={{ marginTop: "8px" }}>
                                        <div
                                          style={{
                                            display: "flex",
                                            gap: "10px",
                                            flexWrap: "wrap",
                                          }}
                                        >
                                          <input
                                            type="text"
                                            style={{
                                              ...styles.input,
                                              flex: 2,
                                              border: "2px solid #2563eb",
                                              margin: 0,
                                            }}
                                            placeholder={`ESCRIBE EL NOMBRE DEL EQUIPO MANUAL #${indexEq + 1}`}
                                            value={
                                              inscripcion.equiposManuales?.[
                                                indexEq
                                              ]?.nombre || ""
                                            }
                                            onChange={(e) => {
                                              const nuevasInscripciones = [
                                                ...formData.inscripciones,
                                              ];
                                              if (
                                                !nuevasInscripciones[
                                                  indexTorneo
                                                ].equiposManuales[indexEq]
                                              ) {
                                                nuevasInscripciones[
                                                  indexTorneo
                                                ].equiposManuales[indexEq] = {};
                                              }
                                              nuevasInscripciones[
                                                indexTorneo
                                              ].equiposManuales[
                                                indexEq
                                              ].nombre = e.target.value
                                                ? e.target.value.toUpperCase()
                                                : "";
                                              setFormData({
                                                ...formData,
                                                inscripciones:
                                                  nuevasInscripciones,
                                              });
                                            }}
                                            autoComplete="off"
                                            required
                                          />

                                          <select
                                            style={{
                                              ...styles.input,
                                              flex: 1,
                                              border: "2px solid #2563eb",
                                              margin: 0,
                                            }}
                                            value={
                                              inscripcion.equiposManuales?.[
                                                indexEq
                                              ]?.categoria || ""
                                            }
                                            onChange={(e) => {
                                              const nuevasInscripciones = [
                                                ...formData.inscripciones,
                                              ];
                                              if (
                                                !nuevasInscripciones[
                                                  indexTorneo
                                                ].equiposManuales[indexEq]
                                              ) {
                                                nuevasInscripciones[
                                                  indexTorneo
                                                ].equiposManuales[indexEq] = {};
                                              }
                                              nuevasInscripciones[
                                                indexTorneo
                                              ].equiposManuales[
                                                indexEq
                                              ].categoria = e.target.value;
                                              setFormData({
                                                ...formData,
                                                inscripciones:
                                                  nuevasInscripciones,
                                              });
                                            }}
                                          >
                                            <option
                                              value=""
                                              style={{
                                                backgroundColor: "#0f172a",
                                              }}
                                            >
                                              -- Categoría (Opcional) --
                                            </option>
                                            <option
                                              value="VARONIL"
                                              style={{
                                                backgroundColor: "#0f172a",
                                              }}
                                            >
                                              VARONIL
                                            </option>
                                            <option
                                              value="FEMENIL"
                                              style={{
                                                backgroundColor: "#0f172a",
                                              }}
                                            >
                                              FEMENIL
                                            </option>
                                            <option
                                              value="MIXTO"
                                              style={{
                                                backgroundColor: "#0f172a",
                                              }}
                                            >
                                              MIXTO
                                            </option>
                                          </select>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ),
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  const nuevasInscripciones = [
                                    ...formData.inscripciones,
                                  ];
                                  nuevasInscripciones[
                                    indexTorneo
                                  ].equiposSeleccionados.push("");
                                  nuevasInscripciones[
                                    indexTorneo
                                  ].equiposManuales.push({});
                                  setFormData({
                                    ...formData,
                                    inscripciones: nuevasInscripciones,
                                  });
                                }}
                                style={{
                                  background: "transparent",
                                  color: "#60a5fa",
                                  border: "none",
                                  cursor: "pointer",
                                  fontWeight: "bold",
                                  marginTop: "4px",
                                  padding: 0,
                                  fontSize: "0.85rem",
                                }}
                              >
                                + Agregar otro equipo a este torneo
                              </button>
                            </div>

                            {/* Botón para minimizar rápido dentro de la tarjeta */}
                            <button
                              type="button"
                              onClick={() => {
                                const nuevas = [...formData.inscripciones];
                                nuevas[indexTorneo].colapsado = true;
                                setFormData({
                                  ...formData,
                                  inscripciones: nuevas,
                                });
                              }}
                              style={{
                                backgroundColor: "#1e293b",
                                color: "#fff",
                                border: "1px solid #334155",
                                padding: "8px 12px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "12px",
                                fontWeight: "bold",
                                marginTop: "15px",
                                width: "100%",
                              }}
                            >
                              ✓ Listo (Minimizar torneo)
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  },
                )}

                {/* Botón para añadir otro Torneo completo */}
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      inscripciones: [
                        ...formData.inscripciones,
                        {
                          torneo_id: "",
                          equiposSeleccionados: [""],
                          equiposManuales: [{}],
                          equiposDisponibles: [],
                          colapsado: false,
                        },
                      ],
                    });
                  }}
                  style={{
                    backgroundColor: "#2563eb",
                    color: "#fff",
                    border: "none",
                    padding: "10px 16px",
                    borderRadius: "1rem",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: "700",
                    width: "100%",
                    marginTop: "5px",
                  }}
                >
                  + Añadir otro torneo
                </button>
              </div>

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
                  <option
                    value="Masculino"
                    style={{ backgroundColor: "#0f172a" }}
                  >
                    Masculino
                  </option>
                  <option
                    value="Femenil"
                    style={{ backgroundColor: "#0f172a" }}
                  >
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
                  <option
                    value="VARONIL"
                    style={{ backgroundColor: "#0f172a" }}
                  >
                    VARONIL
                  </option>
                  <option
                    value="FEMENIL"
                    style={{ backgroundColor: "#0f172a" }}
                  >
                    FEMENIL
                  </option>
                  <option value="MIXTO" style={{ backgroundColor: "#0f172a" }}>
                    MIXTO
                  </option>
                </select>
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
                  disabled={loading}
                  style={{
                    backgroundColor: loading ? "#4b5563" : "#2563eb",
                    color: "#ffffff",
                    padding: "12px 24px",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    cursor: loading ? "not-allowed" : "pointer",
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
