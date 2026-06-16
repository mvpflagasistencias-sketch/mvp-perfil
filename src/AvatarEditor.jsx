import { useState, useEffect } from 'react';
import { createAvatar } from '@dicebear/core';
import * as openPeeps from '@dicebear/open-peeps';

// Configuración nativa para el catálogo de cuerpo completo de Open Peeps
const MAX_OPCIONES = {
  cabello: 10,       // 10 peinados distintos
  colorCabello: 5,   // 5 colores
  ropa: 5,           // 5 estilos de prendas/cuerpo
  colorRopa: 5,      // 5 colores de ropa
  accesorios: 4,     // 3 lentes/accesorios + ninguno
  expresion: 5       // 5 rostros/expresiones
};

const COLORES_CABELLO = ['0e0e10', '4a3728', 'b58143', 'af3838', '6b7280'];
const COLORES_ROPA = ['9b2c2c', '2b6cb0', '2f855a', 'd69e2e', '4a5568'];

const AvatarEditor = ({ jugadorId, configInicial, onGuardarExito }) => {
  const [indices, setIndices] = useState({
    cabello: 0,
    colorCabello: 0,
    ropa: 0,
    colorRopa: 0,
    accesorios: 0,
    expresion: 0,
  });

  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (configInicial) {
      setIndices({
        cabello: typeof configInicial.hair_idx === 'number' ? configInicial.hair_idx : 0,
        colorCabello: typeof configInicial.hair_color_idx === 'number' ? configInicial.hair_color_idx : 0,
        ropa: typeof configInicial.clothing_idx === 'number' ? configInicial.clothing_idx : 0,
        colorRopa: typeof configInicial.clothing_color_idx === 'number' ? configInicial.clothing_color_idx : 0,
        accesorios: typeof configInicial.features_idx === 'number' ? configInicial.features_idx : 0,
        expresion: typeof configInicial.eyebrows_idx === 'number' ? configInicial.eyebrows_idx : 0,
      });
    }
  }, [configInicial]);

  const cambiarOpcion = (key, direccion) => {
    setIndices((prev) => {
      const max = MAX_OPCIONES[key];
      let nuevoIndex = prev[key] + direccion;
      
      if (nuevoIndex < 0) nuevoIndex = max - 1;
      if (nuevoIndex >= max) nuevoIndex = 0;
      
      return { ...prev, [key]: nuevoIndex };
    });
  };

  const obtenerDataUriAvatar = () => {
    try {
      const estiloAvatar = openPeeps.openPeeps || openPeeps;
      
      const opcionesDiceBear = {
        size: 100,
        // Forzamos el modo cuerpo completo de pie que ofrece open-peeps
        maskTop: 0,
        faceProbability: 100,
        maskProbability: 0,
        // Asignamos las variantes numéricas nativas de la librería
        head: [`variant${indices.cabello + 1}`],
        face: [`variant0${indices.expresion + 1}`],
        body: [`drawing${indices.ropa + 1}`], // Jala cuerpos completos con ropa de pie
        accessoriesProbability: indices.accesorios === 0 ? 0 : 100
      };

      if (indices.accesorios > 0) {
        opcionesDiceBear.accessories = [`variant0${indices.accesorios}`];
      }

      const avatar = createAvatar(estiloAvatar, opcionesDiceBear);
      return `data:image/svg+xml;utf8,${encodeURIComponent(avatar.toString())}`;
    } catch (e) {
      console.error("Error generando avatar de cuerpo completo:", e);
      return '';
    }
  };

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      const configAEnviar = {
        hair_idx: indices.cabello,
        hair_color_idx: indices.colorCabello,
        clothing_idx: indices.ropa,
        clothing_color_idx: indices.colorRopa,
        features_idx: indices.accesorios,
        eyebrows_idx: indices.expresion
      };
      
      const response = await fetch(`/api/jugadores/${jugadorId}/avatar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_config: configAEnviar }),
      });

      if (!response.ok) throw new Error("Error en servidor");
      alert("✅ ¡Avatar de cuerpo completo fijado!");
      if (onGuardarExito) onGuardarExito(configAEnviar);
    } catch (err) {
      console.error("Error al guardar avatar:", err);
      alert("❌ No se pudo guardar el avatar en el servidor");
    } finally {
      setGuardando(false);
    }
  };

  const imagenSrc = obtenerDataUriAvatar();

  return (
    <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '24px', border: '1px solid #30363d', maxWidth: '360px', margin: '0 auto', color: 'white', textAlign: 'center', boxSizing: 'border-box' }}>
      <h4 style={{ fontSize: '13px', fontWeight: '900', textTransform: 'uppercase', color: '#60a5fa', marginBottom: '16px', letterSpacing: '0.1em', margin: '0 0 16px' }}>Diseña tu Personaje</h4>
      
      <div style={{ 
        width: '160px', 
        height: '240px', 
        backgroundColor: '#0f172a', 
        borderRadius: '20px', 
        margin: '0 auto 20px', 
        border: '4px solid #60a5fa', 
        overflow: 'hidden', 
        boxSizing: 'border-box', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '4px'
      }}>
        {imagenSrc ? (
          <img 
            src={imagenSrc} 
            alt="Avatar Cuerpo Completo" 
            style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }}
          />
        ) : (
          <div style={{ fontSize: '11px', color: '#64748b' }}>Generando...</div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {[
          { label: 'Estilo de Cabello', campo: 'cabello' },
          { label: 'Color de Cabello', campo: 'colorCabello' },
          { label: 'Tipo de Ropa', campo: 'ropa' },
          { label: 'Color de Ropa', campo: 'colorRopa' },
          { label: 'Accesorios', campo: 'accesorios' },
          { label: 'Expresión', campo: 'expresion' }
        ].map((item) => (
          <div key={item.campo} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', padding: '8px 12px', borderRadius: '12px', border: '1px solid #30363d', boxSizing: 'border-box' }}>
            <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: '#9ca3af' }}>{item.label}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <button type="button" onClick={() => cambiarOpcion(item.campo, -1)} style={{ background: 'none', border: 'none', color: '#60a5fa', fontWeight: '900', cursor: 'pointer', fontSize: '14px', padding: 0 }}>◀</button>
              <span style={{ fontSize: '10px', fontWeight: '900', minWidth: '16px', textAlign: 'center' }}>{indices[item.campo] + 1}</span>
              <button type="button" onClick={() => cambiarOpcion(item.campo, 1)} style={{ background: 'none', border: 'none', color: '#60a5fa', fontWeight: '900', cursor: 'pointer', fontSize: '14px', padding: 0 }}>▶</button>
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={handleGuardar} 
        disabled={guardando}
        style={{ width: '100%', backgroundColor: '#22c55e', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '900', textTransform: 'uppercase', fontSize: '11px', marginTop: '18px', cursor: 'pointer', letterSpacing: '0.05em' }}
      >
        {guardando ? 'Guardando...' : '💾 Fijar en mi Credencial'}
      </button>
    </div>
  );
};

export default AvatarEditor;