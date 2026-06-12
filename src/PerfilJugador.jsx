import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import api from './api'; 
import AvatarEditor from './AvatarEditor'; 
import logoMvp from './assets/logo-mvp.png'; // 👈 Asegúrate de que esta ruta sea correcta

const PerfilJugador = ({ jugadorId, onLogout }) => {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerfil = async () => {
      const idActual = jugadorId || localStorage.getItem('atleta_id');
      if (!idActual) { setLoading(false); return; }

      try {
        const res = await api.get(`/api/jugadores/perfil/${idActual}`);
        let data = res.data;
        if (data.avatar_config && typeof data.avatar_config === 'string') {
          data.avatar_config = JSON.parse(data.avatar_config);
        }
        setPerfil(data);
      } catch (err) {
        console.error("Error al obtener perfil del atleta", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPerfil();
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
      padding: '16px', 
      boxSizing: 'border-box',
      width: '100%'
    }}>
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
        color: 'white'
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
          <div style={{ 
            position: 'absolute', 
            bottom: '0', 
            left: '50%',
            transform: 'translateX(12px)', 
            width: '44px', 
            height: '44px', 
            backgroundColor: '#0f172a', 
            borderRadius: '50%', 
            border: '3px solid #30363d', 
            overflow: 'hidden', 
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
            boxSizing: 'border-box'
          }}>
            <AvatarEditor config={perfil.avatar_config} />
          </div>
        </div>

        {/* Info Jugador */}
        <div style={{ marginBottom: '24px', width: '100%' }}>
          <h2 style={{ fontSize: 'clamp(20px, 6vw, 24px)', fontWeight: '900', textTransform: 'uppercase', margin: '0 0 6px', wordBreak: 'break-word' }}>{perfil.nombre}</h2>
          <p style={{ color: '#22c55e', fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', margin: 0 }}>{perfil.nombre_equipo?.toUpperCase() || 'AGENTE LIBRE'}</p>
          
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', fontSize: '10px', fontWeight: '900', color: '#9ca3af', marginTop: '16px', textTransform: 'uppercase', width: '100%', boxSizing: 'border-box' }}>
            <span style={{ backgroundColor: '#0f172a', padding: '8px 12px', borderRadius: '8px', border: '1px solid #30363d', flex: '1', minWidth: '0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>Cat: {perfil.categoria?.toUpperCase() || 'S/C'}</span>
            <span style={{ backgroundColor: '#0f172a', padding: '8px 12px', borderRadius: '8px', border: '1px solid #30363d', color: '#60a5fa', flex: '1', minWidth: '0' }}># {perfil.numero_jersey || 'S/N'}</span>
          </div>
        </div>

        {/* QR Area Responsivo */}
        <div style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: '16px', border: '1px solid #30363d', width: '100%', marginBottom: '24px', boxSizing: 'border-box' }}>
          <p style={{ fontSize: '9px', color: '#64748b', fontWeight: '900', textTransform: 'uppercase', margin: '0 0 12px' }}>ID Único de Acceso</p>
          {perfil.qr_token ? (
            <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '16px', display: 'inline-block' }}>
              <QRCodeSVG 
                value={perfil.qr_token} 
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
    </div>
  );
};

export default PerfilJugador;