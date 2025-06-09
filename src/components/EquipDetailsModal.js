import React, { useState, useEffect } from 'react';
import './EquipDetailsModal.css';

function EquipDetailsModal({ equipment = {}, onEdit, onClose, users = [], currentIndex, totalEquipment, onNext, onPrev, user }) {
  

  const [isMobile, setIsMobile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedEquipment, setEditedEquipment] = useState({...equipment});
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});


 // Función para touch events

   const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);




  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
  // No permitir gestos durante la edición
  if (isEditing) return;
  
  if (!touchStart || !touchEnd) return;
  
  const distance = touchStart - touchEnd;
  const isLeftSwipe = distance > 50; // Umbral para "siguiente"
  const isRightSwipe = distance < -50; // Umbral para "anterior"

  if (isLeftSwipe && currentIndex < users.length - 1) {
    onNext();
  } else if (isRightSwipe && currentIndex > 0) {
    onPrev();
  }

  setTouchStart(null);
  setTouchEnd(null);
};


  // fin Manejo de eventos táctiles


  // Obtener información del usuario asignado
  const assignedUser = users.find(user => user.id === equipment.assignedTo);



 // Efecto para detectar si es móvil
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768); // 768px es un breakpoint común para móviles
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);




const handleNext = () => {
  if (currentIndex < users.length - 1 && onNext) {
    onNext();
  }
};

const handlePrev = () => {
  if (currentIndex > 0 && onPrev) {
    onPrev();
  }
};

const handleClose = () => {
  setIsEditing(false); // Sale del modo edición si está activo
  onClose(); // Cierra el modal
};
 
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

      procesador: equipment.procesador || '',
      ram: equipment.ram || '',
      discoDuro: equipment.discoDuro || '',
      tarjetaGrafica: equipment.tarjetaGrafica || '',

      IpEquipo: equipment.IpEquipo || '',
      assignedTo: equipment.assignedTo || '',
      imageBase64: equipment.imageBase64 || ''
      
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


const getEstadoColor = (estado) => {
    const colors = {
      'Teletrabajo': '#4caf50',
      'Trabajando': '#ffeb3b',
      'Eliminado': '#f44336',
     
    };
    return colors[estado] || '#666';
  };

 // En EquipDetailsModal.js
const handleSave = async () => {
    if (!validateForm()) return;
    
    setIsSaving(true);
    try {
      const equipmentToUpdate = {
        id: equipment.id,
        ...editedEquipment
      };
      
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        
        setEditedEquipment(prev => ({ ...prev, imageBase64: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };


  

  return (
    <div className="equipment-modalE" onClick={handleClose}>
    <div className="modal-contentE" onClick={e => e.stopPropagation()}>
        <div className="modal-headerE">
          <h3>{isEditing ? 'Editar Equipo' : 'Datos Equipo'}</h3>
          <div className="equipment-counter">
            {currentIndex + 1} / {totalEquipment}
          </div>
          <button className="close-btn" onClick={handleClose}>Cerrar</button>
        </div>
        
        <div className="modal-bodyE">
      
          
          {isEditing ? (
           
            <div className="edit-form">
                {errors.form && <div className="error-message">{errors.form}</div>}


                  <div className="image-upload-containerE">
                  <label>Imagen del Equipo:</label>
                  {editedEquipment.imageBase64 ? (
                   <div className="image-previewE">
                  {editedEquipment.imageBase64.startsWith('data:image/') ? (
                  <img 
                  src={editedEquipment.imageBase64}
                  alt="Vista previa" 
                  className="equipment-image-preview"
                  onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'ruta/a/imagen/por/defecto.jpg';
                }}
                />
                ) : (
                <p className="image-error">Formato de imagen no válido</p>
              )}


                    <div className="image-actions">
                      <label className="change-image-btn">
                        Cambiar imagen
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleImageChange}
                          style={{ display: 'none' }}
                        />
                      </label>

                    <button 
                      type="button" 
                      className="remove-image-btn"
                         onClick={() => setEditedEquipment(prev => ({ ...prev, imageBase64: '' }))}
                      >
                      Eliminar imagen
                    </button>
                  </div>
                  </div>
                ) : (
                   <div className="upload-image-containerE">
                    <label className="upload-image-labelE">
                      <span>+ Seleccionar imagen</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                )}
              </div>


<div className="form-groupDatosE">
              <div className="form-groupE">
                <label>Nombre:</label>
                <input
                  name="nombre"
                  value={editedEquipment.nombre}
                  onChange={handleInputChange}
                  className={`form-inputE ${errors.nombre ? 'error' : ''}`}
                  
                />
                {errors?.nombre && <span className="error-message">{errors.nombre}</span>}    
              </div>
              
              <div className="form-groupE">
                <label>Tipo:</label>
                <input
                  name="type"
                  value={editedEquipment.type}
                  onChange={handleInputChange}
                  className={'form-inputE ' + (errors?.type ? 'error' : '')}
                  
                />
                {errors?.type && <span className="error-message">{errors.type}</span>}
              </div>

              <div className="form-groupE">
          <label>Marca:</label>
            <input
          name="marca"
         value={editedEquipment.marca}
          onChange={handleInputChange}
          className={'form-inputE ' + (errors?.marca ? 'error' : '')}
            />
            {errors?.marca && <span className="error-message">{errors.marca}</span>}
          </div>

          <div className="form-groupE">
            <label>Modelo:</label>
            <input
              name="model"
              value={editedEquipment.model}
              onChange={handleInputChange}
              className={'form-inputE' + (errors?.model ? 'error' : '')}
            />
            {errors?.model && <span className="error-message">{errors.model}</span>}
          </div>

          <div className="form-groupE">
            <label>Número de Serie:</label>
            <input
              name="serialNumber"
              value={editedEquipment.serialNumber}
              onChange={handleInputChange}
              className={'form-inputE' + (errors?.serialNumber ? 'error' : '')}
            />
            {errors?.serialNumber && <span className="error-message">{errors.serialNumber}</span>}
          </div>

          <div className="form-groupE">
            <label>Asignado a:</label>
            <select
              name="assignedTo"
              value={editedEquipment.assignedTo}
              onChange={handleInputChange}
              className={'form-group-select' + (errors?.assignedTo ? 'error' : '')}
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
                              className={'form-inputE' + (errors?.estado ? 'error' : '')}
                          />
                            {errors?.estado && <span className="error-message">{errors.estado}</span>}
                          </div>
              
                        <div className="form-groupE">
                          <label>IP Equipo:</label>
                          <input
                            name="IpEquipo"
                            value={editedEquipment.IpEquipo}
                            onChange={handleInputChange}
                              className={'form-inputE' + (errors?.IpEquipo ? 'error' : '')}
                          />
                          {errors?.IpEquipo && <span className="error-message">{errors.IpEquipo}</span>}
                        </div>
                        
                        <div className="form-groupE">
                          <label>Lugar:</label>
                          <input
                            name="lugar"
                            value={editedEquipment.lugar}
                            onChange={handleInputChange}
                              className={'form-inputE' + (errors?.lugar ? 'error' : '')}
                          />
                          {errors?.lugar && <span className="error-message">{errors.lugar}</span>}
                        </div>

                        <div className="form-groupE">
                          <label>Descripción:</label>
                          <textarea
                            name="descripcion"
                            value={editedEquipment.descripcion}
                            onChange={handleInputChange}
                            className={'form-textareaE' + (errors?.descripcion ? 'error' : '')}
                          />
                          {errors?.descripcion && <span className="error-message">{errors.descripcion}</span>}
                        </div>
<label className='titulo-datos'>Hardware</label>
                        <div className="form-groupE">
                          <label>Procesador:</label>
                          <input
                            name="procesador"
                            value={editedEquipment.procesador}
                            onChange={handleInputChange}
                            className={'form-inputE' + (errors?.procesador ? 'error' : '')}
                          />
                          {errors?.procesador && <span className="error-message">{errors.procesador}</span>}
                        </div>
                        <div className="form-groupE">
                          <label>RAM:</label>
                          <input
                            name="ram"
                            value={editedEquipment.ram}
                            onChange={handleInputChange}
                            className={'form-inputE' + (errors?.ram ? 'error' : '')}
                          />
                          {errors?.ram && <span className="error-message">{errors.ram}</span>}
                        </div>
                        <div className="form-groupE">
                          <label>Disco Duro:</label>
                          <input
                            name="discoDuro"
                            value={editedEquipment.discoDuro}
                            onChange={handleInputChange}
                            className={'form-inputE' + (errors?.discoDuro ? 'error' : '')}
                          />
                          {errors?.discoDuro && <span className="error-message">{errors.discoDuro}</span>}
                        </div>
                        <div className="form-groupE">
                          <label>Tarjeta Gráfica:</label>
                          <input
                            name="tarjetaGrafica"
                            value={editedEquipment.tarjetaGrafica}
                            onChange={handleInputChange}
                            className={'form-inputE' + (errors?.tarjetaGrafica ? 'error' : '')}
                          />
                          {errors?.tarjetaGrafica && <span className="error-message">{errors.tarjetaGrafica}</span>}
                        </div>
                      
                        
                        <div className="modal-actionsE">
                          <button 
                            className="save-btn" 
                            onClick={handleSave}
                            disabled={isSaving}
                          >
                  {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
           <button 
  className="cancel-btn"
  onClick={() => {
    setIsEditing(false);
    setEditedEquipment({...equipment});
  }}
  disabled={isSaving}
>
  Cancelar
</button>
              </div>
            </div>
            </div>
          ) : (
            
             

  <div className="view-mode-container"
   onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
  >
              
              <div className="equipment-details-container">
                <div className="equipment-header">
            
               {equipment.imageBase64 && equipment.imageBase64.startsWith('data:image/') && (
                 
                  <div className="equipment-image-section">
                    <img
                    src={equipment.imageBase64} 
                    alt={equipment.nombre}
                    className="equipment-image-view"
                    />
              </div>
            )}



              <div className="equipment-data-section">
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
                


                <span className="status-badge" style={{ 
                      color: getEstadoColor(equipment.estado),
                      backgroundColor: `${getEstadoColor(equipment.estado)}20`
                    }}>
                      {equipment.estado}
                    </span>


                </div>
                <div className="detail-rowE">
                <span className="detail-labelE">IP Equipo:</span>
                <span>{equipment.IpEquipo}</span>
                </div>
                <div className="detail-rowE">
                <span className="detail-labelE">Lugar:</span>
                <span>{equipment.lugar}</span>
                </div>
                </div>
                </div>
                <div className="equipment-data-section">

                <div className="detail-rowE">
                <span className="detail-labelE">Procesador:</span>
                <span>{equipment.procesador}</span>
                </div>
                <div className="detail-rowE">
                <span className="detail-labelE">Ram:</span>
                <span>{equipment.ram}</span>
                </div>
                <div className="detail-rowE">
                <span className="detail-labelE">Disco Duro:</span>
                <span>{equipment.discoDuro}</span>
                </div>
                <div className="detail-rowE">
                <span className="detail-labelE">Tarjeta Gráfica:</span>
                <span>{equipment.tarjetaGrafica}</span>
                </div>


</div>
                

                

</div>

     {/* Sección de información del usuario asignado */}
                {assignedUser && (
                  <div className="assigned-user-section">
                    <h4>Usuario Asignado</h4>
                    <div className="user-infoE">
                      {assignedUser.imageBase64 ? (
                        <img 
                          src={assignedUser.imageBase64} 
                          alt={assignedUser.name}
                          className="user-photo"
                        />
                      ) : (
                        <div className="user-photo-placeholder">
                          {assignedUser.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="user-details">
                        <div className="user-name">{assignedUser.name}</div>
                        <div className="user-email">{assignedUser.email}</div>
                        {assignedUser.department && (
                          <div className="user-department">{assignedUser.department}</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}



                
              {/* ... otros campos ... */}
              
              <div className="modal-actionsE">
                <div className="navigation-buttons">
                   <button 
                    onClick={handlePrev} 
                    disabled={currentIndex === 0}
                    className="nav-button prev-button"
                  >
                    &larr; Anterior
                  </button>

                <button 
                  onClick={() => setIsEditing(true)} 
                  className="edit-btn"
                >
                  Editar
                </button>

                <button 
                    onClick={handleNext} 
                    disabled={currentIndex === totalEquipment - 1}
                  className="nav-button next-button"
                  >
                    Siguiente &rarr;
                  </button>
              </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EquipDetailsModal;