// AddUserForm.js
import React, { useState, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import './AddUserForm.css';

function AddUserForm({ 
  onUserAdded, 
  userToEdit = null, 
  onEditUser, 
  onCancelEdit, 
  departments = [], 
  onAddDepartment 
}) {
  const [formData, setFormData] = useState({
    name: '',
    correo: '',
    ciudad: '',
    tipoVpn: '',
    department: '',
    estado: 'Teletrabajo',
    imageBase64: ''
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddDepartment, setShowAddDepartment] = useState(false);
  const [newDepartment, setNewDepartment] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (userToEdit) {
      setFormData({
        name: userToEdit.name || '',
        correo: userToEdit.correo || '',
        ciudad: userToEdit.ciudad || '',
        tipoVpn: userToEdit.tipoVpn || '',
        department: userToEdit.department || '',
        estado: userToEdit.estado || 'Teletrabajo',
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
      correo: '',
      ciudad: '',
      tipoVpn: '',
      department: '',
      estado: 'Teletrabajo',
      imageBase64: ''
    });
    setImagePreview(null);
    setIsEditing(false);
    setNewDepartment('');
    setShowAddDepartment(false);
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Nombre es requerido';
    if (!formData.tipoVpn.trim()) newErrors.tipoVpn = 'Tipo VPN requerido';
    if (!formData.ciudad.trim()) newErrors.ciudad = 'Ciudad es requerida';
    if (!formData.correo.trim()) newErrors.correo = 'Correo es requerido';
    else if (!/\S+@\S+\.\S+/.test(formData.correo)) newErrors.correo = 'Correo inválido';
    if (!formData.department.trim()) newErrors.department = 'Departamento es requerido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
        setErrors(prev => ({ ...prev, image: 'Error al procesar la imagen' }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      if (isEditing && userToEdit) {
        await onEditUser({
          ...formData,
          id: userToEdit.id
        });
        onCancelEdit();
      } else {
        await onUserAdded(formData);
        resetForm();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors(prev => ({ ...prev, form: 'Error al guardar los datos' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDepartmentSelect = () => {
    const currentDept = formData.department;
    const deptExists = departments.some(d => {
      const deptName = d.name || d;
      return deptName === currentDept;
    });

    return (
      <div className="department-select-container">
        <select
          name="department"
          value={formData.department}
          onChange={(e) => {
            if (e.target.value === "__add__") {
              setShowAddDepartment(true);
              setNewDepartment(currentDept || '');
            } else {
              handleChange(e);
            }
          }}
          required
          className={`form-input ${errors.department ? 'input-error' : ''}`}
        >
          <option value="">Selecciona un departamento</option>
          {currentDept && (
            <option value={currentDept}>
              {currentDept} {!deptExists && "(Actual)"}
            </option>
          )}
          {departments
            .filter(dept => (dept.name || dept) !== currentDept)
            .map(dept => (
              <option key={dept.id || dept} value={dept.name || dept}>
                {dept.name || dept}
              </option>
            ))}
          <option value="__add__">+ Agregar nuevo departamento</option>
        </select>

        {showAddDepartment && (
          <div className="add-department-form">
            <input
              type="text"
              value={newDepartment}
              onChange={(e) => setNewDepartment(e.target.value)}
              placeholder="Nombre del nuevo departamento"
              className="department-input"
            />
            <div className="department-form-buttons">
              <button 
                type="button" 
                onClick={async () => {
                  if (!newDepartment.trim()) {
                    setErrors(prev => ({ ...prev, department: 'Nombre de departamento no puede estar vacío' }));
                    return;
                  }
                  try {
                    const { success, newDepartment: addedDept } = await onAddDepartment(newDepartment.trim());
                    if (success) {
                      setFormData(prev => ({ ...prev, department: addedDept.name }));
                      setShowAddDepartment(false);
                      setNewDepartment('');
                      setErrors(prev => ({ ...prev, department: '' }));
                    }
                  } catch (error) {
                    console.error('Error adding department:', error);
                    setErrors(prev => ({ ...prev, department: 'Error al agregar departamento' }));
                  }
                }}
                className="add-button"
                disabled={isSubmitting}
              >
                Agregar
              </button>
              <button 
                type="button" 
                onClick={() => setShowAddDepartment(false)}
                className="cancel-button"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
        {errors.department && <div className="error-message">{errors.department}</div>}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="user-form">
      <h2 className="form-title">{isEditing ? 'Editar Usuario' : 'Agregar Usuario'}</h2>
      
      {errors.form && <div className="error-message form-error">{errors.form}</div>}
      {isCompressing && <div className="loading-message">Comprimiendo imagen...</div>}
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="name" className="form-label">Nombre</label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Nombre completo"
            value={formData.name}
            onChange={handleChange}
            required
            className={`form-input ${errors.name ? 'input-error' : ''}`}
          />
          {errors.name && <div className="error-text">{errors.name}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="correo" className="form-label">Correo electrónico</label>
          <input
            id="correo"
            name="correo"
            type="email"
            placeholder="correo@ejemplo.com"
            value={formData.correo}
            onChange={handleChange}
            required
            className={`form-input ${errors.correo ? 'input-error' : ''}`}
          />
          {errors.correo && <div className="error-text">{errors.correo}</div>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="ciudad" className="form-label">Ciudad</label>
          <input
            id="ciudad"
            name="ciudad"
            type="text"
            placeholder="Ciudad"
            value={formData.ciudad}
            onChange={handleChange}
            required
            className={`form-input ${errors.ciudad ? 'input-error' : ''}`}
          />
          {errors.ciudad && <div className="error-text">{errors.ciudad}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="tipoVpn" className="form-label">Tipo de VPN</label>
          <input
            id="tipoVpn"
            name="tipoVpn"
            type="text"
            placeholder="Perfil VPN"
            value={formData.tipoVpn}
            onChange={handleChange}
            required
            className={`form-input ${errors.tipoVpn ? 'input-error' : ''}`}
          />
          {errors.tipoVpn && <div className="error-text">{errors.tipoVpn}</div>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group department-group">
          <label className="form-label">Departamento</label>
          {renderDepartmentSelect()}
        </div>
        
        <div className="form-group">
          <label htmlFor="estado" className="form-label">Estado</label>
          <select
            id="estado"
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            required
            className={`form-input ${errors.estado ? 'input-error' : ''}`}
          >
            <option value="Teletrabajo">Teletrabajo</option>
            <option value="Trabajando">Trabajando</option>
            <option value="Eliminado">Eliminado</option>
          </select>
          {errors.estado && <div className="error-text">{errors.estado}</div>}
        </div>
      </div>

      <div className="form-group image-upload-group">
        <label className="form-label">Imagen de perfil</label>
        <div className="image-upload-container">
          <label htmlFor="image-upload" className="image-upload-label">
            Seleccionar imagen
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={isCompressing}
              className="image-upload-input"
            />
          </label>
          {errors.image && <span className="error-text">{errors.image}</span>}
        </div>
      </div>

      {imagePreview && (
        <div className="image-preview-container">
          <div className="image-preview-wrapper">
            <img 
              src={imagePreview} 
              alt="Vista previa" 
              className="image-preview"
            />
          </div>
        </div>
      )}
      
      <div className="form-actions">
        {isEditing && (
          <button 
            type="button" 
            onClick={onCancelEdit}
            className="btn btn-cancel"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
        )}
        <button 
          type="submit" 
          className={`btn btn-submit ${isSubmitting ? 'btn-loading' : ''}`}
          disabled={isCompressing || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner"></span>
              Procesando...
            </>
          ) : isEditing ? (
            'Actualizar Usuario'
          ) : (
            'Agregar Usuario'
          )}
        </button>
      </div>
    </form>
  );
}

export default AddUserForm;