import { useState } from 'react';
import api from '../../frontend/src/api';

const LoginJugador = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/api/jugadores/login', { correo, password });
      localStorage.setItem('atleta_token', res.data.token);
      localStorage.setItem('atleta_id', res.data.jugador.id);
      onLoginSuccess(res.data.jugador);
    } catch (err) {
      alert('❌ Error: ' + (err.response?.data?.error || 'Credenciales incorrectas'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0f172a',
      margin: 0,
      padding: '16px', // 👈 Ajustado para dejar un margen limpio en los bordes del teléfono
      boxSizing: 'border-box',
      width: '100%'
    }}>
      <div style={{
        backgroundColor: '#1e293b',
        padding: 'clamp(20px, 5vw, 32px)', // 👈 Padding adaptativo: se encoge en pantallas chicas y se expande en web
        borderRadius: '24px',
        border: '1px solid #334155',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        width: '100%',
        maxWidth: '380px', // 👈 Ancho máximo ideal para que embone estético en cualquier celular
        boxSizing: 'border-box',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            backgroundColor: '#3b82f6',
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontWeight: '900',
            fontSize: '24px',
            color: 'white'
          }}>
            MVP
          </div>
          <h2 style={{ color: 'white', fontSize: 'clamp(20px, 6vw, 24px)', fontWeight: '900', textTransform: 'uppercase', margin: 0 }}>
            Portal del <span style={{ color: '#60a5fa' }}>Jugador</span>
          </h2>
        </div>

        <form onSubmit={handleLogin} style={{ textAlign: 'left', width: '100%' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#64748b', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Correo Electrónico</label>
            <input 
              type="email" 
              style={{ width: '100%', backgroundColor: '#0f172a', padding: '14px 16px', borderRadius: '16px', border: '1px solid #334155', color: 'white', outline: 'none', fontWeight: '600', boxSizing: 'border-box', fontSize: '16px' }} // 👈 fontSize a 16px para evitar el zoom automático molesto en iOS/Android
              placeholder="atleta@correo.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <label style={{ color: '#64748b', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Contraseña</label>
            <input 
              type="password" 
              style={{ width: '100%', backgroundColor: '#0f172a', padding: '14px 16px', borderRadius: '16px', border: '1px solid #334155', color: 'white', outline: 'none', fontWeight: '600', boxSizing: 'border-box', fontSize: '16px' }} // 👈 Evita zoom forzado al enfocar
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: '100%', padding: '16px', borderRadius: '16px', border: 'none', backgroundColor: '#2563eb', color: 'white',
              fontWeight: '900', textTransform: 'uppercase', cursor: loading ? 'wait' : 'pointer', fontSize: '14px', boxSizing: 'border-box'
            }}
          >
            {loading ? 'Ingresando...' : 'Entrar al Sistema'}
          </button>
        </form>

        <div style={{ marginTop: '20px' }}>
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              if (onSwitchToRegister) onSwitchToRegister();
            }} 
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: '#60a5fa', 
              fontSize: '11px', // 👈 Sutilmente reducido para que no se desborde el texto en pantallas de 5 pulgadas
              fontWeight: '700', 
              textTransform: 'uppercase', 
              cursor: 'pointer',
              padding: '8px',
              width: '100%',
              whiteSpace: 'normal' // 👈 Permite que rompa renglón limpio si el celular es excesivamente angosto
            }}
          >
            ¿No tienes cuenta? Regístrate aquí
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginJugador;