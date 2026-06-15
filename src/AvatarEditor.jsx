import { useState } from 'react';
import { createAvatar } from '@dicebear/core';
import * as adventurer from '@dicebear/adventurer';

// ✅ Límites numéricos oficiales basados en el esquema de DiceBear v9 Adventurer
const LIMITES = {
  cabello: 6,       // 0 a 5
  colorCabello: 5,  // Indices de colores
  ropa: 5,          // 0 a 4
  colorRopa: 5,     // Indices de colores
  accesorios: 4,    // 0 representa 'none', 1 a 3 son accesorios
  expresion: 4      // 0 a 3
};

const COLORES_CABELLO = ['0e0e10', '4a3728', 'b58143', 'af3838', '2c5282'];
const COLORES_ROPA = ['9b2c2c', '2b6cb0', '2f855a', 'd69e2e', '4a5568'];

const AvatarEditor = ({ jugadorId, configInicial, onGuardarExito }) => {
  // Inicializamos los estados numéricos directamente
  const [indices, setIndices] = useState({
    cabello: typeof configInicial?.hair === 'number' ? configInicial.hair : 0,
    colorCabello: typeof configInicial?.hairColor === 'number' ? configInicial.hairColor : 0,
    ropa: typeof configInicial?.clothing === 'number' ? configInicial.clothing : 0,
    colorRopa: typeof configInicial?.clothingColor === 'number' ? configInicial.clothingColor : 0,
    accesorios: typeof configInicial?.features === 'number' ? configInicial.features : 0,
    expresion: typeof configInicial?.eyebrows === 'number' ? configInicial.eyebrows : 0,
  });

  const [guardando, setGuardando] = useState(false);

  const cambiarOpcion = (key, direccion) => {
    const max = LIMITES[key];
    let nuevoIndex = indices[key] + direccion;
    if (nuevoIndex < 0) nuevoIndex = max - 1;
    if (nuevoIndex >= max) nuevoIndex = 0;
    setIndices({ ...indices, [key]: nuevoIndex });
  };

  // Genera el SVG local inyectando los tipos de datos primitivos que espera la v9
  const generarSvgLocal = () => {
    const estiloAvatar = adventurer.adventurer || adventurer;
    
    // Configuramos los arreglos y parámetros con la sintaxis exacta de DiceBear v9
    const opcionesConfig = {
      seed: 'atleta',
      hair: [indices.cabello], // Espera índice numérico directo
      hairColor: [COLORES_CABELLO[indices.colorCabello]], 
      clothing: [indices.ropa], 
      clothingColor: [COLORES_ROPA[indices.colorRopa]],
      features: indices.accesorios > 0 ? [indices.accesorios] : [], // 0 mapea vacío (sin accesorios)
      eyebrows: [indices.expresion],
      size: 100
    };

    const avatar = createAvatar(estiloAvatar, opcionesConfig);
    return avatar.toString();
  };

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      const configAEnviar = {
        hair: indices.cabello,
        hairColor: indices.colorCabello,
        clothing: indices.ropa,
        clothingColor: indices.colorRopa,
        features: indices.accesorios,
        eyebrows: indices.expresion
      };
      
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
      
      {/* Contenedor del renderizado reactivo */}
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