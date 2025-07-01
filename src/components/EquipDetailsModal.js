import React, { useState, useEffect, useMemo } from 'react';
import './EquipDetailsModal.css';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import AutocompleteInput from './AutocompleteInput';

function EquipDetailsModal({
  equipment = {},
  onClose, 
  onEdit,
  users = [],
  currentIndex,
  totalEquipment,
  onNext,
  onPrev,
  onOpenUserModal,
  availableIps = [],
  onAddNewIp,
  availableSerials = [],
  onAddNewSerial,
  availableModels = [],
  availableProcessors = [],
  setAvailableProcessors,
  availableBrands = [],
  onAssignmentChange,
  onBulkAssignmentChange
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedEquipment, setEditedEquipment] = useState({
    ...equipment,
    usuariosAsignados: equipment.usuariosAsignados || [],
    categoriasAsignacion: equipment.categoriasAsignacion || {}
  });
  const [isMobile, setIsMobile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [touchStartX, setTouchStartX] = useState(null);

// Efecto para detectar si es móvil
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Manejo de gestos táctiles
 const handleTouchStart = (e) => {
  if (!isMobile) return;
  setTouchStartX(e.touches[0].clientX);
  e.stopPropagation(); // Evita que el evento se propague
};


const handleTouchMove = (e) => {
  if (!isMobile || touchStartX === null) return;
  
  const touchEndX = e.touches[0].clientX;
  const diff = touchStartX - touchEndX;
  
  // Umbral para considerar un gesto (50px)
  if (diff > 50) {
    onNext();
    setTouchStartX(null);
  } else if (diff < -50) {
    onPrev();
    setTouchStartX(null);
  }
  
  e.stopPropagation(); // Evita que el evento se propague
};

const handleTouchEnd = () => {
  setTouchStartX(null);
};









  useEffect(() => {
    setEditedEquipment({
      ...equipment,
      usuariosAsignados: equipment.usuariosAsignados || [],
      categoriasAsignacion: equipment.categoriasAsignacion || {}
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
      await onEdit({
        ...editedEquipment,
        id: equipment.id,
        usuariosAsignados: editedEquipment.usuariosAsignados,
        categoriasAsignacion: editedEquipment.categoriasAsignacion
      });
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
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
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

  // Obtener usuarios asignados
  const assignedUsers = useMemo(() => {
    return users
      .filter(user => editedEquipment.usuariosAsignados?.includes(user.id))
      .map(user => ({
        ...user,
        categoria: editedEquipment.categoriasAsignacion?.[user.id] || 'casa'
      }));
  }, [users, editedEquipment.usuariosAsignados, editedEquipment.categoriasAsignacion]);

  // Usuarios disponibles para asignar
  const availableUsers = useMemo(() => {
    return users.filter(
      user => !editedEquipment.usuariosAsignados?.includes(user.id)
    );
  }, [users, editedEquipment.usuariosAsignados]);

  // Funciones de asignación
const handleAssignUsers = (selectedOptions) => {
  const selectedIds = selectedOptions.map(opt => opt.value);
  
  const updates = selectedIds.map(userId => ({
    userId,
    equipmentId: equipment.id,
    category: 'casa' // Valor por defecto
  }));

  // Notificar al padre
  if (typeof onBulkAssignmentChange === 'function') {
    onBulkAssignmentChange(updates);
  }

  // Actualizar estado local
  const newCategories = {...editedEquipment.categoriasAsignacion};
  selectedIds.forEach(id => newCategories[id] = 'casa');
  
  setEditedEquipment(prev => ({
    ...prev,
    usuariosAsignados: [...new Set([...prev.usuariosAsignados, ...selectedIds])],
    categoriasAsignacion: newCategories
  }));
};

const handleUnassignUser = (userId) => {
  // Notificar al padre
  if (typeof onAssignmentChange === 'function') {
    onAssignmentChange(userId, equipment.id, null);
  }

  // Actualizar estado local
  const newCategories = {...editedEquipment.categoriasAsignacion};
  delete newCategories[userId];
  
  setEditedEquipment(prev => ({
    ...prev,
    usuariosAsignados: prev.usuariosAsignados.filter(id => id !== userId),
    categoriasAsignacion: newCategories
  }));
};

const handleUserCategoryChange = (userId, category) => {
  // Notificar al padre
  if (typeof onAssignmentChange === 'function') {
    onAssignmentChange(userId, equipment.id, category);
  }

  // Actualizar estado local
  setEditedEquipment(prev => ({
    ...prev,
    categoriasAsignacion: {
      ...prev.categoriasAsignacion,
      [userId]: category
    }
  }));
};

  const handleUserClick = (userId) => {
    onClose();
    if (onOpenUserModal) {
      onOpenUserModal(userId);
    }
  };

  const renderIpSelect = () => {
    const currentIp = Array.isArray(editedEquipment.IpEquipo) && editedEquipment.IpEquipo.length > 0 
      ? editedEquipment.IpEquipo[0] 
      : editedEquipment.IpEquipo || '';

    const options = [
      ...availableIps.map(ip => ({ value: ip, label: ip })),
      ...(currentIp && !availableIps.includes(currentIp) ? 
        [{ value: currentIp, label: currentIp }] : [])
    ].filter(option => option.value);

    return (
      <div className="form-groupE">
        <label className="form-label">IP del Equipo</label>
        <CreatableSelect  
          isMulti={false}
          options={options}
          value={options.find(option => option.value === currentIp)}
          onChange={(selectedOption) => {
            const ipValue = selectedOption?.value || '';
            setEditedEquipment(prev => ({
              ...prev,
              IpEquipo: ipValue ? [ipValue] : []
            }));
          }}
          onCreateOption={(inputValue) => {
            const newIp = inputValue.trim();
            if (newIp) {
              onAddNewIp?.(newIp);
              setEditedEquipment(prev => ({
                ...prev,
                IpEquipo: [newIp]
              }));
            }
          }}
        />
      </div>
    );
  };

  const renderSerialSelect = () => {
    const currentSerial = editedEquipment.serialNumber || '';

    const options = [
      ...availableSerials.map(serial => ({ value: serial, label: serial })),
      ...(currentSerial && !availableSerials.includes(currentSerial) ? 
        [{ value: currentSerial, label: currentSerial }] : [])
    ].filter(option => option.value);

    return (
      <div className="form-groupE">
        <label>Número de Serie:</label>
        <CreatableSelect  
          isMulti={false}
          options={options}
          value={options.find(option => option.value === currentSerial)}
          onChange={(selectedOption) => {
            const serialValue = selectedOption?.value || '';
            setEditedEquipment(prev => ({
              ...prev,
              serialNumber: serialValue
            }));
          }}
          onCreateOption={(inputValue) => {
            const newSerial = inputValue.trim();
            if (newSerial) {
              setEditedEquipment(prev => ({
                ...prev,
                serialNumber: newSerial
              }));
              onAddNewSerial?.(newSerial);
            }
          }}
        />
        {errors?.serialNumber && <span className="error-message">{errors.serialNumber}</span>}
      </div>
    );
  };

  const getEstadoColor = (estado) => {
    const colors = {
      'En uso': '#4caf50',
      'Mantenimiento': '#ffeb3b',
      'Eliminado': '#f44336',
    };
    return colors[estado] || '#666';
  };

  // Verificación de consistencia de IDs
  useEffect(() => {
    if (editedEquipment.usuariosAsignados) {
      const invalidUsers = editedEquipment.usuariosAsignados.filter(
        userId => !users.some(u => u.id === userId)
      );
      
      if (invalidUsers.length > 0) {
        console.warn("Equipo tiene asignados usuarios que no existen:", invalidUsers);
        setEditedEquipment(prev => ({
          ...prev,
          usuariosAsignados: prev.usuariosAsignados.filter(
            userId => !invalidUsers.includes(userId)
          ),
          categoriasAsignacion: Object.fromEntries(
            Object.entries(prev.categoriasAsignacion || {}).filter(
              ([userId]) => !invalidUsers.includes(userId)
            )
          )
        }));
      }
    }
  }, [users, editedEquipment.usuariosAsignados]);

  return (
    <div className="equipment-modalE"
      onClick={e => e.stopPropagation()}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      >
      <div className="modal-contentE">
        <div className="modal-headerE">
          <div className="equipment-counter">
            {currentIndex + 1} / {totalEquipment}
          </div>
          <button className="close-btnE" onClick={onClose}>×</button>
          <h2>{isEditing ? 'Editar Equipo' : equipment.nombre || 'Detalles del Equipo'}</h2>
        </div>
        
        {isEditing ? (
          <div className="edit-form">
            {errors.form && <div className="error-message">{errors.form}</div>}

            <div className="image-upload-containerE">
              <label>Imagen del Equipo:</label>
              {editedEquipment.imageBase64 ? (
                <div className="image-previewE">
                  <img 
                    src={editedEquipment.imageBase64}
                    alt="Vista previa" 
                    className="equipment-image-preview"
                  />
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
                    className={`form-inputE ${errors.type ? 'error' : ''}`}
                  />
                  {errors?.type && <span className="error-message">{errors.type}</span>}
                </div>

                <div className="form-groupE">
                  <label>Marca:</label>
                  <input
                    name="marca"
                    value={editedEquipment.marca}
                    onChange={handleInputChange}
                    className={`form-inputE ${errors.marca ? 'error' : ''}`}
                  />
                  {errors?.marca && <span className="error-message">{errors.marca}</span>}
                </div>

                <div className="form-groupE">
                  <label>Modelo:</label>
                  <input
                    name="model"
                    value={editedEquipment.model}
                    onChange={handleInputChange}
                    className={`form-inputE ${errors.model ? 'error' : ''}`}
                  />
                  {errors?.model && <span className="error-message">{errors.model}</span>}
                </div>

                {renderSerialSelect()}
                {renderIpSelect()}

                <div className="form-groupE">
                  <label>Estado:</label>
                  <select
                    name="estado"
                    value={editedEquipment.estado}
                    onChange={handleInputChange}
                    className={`form-inputE ${errors.estado ? 'error' : ''}`}
                  >
                    <option value="Disponible">Disponible</option>
                    <option value="En uso">En uso</option>
                    <option value="Mantenimiento">Mantenimiento</option>
                    <option value="Eliminado">Eliminado</option>
                  </select>
                  {errors?.estado && <span className="error-message">{errors.estado}</span>}
                </div>
              
                <div className="form-groupE">
                  <label>Lugar:</label>
                  <input
                    name="lugar"
                    value={editedEquipment.lugar}
                    onChange={handleInputChange}
                    className={`form-inputE ${errors.lugar ? 'error' : ''}`}
                  />
                  {errors?.lugar && <span className="error-message">{errors.lugar}</span>}
                </div>

               <div className="form-groupE">
  <AutocompleteInput
   key={`processor-select-${editedEquipment.id}-${availableProcessors.length}`}  // Fuerza recreación al cambiar equipo
    value={editedEquipment.procesador || ''}
    onChange={(value) => {
      setEditedEquipment(prev => ({ ...prev, procesador: value }));
    }}
    options={availableProcessors.map(p => ({ 
      value: p, 
      label: p  
    }))}
    onAddNewOption={(newOption) => {
       console.log("ADD - Prev processors:", availableProcessors); // 🕵️‍♂️ Debug
      // Actualizar lista global de procesadores
       if (!availableProcessors.includes(newOption)) {
        setAvailableProcessors(prev => [...prev, newOption]);
      }
      // Actualizar el procesador en el equipo editado
      setEditedEquipment(prev => ({ ...prev, procesador: newOption }));
    }}
    onRemoveOption={(optionToRemove) => {
      setAvailableProcessors(prev => prev.filter(p => p !== optionToRemove));
      console.log("REMOVE - Prev processors:", availableProcessors); // 🕵️‍♂️ Debug
      // Actualizar lista global de procesadores
       if (editedEquipment.procesador === optionToRemove) {
        setEditedEquipment(prev => ({ ...prev, procesador: '' }));
      }
      
    }}
    placeholder="Ej: Intel i7, AMD Ryzen 5"
    label="Procesador"
    error={errors.procesador}
    enableDelete={true}
    
  />
</div>

                <div className="form-groupE">
                  <label>Descripción:</label>
                  <textarea
                    name="descripcion"
                    value={editedEquipment.descripcion}
                    onChange={handleInputChange}
                    className={`form-textareaE ${errors.descripcion ? 'error' : ''}`}
                  />
                  {errors?.descripcion && <span className="error-message">{errors.descripcion}</span>}
                </div>

                <div className="form-groupE">
                  <label>Usuarios Asignados:</label>
                  <div className="user-assignment-container">
                    <Select
                      isMulti
                      options={availableUsers.map(user => ({
                        value: user.id,
                        label: `${user.name} (${user.department})`
                      }))}
                      onChange={handleAssignUsers}
                      placeholder="Seleccionar usuarios para asignar..."
                      className="user-select"
                    />
                    
                    <div className="assigned-users-list">
                      {assignedUsers.length === 0 ? (
                        <p>No hay usuarios asignados</p>
                      ) : (
                        <div>
                          {['casa', 'oficina', 'remoto'].map(category => {
                            const categoryUsers = assignedUsers.filter(
                              user => (editedEquipment.categoriasAsignacion[user.id] || 'casa') === category
                            );

                            return categoryUsers.length > 0 && (
                              <div key={category} className="user-category-section">
                                <h4 className="user-category-title">
                                  {category === 'casa' && '🏠 En Casa'}
                                  {category === 'oficina' && '🏢 En Oficina'}
                                  {category === 'remoto' && '🌐 Remotos'}
                                </h4>
                                
                                <ul>
                                  {categoryUsers.map(user => (
                                    <li key={user.id} className="assigned-user-item">
                                      <div 
                                        className="user-info clickable-user"
                                        onClick={() => handleUserClick(user.id)}
                                      >
                                        {user.imageBase64 ? (
                                          <img 
                                            src={user.imageBase64} 
                                            alt={user.name}
                                            className="user-avatar"
                                          />
                                        ) : (
                                          <div className="user-avatar-placeholder">
                                            {user.name.charAt(0)}
                                          </div>
                                        )}
                                        <span className="user-name">{user.name}</span>
                                        <span className="user-department">{user.department}</span>
                                      </div>

                                      <div className="user-actions">
                                        <select
                                          value={editedEquipment.categoriasAsignacion[user.id] || 'casa'}
                                          onChange={(e) => handleUserCategoryChange(user.id, e.target.value)}
                                          className="category-select"
                                        >
                                          <option value="casa">Casa</option>
                                          <option value="oficina">Oficina</option>
                                          <option value="remoto">Remoto</option>
                                        </select>

                                        <button
                                          onClick={() => handleUnassignUser(user.id)}
                                          className="unassign-btn"
                                        >
                                          Quitar
                                        </button>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
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
                  onClick={() => setIsEditing(false)}
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
                    <span className="detail-labelE">Serie</span>
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

            {assignedUsers.length > 0 && (
              <div className="assigned-users-section">
                <h4>Usuarios Asignados ({assignedUsers.length})</h4>
                <div className="assigned-users-list">
                  {['casa', 'oficina', 'remoto'].map(category => {
                    const categoryUsers = assignedUsers.filter(
                      user => (editedEquipment.categoriasAsignacion[user.id] || 'casa') === category
                    );

                    return categoryUsers.length > 0 && (
                      <div key={category} className="user-category-section-view">
                        <h5 className="user-category-title-view">
                          {category === 'casa' && '🏠 En Casa'}
                          {category === 'oficina' && '🏢 En Oficina'}
                          {category === 'remoto' && '🌐 Remotos'}
                        </h5>
                        <div className="user-list-view">
                          {categoryUsers.map(user => (
                            <div 
                              key={user.id} 
                              className="user-infoE clickable-user"
                              onClick={() => handleUserClick(user.id)}
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
                                <div className="user-department">{user.department}</div>
                                <div className="user-category">
                                  {user.categoria}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="modal-actionsE">
              {isMobile ? (
                <div className="mobile-edit-button">
                  <button 
                    onClick={() => setIsEditing(true)} 
                    className="edit-btn"
                  >
                    Editar
                  </button>
                </div>
              ) : (
                <div className="navigation-buttonsM">
                  <button 
                    onClick={onPrev} 
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
                    onClick={onNext} 
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