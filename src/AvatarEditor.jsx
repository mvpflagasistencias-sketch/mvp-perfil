import { useState, useEffect } from 'react';
import { createAvatar } from '@dicebear/core';
import * as adventurer from '@dicebear/adventurer';

// 🚀 CATÁLOGO REAL COMPATIBLE CON ADVENTURER (Corregido con las variantes reales del paquete)
const OPCIONES = {
  cabello: ['long01', 'short01', 'short02', 'short03', 'short04', 'short05'],
  colorCabello: ['0e0e10', '4a3728', 'b58143', 'af3838', '2c5282'],
  ropa: ['jersey01', 'jersey02', 'jersey03', 'jersey04', 'jersey05'],
  colorRopa: ['9b2c2c', '2b6cb0', '2f855a', 'd69e2e', '4a5568'],
  accesorios: ['none', 'glasses01', 'eyepatch'], // 👈 Variantes reales de la librería adventurer
  expresion: ['variant01', 'variant02', 'variant03', 'variant04'],
  colorPiel: ['f2d3b1', 'ecad80', 'c1885a', '94613c', '613b1e'] 
};

const AvatarEditor = ({ jugadorId, configInicial, onGuardarExito }) => {
  const [indices, setIndices] = useState({
    cabello: 0,
    colorCabello: 0,
    ropa: 0,
    colorRopa: 0,
    accesorios: 0,
    expresion: 0,
    colorPiel: 2, 
  });

  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (configInicial) {
      const hairConfig = Array.isArray(configInicial.hair) ? configInicial.hair[0] : configInicial.hair;
      const hairColorConfig = Array.isArray(configInicial.hairColor) ? configInicial.hairColor[0] : configInicial.hairColor;
      const clothingConfig = Array.isArray(configInicial.clothing) ? configInicial.clothing[0] : configInicial.clothing;
      const clothingColorConfig = Array.isArray(configInicial.clothingColor) ? configInicial.clothingColor[0] : configInicial.clothingColor;
      
      const rawAccessories = configInicial.accessories || configInicial.features;
      const targetAccessory = Array.isArray(rawAccessories) ? rawAccessories[0] : rawAccessories;
      
      const eyebrowsConfig = Array.isArray(configInicial.eyebrows) ? configInicial.eyebrows[0] : configInicial.eyebrows;
      const skinColorConfig = Array.isArray(configInicial.skinColor) ? configInicial.skinColor[0] : configInicial.skinColor;

      setIndices({
        cabello: OPCIONES.cabello.indexOf(hairConfig) >= 0 ? OPCIONES.cabello.indexOf(hairConfig) : 0,
        colorCabello: OPCIONES.colorCabello.indexOf(hairColorConfig) >= 0 ? OPCIONES.colorCabello.indexOf(hairColorConfig) : 0,
        ropa: OPCIONES.ropa.indexOf(clothingConfig) >= 0 ? OPCIONES.ropa.indexOf(clothingConfig) : 0,
        colorRopa: OPCIONES.colorRopa.indexOf(clothingColorConfig) >= 0 ? OPCIONES.colorRopa.indexOf(clothingColorConfig) : 0,
        accesorios: OPCIONES.accesorios.indexOf(targetAccessory) >= 0 ? OPCIONES.accesorios.indexOf(targetAccessory) : 0,
        expresion: OPCIONES.expresion.indexOf(eyebrowsConfig) >= 0 ? OPCIONES.expresion.indexOf(eyebrowsConfig) : 0,
        colorPiel: OPCIONES.colorPiel.indexOf(skinColorConfig) >= 0 ? OPCIONES.colorPiel.indexOf(skinColorConfig) : 2,
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
        // ✂️ Comentamos el cabello para dejarlo pelón temporalmente y probar los accesorios nativos
        // hair: [OPCIONES.cabello[indices.cabello]], 
        // hairColor: [OPCIONES.colorCabello[indices.colorCabello]],
        eyebrows: [OPCIONES.expresion[indices.expresion]],
        skinColor: [OPCIONES.colorPiel[indices.colorPiel]],
        features: []
      };

      // 🚀 PRUEBA: Mandamos el accesorio original directamente a DiceBear
      if (indices.accesorios > 0) {
        opcionesDiceBear.accessories = [OPCIONES.accesorios[indices.accesorios]];
      } else {
        opcionesDiceBear.accessories = [];
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
        accessories: OPCIONES.accesorios[indices.accesorios] !== 'none' ? [OPCIONES.accesorios[indices.accesorios]] : [],
        eyebrows: [OPCIONES.expresion[indices.expresion]],
        skinColor: [OPCIONES.colorPiel[indices.colorPiel]] 
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
  const colorJerseyActual = `#${OPCIONES.colorRopa[indices.colorRopa]}`;

  const renderJerseyEstilizado = () => {
    const tipoRopa = indices.ropa + 1;
    const colorDetalles = '#ffffff';
    const colorSombras = 'rgba(0, 0, 0, 0.15)';
    const colorBordeNegro = '#1a1a1a';

    return (
      <div style={{ 
        position: 'absolute',
        bottom: '-15px', 
        width: '150px',
        height: '140px',
        zIndex: 1,
        transition: 'all 0.2s ease'
      }}>
        <svg viewBox="0 0 120 110" style={{ width: '100%', height: '100%', transform: 'translateY(-12px)' }}>
          <path d="M 53,35 L 53,28" fill="none" stroke={colorBordeNegro} strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 67,35 L 67,28" fill="none" stroke={colorBordeNegro} strokeWidth="3.5" strokeLinecap="round" />

          <path 
            d="M 25,100 C 25,60 35,42 45,35 C 50,32 70,32 75,35 C 85,42 95,60 95,100 Z" 
            fill={colorJerseyActual} 
            stroke={colorBordeNegro} 
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {tipoRopa === 1 && (
            <>
              <path d="M 28,65 C 30,52 35,45 40,41" fill="none" stroke={colorDetalles} strokeWidth="4" opacity="0.8" />
              <path d="M 92,65 C 90,52 85,45 80,41" fill="none" stroke={colorDetalles} strokeWidth="4" opacity="0.8" />
            </>
          )}

          {tipoRopa === 2 && (
            <>
              <path d="M 23,100 C 24,68 33,52 38,44" fill="none" stroke={colorSombras} strokeWidth="6" />
              <path d="M 97,100 C 96,68 87,52 82,44" fill="none" stroke={colorSombras} strokeWidth="6" />
            </>
          )}

          {tipoRopa === 3 && (
            <path d="M 27,62 C 40,58 80,58 93,62 L 94,74 C 80,70 40,70 26,74 Z" fill={colorDetalles} opacity="0.85" />
          )}

          {tipoRopa === 4 && (
            <path d="M 45,35 C 48,45 72,45 75,35 C 72,48 48,48 45,35" fill={colorDetalles} />
          )}

          {tipoRopa === 5 && (
            <>
              <path d="M 42,36 C 44,55 40,75 32,95" fill="none" stroke={colorSombras} strokeWidth="2.5" />
              <path d="M 78,36 C 76,55 80,75 88,95" fill="none" stroke={colorSombras} strokeWidth="2.5" />
            </>
          )}

          <path d="M 29,82 C 34,80 36,83 34,86" fill="none" stroke={colorSombras} strokeWidth="2" strokeLinecap="round" />
          <path d="M 91,82 C 86,80 84,83 86,86" fill="none" stroke={colorSombras} strokeWidth="2" strokeLinecap="round" />

          <path d="M 45,35 C 50,42 70,42 75,35 Z" fill={colorSombras} />

          <path 
            d="M 46,34 L 60,46 L 74,34" 
            fill="none" 
            stroke={colorBordeNegro} 
            strokeWidth="3.5" 
            strokeLinecap="round"
          />

          <text 
            x="60" 
            y="78" 
            textAnchor="middle" 
            fill={colorDetalles} 
            opacity="0.25"
            style={{ fontSize: '26px', fontWeight: '900', fontFamily: 'Impact, sans-serif', letterSpacing: '-0.5px' }}
          >
            {tipoRopa}
          </text>
        </svg>
      </div>
    );
  };

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
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'flex-start',
        position: 'relative'
      }}>
        {/* 1. SECCIÓN DE LA CABEZA (DiceBear base) */}
        <div style={{ 
          width: '110px', 
          height: '110px', 
          zIndex: 2, 
          position: 'relative', 
          marginTop: '48px'
        }}>
          {imagenSrc && (
            <img 
              src={imagenSrc} 
              alt="Rostro" 
              style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }}
            />
          )}
        </div>

        {/* 2. UNIFORME DEPORTIVO VECTORIAL DINÁMICO */}
        {renderJerseyEstilizado()}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {[
          { label: 'Estilo de Cabello', campo: 'cabello' },
          { label: 'Color de Cabello', campo: 'colorCabello' },
          { label: 'Tipo de Ropa', campo: 'ropa' },
          { label: 'Color de Ropa', campo: 'colorRopa' },
          { label: 'Accesorios', campo: 'accesorios' },
          { label: 'Expresión', campo: 'expresion' },
          { label: 'Color de Piel', campo: 'colorPiel' } 
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