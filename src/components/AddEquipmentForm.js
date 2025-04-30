import React, { useState, useEffect, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import './AddEquipmentForm.css';

function AddEquipmentForm({ 
  users, 
  onEquipmentAdded, 
  equipmentToEdit, 
  onEditEquipment, 
  onCancelEdit 
}) {
  const [formData, setFormData] = useState({
    nombre: '',
    type: '',
    model: '',
    assignedTo: '',
    imageBase64: ''
  });
  const [isCompressing, setIsCompressing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef();

  // Cargar datos del equipo a editar
  useEffect(() => {
    if (equipmentToEdit) {
      setFormData({
        nombre: equipmentToEdit.nombre || '',
        type: equipmentToEdit.type || '',
        model: equipmentToEdit.model || '',
        assignedTo: equipmentToEdit.assignedTo || '',
        imageBase64: equipmentToEdit.imageBase64 || ''
      });
      setIsEditing(true);
    } else {
      resetForm();
    }
  }, [equipmentToEdit]);

  const resetForm = () => {
    setFormData({
      nombre: '',
      type: '',
      model: '',
      assignedTo: '',
      imageBase64: ''
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsEditing(false);
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'nombre requerido';
    if (!formData.type.trim()) newErrors.type = 'Tipo es requerido';
    if (!formData.model.trim()) newErrors.model = 'Modelo es requerido';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      setIsCompressing(true);
      try {
        const file = e.target.files[0];
        const options = {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 800,
          useWebWorker: true,
          fileType: 'image/webp'
        };
        
        const compressedFile = await imageCompression(file, options);
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({ ...prev, imageBase64: reader.result }));
          setIsCompressing(false);
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error("Error al comprimir:", error);
        setIsCompressing(false);
        setErrors(prev => ({ ...prev, image: 'Error al procesar la imagen' }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (isEditing && equipmentToEdit) {
        await onEditEquipment({
          id: equipmentToEdit.id,
          ...formData
        });
      } else {
        await onEquipmentAdded(formData);
      }
      resetForm();
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors(prev => ({ ...prev, form: 'Error al guardar los datos' }));
    }
  };

  return (
    <div className="form-container">
      <h3>{isEditing ? 'Editar Equipo' : 'Agregar Nuevo Equipo'}</h3>
      <form onSubmit={handleSubmit}>
        {isCompressing && <div className="loading-message">Comprimiendo imagen...</div>}
        {errors.form && <div className="error-message">{errors.form}</div>}
        
        {formData.imageBase64 && !isCompressing && (
          <div className="image-preview-container">
            <img src={formData.imageBase64} alt="Vista previa del equipo" />
          </div>
        )}


        <div className="form-row">
          <div className="form-group">
            <label htmlFor="nombre" className="form-label">Nombre de Equipo</label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Nombre de equipo"
              required
              className={`form-input ${errors.nombre ? 'input-error' : ''}`}
            />
            {errors.nombre && <div className="error-text">{errors.nombre}</div>}
          </div>





        <div className="form-row">
          <div className="form-group">
            <label htmlFor="type" className="form-label">Tipo de Equipo</label>
            <input
              id="type"
              name="type"
              type="text"
              value={formData.type}
              onChange={handleChange}
              placeholder="Ej: Laptop, Teléfono, Monitor"
              required
              className={`form-input ${errors.type ? 'input-error' : ''}`}
            />
            {errors.type && <div className="error-text">{errors.type}</div>}
          </div>
              </div>

          <div className="form-group">
            <label htmlFor="model" className="form-label">Modelo</label>
            <input
              id="model"
              name="model"
              type="text"
              value={formData.model}
              onChange={handleChange}
              placeholder="Ej: Dell XPS 15, iPhone 13"
              required
              className={`form-input ${errors.model ? 'input-error' : ''}`}
            />
            {errors.model && <div className="error-text">{errors.model}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group department-group">
            <label className="form-label">Asignar a</label>
            <select
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
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

          <div className="image-preview-container">
            <label>Imagen del Equipo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              ref={fileInputRef}
              disabled={isCompressing}
            />
            {errors.image && <div className="error-text">{errors.image}</div>}
          </div>
        </div>

        <div className="form-actions">
          {isEditing && (
            <button 
              type="button" 
              onClick={() => {
                onCancelEdit();
                resetForm();
              }}
              className="btn btn-cancel"
            >
              Cancelar
            </button>
          )}
          
          <button 
            type="submit" 
            disabled={isCompressing}
            className="btn btn-submit"
          >
            {isCompressing ? 'Guardando...' : (isEditing ? 'Actualizar Equipo' : 'Guardar Equipo')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddEquipmentForm;
