import React, { useState, useEffect } from 'react';
import imageCompression from 'browser-image-compression';

function AddUserForm({ onUserAdded, userToEdit = null, onEditUser, onCancelEdit, departments = [] }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    imageBase64: ''
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Efecto para cargar datos del usuario a editar
  useEffect(() => {
    if (userToEdit) {
      setFormData({
        name: userToEdit.name || '',
        email: userToEdit.correo || '',
        department: userToEdit.department || '',
        imageBase64: userToEdit.imageBase64 || ''
      });
      setImagePreview(userToEdit.imageBase64 || null);
      setIsEditing(true);
    } else {
      resetForm();
    }
  }, [userToEdit]);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      department: '',
      imageBase64: ''
    });
    setImagePreview(null);
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      setIsCompressing(true);
      try {
        const file = e.target.files[0];
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 800,
          useWebWorker: true
        };
        const compressedFile = await imageCompression(file, options);
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({ ...prev, imageBase64: reader.result }));
          setImagePreview(reader.result);
          setIsCompressing(false);
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error('Error comprimiendo imagen:', error);
        setIsCompressing(false);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const userData = {
      ...formData,
      ...(isEditing && userToEdit && { id: userToEdit.id })
    };

    if (isEditing) {
      onEditUser(userData);
    } else {
      onUserAdded(userData);
    }
    
    if (!isEditing) {
      resetForm();
    }
  };

  // Renderizado del select de departamentos
  const renderDepartmentSelect = () => {
    const currentDept = formData.department;
    const deptExists = departments.some(d => {
      const deptName = d.name || d;
      return deptName === currentDept;
    });

    return (
      <select
        name="department"
        value={currentDept}
        onChange={handleChange}
        required
      >
        <option value="">Selecciona un departamento</option>
        
        {isEditing && !deptExists && currentDept && (
          <option value={currentDept} style={{ fontStyle: 'italic', color: '#999' }}>
            {currentDept} (actual)
          </option>
        )}
        
        {departments.map(dept => {
          const deptName = dept.name || dept;
          const deptId = dept.id || dept;
          return (
            <option key={deptId} value={deptName}>
              {deptName}
            </option>
          );
        })}
      </select>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="user-form">
      <h2>{isEditing ? 'Editar Usuario' : 'Agregar Usuario'}</h2>
      
      {isCompressing && <div className="loading-message">Comprimiendo imagen...</div>}
      
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
      
      {renderDepartmentSelect()}
      
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        disabled={isCompressing}
      />
      
      {imagePreview && (
        <div className="image-preview" style={{
          maxWidth: '150px',
          maxHeight: '150px',
          margin: '10px 0',
          overflow: 'hidden',
          borderRadius: '4px'
        }}>
          <img 
            src={imagePreview} 
            alt="Vista previa" 
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        </div>
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
        <button 
          type="submit" 
          className="submit-button"
          disabled={isCompressing}
        >
          {isEditing ? 'Actualizar Usuario' : 'Agregar Usuario'}
        </button>
      </div>
    </form>
  );
}

export default AddUserForm;