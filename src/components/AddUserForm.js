import React, { useState, useEffect } from 'react';
import imageCompression from 'browser-image-compression';

function AddUserForm({ onUserAdded, userToEdit, onEditUser, onCancelEdit, departments }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Efecto para cargar datos del usuario a editar
  useEffect(() => {
    if (userToEdit) {
      setName(userToEdit.name);
      setEmail(userToEdit.correo);
      setDepartment(userToEdit.department);
      setImageBase64(userToEdit.imageBase64 || '');
      setIsEditing(true);
    } else {
      resetForm();
      setIsEditing(false);
    }
  }, [userToEdit]);

  const resetForm = () => {
    setName('');
    setEmail('');
    setDepartment('');
    setImageBase64('');
  };

  const handleImageChange = async (e) => {
    // ... (mantén tu lógica actual de manejo de imágenes)
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const userData = {
      name,
      correo: email,
      department,
      imageBase64
    };

    if (isEditing && userToEdit) {
      userData.id = userToEdit.id; // Añade el ID para edición
      onEditUser(userData);
    } else {
      onUserAdded(userData);
    }
    
    if (!isEditing) {
      resetForm();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="user-form">
      <h2>{isEditing ? 'Editar Usuario' : 'Agregar Usuario'}</h2>
      
      <input
        type="text"
        placeholder="Nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      
      <input
        type="email"
        placeholder="Correo"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      
      <input
        type="department"
        placeholder="Departamento"
        value={department}
        onChange={(e) => setDepartment(e.target.value)}
        list="departments"
        required
      />
      
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
      />
      
      {imageBase64 && (
        <img src={imageBase64} alt="Preview" className="image-preview" />
      )}
      
      <div className="form-buttons">
        {isEditing && (
          <button 
            type="button" 
            onClick={onCancelEdit}
            className="cancel-button"
          >
            Cancelar
          </button>
        )}
        <button type="submit" className="submit-button">
          {isEditing ? 'Actualizar Usuario' : 'Agregar Usuario'}
        </button>
      </div>
    </form>
  );
}

export default AddUserForm;