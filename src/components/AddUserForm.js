import React, { useState, useRef } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import imageCompression from 'browser-image-compression';

function AddUserForm() {
  const [name, setName] = useState('');
  const [correo, setCorreo] = useState('');
  const [department, setDepartment] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef();

  
  // Función de compresión y conversión a Base64
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Verificar si es imagen
    if (!file.type.match('image.*')) {
      alert('Por favor seleccione un archivo de imagen');
      return;
    }

    setIsCompressing(true);

    try {
      // Opciones de compresión
      const options = {
        maxSizeMB: 0.5,               // Tamaño máximo final (0.5MB)
        maxWidthOrHeight: 800,        // Dimensión máxima
        useWebWorker: true,           // Usar hilo separado para mejor performance
        fileType: 'image/webp'        // Convertir a WebP para mejor compresión
      };
      
      // Comprimir imagen
      const compressedFile = await imageCompression(file, options);
      
      // Convertir a Base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result);
        setIsCompressing(false);
      };
      reader.readAsDataURL(compressedFile);

    } catch (error) {
      console.error("Error al comprimir:", error);
      setIsCompressing(false);
      alert('Error al procesar la imagen');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !correo || !department) {
      alert('Por favor complete todos los campos');
      return;
    }

    try {
      
      await addDoc(collection(db, 'users'), {
        name,
        correo,
        department,
        imageBase64: imageBase64 || null, // Guarda Base64 o null si no hay imagen
        createdAt: new Date()
      });

      // Resetear formulario
      setName('');
      setCorreo('');
      setDepartment('');
      setImageBase64('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      alert('Usuario guardado exitosamente!');
    } catch (error) {
      console.error("Error:", error);
      alert('Error al guardar usuario');
    }
  };

  return (
    <div className="form-container">
      <h3>Agregar Usuario</h3>
      <form onSubmit={handleSubmit}>
        {isCompressing && <p>Comprimiendo imagen...</p>}
        {imageBase64 && !isCompressing && (
          <div className="image-preview">
            <img 
              src={imageBase64} 
              alt="Preview" 
              style={{
                maxWidth: '100px', 
                maxHeight: '100px',
                borderRadius: '4px'
              }}
            />
          </div>
        )}
        <input
          type="text"
          placeholder="Nombre completo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required   
        />
        <input
          type="text"
          placeholder="Correo usuario"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Departamento"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          ref={fileInputRef}
          disabled={isCompressing}
        />
        <button 
          type="submit" 
          disabled={isCompressing}
        >
          {isCompressing ? 'Procesando...' : 'Guardar Usuario'}
        </button>
      </form>
    </div>
  );
}

export default AddUserForm;
