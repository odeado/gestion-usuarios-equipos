import React, { useState, useEffect } from 'react';
import imageCompression from 'browser-image-compression';

function AddUserForm({ onUserAdded, userToEdit, onEditUser, onCancelEdit, departments }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    imageBase64: ''
  });
  const [isCompressing, setIsCompressing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Normaliza strings para comparación
  const normalizeString = (str) => (str || '').toString().toLowerCase().trim();

  // Efecto para cargar datos del usuario a editar
  useEffect(() => {
    if (userToEdit) {
      const userDept = departments.find(dept => 
        dept.id === userToEdit.departmentId || // Primero compara por ID si existe
        normalizeString(dept.name) === normalizeString(userToEdit.department)
      );

      setFormData(prev => ({
        ...prev,
        department: userDept ? userDept.name : userToEdit.department || ''
      }));
    }
  }, [userToEdit, departments]);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      department: '',
      imageBase64: ''
    });
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e) => {
    // Mantén tu lógica actual de manejo de imágenes
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, email, department, imageBase64 } = formData;
    
    const userData = {
      name,
      correo: email,
      department,
      imageBase64
    };

    if (isEditing && userToEdit) {
      userData.id = userToEdit.id;
      onEditUser(userData);
    } else {
      onUserAdded(userData);
    }
    
    if (!isEditing) {
      resetForm();
    }
  };

  // Filtra departamentos válidos
  const validDepartments = departments.filter(
    dept => dept.name && normalizeString(dept.name)
  );

  console.log('Departamentos disponibles:', departments);
  console.log('Departamento del usuario:', userToEdit?.department);
  console.log('Departamento seleccionado:', formData.department);

  return (
    <form onSubmit={handleSubmit} className="user-form">
      <h2>{isEditing ? 'Editar Usuario' : 'Agregar Usuario'}</h2>
      
      <input
        name="name"
        type="text"
        placeholder="Nombre"
        value={formData.name}
        onChange={handleChange}
        required
      />
      
      <input
        name="email"
        type="email"
        placeholder="Correo"
        value={formData.email}
        onChange={handleChange}
        required
      />
      
      <select
  value={formData.department || ''}
  onChange={handleChange}
  required
>
  <option value="">Selecciona un departamento</option>
  {departments.map(dept => (
    <option key={dept.id} value={dept.name}>
      {dept.name} {dept.id === userToEdit?.departmentId && '(Actual)'}
    </option>
  ))}
</select>
      
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
      />
      
      {formData.imageBase64 && (
        <img src={formData.imageBase64} alt="Preview" className="image-preview" />
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