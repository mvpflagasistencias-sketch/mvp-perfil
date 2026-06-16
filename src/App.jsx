import { useState } from 'react';
import LoginJugador from './LoginJugador';
import RegistroJugador from './RegistroJugador';
import PerfilJugador from './PerfilJugador';

function App() {
  // 🚀 MODIFICACIÓN ÚNICA: Validamos si hay token para mantener la vista en perfil tras un F5
  const [view, setView] = useState(() => {
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
    </div>
  );
}

export default App;