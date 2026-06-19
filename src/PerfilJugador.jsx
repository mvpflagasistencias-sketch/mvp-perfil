import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import api from './api'; 
import AvatarEditor from './AvatarEditor'; 
import logoMvp from './assets/logo-mvp.png'; 

const PerfilJugador = ({ jugadorId, onLogout }) => {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [equipos, setEquipos] = useState([]);
  
  // 🍔 ESTADOS PARA EL MENÚ HAMBURGUESA DESPLEGABLE
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [tabActiva, setTabActiva] = useState('promos');

  // 📝 ESTADO EXTENDIDO: Ahora incluye Nombre, Equipo, Teléfono, Jersey y Password
  const [modalPerfilAbierto, setModalPerfilAbierto] = useState(false);
  const [datosForm, setDatosForm] = useState({ 
    nombre: '',
    nombre_equipo: '', // Se guardará el ID o el nombre seleccionado
    numero_jersey: '', 
    telefono: '',
    password: '', 
    confirmPassword: ''
  });

  // 🚀 FOTO: Estado local para manejar el string de previsualización y guardado
  const [fotoBase64, setFotoBase64] = useState('');

  // Información del equipo (para jalar de tu API en Railway)
  const [datosEquipo, setDatosEquipo] = useState({
    asistencias: 0, // Inicia en 0 en lugar de hardcodeado
    totalesPartidos: 16, // Base por defecto, se actualizará dinámicamente
    fotos: [
      'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=400&auto=format&fit=crop'
    ],
    promociones: [
      { id: 1, titulo: "🔥 ¡20% EN JERSEY OFICIAL!", desc: "Usa el cupón MVPJERSEY26 en la tienda física de la liga y personaliza tu uniforme.", expira: "30/06/2026" },
      { id: 2, titulo: "🏈 INSCRIPCIONES ABIERTAS", desc: "Asegura el lugar de tu escuadra para el torneo relámpago de Verano. Cierre de registros: Julio 5.", expira: "05/07/2026" }
    ]
  });

  useEffect(() => {
    const fetchPerfilYEquipos = async () => {
      const idActual = jugadorId || localStorage.getItem('atleta_id');
      if (!idActual) { setLoading(false); return; }

      try {
        // Realizamos las 3 peticiones en paralelo para optimizar la velocidad de carga en Railway
        const [resPerfil, resEquipos, resAsistencias] = await Promise.all([
          api.get(`/api/jugadores/perfil/${idActual}`),
          api.get('/api/equipos'),
          api.get(`/api/jugadores/${idActual}/contador-asistencias`)
        ]);

        let data = resPerfil.data;
        if (data.avatar_config && typeof data.avatar_config === 'string') {
          data.avatar_config = JSON.parse(data.avatar_config);
        }
        
        setPerfil(data);
        setEquipos(resEquipos.data);

        // Mantenemos intactas tus galerías y promos, inyectando las asistencias reales de la base de datos
        if (resAsistencias.data) {
          setDatosEquipo(prev => ({
            ...prev,
            asistencias: resAsistencias.data.asistencias,
            totalesPartidos: resAsistencias.data.totalesPartidos
          }));
        }

        // Sincronizamos los datos editables con el formulario
        setDatosForm({
          nombre: data.nombre || '',
          nombre_equipo: data.nombre_equipo || '',
          numero_jersey: data.numero_jersey || '',
          telefono: data.telefono || '',
          password: '',
          confirmPassword: ''
        });
        
        // Sincronizamos la foto inicial en el estado de preview
        setFotoBase64(data.foto_perfil || '');
      } catch (err) {
        console.error("Error al obtener perfil del atleta o asistencias", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPerfilYEquipos();
  }, [jugadorId]);

  const handleLogout = () => {
    localStorage.removeItem('atleta_token');
    localStorage.removeItem('atleta_id');
    if (onLogout) {
      onLogout();
    } else {
      window.location.reload();
    }
  };

  // 🚀 FOTO: Lector de archivos binarios para convertirlos a Base64 antes de enviarlos al Servidor
  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoBase64(reader.result); // Almacena el string Base64 con el prefijo data:image/...
      };
      reader.readAsDataURL(file);
    }
  };

  // Manejador del submit para impactar el backend en Railway
  const handleActualizarPerfil = async (e) => {
    e.preventDefault();

    // 🛑 VALIDACIÓN BÁSICA: Asegurar que las contraseñas coinciden
    if (datosForm.password && datosForm.password !== datosForm.confirmPassword) {
      alert("❌ Las contraseñas no coinciden.");
      return;
    }

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      
      // Estructuramos el payload de forma segura (sin incluir password si está vacío)
      // 🚀 FOTO: Inyectamos la foto convertida en Base64 al JSON que espera tu endpoint unificado
      const payloadAEnviar = { 
        ...datosForm,
        foto_perfil: fotoBase64 
      };
      
      if (!payloadAEnviar.password) {
        delete payloadAEnviar.password;
        delete payloadAEnviar.confirmPassword;
      }

      // 🚀 CORRECCIÓN CRÍTICA: Extraemos de forma garantizada el ID real para evitar el 'undefined'
      const idActual = jugadorId || localStorage.getItem('atleta_id');
      const response = await api.put(`/api/jugadores/perfil/actualizar/${idActual}`, payloadAEnviar);
      
      if (response.status === 200) {
        // Actualizamos el estado local del perfil con la info guardada (sin la password)
        const {...perfilActualizado} = payloadAEnviar;
        delete perfilActualizado.password;
        delete perfilActualizado.confirmPassword;

        setPerfil({ ...perfil, ...perfilActualizado });
        alert("✅ ¡Perfil actualizado correctamente!");
        setModalPerfilAbierto(false);
      }
    } catch (err) {
      console.error("Error al actualizar datos:", err);
      alert("❌ No se pudieron guardar los cambios en el servidor");
    }
  };

  const obtenerNombreEquipo = () => {
    if (!perfil) return 'AGENTE LIBRE';
    if (isNaN(perfil.nombre_equipo)) {
      return perfil.nombre_equipo || 'AGENTE LIBRE';
    }
    const equipoEncontrado = equipos.find(e => e.id === Number(perfil.nombre_equipo));
    return equipoEncontrado ? equipoEncontrado.nombre_equipo : 'AGENTE LIBRE';
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#161b22', color: '#3b82f6', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em', padding: '16px', boxSizing: 'border-box' }}>
        Cargando Licencia...
      </div>
    );
  }

  if (!perfil) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#161b22', padding: '16px', textAlign: 'center', color: 'white', boxSizing: 'border-box' }}>
        <div style={{ width: '100%', maxWidth: '360px' }}>
          <p style={{ marginBottom: '16px', fontWeight: '700' }}>⚠️ Sesión no encontrada.</p>
          <button onClick={() => window.location.reload()} style={{ backgroundColor: '#2563eb', padding: '14px 24px', borderRadius: '12px', border: 'none', color: 'white', fontWeight: '700', cursor: 'pointer', width: '100%', textTransform: 'uppercase', fontSize: '12px' }}>Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#0f172a', 
      padding: '24px', 
      boxSizing: 'border-box',
      width: '100%',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      
      {/* 🍔 BOTÓN DE HAMBURGUESA FLOTANTE */}
      <button 
        onClick={() => setMenuAbierto(true)}
        style={{
          position: 'fixed',
          top: '24px',
          left: '24px',
          backgroundColor: '#1e293b',
          border: '1px solid #30363d',
          borderRadius: '12px',
          padding: '12px 14px',
          cursor: 'pointer',
          zIndex: 99,
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          transition: 'transform 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <div style={{ width: '20px', height: '3px', backgroundColor: '#60a5fa', borderRadius: '2px' }}></div>
        <div style={{ width: '20px', height: '3px', backgroundColor: '#60a5fa', borderRadius: '2px' }}></div>
        <div style={{ width: '20px', height: '3px', backgroundColor: '#60a5fa', borderRadius: '2px' }}></div>
      </button>

      {/* 💳 ESTA ES TU LICENCIA DIGITAL (Alineada en el centro absoluto) */}
      <div style={{ 
        backgroundColor: '#1e293b',
        padding: 'clamp(20px, 6vw, 32px)', 
        borderRadius: '24px', 
        border: '1px solid #30363d', 
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', 
        width: '100%', 
        maxWidth: '380px', 
        boxSizing: 'border-box',
        textAlign: 'center',
        color: 'white',
        zIndex: 5
      }}>
        
        {/* Header Visual */}
        <div style={{ marginBottom: '24px' }}>
          <span style={{ color: '#60a5fa', fontSize: '10px', fontWeight: '900', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Licencia Digital</span>
          <h3 style={{ fontSize: 'clamp(18px, 5vw, 20px)', fontWeight: '900', marginTop: '8px', textTransform: 'uppercase', margin: '8px 0 0' }}>MVP Flag</h3>
        </div>

        {/* Avatar y Foto Responsivos */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', marginBottom: '24px', width: '100%' }}>
          <div style={{ width: '112px', height: '112px', backgroundColor: '#0f172a', borderRadius: '50%', border: '4px solid #30363d', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)', boxSizing: 'border-box' }}>
            {perfil.foto_perfil ? (
              <img src={perfil.foto_perfil} alt="Foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ color: '#374151', fontSize: '10px', display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>SIN FOTO</div>
            )}
          </div>
        </div>

        {/* Info Jugador */}
        <div style={{ marginBottom: '12px', width: '100%' }}>
          <h2 style={{ fontSize: 'clamp(20px, 6vw, 24px)', fontWeight: '900', textTransform: 'uppercase', margin: '0 0 6px', wordBreak: 'break-word' }}>{perfil.nombre}</h2>
          <p style={{ color: '#22c55e', fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', margin: 0 }}>{obtenerNombreEquipo().toUpperCase()}</p>
          
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', fontSize: '10px', fontWeight: '900', color: '#9ca3af', marginTop: '16px', textTransform: 'uppercase', width: '100%', boxSizing: 'border-box' }}>
            <span style={{ backgroundColor: '#0f172a', padding: '8px 12px', borderRadius: '8px', border: '1px solid #30363d', flex: '1', minWidth: '0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>Cat: {perfil.categoria?.toUpperCase() || 'S/C'}</span>
            <span style={{ backgroundColor: '#0f172a', padding: '8px 12px', borderRadius: '8px', border: '1px solid #30363d', color: '#60a5fa', flex: '1', minWidth: '0' }}># {perfil.numero_jersey || 'S/N'}</span>
          </div>
        </div>

        {/* QR Area Responsivo */}
        <div style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: '16px', border: '1px solid #30363d', width: '100%', boxSizing: 'border-box' }}>
          <p style={{ fontSize: '9px', color: '#64748b', fontWeight: '900', textTransform: 'uppercase', margin: '0 0 12px' }}>ID Único de Acceso</p>
          {perfil ? (
            <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '16px', display: 'inline-block' }}>
              <QRCodeSVG 
                value={JSON.stringify({id: perfil.id, nombre: perfil.nombre})} 
                size={120} 
                level={"H"} 
                includeMargin={true}
                imageSettings={{
                  src: logoMvp,
                  height: 35,
                  width: 35,
                  align: 'center',
                  excavate: true,
                }}
              />
            </div>
          ) : (
            <div style={{ color: '#475569', fontSize: '11px', fontFamily: 'monospace' }}>TOKEN PENDIENTE</div>
          )}
        </div>
      </div>

      {/* 🎴 SIDESHEET / PANEL LATERAL DESPLEGABLE */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: menuAbierto ? 0 : '-400px',
        width: '100%',
        maxWidth: '360px',
        height: '100vh',
        backgroundColor: '#1e293b',
        borderRight: '1px solid #30363d',
        boxShadow: '25px 0 50px -12px rgba(0,0,0,0.5)',
        zIndex: 100,
        transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        color: 'white'
      }}>
        {/* Cabecera del Menú */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 20px', backgroundColor: '#0f172a', borderBottom: '1px solid #30363d' }}>
          <span style={{ fontSize: '12px', fontWeight: '900', color: '#60a5fa', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Centro de Control</span>
          <button onClick={() => setMenuAbierto(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '18px', fontWeight: '900', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Links de Pestañas */}
        <div style={{ display: 'flex', backgroundColor: '#111827', borderBottom: '1px solid #30363d' }}>
          {[
            { id: 'promos', label: '📢 Promos' },
            { id: 'asistencias', label: '📊 Asistencias' },
            { id: 'fotos', label: '📸 Galería' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTabActiva(tab.id)}
              style={{
                flex: 1,
                padding: '14px 5px',
                background: tabActiva === tab.id ? '#1e293b' : 'transparent',
                border: 'none',
                color: tabActiva === tab.id ? '#60a5fa' : '#9ca3af',
                fontWeight: '900',
                fontSize: '11px',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Zona Central: Contenido del Dashboard */}
        <div style={{ padding: '20px', flex: 1, overflowY: 'auto', boxSizing: 'border-box' }}>
          {tabActiva === 'promos' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {datosEquipo.promociones.map((p) => (
                <div key={p.id} style={{ backgroundColor: '#0f172a', padding: '14px', borderRadius: '14px', border: '1px solid #30363d' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '900', color: '#22c55e' }}>{p.titulo}</span>
                    <span style={{ fontSize: '9px', color: '#64748b', fontWeight: '700' }}>{p.expira}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af', lineHeight: '1.4' }}>{p.desc}</p>
                </div>
              ))}
            </div>
          )}

          {tabActiva === 'asistencias' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '95px', height: '95px', borderRadius: '50%', border: '6px solid #0f172a', borderTopColor: '#22c55e', marginBottom: '16px' }}>
                <span style={{ fontSize: '24px', fontWeight: '900' }}>{datosEquipo.asistencias}</span>
              </div>
              <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: '900', textTransform: 'uppercase', color: '#60a5fa' }}>Récord de Asistencia</p>
              <span style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'center', lineHeight: '1.4' }}>Tu escuadra registra asistencia en {datosEquipo.asistencias} de {datosEquipo.totalesPartidos} partidos oficiales.</span>
            </div>
          )}

          {tabActiva === 'fotos' && (
            <div>
              <p style={{ margin: '0 0 12px 0', fontSize: '10px', fontWeight: '900', color: '#9ca3af', textTransform: 'uppercase' }}>
                📸 Capturas de Árbitros ({obtenerNombreEquipo()})
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {datosEquipo.fotos.map((url, index) => (
                  <div key={index} style={{ width: '100%', aspectRatio: '1', backgroundColor: '#0f172a', borderRadius: '10px', overflow: 'hidden', border: '1px solid #30363d' }}>
                    <img src={url} alt={`Partido ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 🛑 OPCIONES EXCLUSIVAS (Bottom del menú con línea divisoria roja) */}
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#0f172a', 
          borderTop: '2px solid #ef4444', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '10px',
          boxSizing: 'border-box'
        }}>
          {/* Botón A: Editar Perfil */}
          <button 
            onClick={() => { setModalPerfilAbierto(true); setMenuAbierto(false); }}
            style={{ width: '100%', padding: '12px', backgroundColor: '#2563eb', border: 'none', borderRadius: '10px', color: 'white', fontWeight: '900', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em', cursor: 'pointer', transition: 'background-color 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          >
            ⚙️ Administrar Cuenta
          </button>

          {/* Botón B: Cerrar Sesión */}
          <button 
            onClick={handleLogout}
            style={{ width: '100%', padding: '12px', backgroundColor: 'transparent', border: '1px solid #475569', borderRadius: '10px', color: '#9ca3af', fontWeight: '900', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#475569'; e.currentTarget.style.color = '#9ca3af'; }}
          >
            🚪 Cerrar Sesión
          </button>
        </div>

      </div>

      {/* 📋 MODAL EMERGENTE: FORMULARIO UNIFICADO (Contraseña, Foto, Nombre, Jersey, Teléfono, Equipo) */}
      {modalPerfilAbierto && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', boxSizing: 'border-box' }}>
          <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '24px', border: '1px solid #30363d', maxWidth: '400px', width: '100%', color: 'white', boxSizing: 'border-box', overflowY: 'auto', maxHeight: '90vh' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', color: '#60a5fa', margin: '0 0 20px', letterSpacing: '0.05em' }}>Administrar Cuenta MVP FLAG</h4>
            
            <form onSubmit={handleActualizarPerfil} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* 📷 FOTO DE PERFIL (Carga de archivo) */}
              <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <img src={fotoBase64 || logoMvp} alt="Preview" style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #30363d', marginBottom: '8px' }}/>
                <input type="file" accept="image/*" onChange={handleFotoChange} style={{ fontSize: '10px', color: '#9ca3af' }}/>
                <p style={{fontSize: '9px', color: '#64748b', margin: '4px 0 0'}}>Formatos: JPG, PNG. Máx: 2MB.</p>
              </div>

              {/* 🧑 DATOS PERSONALES */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                <label style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: '#9ca3af' }}>Nombre Completo</label>
                <input type="text" value={datosForm.nombre} onChange={(e) => setDatosForm({ ...datosForm, nombre: e.target.value })} style={{ backgroundColor: '#0f172a', border: '1px solid #30363d', borderRadius: '10px', padding: '12px', color: 'white', fontWeight: '700', outline: 'none' }} />
              </div>

              {/* 🏈 IDENTIDAD DEPORTIVA (Selector de Equipo y Jersey) */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left', flex: '1' }}>
                  <label style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: '#9ca3af' }}>N° Jersey</label>
                  <input type="text" value={datosForm.numero_jersey} onChange={(e) => setDatosForm({ ...datosForm, numero_jersey: e.target.value })} style={{ backgroundColor: '#0f172a', border: '1px solid #30363d', borderRadius: '10px', padding: '12px', color: 'white', fontWeight: '700', outline: 'none' }} />
                </div>
                
                {/* 🛡️ SELECTOR DE EQUIPO DINDÁMICO (Jalado de Railway) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left', flex: '2' }}>
                  <label style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: '#9ca3af' }}>Equipo Actual</label>
                  <select 
                    value={datosForm.nombre_equipo} 
                    onChange={(e) => setDatosForm({ ...datosForm, nombre_equipo: e.target.value })}
                    style={{ backgroundColor: '#0f172a', border: '1px solid #30363d', borderRadius: '10px', padding: '12px', color: 'white', fontWeight: '700', outline: 'none', appearance: 'none', cursor: 'pointer' }}
                  >
                    <option value="" disabled>Selecciona tu equipo</option>
                    <option value="AGENTE LIBRE">Agente Libre</option>
                    {equipos.map(e => (
                      <option key={e.id} value={e.id}>{e.nombre_equipo.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 📞 TELÉFONO */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                <label style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: '#9ca3af' }}>Teléfono de Contacto</label>
                <input type="text" value={datosForm.telefono} onChange={(e) => setDatosForm({ ...datosForm, telefono: e.target.value })} style={{ backgroundColor: '#0f172a', border: '1px solid #30363d', borderRadius: '10px', padding: '12px', color: 'white', fontWeight: '700', outline: 'none' }} />
              </div>

              {/* 🔐 SEGURIDAD: ACTUALIZAR CONTRASEÑA */}
              <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid #30363d', paddingTop: '16px', marginTop: '4px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left', flex: 1 }}>
                  <label style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: '#60a5fa' }}>Nueva Password</label>
                  <input type="password" placeholder="••••••••" value={datosForm.password} onChange={(e) => setDatosForm({ ...datosForm, password: e.target.value })} style={{ backgroundColor: '#111827', border: '1px solid #30363d', borderRadius: '10px', padding: '12px', color: 'white', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left', flex: 1 }}>
                  <label style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: '#60a5fa' }}>Confirmar</label>
                  <input type="password" placeholder="••••••••" value={datosForm.confirmPassword} onChange={(e) => setDatosForm({ ...datosForm, confirmPassword: e.target.value })} style={{ backgroundColor: '#111827', border: '1px solid #30363d', borderRadius: '10px', padding: '12px', color: 'white', outline: 'none' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '16px', borderTop: '1px solid #30363d', paddingTop: '16px' }}>
                <button type="button" onClick={() => setModalPerfilAbierto(false)} style={{ flex: 1, backgroundColor: 'transparent', border: '1px solid #475569', padding: '12px', borderRadius: '10px', color: 'white', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" style={{ flex: 1, backgroundColor: '#22c55e', border: 'none', padding: '12px', borderRadius: '10px', color: 'white', fontWeight: '900', fontSize: '11px', textTransform: 'uppercase', cursor: 'pointer' }}>Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fondo oscuro traslúcido de apoyo */}
      {menuAbierto && (
        <div onClick={() => setMenuAbierto(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(2px)', zIndex: 98 }}></div>
      )}

      {/* 🔵 PANEL DEL AVATAR */}
      <AvatarEditor 
        key={`editor-atleta-${perfil.id}`}
        jugadorId={perfil.id} 
        configInicial={perfil.avatar_config} 
        onGuardarExito={(nuevaConfig) => setPerfil({ ...perfil, avatar_config: nuevaConfig })} 
      />

    </div>
  );
};

export default PerfilJugador;