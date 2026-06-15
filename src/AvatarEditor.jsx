import { useState } from 'react';
import { createAvatar } from '@dicebear/core';
// ✅ ASÍ DEBE QUEDAR (Compatible con la v9):
import adventurer from '@dicebear/adventurer';

const OPCIONES = {
  cabello: ['short1', 'short2', 'curly', 'long1', 'dreadlocks', 'shaved'],
  colorCabello: ['0e0e10', '4a3728', 'b58143', 'af3838', '2c5282'],
  ropa: ['jersey', 'hoodie', 'shirt'],
  colorRopa: ['9b2c2c', '2b6cb0', '2f855a', 'd69e2e', '4a5568'],
  accesorios: ['none', 'glasses', 'sunglasses'],
  expresion: ['happy', 'smile', 'surprised', 'serious']
};

const AvatarEditor = ({ jugadorId, configInicial, onGuardarExito }) => {
  const [indices, setIndices] = useState({
    cabello: OPCIONES.cabello.indexOf(configInicial?.hair?.[0]) >= 0 ? OPCIONES.cabello.indexOf(configInicial?.hair?.[0]) : 0,
    colorCabello: OPCIONES.colorCabello.indexOf(configInicial?.hairColor?.[0]) >= 0 ? OPCIONES.colorCabello.indexOf(configInicial?.hairColor?.[0]) : 0,
    ropa: OPCIONES.ropa.indexOf(configInicial?.clothing?.[0]) >= 0 ? OPCIONES.ropa.indexOf(configInicial?.clothing?.[0]) : 0,
    colorRopa: OPCIONES.colorRopa.indexOf(configInicial?.clothingColor?.[0]) >= 0 ? OPCIONES.colorRopa.indexOf(configInicial?.clothingColor?.[0]) : 0,
    accesorios: OPCIONES.accesorios.indexOf(configInicial?.features?.[0]) >= 0 ? OPCIONES.accesorios.indexOf(configInicial?.features?.[0]) : 0,
    expresion: OPCIONES.expresion.indexOf(configInicial?.eyebrows?.[0]) >= 0 ? OPCIONES.expresion.indexOf(configInicial?.eyebrows?.[0]) : 0,
  });

  const [guardando, setGuardando] = useState(false);

  const cambiarOpcion = (key, direccion) => {
    const max = OPCIONES[key].length;
    let nuevoIndex = indices[key] + direccion;
    if (nuevoIndex < 0) nuevoIndex = max - 1;
    if (nuevoIndex >= max) nuevoIndex = 0;
    setIndices({ ...indices, [key]: nuevoIndex });
  };

  const obtenerConfigActual = () => ({
    hair: [OPCIONES.cabello[indices.cabello]],
    hairColor: [OPCIONES.colorCabello[indices.colorCabello]],
    clothing: [OPCIONES.ropa[indices.ropa]],
    clothingColor: [OPCIONES.colorRopa[indices.colorRopa]],
    features: OPCIONES.accesorios[indices.accesorios] !== 'none' ? [OPCIONES.accesorios[indices.accesorios]] : [],
    eyebrows: [OPCIONES.expresion[indices.expresion]]
  });

  // 🚀 TRUCO MAESTRO: La librería crea el string XML del SVG localmente al vuelo
  const generarSvgLocal = () => {
    const conf = obtenerConfigActual();
    const avatar = createAvatar(adventurer, {
      seed: 'atleta',
      hair: conf.hair,
      hairColor: conf.hairColor,
      clothing: conf.clothing,
      clothingColor: conf.clothingColor,
      features: conf.features,
      eyebrows: conf.eyebrows,
      size: 100
    });
    return avatar.toString();
  };

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      const configAEnviar = obtenerConfigActual();
      
      const response = await fetch(`/api/jugadores/${jugadorId}/avatar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ avatar_config: configAEnviar }),
      });

      if (!response.ok) throw new Error("Error en servidor");

      alert("✅ ¡Avatar guardado y fijado en tu perfil!");
      if (onGuardarExito) onGuardarExito(configAEnviar);
    } catch (err) {
      console.error("Error al guardar avatar:", err);
      alert("❌ No se pudo guardar el avatar en el servidor");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '24px', border: '1px solid #30363d', maxWidth: '360px', margin: '0 auto', color: 'white', textAlign: 'center', boxSizing: 'border-box' }}>
      <h4 style={{ fontSize: '13px', fontWeight: '900', textTransform: 'uppercase', color: '#60a5fa', marginBottom: '16px', letterSpacing: '0.1em', margin: '0 0 16px' }}>Diseña tu Personaje</h4>
      
      {/* 🚀 RENDERIZADO INMEDIATO: Inyectamos el SVG puro usando dangerouslySetInnerHTML sin depender de URLs externas */}
      <div 
        style={{ width: '120px', height: '120px', backgroundColor: '#0f172a', borderRadius: '50%', margin: '0 auto 20px', border: '4px solid #60a5fa', overflow: 'hidden', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px' }}
        dangerouslySetInnerHTML={{ __html: generarSvgLocal() }}
      />

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