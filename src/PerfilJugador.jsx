import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import api from './api'; 
import AvatarEditor from './AvatarEditor'; 
import logoMvp from './assets/logo-mvp.png'; 

const PerfilJugador = ({ jugadorId, onLogout }) => {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [equipos, setEquipos] = useState([]);
  
  // 🚀 NUEVO ESTADO: Pestaña activa del centro de control
  const [tabActiva, setTabActiva] = useState('promos');

  // ⚡ MOCK DATA: Simulación de la información del equipo que llegará desde tu API en Railway
  const [datosEquipo, setDatosEquipo] = useState({
    asistencias: 14,
    totalesPartidos: 16,
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
        const [resPerfil, resEquipos] = await Promise.all([
          api.get(`/api/jugadores/perfil/${idActual}`),
          api.get('/api/equipos')
        ]);

        let data = resPerfil.data;
        if (data.avatar_config && typeof data.avatar_config === 'string') {
          data.avatar_config = JSON.parse(data.avatar_config);
        }
        
        setPerfil(data);
        setEquipos(resEquipos.data);

        // 💡 NOTA DE ESTADÍA: Aquí harías tu llamada filtrada usando el equipo del jugador:
        // const resExtra = await api.get(`/api/equipos/${data.nombre_equipo}/dashboard`);
        // setDatosEquipo(resExtra.data);

      } catch (err) {
        console.error("Error al obtener perfil del atleta", err);
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
      flexDirection: 'column', // 🎯 Alineación vertical para alojar el centro de control abajo
      alignItems: 'center', 
      justifyContent: 'flex-start', 
      backgroundColor: '#0f172a', 
      padding: '40px 24px', 
      boxSizing: 'border-box',
      width: '100%',
      position: 'relative',
      gap: '32px'
    }}>
      
      {/* 💳 ESTA ES TU LICENCIA DIGITAL */}
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
        <div style={{ marginBottom: '24px', width: '100%' }}>
          <h2 style={{ fontSize: 'clamp(20px, 6vw, 24px)', fontWeight: '900', textTransform: 'uppercase', margin: '0 0 6px', wordBreak: 'break-word' }}>{perfil.nombre}</h2>
          <p style={{ color: '#22c55e', fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', margin: 0 }}>{obtenerNombreEquipo().toUpperCase()}</p>
          
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', fontSize: '10px', fontWeight: '900', color: '#9ca3af', marginTop: '16px', textTransform: 'uppercase', width: '100%', boxSizing: 'border-box' }}>
            <span style={{ backgroundColor: '#0f172a', padding: '8px 12px', borderRadius: '8px', border: '1px solid #30363d', flex: '1', minWidth: '0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>Cat: {perfil.categoria?.toUpperCase() || 'S/C'}</span>
            <span style={{ backgroundColor: '#0f172a', padding: '8px 12px', borderRadius: '8px', border: '1px solid #30363d', color: '#60a5fa', flex: '1', minWidth: '0' }}># {perfil.numero_jersey || 'S/N'}</span>
          </div>
        </div>

        {/* QR Area Responsivo */}
        <div style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: '16px', border: '1px solid #30363d', width: '100%', marginBottom: '24px', boxSizing: 'border-box' }}>
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

        {/* Botón Salir */}
        <button 
          onClick={handleLogout}
          style={{ width: '100%', padding: '12px', backgroundColor: 'transparent', border: 'none', color: '#64748b', fontWeight: '900', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.15em', cursor: 'pointer', boxSizing: 'border-box' }}
        >
          Cerrar Sesión
        </button>
      </div>

      {/* 🏟️ NUEVO CONTENEDOR: CENTRO DE CONTROL DEL JUGADOR */}
      <div style={{
        backgroundColor: '#1e293b',
        borderRadius: '24px',
        border: '1px solid #30363d',
        width: '100%',
        maxWidth: '450px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)',
        color: 'white'
      }}>
        {/* Barra de Pestañas Navegables */}
        <div style={{ display: 'flex', backgroundColor: '#0f172a', borderBottom: '1px solid #30363d' }}>
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
                padding: '14px 10px',
                background: tabActiva === tab.id ? '#1e293b' : 'transparent',
                border: 'none',
                color: tabActiva === tab.id ? '#60a5fa' : '#9ca3af',
                fontWeight: '900',
                fontSize: '11px',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenido Dinámico de las Pestañas */}
        <div style={{ padding: '20px', boxSizing: 'border-box', minHeight: '180px' }}>
          
          {/* TAB 1: PROMOCIONES */}
          {tabActiva === 'promos' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {datosEquipo.promociones.map((p) => (
                <div key={p.id} style={{ backgroundColor: '#0f172a', padding: '14px', borderRadius: '14px', border: '1px solid #30363d', textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '900', color: '#22c55e', letterSpacing: '0.05em' }}>{p.titulo}</span>
                    <span style={{ fontSize: '9px', color: '#64748b', fontWeight: '700' }}>Expira: {p.expira}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af', lineHeight: '1.4' }}>{p.desc}</p>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: ASISTENCIAS */}
          {tabActiva === 'asistencias' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', paddingTop: '10px' }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100px', height: '100px', borderRadius: '50%', border: '6px solid #0f172a', borderTopColor: '#22c55e', marginBottom: '14px' }}>
                <span style={{ fontSize: '24px', fontWeight: '900' }}>{datosEquipo.asistencias}</span>
              </div>
              <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: '900', textTransform: 'uppercase', color: '#60a5fa' }}>Récord de Asistencia</p>
              <span style={{ fontSize: '11px', color: '#9ca3af' }}>Tu equipo ha asistido a {datosEquipo.asistencias} de {datosEquipo.totalesPartidos} juegos programados.</span>
            </div>
          )}

          {/* TAB 3: FOTOS DEL ÁRBITRO */}
          {tabActiva === 'fotos' && (
            <div>
              <p style={{ margin: '0 0 12px 0', fontSize: '10px', fontWeight: '900', color: '#9ca3af', textTransform: 'uppercase', textAlign: 'left' }}>
                📷 Capturas de Oficiales ({obtenerNombreEquipo()})
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {datosEquipo.fotos.map((url, index) => (
                  <div key={index} style={{ width: '100%', aspectRatio: '1', backgroundColor: '#0f172a', borderRadius: '10px', overflow: 'hidden', border: '1px solid #30363d' }}>
                    <img src={url} alt={`Partido ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.2s', cursor: 'zoom-in' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'} />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 🔵 PANEL DEL AVATAR (Mantiene su comportamiento flotante independiente sin alterar nada) */}
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