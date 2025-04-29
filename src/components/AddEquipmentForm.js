import React, { useState, useRef } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import imageCompression from 'browser-image-compression';

function AddEquipmentForm({ users }) {
  const [type, setType] = useState('');
  const [model, setModel] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef();
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Función de compresión y conversión a Base64
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      alert('Por favor seleccione un archivo de imagen');
      return;
    }

    setIsCompressing(true);

    try {
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 800,
        useWebWorker: true,
        fileType: 'image/webp'
      };
      
      const compressedFile = await imageCompression(file, options);
      
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
    if (!type || !model) {
      alert('Por favor complete los campos obligatorios');
      return;
    }

    try {
      await addDoc(collection(db, 'equipment'), {
        type,
        model,
        assignedTo: assignedTo || null,
        imageBase64: imageBase64 || null,
        createdAt: new Date()
      });

      // Resetear formulario
      setType('');
      setModel('');
      setAssignedTo('');
      setImageBase64('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      alert('¡Equipo agregado exitosamente!');
    } catch (error) {
      console.error("Error:", error);
      alert('Error al agregar equipo: ' + error.message);
    }
  };

  return (
    <div className="form-container">
      <h3>Agregar Nuevo Equipo</h3>
      <form onSubmit={handleSubmit}>
        {isCompressing && <div className="loading-message">Comprimiendo imagen...</div>}
        
        {imageBase64 && !isCompressing && (
          <div className="image-preview">
            <img 
              src={imageBase64} 
              alt="Vista previa del equipo" 
            />
          </div>
        )}

  
       <div className="form-row">
        <div className="form-group">
          
          <label htmlFor="type" className="form-label">Tipo de Equipo</label>
          <input
          id="type"
          name="type"
            type="text"
            value={type}
            onChange={(e) => setType(e.target.value)}
            placeholder="Ej: Laptop, Teléfono, Monitor"
            required
            className={`form-input ${errors.name ? 'input-error' : ''}`}
            />
            {errors.name && <div className="error-text">{errors.name}</div>}
        </div>

        <div className="form-group">
        <label htmlFor="model" className="form-label">Modelo</label>
          <input
          id="model"
          name="model"
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="Ej: Dell XPS 15, iPhone 13"
            required
            className={`form-input ${errors.name ? 'input-error' : ''}`}
            />
            {errors.name && <div className="error-text">{errors.name}</div>}
        </div>
        </div>

        <div className="form-row">
        <div className="form-group">
          <label>Asignar a</label>
          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="user-selector"
          >
            <option value="">Seleccione un usuario...</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name} - {user.department}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Imagen del Equipo</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            ref={fileInputRef}
            disabled={isCompressing}
          />
        </div>
              </div>

        <button 
          type="submit" 
          disabled={isCompressing}
          className="btn btn-submit"
        >
          {isCompressing ? 'Guardando...' : 'Guardar Equipo'}
        </button>
      </form>
    </div>
  );
}

export default AddEquipmentForm;
