import { useState, useEffect } from 'react';
import { createAvatar } from '@dicebear/core';
import * as adventurer from '@dicebear/adventurer';

// Usamos números planos para iterar de forma nativa sobre el catálogo seguro de adventurer
const MAX_OPCIONES = {
  cabello: 6,       // 6 estilos
  colorCabello: 5,  // 5 colores
  ropa: 5,          // 5 prendas
  colorRopa: 5,     // 5 colores
  accesorios: 4,    // 3 variantes + 1 (ninguno)
  expresion: 4      // 4 rostros
};

// Paletas de colores reales en formato Hex para el motor
const COLORES_CABELLO = ['0e0e10', '4a3728', 'b58143', 'af3838', '2c5282'];
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

  // Sincroniza al cargar los datos guardados de la base de datos
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

  // 🚀 GENERACIÓN LOCAL MODIFICANDO EL MAPA DE VECTORES DIRECTAMENTE
  const obtenerDataUriAvatar = () => {
    try {
      const estiloAvatar = adventurer.adventurer || adventurer;
      
      const opcionesDiceBear = {
        featuresProbability: indices.accesorios === 0 ? 0 : 100,
        hairProbability: 100,
        clothingProbability: 100,
        hair: [`variant0${indices.cabello + 1}`],
        hairColor: [COLORES_CABELLO[indices.colorCabello]],
        clothing: [`variant0${indices.ropa + 1}`],
        clothingColor: [COLORES_ROPA[indices.colorRopa]],
        eyebrows: [`variant0${indices.expresion + 1}`]
      };

      if (indices.accesorios > 0) {
        opcionesDiceBear.features = [`variant0${indices.accesorios}`];
      }

      const avatar = createAvatar(estiloAvatar, opcionesDiceBear);
      let svgString = avatar.toString();

      // 🚀 HACK DE COORDENADAS: Forzamos al SVG local a redefinir su área visible de '0 0 100 100' a vertical '0 0 100 160'
      // Esto rompe el recorte por defecto de la cabeza y expone los hombros y la playera
      if (svgString.includes('viewBox="0 0 100 100"')) {
        svgString = svgString.replace('viewBox="0 0 100 100"', 'viewBox="0 0 100 155"');
      } else if (svgString.includes('viewBox="0 0 0 0"')) {
        // En caso de que no traiga dimensiones fijas, se las inyectamos directo
        svgString = svgString.replace('<svg', '<svg viewBox="0 0 100 155"');
      }

      return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
    } catch (e) {
      console.error("Error generando avatar local:", e);
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
        eyebrows_idx: indices.expresion,
        hair: [`variant0${indices.cabello + 1}`],
        hairColor: [COLORES_CABELLO[indices.colorCabello]],
        clothing: [`variant0${indices.ropa + 1}`],
        clothingColor: [COLORES_ROPA[indices.colorRopa]],
        features: indices.accesorios > 0 ? [`variant0${indices.accesorios}`] : [],
        eyebrows: [`variant0${indices.expresion + 1}`]
      };
      
      const response = await fetch(`/api/jugadores/${jugadorId}/avatar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
        padding: '12px'
      }}>
        {imagenSrc ? (
          <img 
            src={imagenSrc} 
            alt="Avatar Personaje" 
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
        {guardando ? 'Guardando...' : '¼ Guarda en la base...'}
      </button>
    </div>
  );
};

export default AvatarEditor;