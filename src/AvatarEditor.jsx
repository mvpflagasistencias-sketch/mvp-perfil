import { useState, useEffect } from 'react';
import { createAvatar } from '@dicebear/core';
import * as adventurer from '@dicebear/adventurer';

// 🚀 CATÁLOGO REAL COMPATIBLE CON ADVENTURER
const OPCIONES = {
  cabello: ['long01', 'short01', 'short02', 'short03', 'short04', 'short05'],
  colorCabello: ['0e0e10', '4a3728', 'b58143', 'af3838', '2c5282'],
  ropa: ['jersey01', 'jersey02', 'jersey03', 'jersey04', 'jersey05'],
  colorRopa: ['9b2c2c', '2b6cb0', '2f855a', 'd69e2e', '4a5568'],
  accesorios: ['none', 'variant01', 'variant02', 'variant03'],
  expresion: ['variant01', 'variant02', 'variant03', 'variant04']
};

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
      const hairConfig = Array.isArray(configInicial.hair) ? configInicial.hair[0] : configInicial.hair;
      const hairColorConfig = Array.isArray(configInicial.hairColor) ? configInicial.hairColor[0] : configInicial.hairColor;
      const clothingConfig = Array.isArray(configInicial.clothing) ? configInicial.clothing[0] : configInicial.clothing;
      const clothingColorConfig = Array.isArray(configInicial.clothingColor) ? configInicial.clothingColor[0] : configInicial.clothingColor;
      const featuresConfig = Array.isArray(configInicial.features) ? configInicial.features[0] : configInicial.features;
      const eyebrowsConfig = Array.isArray(configInicial.eyebrows) ? configInicial.eyebrows[0] : configInicial.eyebrows;

      setIndices({
        cabello: OPCIONES.cabello.indexOf(hairConfig) >= 0 ? OPCIONES.cabello.indexOf(hairConfig) : 0,
        colorCabello: OPCIONES.colorCabello.indexOf(hairColorConfig) >= 0 ? OPCIONES.colorCabello.indexOf(hairColorConfig) : 0,
        ropa: OPCIONES.ropa.indexOf(clothingConfig) >= 0 ? OPCIONES.ropa.indexOf(clothingConfig) : 0,
        colorRopa: OPCIONES.colorRopa.indexOf(clothingColorConfig) >= 0 ? OPCIONES.colorRopa.indexOf(clothingColorConfig) : 0,
        accesorios: OPCIONES.accesorios.indexOf(featuresConfig) >= 0 ? OPCIONES.accesorios.indexOf(featuresConfig) : 0,
        expresion: OPCIONES.expresion.indexOf(eyebrowsConfig) >= 0 ? OPCIONES.expresion.indexOf(eyebrowsConfig) : 0,
      });
    }
  }, [configInicial]);

  const cambiarOpcion = (key, direccion) => {
    setIndices((prev) => {
      const max = OPCIONES[key].length;
      let nuevoIndex = prev[key] + direccion;
      
      if (nuevoIndex < 0) nuevoIndex = max - 1;
      if (nuevoIndex >= max) nuevoIndex = 0;
      
      return { ...prev, [key]: nuevoIndex };
    });
  };

  const obtenerDataUriAvatar = () => {
    try {
      const estiloAvatar = adventurer.adventurer || adventurer;
      
      const opcionesDiceBear = {
        featuresProbability: indices.accesorios === 0 ? 0 : 100,
        hairProbability: 100,
        hair: [OPCIONES.cabello[indices.cabello]], 
        hairColor: [OPCIONES.colorCabello[indices.colorCabello]],
        eyebrows: [OPCIONES.expresion[indices.expresion]]
      };

      if (indices.accesorios > 0) {
        opcionesDiceBear.features = [OPCIONES.accesorios[indices.accesorios]];
      }

      const avatar = createAvatar(estiloAvatar, opcionesDiceBear);
      return `data:image/svg+xml;utf8,${encodeURIComponent(avatar.toString())}`;
    } catch (e) {
      console.error("Error generando avatar local:", e);
      return '';
    }
  };

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      const configAEnviar = {
        hair: [OPCIONES.cabello[indices.cabello]],
        hairColor: [OPCIONES.colorCabello[indices.colorCabello]],
        clothing: [OPCIONES.ropa[indices.ropa]],
        clothingColor: [OPCIONES.colorRopa[indices.colorRopa]],
        features: OPCIONES.accesorios[indices.accesorios] !== 'none' ? [OPCIONES.accesorios[indices.accesorios]] : [],
        eyebrows: [OPCIONES.expresion[indices.expresion]]
      };
      
      const response = await fetch(`/api/jugadores/${jugadorId}/avatar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_config: configAEnviar }),
      });

      if (!response.ok) throw new Error("Error en servidor");
      alert("✅ ¡Avatar deportivo guardado!");
      if (onGuardarExito) onGuardarExito(configAEnviar);
    } catch (err) {
      console.error("Error al guardar avatar:", err);
      alert("❌ No se pudo guardar el avatar en el servidor");
    } finally {
      setGuardando(false);
    }
  };

  const imagenSrc = obtenerDataUriAvatar();
  // Jala el color actual seleccionado por los botones para pintar el jersey deportivo
  const colorJerseyActual = `#${OPCIONES.colorRopa[indices.colorRopa]}`;

  return (
    <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '24px', border: '1px solid #30363d', maxWidth: '360px', margin: '0 auto', color: 'white', textAlign: 'center', boxSizing: 'border-box' }}>
      <h4 style={{ fontSize: '13px', fontWeight: '900', textTransform: 'uppercase', color: '#60a5fa', marginBottom: '16px', letterSpacing: '0.1em', margin: '0 0 16px' }}>Diseña tu Personaje</h4>
      
      {/* Tarjeta contenedora vertical */}
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
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'flex-start',
        position: 'relative',
        paddingTop: '25px'
      }}>
        {/* 1. SECCIÓN DE LA CABEZA (Viene limpia desde DiceBear) */}
        <div style={{ width: '100px', height: '100px', zIndex: 2, position: 'relative' }}>
          {imagenSrc && (
            <img 
              src={imagenSrc} 
              alt="Rostro" 
              style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }}
            />
          )}
        </div>

        {/* 2. UNIFORME DEPORTIVO (Renderizado con CSS dinámico de frente) */}
        <div style={{ 
          position: 'absolute',
          bottom: '0',
          width: '110px',
          height: '115px',
          backgroundColor: colorJerseyActual, // Cambia de color en vivo con los botones
          borderRadius: '45px 45px 0 0',
          zIndex: 1,
          border: '3px solid #1e293b',
          borderBottom: 'none',
          boxSizing: 'border-box',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          paddingTop: '12px',
          transition: 'background-color 0.2s ease'
        }}>
          {/* Detalles del Jersey: Cuello deportivo tipo V */}
          <div style={{
            width: '32px',
            height: '20px',
            backgroundColor: '#0f172a',
            borderRadius: '0 0 16px 16px',
            border: '2px solid rgba(255,255,255,0.1)',
            borderTop: 'none'
          }} />
          
          {/* Sombra o número de jersey sutil en el pecho */}
          <div style={{
            position: 'absolute',
            bottom: '25px',
            color: 'rgba(255, 255, 255, 0.15)',
            fontSize: '32px',
            fontWeight: '900',
            fontFamily: 'sans-serif'
          }}>
            {indices.ropa + 1}
          </div>
        </div>
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