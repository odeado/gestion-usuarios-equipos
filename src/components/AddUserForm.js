import React, { useState, useRef, useEffect } from 'react';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import imageCompression from 'browser-image-compression';

function AddUserForm({ onUserAdded, userToEdit, onEditUser }) {
  const [formData, setFormData] = useState({
    name: '',
    correo: '',
    department: '',
    imageBase64: ''
  });
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef();

  // Cargar datos del usuario a editar
  useEffect(() => {
    if (userToEdit) {
      setFormData(userToEdit);
      if (userToEdit.imageBase64) {
        setImageBase64(userToEdit.imageBase64);
      }
    }
  }, [userToEdit]);

  const handleImageChange = async (e) => {
    // ... (mantén igual tu código actual de compresión)
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.correo || !formData.department) {
      alert('Por favor complete todos los campos');
      return;
    }

    try {
      if (userToEdit) {
        // Modo Edición
        await updateDoc(doc(db, 'users', userToEdit.id), {
          ...formData,
          imageBase64: formData.imageBase64 || null
        });
        onEditUser({ ...formData, id: userToEdit.id });
        alert('Usuario actualizado exitosamente!');
      } else {
        // Modo Creación
        const docRef = await addDoc(collection(db, 'users'), {
          ...formData,
          imageBase64: formData.imageBase64 || null,
          createdAt: new Date()
        });
        onUserAdded(prev => [...prev, { id: docRef.id, ...formData }]);
        alert('Usuario guardado exitosamente!');
      }

      // Resetear formulario
      setFormData({
        name: '',
        correo: '',
        department: '',
        imageBase64: ''
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      
    } catch (error) {
      console.error("Error:", error);
      alert(`Error al ${userToEdit ? 'actualizar' : 'guardar'} usuario`);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="form-container">
      <h3>{userToEdit ? 'Editar Usuario' : 'Agregar Usuario'}</h3>
      <form onSubmit={handleSubmit}>
        {isCompressing && <p>Comprimiendo imagen...</p>}
        {formData.imageBase64 && !isCompressing && (
          <div className="image-preview">
            <img 
              src={formData.imageBase64} 
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
          name="name"
          placeholder="Nombre completo"
          value={formData.name}
          onChange={handleChange}
          required   
        />
        <input
          type="email"
          name="correo"
          placeholder="Correo usuario"
          value={formData.correo}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="department"
          placeholder="Departamento"
          value={formData.department}
          onChange={handleChange}
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
          {isCompressing ? 'Procesando...' : (userToEdit ? 'Actualizar Usuario' : 'Guardar Usuario')}
        </button>
      </form>
    </div>
  );
}

export default AddUserForm;
