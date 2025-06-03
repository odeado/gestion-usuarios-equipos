import React, { useState, useEffect } from 'react';
import './EquipDetailsModal.css';

function EquipDetailsModal({ equipment, onEdit, onClose, users }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedEquipment, setEditedEquipment] = useState({...equipment});
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

    // Inicializar con todos los campos necesarios
useEffect(() => {
  if (equipment) {
    setEditedEquipment({
      nombre: equipment.nombre || '',
      type: equipment.type || '',
      ciudad: equipment.ciudad || '',
      estado: equipment.estado || '',
      lugar: equipment.lugar || '',
      descripcion: equipment.descripcion || '',
      marca: equipment.marca || '',
      model: equipment.model || '',
      serialNumber: equipment.serialNumber || '',
      IpEquipo: equipment.IpEquipo || '',
      assignedTo: equipment.assignedTo || ''
      
    });
  }
}, [equipment]);

const validateForm = () => {
  const newErrors = {};
  if (!editedEquipment.nombre?.trim()) newErrors.nombre = 'Nombre es requerido';
  if (!editedEquipment.type?.trim()) newErrors.type = 'Tipo es requerido';
  if (!editedEquipment.model?.trim()) newErrors.model = 'Modelo es requerido';
  if (!editedEquipment.serialNumber?.trim()) newErrors.serialNumber = 'Número de serie es requerido';
  if (!editedEquipment.assignedTo?.trim()) newErrors.assignedTo = 'Debe asignar a un usuario';
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

 // En EquipDetailsModal.js
const handleSave = async () => {
  if (!validateForm()) return;
  
  setIsSaving(true);
  try {
    // Asegurarse de incluir todos los campos necesarios
     const equipmentToUpdate = {
      id: equipment.id, // Esto es crítico
      ...editedEquipment
    };
    
    console.log('Enviando datos:', equipmentToUpdate); // Para depuración
    await onEdit(equipmentToUpdate);
    setIsEditing(false);
  } catch (error) {
    console.error("Error al guardar:", error);
    setErrors({ form: error.message || 'Error al guardar los cambios' });
  } finally {
    setIsSaving(false);
  }
};

    const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedEquipment(prev => ({ ...prev, [name]: value }));
    // Limpiar error del campo al modificar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="equipment-modalE">
      <div className="modal-contentE">
        <div className="modal-headerE">
          <h3>{isEditing ? 'Editar Equipo' : 'Detalles del Equipo'}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-bodyE">
          {isEditing ? (
            // MODO EDICIÓN
            <div className="edit-form">
                {errors.form && <div className="error-message">{errors.form}</div>}

              <div className="form-groupE">
                <label>Nombre:</label>
                <input
                  name="nombre"
                  value={editedEquipment.nombre}
                  onChange={handleInputChange}
                  className={errors?.nombre ? 'error' : ''}
                />
                {errors?.nombre && <span className="error-message">{errors.nombre}</span>}    
              </div>
              
              <div className="form-groupE">
                <label>Tipo:</label>
                <input
                  name="type"
                  value={editedEquipment.type}
                  onChange={handleInputChange}
                  className={errors?.type ? 'error' : ''}
                />
                {errors?.type && <span className="error-message">{errors.type}</span>}
              </div>

              <div className="form-groupE">
  <label>Marca:</label>
  <input
    name="marca"
    value={editedEquipment.marca}
    onChange={handleInputChange}
    className={errors?.marca ? 'error' : ''}
  />
  {errors?.marca && <span className="error-message">{errors.marca}</span>}
</div>

<div className="form-groupE">
  <label>Modelo:</label>
  <input
    name="model"
    value={editedEquipment.model}
    onChange={handleInputChange}
    className={errors?.model ? 'error' : ''}
  />
  {errors?.model && <span className="error-message">{errors.model}</span>}
</div>

<div className="form-groupE">
  <label>Número de Serie:</label>
  <input
    name="serialNumber"
    value={editedEquipment.serialNumber}
    onChange={handleInputChange}
    className={errors?.serialNumber ? 'error' : ''}
  />
  {errors?.serialNumber && <span className="error-message">{errors.serialNumber}</span>}
</div>

<div className="form-groupE">
  <label>Asignado a:</label>
  <select
    name="assignedTo"
    value={editedEquipment.assignedTo}
    onChange={handleInputChange}
    className={errors?.assignedTo ? 'error' : ''}
  >
    <option value="">Seleccione un usuario...</option>
    {users.map(user => (
      <option key={user.id} value={user.id}>
        {user.name}
      </option>
    ))}
  </select>
  {errors?.assignedTo && <span className="error-message">{errors.assignedTo}</span>}
</div>
              
              <div className="form-groupE">
                <label>Estado:</label>
                <input
                  name="estado"
                  value={editedEquipment.estado}
                  onChange={handleInputChange}
                  className={errors?.estado ? 'error' : ''}
              />
                {errors?.estado && <span className="error-message">{errors.estado}</span>}
              </div>
              
              <div className="form-groupE">
                <label>IP Equipo:</label>
                <input
                  name="IpEquipo"
                  value={editedEquipment.IpEquipo}
                  onChange={handleInputChange}
                    className={errors?.IpEquipo ? 'error' : ''}
                />
                {errors?.IpEquipo && <span className="error-message">{errors.IpEquipo}</span>}
              </div>
              
              <div className="form-groupE">
                <label>Lugar:</label>
                <input
                  name="lugar"
                  value={editedEquipment.lugar}
                  onChange={handleInputChange}
                    className={errors?.lugar ? 'error' : ''}
                />
                {errors?.lugar && <span className="error-message">{errors.lugar}</span>}
              </div>
              
               <div className="modal-actions">
                <button 
                  className="save-btn" 
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
                <button 
                  className="cancel-btn"
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* MODO VISUALIZACIÓN (igual que antes) */}
              <div className="detail-rowE">
                <span className="detail-labelE">Nombre:</span>
                <span>{equipment.nombre}</span>
              </div>
                <div className="detail-rowE">
                <span className="detail-labelE">Tipo:</span>
                <span>{equipment.type}</span>
                </div>
                <div className="detail-rowE">
                <span className="detail-labelE">Estado:</span>
                <span>{equipment.estado}</span>
                </div>
                <div className="detail-rowE">
                <span className="detail-labelE">IP Equipo:</span>
                <span>{equipment.IpEquipo}</span>
                </div>
                <div className="detail-rowE">
                <span className="detail-labelE">Lugar:</span>
                <span>{equipment.lugar}</span>
                </div>
              {/* ... otros campos ... */}
              
              <div className="modal-actions">
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="edit-btn"
                >
                  Editar
                </button>
                <button 
                  onClick={onClose} 
                  className="cancel-btn"
                >
                  Cerrar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default EquipDetailsModal;