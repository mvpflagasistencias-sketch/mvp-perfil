import { useState, useEffect } from 'react';
import { createAvatar } from '@dicebear/core';
import * as adventurer from '@dicebear/adventurer';

// 🚀 CATÁLOGO REAL COMPATIBLE CON ADVENTURER (Corregido con las variantes reales del paquete)
const OPCIONES = {
  cabello: ['long01', 'short01', 'short02', 'short03', 'short04', 'short05'],
  colorCabello: ['0e0e10', '4a3728', 'b58143', 'af3838', '2c5282'],
  ropa: ['jersey01', 'jersey02', 'jersey03', 'jersey04', 'jersey05'],
  colorRopa: ['9b2c2c', '2b6cb0', '2f855a', 'd69e2e', '4a5568'],
  expresion: ['variant01', 'variant02', 'variant03', 'variant04'],
  colorPiel: ['f2d3b1', 'ecad80', 'c1885a', '94613c', '613b1e'] 
};

const AvatarEditor = ({ jugadorId, configInicial, onGuardarExito, soloModal = false }) => {
  const [indices, setIndices] = useState({
    cabello: 0,
    colorCabello: 0,
    ropa: 0,
    colorRopa: 0,
    expresion: 0,
    colorPiel: 2, 
  });

  const [guardando, setGuardando] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // 🚀 Control del modal flotante (Opción B)

  // 🎈 ESTADOS PARA EL EFECTO BURBUJA DRAGGABLE (MESSENGER STYLE)
  const [posicion, setPosicion] = useState({ x: window.innerWidth - 200, y: window.innerHeight / 2 - 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [seMovio, setSeMovio] = useState(false); // Evita abrir el modal por accidente al arrastrar

  useEffect(() => {
    if (configInicial) {
      const hairConfig = Array.isArray(configInicial.hair) ? configInicial.hair[0] : configInicial.hair;
      const hairColorConfig = Array.isArray(configInicial.hairColor) ? configInicial.hairColor[0] : configInicial.hairColor;
      const clothingConfig = Array.isArray(configInicial.clothing) ? configInicial.clothing[0] : configInicial.clothing;
      const clothingColorConfig = Array.isArray(configInicial.clothingColor) ? configInicial.clothingColor[0] : configInicial.clothingColor;
      const eyebrowsConfig = Array.isArray(configInicial.eyebrows) ? configInicial.eyebrows[0] : configInicial.eyebrows;
      const skinColorConfig = Array.isArray(configInicial.skinColor) ? configInicial.skinColor[0] : configInicial.skinColor;

      setIndices({
        cabello: OPCIONES.cabello.indexOf(hairConfig) >= 0 ? OPCIONES.cabello.indexOf(hairConfig) : 0,
        colorCabello: OPCIONES.colorCabello.indexOf(hairColorConfig) >= 0 ? OPCIONES.colorCabello.indexOf(hairColorConfig) : 0,
        ropa: OPCIONES.ropa.indexOf(clothingConfig) >= 0 ? OPCIONES.ropa.indexOf(clothingConfig) : 0,
        colorRopa: OPCIONES.colorRopa.indexOf(clothingColorConfig) >= 0 ? OPCIONES.colorRopa.indexOf(clothingColorConfig) : 0,
        expresion: OPCIONES.expresion.indexOf(eyebrowsConfig) >= 0 ? OPCIONES.expresion.indexOf(eyebrowsConfig) : 0,
        colorPiel: OPCIONES.colorPiel.indexOf(skinColorConfig) >= 0 ? OPCIONES.colorPiel.indexOf(skinColorConfig) : 2,
      });
    }
  }, [configInicial]);

  // Manejo global del movimiento del mouse para un arrastre fluido
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      
      // Calculamos la nueva posición restando el offset inicial
      let nuevaX = e.clientX - dragStart.x;
      let nuevaY = e.clientY - dragStart.y;

      // 🛑 Límites de pantalla elementales (Evita que el mono se pierda fuera de los bordes)
      nuevaX = Math.max(10, Math.min(nuevaX, window.innerWidth - 170));
      nuevaY = Math.max(10, Math.min(nuevaY, window.innerHeight - 170));

      setPosicion({ x: nuevaX, y: nuevaY });
      setSeMovio(true);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeUpEventListener?.('mouseup', handleMouseUp);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  // 🚀 ESCUCHA GLOBAL: Permite abrir el modal de forma remota al cliquear la foto integrada de la credencial
  useEffect(() => {
    const escucharApertura = () => setIsOpen(true);
    window.addEventListener('abrir-editor-avatar', escucharApertura);
    return () => window.removeEventListener('abrir-editor-avatar', escucharApertura);
  }, []);

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
        hair: [OPCIONES.cabello[indices.cabello]], 
        hairColor: [OPCIONES.colorCabello[indices.colorCabello]],
        eyebrows: [OPCIONES.expresion[indices.expresion]],
        skinColor: [OPCIONES.colorPiel[indices.colorPiel]],
        features: [],
        accessories: [] // Deshabilitado el render nativo debido a la incompatibilidad en servidor
      };

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
        accessories: [], // Se envía vacío al servidor de forma segura
        eyebrows: [OPCIONES.expresion[indices.expresion]],
        skinColor: [OPCIONES.colorPiel[indices.colorPiel]] 
      };
      
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      
      const response = await fetch(`${baseUrl}/api/jugadores/${jugadorId}/avatar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_config: configAEnviar }),
      });

      if (!response.ok) throw new Error("Error en servidor");
      alert("✅ ¡Avatar deportivo guardado!");
      setIsOpen(false); // Cierra automáticamente el modal tras un guardado exitoso
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

  // Funciones controladoras del arrastre interactivo burbuja
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setSeMovio(false);
    setDragStart({
      x: e.clientX - posicion.x,
      y: e.clientY - posicion.y
    });
  };

  const handleElementClick = () => {
    // Si solo se arrastró la burbuja, no disparamos la apertura del editor
    if (!seMovio) {
      setIsOpen(true);
    }
  };

  return (
    <>
      {/* 1. DISPARADOR INTERACTIVO MODIFICADO A BURBUJA FLOTANTE (DRAGGABLE) */}
      {!soloModal && (
        <div 
          onMouseDown={handleMouseDown}
          onClick={handleElementClick}
          style={{ 
            width: '160px', 
            height: '160px', 
            backgroundColor: '#0f172a', 
            borderRadius: '50%', 
            border: '4px solid #60a5fa', 
            overflow: 'hidden', 
            boxSizing: 'border-box', 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'flex-start',
            position: 'fixed', // 🚀 CAPA INDEPENDIENTE: Sale del flujo para dejar la credencial al centro
            left: `${posicion.x}px`, // Posición X dinámica en píxeles
            top: `${posicion.y}px`,  // Posición Y dinámica en píxeles
            zIndex: 999, // Se mantiene flotando por encima del contenido
            cursor: isDragging ? 'grabbing' : 'grab', // Icono dinámico de mano
            transition: isDragging ? 'none' : 'transform 0.2s ease', // Evita retrasos durante el drag
            userSelect: 'none',
          }}
          onMouseEnter={(e) => !isDragging && (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => !isDragging && (e.currentTarget.style.transform = 'scale(1)')}
        >
          <div style={{ width: '90px', height: '90px', zIndex: 2, position: 'relative', marginTop: '-15px', pointerEvents: 'none' }}>
            {imagenSrc && (
              <img src={imagenSrc} alt="Rostro" style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }} />
            )}
          </div>
          <div style={{ pointerEvents: 'none', position: 'absolute', width: '100%', height: '100%' }}>
            {renderJerseyEstilizado()}
          </div>
        </div>
      )}

      {/* 2. MODAL FLOTANTE (Emerge al dar clic sobre el círculo asignado) */}
      {isOpen && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100vw', 
          height: '100vh', 
          backgroundColor: 'rgba(15, 23, 42, 0.75)', 
          backdropFilter: 'blur(4px)', 
          zIndex: 9999, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '20px',
          boxSizing: 'border-box'
        }}>
          <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '24px', border: '1px solid #30363d', maxWidth: '360px', width: '100%', color: 'white', textAlign: 'center', boxSizing: 'border-box', position: 'relative' }}>
            
            <button 
              onClick={() => setIsOpen(false)}
              style={{ position: 'absolute', top: '14px', right: '16px', background: 'none', border: 'none', color: '#9ca3af', fontSize: '18px', fontWeight: '900', cursor: 'pointer' }}
            >
              ✕
            </button>

            <h4 style={{ fontSize: '13px', fontWeight: '900', textTransform: 'uppercase', color: '#60a5fa', marginBottom: '16px', letterSpacing: '0.1em', margin: '0 0 16px' }}>Diseña tu Personaje</h4>
            
            <div style={{ width: '160px', height: '240px', backgroundColor: '#0f172a', borderRadius: '20px', margin: '0 auto 20px', border: '4px solid #60a5fa', overflow: 'hidden', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', position: 'relative' }}>
              <div style={{ width: '110px', height: '110px', zIndex: 2, position: 'relative', marginTop: '48px' }}>
                {imagenSrc && (
                  <img src={imagenSrc} alt="Rostro" style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }} />
                )}
              </div>
              {renderJerseyEstilizado()}
            </div>

            {/* Selectores del catálogo */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: 'Estilo de Cabello', campo: 'cabello' },
                { label: 'Color de Cabello', campo: 'colorCabello' },
                { label: 'Tipo de Ropa', campo: 'ropa' },
                { label: 'Color de Ropa', campo: 'colorRopa' },
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
        </div>
      )}
    </>
  );
};

export default AvatarEditor;