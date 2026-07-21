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

  // 🔒 CONTROL DE EDICIÓN: Bloquea o desbloquea secciones de forma independiente
  const [editandoCampos, setEditandoCampos] = useState(false);
  const [verSeccionPassword, setVerSeccionPassword] = useState(false);

  // 📢 NUEVO ESTADO: Guarda la promoción seleccionada para el modal de detalle
  const [promoSeleccionada, setPromoSeleccionada] = useState(null);

  // Información del equipo (para jalar de tu API en Railway)
  const [datosEquipo, setDatosEquipo] = useState({
    asistencias: 0, // Inicia en 0 en lugar de hardcodeado
    totalesPartidos: 16, // Base por defecto, se actualizará dinámicamente
    fotos: [
      'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=400&auto=format&fit=crop'
    ],
    promociones: [] // Inicializado vacío para recibir la información real de la BD
  });

  useEffect(() => {
    const fetchPerfilYEquipos = async () => {
      const idActual = jugadorId || localStorage.getItem('atleta_id');
      if (!idActual) { setLoading(false); return; }

      try {
        // Realizamos las peticiones en paralelo para optimizar la velocidad de carga en Railway, consumiendo el endpoint por jugador_id
        const [resPerfil, resEquipos, resAsistencias, resPromociones] = await Promise.all([
          api.get(`/api/jugadores/perfil/${idActual}`),
          api.get('/api/equipos'),
          api.get(`/api/jugadores/${idActual}/contador-asistencias`),
          api.get(`/api/promociones/jugador/${idActual}`) // Pide la promo por el ID del jugador, igual que las asistencias
        ]);

        let data = resPerfil.data;
        if (data.avatar_config && typeof data.avatar_config === 'string') {
          data.avatar_config = JSON.parse(data.avatar_config);
        }
        
        setPerfil(data);
        setEquipos(resEquipos.data);

        // Mantenemos intactas tus galerías e inyectamos las asistencias reales de la base de datos
        if (resAsistencias.data) {
          setDatosEquipo(prev => ({
            ...prev,
            asistencias: resAsistencias.data.asistencias,
            totalesPartidos: resAsistencias.data.totalesPartidos
          }));
        }

        // Mapeo masivo para formatear y acumular todas las promociones que devuelva la tabla intermedia
        if (resPromociones.data && resPromociones.data.length > 0) {
          const listaFormateada = resPromociones.data.map(promo => ({
            id: promo.id,
            titulo: promo.titulo,
            desc: promo.descripcion, 
            expira: promo.fecha_fin ? promo.fecha_fin.split('T')[0] : 'PERMANENTE'
          }));

          setDatosEquipo(prev => ({
            ...prev,
            promociones: listaFormateada 
          }));
        } else {
          setDatosEquipo(prev => ({ ...prev, promociones: [] }));
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

  // 🛠️ SECCIÓN INDEPENDIENTE 1: GUARDAR EXCLUSIVAMENTE LA NUEVA FOTO
  const handleGuardarFoto = async () => {
    try {
      const idActual = jugadorId || localStorage.getItem('atleta_id');
      const payload = { ...datosForm, foto_perfil: fotoBase64 };
      if (!payload.password) { delete payload.password; delete payload.confirmPassword; }

      const response = await api.put(`/api/jugadores/perfil/actualizar/${idActual}`, payload);
      if (response.status === 200) {
        setPerfil({ ...perfil, foto_perfil: fotoBase64 });
        alert("✅ ¡Foto de perfil guardada con éxito!");
      }
    } catch (err) {
      console.error("Error al guardar foto:", err);
      alert("❌ No se pudo guardar la nueva foto.");
    }
  };

  // 🛠️ SECCIÓN INDEPENDIENTE 2: GUARDAR EXCLUSIVAMENTE LOS DATOS PERSONALES
  const handleGuardarDatosPersonales = async () => {
    try {
      const idActual = jugadorId || localStorage.getItem('atleta_id');
      const payload = { ...datosForm, foto_perfil: perfil.foto_perfil };
      delete payload.password;
      delete payload.confirmPassword;

      const response = await api.put(`/api/jugadores/perfil/actualizar/${idActual}`, payload);
      if (response.status === 200) {
        setPerfil({ ...perfil, ...payload });
        setEditandoCampos(false);
        alert("✅ ¡Datos personales guardados con éxito!");
      }
    } catch (err) {
      console.error("Error al actualizar datos:", err);
      alert("❌ Error al intentar guardar los cambios.");
    }
  };

  // 🛠️ SECCIÓN INDEPENDIENTE 3: GUARDAR EXCLUSIVAMENTE LA NUEVA CONTRASEÑA
  const handleGuardarPassword = async () => {
    if (!datosForm.password || datosForm.password !== datosForm.confirmPassword) {
      alert("❌ Las contraseñas están vacías o no coinciden.");
      return;
    }
    try {
      const idActual = jugadorId || localStorage.getItem('atleta_id');
      const payload = {
        nombre: perfil.nombre,
        telefono: perfil.telefono,
        nombre_equipo: perfil.nombre_equipo,
        numero_jersey: perfil.numero_jersey,
        foto_perfil: perfil.foto_perfil,
        password: datosForm.password
      };

      const response = await api.put(`/api/jugadores/perfil/actualizar/${idActual}`, payload);
      if (response.status === 200) {
        setDatosForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
        setVerSeccionPassword(false);
        alert("✅ ¡Contraseña actualizada con éxito!");
      }
    } catch (err) {
      console.error("Error al cambiar contraseña:", err);
      alert("❌ No se pudo guardar la contraseña.");
    }
  };

  const obtenerNombreEquipo = () => {
  if (!perfil || !perfil.nombre_equipo) return 'AGENTE LIBRE';

  const valor = perfil.nombre_equipo.toString();

  // 1. Si es "AGENTE LIBRE", no busques más
  if (valor === 'AGENTE LIBRE') return 'AGENTE LIBRE';

  // 2. Intentamos buscar por ID (si es un número válido)
  const idEquipo = Number(valor);
  
  if (!isNaN(idEquipo) && idEquipo !== 0) {
    const equipoEncontrado = equipos.find(e => e.id === idEquipo);
    if (equipoEncontrado) return equipoEncontrado.nombre_equipo;
  }

  // 3. Si no es un ID o no se encontró en la lista, devolvemos el texto original
  return valor.toUpperCase();
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
<style>
{`
  @media print {
    body * { visibility: hidden; }
    #tarjeta-completa-jugador, #tarjeta-completa-jugador * { visibility: visible; }
    #tarjeta-completa-jugador { position: absolute; left: 0; top: 0; width: 100%; }
  }
`}
</style>
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
     <div 
  id="tarjeta-completa-jugador" 
  style={{ 
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
    zIndex: 5,
    margin: '0 auto' // Centra la tarjeta en la pantalla
  }}
>
        
        {/* Header Visual */}
        <div style={{ marginBottom: '24px' }}>
          <span style={{ color: '#60a5fa', fontSize: '10px', fontWeight: '900', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Licencia Digital</span>
          <h3 style={{ fontSize: 'clamp(18px, 5vw, 20px)', fontWeight: '900', marginTop: '8px', textTransform: 'uppercase', margin: '8px 0 0' }}>MVP Flag</h3>
        </div>

        

         {/* CONTENEDOR DE IDENTIDAD VISUAL - CORRECCIÓN DE ALTURA */}
          <div style={{ 
            margin: '0 auto 20px auto', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '15px', 
            width: '100%' 
          }}>
            
            {/* 1. Contenedor del Avatar con altura fija */}
            <div style={{ 
              height: '100px', // Altura fija para que no se corte
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <div style={{ transform: 'scale(0.6)', transformOrigin: 'center' }}>
                <AvatarEditor 
                  key={`editor-atleta-${perfil.id}`}
                  jugadorId={perfil.id} 
                  configInicial={perfil.avatar_config} 
                  onGuardarExito={(nuevaConfig) => setPerfil({ ...perfil, avatar_config: nuevaConfig })} 
                />
              </div>
            </div>

            {/* 2. Foto Real */}
            <div style={{ 
              width: '120px', 
              height: '120px', 
              borderRadius: '50%', 
              overflow: 'hidden',
              border: '3px solid #60a5fa',
              backgroundColor: '#0f172a',
              flexShrink: 0 // Evita que se deforme
            }}>
              {fotoBase64 ? (
                <img 
                  src={fotoBase64} 
                  alt="Perfil Real" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                  📷
                </div>
              )}
            </div>
          </div>


          {/* QR Area Responsivo */}
<div style={{ 
  backgroundColor: '#0f172a', 
  padding: '24px', 
  borderRadius: '20px', 
  border: '1px solid #30363d', 
  width: '100%', 
  boxSizing: 'border-box',
  marginTop: '20px'
}}>
  <p style={{ fontSize: '10px', color: '#64748b', fontWeight: '900', textTransform: 'uppercase', margin: '0 0 16px' }}>ID Único de Acceso</p>
  
  {perfil ? (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '16px', display: 'inline-block' }}>
        <QRCodeSVG 
          value={JSON.stringify({id: perfil.id, nombre: perfil.nombre})} 
          size={220} 
          level={"H"} 
          includeMargin={true}
          imageSettings={{
            src: logoMvp,
            height: 60,
            width: 60,
            align: 'center',
            excavate: true,
          }}
        />
      </div>

      {/* NUEVA LEYENDA */}
      <p style={{ 
        marginTop: '16px', 
        marginBottom: '4px', 
        fontSize: '9px', 
        color: '#94a3b8', 
        textAlign: 'center',
        lineHeight: '1.4',
        padding: '0 10px'
      }}>
        PUEDE TOMAR UNA CAPTURA DE PANTALLA O
      </p>

      {/* Botón */}
      <button 
        id="boton-descarga-oculto"
        onClick={() => window.print()}
        style={{
          width: '100%',
          backgroundColor: '#22c55e',
          color: 'white',
          border: 'none',
          padding: '14px',
          borderRadius: '12px',
          fontWeight: '900',
          textTransform: 'uppercase',
          fontSize: '12px',
          cursor: 'pointer'
        }}
      >
        ⬇ Descargar Tarjeta (PDF)
      </button>
    </div>
  ) : (
    <div style={{ color: '#475569', fontSize: '11px', fontFamily: 'monospace' }}>TOKEN PENDIENTE</div>
  )}
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
              {datosEquipo.promociones.length === 0 ? (
                <div style={{ fontSize: '11px', color: '#64748b', textAlign: 'center', padding: '20px', italic: 'true', fontWeight: '700' }}>
                  📭 NO TIENES PROMOCIONES ACTIVAS EN ESTE MOMENTO.
                </div>
              ) : (
                datosEquipo.promociones.map((p) => (
                  /* 🚀 SE MODIFICÓ: Añadidos estilos interactivos onClick, hover y active para hacerlas clicables */
                  <div 
                    key={p.id} 
                    onClick={() => setPromoSeleccionada(p)}
                    style={{ 
                      backgroundColor: '#0f172a', 
                      padding: '14px', 
                      borderRadius: '14px', 
                      border: '1px solid #30363d',
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.borderColor = '#22c55e';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(34, 197, 94, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.borderColor = '#30363d';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '900', color: '#22c55e' }}>{p.titulo}</span>
                      <span style={{ fontSize: '9px', color: '#64748b', fontWeight: '700' }}>VENCE: {p.expira}</span>
                    </div>
                    {/* Se trunca el texto con elipsis para mantener el diseño simétrico en la lista */}
                    <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af', lineHeight: '1.4', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{p.desc}</p>
                  </div>
                ))
              )}
            </div>
          )}

         {tabActiva === 'asistencias' && (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '20px', width: '100%', boxSizing: 'border-box' }}>
    
    {/* Círculo con el total */}
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '95px', height: '95px', borderRadius: '50%', border: '6px solid #0f172a', borderTopColor: '#22c55e', marginBottom: '16px' }}>
      <span style={{ fontSize: '24px', fontWeight: '900', color: '#ffffff' }}>{datosEquipo.asistencias}</span>
    </div>
    
    <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: '900', textTransform: 'uppercase', color: '#60a5fa' }}>Récord de Asistencia</p>
    
    <span style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'center', lineHeight: '1.4', marginBottom: '20px' }}>
      Asistencias registradas en partidos oficiales.
    </span>

    {/* --- LISTA DETALLADA DE ASISTENCIAS (UNA POR UNA) --- */}
    <div style={{ width: '100%', maxWidth: '340px', backgroundColor: '#1e293b', borderRadius: '16px', border: '1px solid #334155', padding: '12px', boxSizing: 'border-box', maxHeight: '220px', overflowY: 'auto', textAlign: 'left' }}>
      {datosEquipo.historial && datosEquipo.historial.length > 0 ? (
        datosEquipo.historial.map((asistencia, index) => (
          <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: index < datosEquipo.historial.length - 1 ? '1px solid #334155' : 'none' }}>
            <div>
              <p style={{ color: 'white', fontSize: '12px', fontWeight: 'bold', margin: 0 }}>{asistencia.tipo_evento || 'Partido Oficial'}</p>
              <p style={{ color: '#94a3b8', fontSize: '10px', margin: '2px 0 0 0' }}>{asistencia.fecha} - {asistencia.hora}</p>
            </div>
            <span style={{ backgroundColor: '#16a34a', color: 'white', fontSize: '9px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '6px' }}>
              ASISTIÓ
            </span>
          </div>
        ))
      ) : (
        <p style={{ color: '#64748b', fontSize: '12px', textAlign: 'center', margin: '10px 0' }}>No hay registros de asistencia todavía.</p>
      )}
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

      {/* 📋 MODAL EMERGENTE: FORMULARIO MODULAR INDEPENDIENTE */}
      {modalPerfilAbierto && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifycontent: 'center', padding: '20px', boxSizing: 'border-box' }}>
          <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '24px', border: '1px solid #30363d', maxWidth: '420px', width: '100%', color: 'white', boxSizing: 'border-box', overflowY: 'auto', maxHeight: '90vh' }}>
            
            <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', color: '#60a5fa', margin: 0, letterSpacing: '0.05em' }}>Ajustes de Cuenta MVP</h4>
              <button onClick={() => { setModalPerfilAbierto(false); setEditandoCampos(false); setVerSeccionPassword(false); }} style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: '900', cursor: 'pointer', fontSize: '14px' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* 📷 SECCIÓN 1: IDENTIDAD VISUAL (FOTO SEPARADA) */}
              <div style={{ textAlign: 'center', backgroundColor: '#0f172a', padding: '16px', borderRadius: '16px', border: '1px solid #30363d' }}>
                <span style={{ fontSize: '10px', fontWeight: '900', color: '#64748b', display: 'block', textTransform: 'uppercase', marginBottom: '12px', textAlign: 'left' }}>Visual del Atleta</span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                  <img src={fotoBase64 || logoMvp} alt="Preview" style={{ width: '65px', height: '65px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #30363d' }}/>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <input type="file" accept="image/*" onChange={handleFotoChange} style={{ fontSize: '11px', color: '#9ca3af', width: '100%' }} />
                    {fotoBase64 !== perfil.foto_perfil && (
                      <button onClick={handleGuardarFoto} type="button" style={{ marginTop: '8px', padding: '6px 12px', backgroundColor: '#3b82f6', border: 'none', borderRadius: '6px', color: 'white', fontWeight: '900', fontSize: '10px', textTransform: 'uppercase', cursor: 'pointer' }}>
                        ⚡ Guardar Foto
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 🧑 SECCIÓN 2: DATOS PERSONALES (CLICK INDEPENDIENTE PARA ACTUALIZAR) */}
              <div style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: '16px', border: '1px solid #30363d', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase' }}>Información de Ficha</span>
                  {!editandoCampos ? (
                    <button onClick={() => setEditandoCampos(true)} type="button" style={{ background: 'none', border: '1px solid #475569', padding: '4px 10px', borderRadius: '6px', color: '#60a5fa', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', cursor: 'pointer' }}>✏️ Editar</button>
                  ) : (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => setEditandoCampos(false)} type="button" style={{ background: 'none', border: '1px solid #ef4444', padding: '4px 8px', borderRadius: '6px', color: '#ef4444', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', cursor: 'pointer' }}>X</button>
                      <button onClick={handleGuardarDatosPersonales} type="button" style={{ backgroundColor: '#22c55e', border: 'none', padding: '4px 10px', borderRadius: '6px', color: 'white', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', cursor: 'pointer' }}>💾 Guardar</button>
                    </div>
                  )}
                </div>

                {/* Nombre Completo */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', color: '#9ca3af' }}>Nombre Completo</label>
                  <input type="text" disabled={!editandoCampos} value={datosForm.nombre} onChange={(e) => setDatosForm({ ...datosForm, nombre: e.target.value })} style={{ backgroundColor: editandoCampos ? '#1e293b' : '#0f172a', border: '1px solid #30363d', borderRadius: '8px', padding: '10px', color: editandoCampos ? 'white' : '#64748b', fontWeight: '700', outline: 'none' }} />
                </div>

                {/* Identidad Deportiva - CORREGIDO */}
                    <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px', width: '100%' }}>
                      
                      {/* Columna Jersey */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', color: '#9ca3af' }}>Jersey</label>
                        <input 
                          type="text" 
                          disabled={!editandoCampos} 
                          value={datosForm.numero_jersey} 
                          onChange={(e) => setDatosForm({ ...datosForm, numero_jersey: e.target.value })} 
                          style={{ 
                            backgroundColor: editandoCampos ? '#1e293b' : '#0f172a', 
                            border: '1px solid #30363d', 
                            borderRadius: '8px', 
                            padding: '10px', 
                            color: editandoCampos ? 'white' : '#64748b', 
                            fontWeight: '700', 
                            outline: 'none', 
                            textAlign: 'center',
                            width: '100%',
                            boxSizing: 'border-box'
                          }} 
                        />
                      </div>
                      
                      {/* Columna Escuadra */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '0' }}>
                        <label style={{ fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', color: '#9ca3af' }}>Escuadra Actual</label>
                        <select 
                          disabled={!editandoCampos} 
                          // Convertimos a string para asegurar comparación exacta
                          value={datosForm.nombre_equipo ? datosForm.nombre_equipo.toString() : ""} 
                          onChange={(e) => setDatosForm({ ...datosForm, nombre_equipo: e.target.value })} 
                          style={{ 
                            backgroundColor: editandoCampos ? '#1e293b' : '#0f172a', 
                            border: '1px solid #30363d', 
                            borderRadius: '8px', 
                            padding: '10px', 
                            color: editandoCampos ? 'white' : '#64748b', 
                            fontWeight: '700', 
                            outline: 'none', 
                            cursor: editandoCampos ? 'pointer' : 'default', 
                            width: '100%',
                            boxSizing: 'border-box'
                          }}
                        >
                          <option value="" disabled>Selecciona equipo</option>
                          {/* Aseguramos que este value sea string */}
                          <option value="AGENTE LIBRE">AGENTE LIBRE</option>
                          {equipos.map(e => (
                            // Convertimos el ID a string aquí también
                            <option key={e.id} value={e.id.toString()}>
                              {e.nombre_equipo.toUpperCase()}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                {/* Teléfono */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', color: '#9ca3af' }}>Teléfono de Contacto</label>
                  <input type="text" disabled={!editandoCampos} value={datosForm.telefono} onChange={(e) => setDatosForm({ ...datosForm, telefono: e.target.value })} style={{ backgroundColor: editandoCampos ? '#1e293b' : '#0f172a', border: '1px solid #30363d', borderRadius: '8px', padding: '10px', color: editandoCampos ? 'white' : '#64748b', fontWeight: '700', outline: 'none' }} />
                </div>
              </div>

              {/* 🔐 SECCIÓN 3: SEGURIDAD (CONTRASENAS OCULTAS POR DEFECTO) */}
              <div style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: '16px', border: '1px solid #30363d' }}>
                <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase' }}>Credenciales de Acceso</span>
                  <button onClick={() => setVerSeccionPassword(!verSeccionPassword)} type="button" style={{ background: 'none', border: '1px solid #475569', padding: '4px 10px', borderRadius: '6px', color: '#60a5fa', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', cursor: 'pointer' }}>
                    {verSeccionPassword ? "Ocultar" : "Cambiar"}
                  </button>
                </div>

                {verSeccionPassword && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '14px', borderTop: '1px solid #242b3d', paddingTop: '14px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                        <label style={{ fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', color: '#60a5fa' }}>Nueva Password</label>
                        <input type="password" placeholder="••••••••" value={datosForm.password} onChange={(e) => setDatosForm({ ...datosForm, password: e.target.value })} style={{ backgroundColor: '#111827', border: '1px solid #30363d', borderRadius: '8px', padding: '10px', color: 'white', outline: 'none', fontSize: '12px' }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                        <label style={{ fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', color: '#60a5fa' }}>Confirmar</label>
                        <input type="password" placeholder="••••••••" value={datosForm.confirmPassword} onChange={(e) => setDatosForm({ ...datosForm, confirmPassword: e.target.value })} style={{ backgroundColor: '#111827', border: '1px solid #30363d', borderRadius: '8px', padding: '10px', color: 'white', outline: 'none', fontSize: '12px' }} />
                      </div>
                    </div>
                    <button onClick={handleGuardarPassword} type="button" style={{ width: '100%', padding: '10px', backgroundColor: '#e11d48', border: 'none', borderRadius: '8px', color: 'white', fontWeight: '900', fontSize: '11px', textTransform: 'uppercase', cursor: 'pointer', marginTop: '4px' }}>
                      🔒 Actualizar Contraseña
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 🚀 NUEVO MODAL: DETALLE INMERSIVO DE LA PROMOCIÓN SELECCIONADA */}
      {promoSeleccionada && (
        <div 
          onClick={() => setPromoSeleccionada(null)} 
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(6px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', boxSizing: 'border-box' }}
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            style={{ backgroundColor: '#1e293b', padding: '28px', borderRadius: '24px', border: '1px solid #30363d', maxWidth: '400px', width: '100%', color: 'white', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)', boxSizing: 'border-box' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #30363d', paddingBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: '900', color: '#22c55e', letterSpacing: '0.05em', textTransform: 'uppercase' }}>📢 Beneficio Activado</span>
              <button onClick={() => setPromoSeleccionada(null)} style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: '900', cursor: 'pointer', fontSize: '16px' }}>✕</button>
            </div>
            
            <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '900', color: '#60a5fa', textTransform: 'uppercase' }}>{promoSeleccionada.titulo}</h3>
            <span style={{ fontSize: '10px', color: '#9ca3af', fontWeight: '800', display: 'block', marginBottom: '16px' }}>📅 FECHA LÍMITE DE CANJE: {promoSeleccionada.expira}</span>
            
            <p style={{ margin: '0 0 24px 0', fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6', wordBreak: 'break-word' }}>{promoSeleccionada.desc}</p>
            
            <button 
              onClick={() => setPromoSeleccionada(null)} 
              style={{ width: '100%', padding: '12px', backgroundColor: '#22c55e', border: 'none', borderRadius: '12px', color: 'white', fontWeight: '900', textTransform: 'uppercase', fontSize: '11px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)' }}
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Fondo oscuro traslúcido de apoyo */}
      {menuAbierto && (
        <div onClick={() => setMenuAbierto(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(2px)', zIndex: 98 }}></div>
      )}

     

    </div>
  );
};

export default PerfilJugador;