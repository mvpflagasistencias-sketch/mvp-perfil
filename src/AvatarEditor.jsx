// src/AvatarEditor.jsx

const AvatarEditor = ({ config }) => {
  const c = config || { 
    cuerpo: 'cuerpo', 
    cara: 'cara', 
    accesorio: 'accesorio' 
  };

  const handleImageError = (e) => {
    e.target.style.display = 'none';
  };

  return (
    <div className="relative w-24 h-24 mx-auto flex items-center justify-center bg-gray-800 rounded-full overflow-hidden">
      <img 
        src={`/assets/avatar/${c.cuerpo}.svg`} 
        onError={handleImageError}
        className="absolute w-full h-full object-contain z-10" 
        alt="Cuerpo" 
      />
      <img 
        src={`/assets/avatar/${c.cara}.svg`} 
        onError={handleImageError}
        className="absolute w-full h-full object-contain z-20" 
        alt="Cara" 
      />
      {c.accesorio !== 'none' && (
        <img 
          src={`/assets/avatar/${c.accesorio}.svg`} 
          onError={handleImageError}
          className="absolute w-full h-full object-contain z-30 animate-in zoom-in duration-300" 
          alt="Accesorio" 
        />
      )}
    </div>
  );
};

export default AvatarEditor;