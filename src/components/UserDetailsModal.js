import React, { useState, useMemo, useEffect } from 'react';
import './UserDetailsModal.css';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import AutocompleteInput from './AutocompleteInput';

function UserDetailsModal({ 
  user = {}, 
  onClose, 
  onEdit,
  users = [],
  equipment = [],
  onNext,
  onPrev,
  onOpenEquipmentModal,
  availableDepartments = [],
  onAssignmentChange,
  availableCorreos = [],
  setAvailableCorreos,
  onBulkAssignmentChange
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [touchStartX, setTouchStartX] = useState(null);
  const [editedUser, setEditedUser] = useState({
    ...user,
    equiposAsignados: user.equiposAsignados || [],
    categoriasTemporales: user.categoriasTemporales || {}
  });
  
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
    setEditedUser({
      ...user,
      equiposAsignados: user.equiposAsignados || [],
      categoriasTemporales: user.categoriasTemporales || {}
    });
  }, [user]);

  const validateForm = () => {
    const newErrors = {};
    if (!editedUser.name?.trim()) newErrors.name = 'Nombre es requerido';
    if (!editedUser.correo?.trim()) newErrors.correo = 'Correo es requerido';
    if (!editedUser.department?.trim()) newErrors.department = 'Departamento es requerido';

     setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
  if (!validateForm()) return;

  // Crear objeto final asegurando todos los campos
  const userToSave = {
    ...editedUser,
    id: user.id,
    equiposAsignados: editedUser.equiposAsignados || [],
    categoriasTemporales: Object.entries(editedUser.categoriasTemporales || {})
      .reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value || 'casa';
        }
        return acc;
      }, {})
  };

  console.log('Datos finales a guardar:', userToSave); // Verificar en consola

setIsSaving(true);
  try {
    await onEdit(userToSave);
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
    setEditedUser(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedUser(prev => ({ ...prev, imageBase64: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };


const getEstadoColor = (estado) => {
    const colors = {
      'Teletrabajo': '#4caf50',
      'Trabajando': '#ffeb3b',
      'Eliminado': '#f44336',
    };
    return colors[estado] || '#666';
  };



   // Obtener equipos asignados
  const assignedEquipment = useMemo(() => {
    return equipment.filter(eq => 
      editedUser.equiposAsignados?.includes(eq.id)
    );
  }, [equipment, editedUser.equiposAsignados]);

  // Equipos disponibles para asignar
  const availableEquipment = useMemo(() => {
    return equipment.filter(eq => 
      !editedUser.equiposAsignados?.includes(eq.id)
    );
  }, [equipment, editedUser.equiposAsignados]);

  const handleEquipmentClick = (equipmentItem) => {
    onClose();
    if (onOpenEquipmentModal) {
      onOpenEquipmentModal(equipmentItem.id);
    }
  };

const handleAssignEquipment = (selectedOptions) => {
  const selectedIds = selectedOptions.map(opt => opt.value);
  
  if (editedUser.equiposAsignados.length + selectedIds.length > 10) {
    alert('Máximo 10 equipos por usuario');
    return;
  }

  const updates = selectedIds.map(equipmentId => ({
    userId: user.id,
    equipmentId,
    category: 'casa' // Valor por defecto
  }));

  // Notificar al padre
  if (typeof onBulkAssignmentChange === 'function') {
    onBulkAssignmentChange(updates);
  }

  // Actualizar estado local
  const newCategories = {...editedUser.categoriasTemporales};
  selectedIds.forEach(id => newCategories[id] = 'casa');
  
  setEditedUser(prev => ({
    ...prev,
    equiposAsignados: [...new Set([...prev.equiposAsignados, ...selectedIds])],
    categoriasTemporales: newCategories
  }));
};

const handleUnassignEquipment = (equipmentId) => {
  // Notificar al padre
  if (typeof onAssignmentChange === 'function') {
    onAssignmentChange(user.id, equipmentId, null);
  }

  // Actualizar estado local
  const newCategories = {...editedUser.categoriasTemporales};
  delete newCategories[equipmentId];
  
  setEditedUser(prev => ({
    ...prev,
    equiposAsignados: prev.equiposAsignados.filter(id => id !== equipmentId),
    categoriasTemporales: newCategories
  }));
};

const handleCategoryChange = (equipmentId, category) => {
  // Notificar al padre
  if (typeof onAssignmentChange === 'function') {
    onAssignmentChange(user.id, equipmentId, category);
  }

  // Actualizar estado local
  setEditedUser(prev => ({
    ...prev,
    categoriasTemporales: {
      ...prev.categoriasTemporales,
      [equipmentId]: category
    }
  }));
};

  return (
    <div className="user-modalU" 
      onClick={e => e.stopPropagation()}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      >
      <div className="modal-contentU">
        <div className="modal-headerU">
          <div className="user-counter">
            {users.findIndex(u => u.id === user.id) + 1} / {users.length}
          </div>
          <button className="close-btnU" onClick={onClose}>×</button>
          <h2>{isEditing ? 'Editar Usuario' : user.name}</h2>
        </div>

        {isEditing ? (
          <div className="edit-form">
            {errors.form && <div className="error-message">{errors.form}</div>}

            <div className="image-upload-containerU">
              <label>Imagen del Usuario:</label>
              {editedUser.imageBase64 ? (
                <div className="image-previewU">
                  <img 
                    src={editedUser.imageBase64}
                    alt="Vista previa" 
                    className="user-image-preview"
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
                      onClick={() => setEditedUser(prev => ({ ...prev, imageBase64: '' }))}
                    >
                      Eliminar imagen
                    </button>
                  </div>
                </div>
              ) : (
                <div className="upload-image-containerU">
                  <label className="upload-image-labelU">
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
              <div className="form-groupDatosU">
                <div className="form-groupU">
                  <label>Nombre:</label>
                  <input
                    name="name"
                    value={editedUser.name}
                    onChange={handleInputChange}
                    className={`form-inputU ${errors.name ? 'error' : ''}`}
                    placeholder="Nombre completo"
                  />
                  {errors?.name && <span className="error-message">{errors.name}</span>}    
                </div>

               <div className="form-groupU">
  
  <AutocompleteInput
    key={`correo-select-${user.id}-${availableCorreos.length}`}
    value={editedUser.correo || ''}
    onChange={(value) => {
      setEditedUser(prev => ({ ...prev, correo: value }));
      if (errors.correo) setErrors(prev => ({ ...prev, correo: '' }));
    }}
    options={availableCorreos.map(c => ({ 
      value: c, 
      label: c  
    }))}
    onAddNewOption={(newCorreo) => {
      // Validar formato de correo
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newCorreo)) {
        setErrors(prev => ({ ...prev, correo: 'Formato de correo inválido' }));
        return;
      }
      
      // Actualizar lista global de correos
      if (!availableCorreos.includes(newCorreo)) {
        setAvailableCorreos(prev => [...prev, newCorreo].sort());
      }
      
      // Actualizar el correo en el usuario editado
      setEditedUser(prev => ({ ...prev, correo: newCorreo }));
    }}
    onRemoveOption={(correoToRemove) => {
      setAvailableCorreos(prev => prev.filter(c => c !== correoToRemove));
      
      // Si el correo que se está eliminando es el del usuario actual
      if (editedUser.correo === correoToRemove) {
        setEditedUser(prev => ({ ...prev, correo: '' }));
      }
    }}
    placeholder="Ej: usuario@empresa.com"
    label="Correo:"
    error={errors.correo}
    enableDelete={true}
  />
  {errors?.correo && <span className="error-message">{errors.correo}</span>}
</div>
                

                <div className="form-groupU">
                  <label>Departamento:</label>
                  <select
                    name="department"
                    value={editedUser.department}
                    onChange={handleInputChange}
                    className={`form-inputU ${errors.department ? 'error' : ''}`}
                  >
                    <option value="">Seleccione departamento</option>
                    {availableDepartments.map(dept => (
                      <option key={dept.id} value={dept.name}>{dept.name}</option>
                    ))}
                  </select>
                  {errors?.department && <span className="error-message">{errors.department}</span>}
                </div>

                <div className="form-groupU">
                  <label>Estado:</label>
                  <select
                    name="estado"
                    value={editedUser.estado}
                    onChange={handleInputChange}
                    className={`form-inputU ${errors.estado ? 'error' : ''}`}
                  >
                    <option value="Teletrabajo">Teletrabajo</option>
                    <option value="Trabajando">Trabajando</option>
                    <option value="Eliminado">Eliminado</option>
                  </select>
                  {errors?.estado && <span className="error-message">{errors.estado}</span>}
                </div>

                <div className="form-groupU">
                  <label>Tipo VPN:</label>
                  <input
                    name="tipoVpn"
                    value={editedUser.tipoVpn}
                    onChange={handleInputChange}
                    className={`form-inputU ${errors.tipoVpn ? 'error' : ''}`}
                  />
                  {errors?.tipoVpn && <span className="error-message">{errors.tipoVpn}</span>}
                </div>

                <div className="form-groupU">
                  <label>Ciudad:</label>
                  <input
                    name="ciudad"
                    value={editedUser.ciudad}
                    onChange={handleInputChange}
                    className={`form-inputU ${errors.ciudad ? 'error' : ''}`}
                  />
                  {errors?.ciudad && <span className="error-message">{errors.ciudad}</span>}
                </div>
 {/* codigo de edicion modal */}
                <div className="form-groupU">
                  <label>Equipos Asignados:</label>
                  <div className="equipment-assignment-container">
                    <Select
                      isMulti
                      options={availableEquipment.map(eq => ({
                        value: eq.id,
                        label: `${eq.nombre} (${eq.type})`
                      }))}
                      onChange={handleAssignEquipment}
                      placeholder="Seleccione equipos para asignar..."
                      className="equipment-select"
                    />
                    
<div className="assigned-equipment-list">
  {assignedEquipment.length === 0 ? (
    <p>No hay equipos asignados</p>
  ) : (
    <div>
      {/* Sección de Equipos en Casa */}
      <div className="equipment-category-section">
        <h4 className="equipment-category-title">Equipos en Casa</h4>
        <ul>
          {assignedEquipment
            .filter(eq => (editedUser.categoriasTemporales[eq.id] || 'casa') === 'casa')
            .map(eq => (
              <li key={eq.id}>
                <div className="equipment-infoU">
                  <span className="name">{eq.nombre}</span>
                  <span className="type">{eq.type}</span>
                  <span className="ip">{eq.IpEquipo || 'Sin IP'}</span>
                </div>
                
                <div className="equipment-actions">
                  <select
                    value={editedUser.categoriasTemporales[eq.id] || 'casa'}
                    onChange={(e) => handleCategoryChange(eq.id, e.target.value)}
                    className="category-select"
                  >
                    <option value="casa">Casa</option>
                    <option value="oficina">Oficina</option>
                    <option value="remoto">Remoto</option>
                  </select>
                  
                  <button 
                    onClick={() => handleUnassignEquipment(eq.id)}
                    className="unassign-btn"
                  >
                    Desasignar
                  </button>
                </div>
              </li>
          ))}
        </ul>
      </div>

      {/* Sección de Equipos en Oficina */}
      <div className="equipment-category-section">
        <h4 className="equipment-category-title">Equipos en Oficina</h4>
        <ul>
          {assignedEquipment
            .filter(eq => editedUser.categoriasTemporales[eq.id] === 'oficina')
            .map(eq => (
              <li key={eq.id}>
                <div className="equipment-infoU">
                  <span className="name">{eq.nombre}</span>
                  <span className="type">{eq.type}</span>
                  <span className="ip">{eq.IpEquipo || 'Sin IP'}</span>
                </div>
                   <div className="equipment-actions">
                  <select
                    value={editedUser.categoriasTemporales[eq.id] || 'oficina'}
                    onChange={(e) => handleCategoryChange(eq.id, e.target.value)}
                    className="category-select"
                  >
                    <option value="casa">Casa</option>
                    <option value="oficina">Oficina</option>
                    <option value="remoto">Remoto</option>
                  </select>
                  
                  <button 
                    onClick={() => handleUnassignEquipment(eq.id)}
                    className="unassign-btn"
                  >
                    Desasignar
                  </button>
                </div>
              </li>
          ))}
        </ul>
      </div>

      {/* Sección de Equipos Remotos */}
      <div className="equipment-category-section">
        <h4 className="equipment-category-title">Equipos Remotos</h4>
        <ul>
          {assignedEquipment
            .filter(eq => editedUser.categoriasTemporales[eq.id] === 'remoto')
            .map(eq => (
              <li key={eq.id}>
                <div className="equipment-infoU">
                  <span className="name">{eq.nombre}</span>
                  <span className="type">{eq.type}</span>
                  <span className="ip">{eq.IpEquipo || 'Sin IP'}</span>
                </div>
                
                <div className="equipment-actions">
                  <select
                    value={editedUser.categoriasTemporales[eq.id] || 'remoto'}
                    onChange={(e) => handleCategoryChange(eq.id, e.target.value)}
                    className="category-select"
                  >
                    <option value="casa">Casa</option>
                    <option value="oficina">Oficina</option>
                    <option value="remoto">Remoto</option>
                  </select>
                  
                  <button 
                    onClick={() => handleUnassignEquipment(eq.id)}
                    className="unassign-btn"
                  >
                    Desasignar
                  </button>
                </div>
              </li>
          ))}
        </ul>
      </div>
    </div>
  )}
</div>
                  </div>
                </div>
              </div>

              <div className="modal-actionsU">
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
          <div className='caja-modalU'>
          <div className="user-details-container">
            <div className="user-header">
              {user.imageBase64?.startsWith('data:image/') && (
                <div className="user-image-section">
                  <img
                    src={user.imageBase64}
                    alt={user.name}
                    className="user-image-view"
                  />
                </div>
              )}
            
              <div className="detail-nameU">
                <div className='nombre-apellidoM'>
                  <div className="nombreM">{user.name.split(' ')[0]}</div>
                  <div className="apellidoM">{user.name.split(' ').slice(1).join(' ')}</div>
                </div>
              </div>
            </div>
            
            <div className="user-data-section">
              <div className="detail-rowU">
                <span className="detail-labelU">Correo:</span>
                <span>{user.correo}</span>
              </div>

              <div className="detail-rowU">
                <span className="detail-labelU">Tipo VPN:</span>
                <span>{user.tipoVpn}</span>
              </div>

              <div className="detail-rowU">
                <span className="detail-labelU">Departamento:</span>
                <span>{user.department}</span>
              </div>

              <div className="detail-rowU">
                <span className="status-badge">Estado:</span> 
                <span style={{ 
                  color: getEstadoColor(user.estado), 
                  backgroundColor: `${getEstadoColor(user.estado)}20`, 
                  maxWidth: 'max-content',
                  
                }}>
                  {user.estado}
                </span>
              </div>

              <div className="detail-rowU">
                <span className="detail-labelU">Ciudad:</span>
                <span>{user.ciudad || 'No especificada'}</span>
              </div>
            </div>
          </div>
 {/* codigo visual del modal*/}
<div className="assigned-equipment-section">
  <h4>Equipos Asignados ({assignedEquipment.length})</h4>
  {assignedEquipment.length > 0 ? (
    <div>
      {['casa', 'oficina', 'remoto'].map(category => {
        const categoryEquipments = assignedEquipment.filter(
          eq => (user.categoriasTemporales?.[eq.id] || 'casa') === category
        );

        return categoryEquipments.length > 0 && (
          <div key={category} className="equipment-category-section">
            <h5 className="equipment-category-title">
              {category === 'casa' && '🏠 Equipos en Casa'}
              {category === 'oficina' && '🏢 Equipos en Oficina'}
              {category === 'remoto' && '🌐 Equipos Remotos'}
            </h5>
            <div className="equipment-list">
              {categoryEquipments.map(equipo => {
                const ip = Array.isArray(equipo.IpEquipo) 
                  ? equipo.IpEquipo[0] || 'Sin IP' 
                  : equipo.IpEquipo || 'Sin IP';

                return (
                  <div 
                    key={equipo.id} 
                    className="equipment-item"
                    onClick={() => handleEquipmentClick(equipo)}
                  >
                    


              {equipment.imageBase64?.startsWith('data:image/') && (
                <div className="equipment-image-container">
                  <img
                    src={equipment.imageBase64}
                    alt={equipment.nombre}
                    className="equipment-image"
                  />
                </div>
              )}



<div className="equipment-infoU">
                      <span className="equipment-name">{equipo.nombre}</span>
                      <span className="equipment-type">{equipo.type}</span>
                      <span className="equipment-ip">{ip}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  ) : (
    <p>No hay equipos asignados</p>
  )}
</div>
</div>
          <div className="modal-actionsU">
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
              <div className="navigation-buttonsU">
                <button 
                  onClick={onPrev} 
                  disabled={users.findIndex(u => u.id === user.id) === 0}
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
                  disabled={users.findIndex(u => u.id === user.id) === users.length - 1}
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

export default UserDetailsModal;