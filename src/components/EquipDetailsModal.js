import React, { useState, useEffect, useMemo } from 'react';
import './EquipDetailsModal.css';

function EquipDetailsModal({ equipment = {}, onClose, onEdit, users = [], currentIndex, totalEquipment, onNext, onPrev, user, onOpenUserModal }) {
  // Estado para manejar la edición del equipo
  const [isEditing, setIsEditing] = useState(false);
  const [editedEquipment, setEditedEquipment] = useState({...equipment});
  const [isMobile, setIsMobile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  // Función para touch events
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isSwiping, setIsSwiping] = useState(false);


// Función para normalizar arrays
  const normalizeArray = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return [value];
  };

  // Usuarios asignados con normalización
  const assignedUsers = useMemo(() => {
    const userIdsArray = normalizeArray(editedEquipment.usuariosAsignados);
    return userIdsArray
      .map(userId => users.find(u => u.id === userId))
      .filter(user => user !== undefined);
  }, [editedEquipment.usuariosAsignados, users]);


 

  function getAssignedUsers(userIds) {
    if (!userIds) return [];
    const userIdsArray = Array.isArray(userIds) ? userIds : [userIds].filter(Boolean);
    return userIdsArray
      .map(userId => users.find(u => u.id === userId))
      .filter(user => user !== undefined);
  }

  const getEstadoColor = (estado) => {
    const colors = {
      'En uso': '#4caf50',
      'Mantenimiento': '#ffeb3b',
      'Eliminado': '#f44336',
    };
    return colors[estado] || '#666';
  };

  // Inicializar datos del equipo
  useEffect(() => {
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
      windows: equipment.windows || '',
      antivirus: equipment.antivirus || '',
      office: equipment.office || '',
      IpEquipo: Array.isArray(equipment.IpEquipo) ? equipment.IpEquipo : [],
      usuariosAsignados: Array.isArray(equipment.usuariosAsignados) 
        ? equipment.usuariosAsignados 
        : (equipment.usuariosAsignados ? [equipment.usuariosAsignados] : []),
      imageBase64: equipment.imageBase64 || ''
    });
  }, [equipment]);

  const validateForm = () => {
    const newErrors = {};
    if (!editedEquipment.nombre?.trim()) newErrors.nombre = 'Nombre es requerido';
    if (!editedEquipment.type?.trim()) newErrors.type = 'Tipo es requerido';
    if (!editedEquipment.model?.trim()) newErrors.model = 'Modelo es requerido';
    if (!editedEquipment.serialNumber?.trim()) newErrors.serialNumber = 'Número de serie es requerido';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setIsSaving(true);
    try {
      const equipmentToUpdate = {
        id: equipment.id,
        ...editedEquipment,
        usuariosAsignados: Array.isArray(editedEquipment.usuariosAsignados)
          ? editedEquipment.usuariosAsignados
          : []
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

  const handleOpenUserModal = (userId) => {
    if (onOpenUserModal) {
      onClose(); // Cierra primero el modal de equipos
    onOpenUserModal(userId); // Luego abre el modal de usuario
    }
  };

  // Manejo de eventos táctiles
  const handleTouchStart = (e) => {
  setTouchStart(e.targetTouches[0].clientX);
  setTouchEnd(null); // Reset touchEnd
};

  const handleTouchMove = (e) => {
    if (!touchStart) return;
    setTouchEnd(e.targetTouches[0].clientX);
    e.preventDefault(); // Prevenir scroll horizontal
};

 const handleTouchEnd = () => {
  if (!touchStart || !touchEnd || isEditing) return;
  
  const distance = touchStart - touchEnd;
  const isLeftSwipe = distance > 50; // Umbral para "siguiente"
  const isRightSwipe = distance < -50; // Umbral para "anterior"

  if (isLeftSwipe && currentIndex < totalEquipment - 1) {
    onNext();
  } else if (isRightSwipe && currentIndex > 0) {
    onPrev();
  }

  setTouchStart(null);
  setTouchEnd(null);
};
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
    if (currentIndex < totalEquipment - 1 && onNext) {
      onNext();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0 && onPrev) {
      onPrev();
    }
  };

  const handleClose = (e) => {
    if (e) e.stopPropagation();
    onClose();
  };

  return (
    <div 
      className="equipment-modalE" 
      onClick={e => e.stopPropagation()}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="modal-contentE" onClick={e => e.stopPropagation()}>
        <div className="modal-headerE">
          <div className="equipment-counter">
            {currentIndex + 1} / {totalEquipment}
          </div>
          <button className="close-btnE" onClick={handleClose}>×</button>
          <h2>{isEditing ? 'Editar Equipo' : equipment.nombre}</h2>
        </div>
        
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

            <div className="form-fields-container">
              <div className="form-groupDatosE">
                <div className="form-groupE">
                  <label>Nombre:</label>
                  <input
                    name="nombre"
                    value={editedEquipment.nombre}
                    onChange={handleInputChange}
                    className={`form-inputE ${errors.nombre ? 'error' : ''}`}
                    placeholder="Ingrese el nombre del equipo"
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
  name="usuariosAsignados"
  multiple
  value={normalizeArray(editedEquipment.usuariosAsignados)}
  onChange={(e) => {
    const selectedId = e.target.value;
    setEditedEquipment(prev => {
      const currentSelection = normalizeArray(prev.usuariosAsignados);
      const newSelection = currentSelection.includes(selectedId)
        ? currentSelection.filter(id => id !== selectedId)
        : [...currentSelection, selectedId];
      
      return { ...prev, usuariosAsignados: newSelection };
    });
  }}
  className="form-group-select"
  size="5"
  onClick={(e) => e.preventDefault()}
>
  {users.map(user => (
    <option 
      key={user.id} 
      value={user.id}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {user.name} - {user.department || 'Sin departamento'}
    </option>
  ))}
</select>
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
                    value={Array.isArray(editedEquipment.IpEquipo) ? editedEquipment.IpEquipo.join(', ') : editedEquipment.IpEquipo || ''}
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
                
                <div className="form-groupE">
                  <label>Sistema Operativo:</label>
                  <input
                    name="windows"
                    value={editedEquipment.windows}
                    onChange={handleInputChange}
                    className={'form-inputE' + (errors?.windows ? 'error' : '')}
                  />
                  {errors?.windows && <span className="error-message">{errors.windows}</span>}
                </div>
                
                <div className="form-groupE">
                  <label>Antivirus:</label>
                  <input
                    name="antivirus"
                    value={editedEquipment.antivirus}
                    onChange={handleInputChange}
                    className={'form-inputE' + (errors?.antivirus ? 'error' : '')}
                  />
                  {errors?.antivirus && <span className="error-message">{errors.antivirus}</span>}
                </div>
                
                <div className="form-groupE">
                  <label>Office:</label>
                  <input
                    name="office"
                    value={editedEquipment.office}
                    onChange={handleInputChange}
                    className={'form-inputE' + (errors?.office ? 'error' : '')}
                  />
                  {errors?.office && <span className="error-message">{errors.office}</span>}
                </div>
              
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
          <div className="view-mode-container">
            <div className="equipment-details-container">
              <div className="equipment-header">
                {equipment.imageBase64?.startsWith('data:image/') && (
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
                  <span className="detail-labelE">Tipo:</span>
                  <span>{equipment.type}</span>
                </div>

                <div className="detail-rowE">
                  <span className="detail-labelE">Marca:</span>
                  <span>{equipment.marca}</span>
                </div>

                <div className="detail-rowE">
                  <span className="detail-labelE">Modelo</span>
                  <span>{equipment.model}</span>
                </div>

                <div className="detail-rowE">
                  <span className="detail-labelE">Número de Serie:</span>
                  <span>{equipment.serialNumber}</span> 
                </div>

                <div className="detail-rowE">
                  <span className="status-badge">Estado:</span> 
                  <span style={{ 
                    color: getEstadoColor(equipment.estado), 
                    backgroundColor: `${getEstadoColor(equipment.estado)}20`, 
                    width: 'max-content' 
                  }}>
                    {equipment.estado}
                  </span>
                </div>

                <div className="detail-rowE">
                  <span className="detail-labelE">IP Equipo:</span>
                  <span>
                    {Array.isArray(equipment.IpEquipo) 
                      ? equipment.IpEquipo.join(', ') 
                      : equipment.IpEquipo || 'No asignada'}
                  </span>
                </div>

                <div className="detail-rowE">
                  <span className="detail-labelE">Lugar:</span>
                  <span>{equipment.lugar}</span>
                </div>
              </div>

</div>

              <div className="equipment-data-section2">
                <div className="equipment-data-section">
                  <label className='titulo-datos'>Hardware</label>
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
              
                <div className="equipment-data-section">
                  <label className='titulo-datos'>Información Adicional</label>
                  
                  <div className="detail-rowE">
                    <span className="detail-labelE">Windows:</span>
                    <span>{equipment.windows}</span>
                  </div>

                  <div className="detail-rowE">
                    <span className="detail-labelE">Office:</span>
                    <span>{equipment.office}</span>
                  </div>

                  <div className="detail-rowE">
                    <span className="detail-labelE">Antivirus:</span>
                    <span>{equipment.antivirus}</span>
                  </div>

                  <div className="detail-rowE">
                    <span className="detail-labelE">Descripción:</span>
                    <p>{equipment.descripcion}</p>
                  </div>
                </div>
              </div>
            </div>

            {assignedUsers.length > 0 && (
              <div className="assigned-users-section">
                <h4>Usuarios Asignados ({assignedUsers.length})</h4>
                <div className="assigned-users-list">
                  {assignedUsers.map(user => (
                    <div 
                      key={user.id} 
                      className="user-infoE clickable-user"
                      onClick={(e) => {
    e.stopPropagation(); // Evita que el evento se propague al modal padre
    handleOpenUserModal(user.id);
  }}
>
                      {user.imageBase64 ? (
                        <img 
                          src={user.imageBase64} 
                          alt={user.name}
                          className="user-photo"
                        />
                      ) : (
                        <div className="user-photo-placeholder">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="user-details">
                        <div className="user-name">{user.name}</div>
                        <div className="user-email">{user.email || 'Sin email'}</div>
                        {user.department && (
                          <div className="user-department">{user.department}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="modal-actionsE">
              {isMobile ? (
    // Solo muestra el botón de editar en móvil
    <div className="mobile-edit-button">
      <button 
        onClick={() => setIsEditing(true)} 
        className="edit-btn"
      >
        Editar
      </button>
    </div>
  ) : (
    // Versión desktop
              <div className="navigation-buttonsM">
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
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EquipDetailsModal;