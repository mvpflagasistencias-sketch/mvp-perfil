import { useState } from 'react';
import LoginJugador from './LoginJugador';
import RegistroJugador from './RegistroJugador';
import PerfilJugador from './PerfilJugador';
import RestablecerPassword from './RestablecerPassword'; // 1. Importas el nuevo componente

function App() {
  // 🚀 Validamos si la URL actual trae el parámetro del token o si hay sesión activa
  const [view, setView] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('token')) return 'restablecer';
    return localStorage.getItem('atleta_token') ? 'perfil' : 'login';
  });

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Si estamos en login, mostramos LoginJugador */}
      {view === 'login' && (
        <LoginJugador 
          onLoginSuccess={() => setView('perfil')} 
          onSwitchToRegister={() => {
            console.log("Cambiando a registro...");
            setView('registro');
          }}
        />
      )}
      
      {/* Si estamos en registro, mostramos RegistroJugador */}
      {view === 'registro' && (
        <RegistroJugador 
          onRegistroExitoso={() => {
            console.log("Registro exitoso, volviendo a login...");
            setView('login');
          }} 
        />
      )}

      {/* Si estamos en perfil, mostramos PerfilJugador */}
      {view === 'perfil' && <PerfilJugador />}

      {/* Si la URL traía el token, mostramos la vista para restablecer contraseña */}
      {view === 'restablecer' && <RestablecerPassword />}
    </div>
  );
}

export default App;