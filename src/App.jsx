import { useState } from 'react';
import LoginJugador from './LoginJugador';
import RegistroJugador from './RegistroJugador';
import PerfilJugador from './PerfilJugador';

function App() {
  // view puede ser: 'login', 'registro', o 'perfil'
  const [view, setView] = useState('login');

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