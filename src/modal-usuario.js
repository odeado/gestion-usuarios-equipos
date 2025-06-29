import React, { useState, useEffect, useMemo } from 'react';
import './UserDetailsModal.css';
import Select from 'react-select';

function UserDetailsModal({ 
  user = {}, 
  onClose, 
  onEdit, 
  users = [], 
  equipment = [],
  
  onNext, 
  onPrev,
  onOpenEquipmentModal,
  imageCompression,
  departments = [],
  onAddDepartment
}) {




const normalizeArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return value.split(',').map(item => item.trim());
  return [String(value)];
};
  // Estado para manejar la edición del usuario
  const [isEditing, setIsEditing] = useState(false);
 const [editedUser, setEditedUser] = useState({
    ...user,
    equiposCasa: normalizeArray(user.equiposCasa),
    equiposRemoto: normalizeArray(user.equiposRemoto),
    equiposOficina: normalizeArray(user.equiposOficina)
  });
  const [isMobile, setIsMobile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [showAddDepartment, setShowAddDepartment] = useState(false);
  const [newDepartment, setNewDepartment] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  
  // Función para touch events
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isSwiping, setIsSwiping] = useState(false);

  const currentIndex = users.findIndex(u => u.id === user.id);
const totalUsers = users.length;


// Obtener etiqueta legible para el tipo de trabajo
const getTrabajoLabel = (tipo) => {
  const tipos = {
    'remoto': 'Remoto',
    'hibrido': 'Híbrido',
    'oficina': 'Oficina'
  };
  return tipos[tipo] || tipo || 'No especificado';
};

// Obtener propósito del equipo
const getEquipmentPurpose = (type) => {
  const purposes = {
    'laptop': 'Portátil',
    'desktop': 'Computadora de escritorio',
    'monitor': 'Monitor',
    'dispositivo_remoto': 'Dispositivo remoto',
    'accesorio': 'Accesorio'
  };
  return purposes[type] || type;
};



// Uso:
const assignedEquipment = useMemo(() => ({
  casa: equipment.filter(e => editedUser.equiposCasa.includes(e.id)),
  remoto: equipment.filter(e => editedUser.equiposRemoto.includes(e.id)),
  oficina: equipment.filter(e => editedUser.equiposOficina.includes(e.id))
}), [editedUser, equipment]);


  // Obtener estados de los equipos asignados
  const getEstadoColor = (estado) => {
    const colors = {
      'Teletrabajo': '#4caf50',
      'Trabajando': '#ffeb3b',
      'Eliminado': '#f44336',
    };
    return colors[estado] || '#666';
  };

  // Inicializar datos del usuario
  useEffect(() => {
    setEditedUser({
      name: user.name || '',
      correo: user.correo || '',
      tipoVpn: user.tipoVpn || '',
      department: user.department || '',
      estado: user.estado || '',
      ciudad: user.ciudad || '',
      equiposCasa: Array.isArray(user.equiposCasa) ? user.equiposCasa : [],
      equiposRemoto: Array.isArray(user.equiposRemoto) ? user.equiposRemoto : [],
      equiposOficina: Array.isArray(user.equiposOficina) ? user.equiposOficina : [],
      imageBase64: user.imageBase64 || ''
    });
  }, [user]);

  const validateForm = () => {
    const newErrors = {};
    if (!editedUser.name?.trim()) newErrors.name = 'Nombre es requerido';
    if (!editedUser.correo?.trim()) newErrors.correo = 'Correo es requerido';
    if (!editedUser.tipoVpn?.trim()) newErrors.tipoVpn = 'Tipo VPN es requerido';
    if (!editedUser.department?.trim()) newErrors.department = 'Departamento es requerido';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSave = async () => {
  if (!validateForm()) return;
  
   setIsSaving(true);
  try {
    const userToUpdate = {
      id: user.id,
      ...editedUser,
      equiposCasa: editedUser.equiposCasa || [],
      equiposRemoto: editedUser.equiposRemoto || [],
      equiposOficina: editedUser.equiposOficina || []
    };
    
    await onEdit(userToUpdate);
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
    // Limpiar error del campo al modificar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = async (e) => {
    if (e.target.files?.length) {
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
          setEditedUser(prev => ({ ...prev, imageBase64: reader.result }));
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

  const handleAddNewDepartment = async () => {
    if (!newDepartment.trim()) {
      setErrors(prev => ({ ...prev, department: 'Nombre de departamento no puede estar vacío' }));
      return;
    }

    try {
      const { success, newDepartment: addedDept } = await onAddDepartment(newDepartment.trim());
      
      if (success) {
        setEditedUser(prev => ({ ...prev, department: addedDept.name }));
        setShowAddDepartment(false);
        setNewDepartment('');
        setErrors(prev => ({ ...prev, department: '' }));
      }
    } catch (error) {
      console.error('Error adding department:', error);
      setErrors(prev => ({ ...prev, department: 'Error al agregar departamento' }));
    }
  };



const renderEquipmentSelects = () => {
  if (!equipment || !Array.isArray(equipment)) return null;

  return (
        <div className="equipment-selects-container">
      <div className="form-group">
        <label className="form-label">Equipos para Casa</label>
        <Select
          isMulti
          options={equipment.map(eq => ({
            value: eq.id,
            label: `${eq.nombre} (${eq.type}) - ${eq.IpEquipo || 'Sin IP'}`
          }))}
          value={editedUser.equiposCasa?.map(id => {
            const eq = equipment.find(e => e.id === id);
            return {
              value: eq?.id,
              label: eq ? `${eq.nombre} (${eq.type}) - ${eq.IpEquipo || 'Sin IP'}` : 'Equipo no encontrado'
            };
          })}
          onChange={selected => {
            setEditedUser(prev => ({
              ...prev,
              equiposCasa: selected ? selected.map(item => item.value) : []
            }));
          }}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Equipos para Remoto</label>
        <Select
          isMulti
          options={equipment.map(toOption)}
          value={equipment
            .filter(e => editedUser.equiposRemoto?.includes(e.id))
            .map(toOption)}
          onChange={selected => handleEquipmentChange('equiposRemoto', selected)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Equipos para Oficina</label>
        <Select
          isMulti
          options={equipment.map(toOption)}
          value={equipment
            .filter(e => editedUser.equiposOficina?.includes(e.id))
            .map(toOption)}
          onChange={selected => handleEquipmentChange('equiposOficina', selected)}
        />
      </div>
    </div>
  );
};

const toOption = (eq) => ({
  value: eq.id,
  label: `${eq.nombre} (${eq.IpEquipo || 'Sin IP'})`
});

const handleEquipmentChange = (field, selectedOptions) => {
  setEditedUser(prev => ({
    ...prev,
    [field]: selectedOptions ? selectedOptions.map(o => o.value) : []
  }));
};




  const renderDepartmentSelect = () => {
    const currentDept = editedUser.department;
    const deptExists = departments.some(d => (d.name || d) === currentDept);

    return (
      <div className="form-groupU">
        <select
          name="department"
          value={currentDept}
          onChange={(e) => {
            if (e.target.value === "__add__") {
              setShowAddDepartment(true);
              setNewDepartment(currentDept || '');
            } else {
              handleInputChange(e);
            }
          }}
          required
          className={`form-inputU ${errors.department ? 'error' : ''}`}
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
            ))
          }
          
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
                onClick={handleAddNewDepartment}
                className="save-btn"
              >
                Agregar
              </button>
              <button 
                type="button" 
                onClick={() => setShowAddDepartment(false)}
                className="cancel-btn"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
        {errors.department && <span className="error-message">{errors.department}</span>}
      </div>
    );
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

  if (isLeftSwipe && currentIndex < totalUsers - 1) {
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
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const handleNext = () => {
  if (onNext) {
    onNext();
  }
};

const handlePrev = () => {
  if (onPrev) {
    onPrev();
  }
};

  const handleClose = (e) => {
    if (e) e.stopPropagation();
    onClose();
  };

 const handleEquipmentClick = (equipmentItem) => {
    onClose();
    if (onOpenEquipmentModal) {
      onOpenEquipmentModal(equipmentItem.id);
    }
  };

  return (
    <div 
      className="user-modalU" 
      onClick={e => e.stopPropagation()}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="modal-contentU" onClick={e => e.stopPropagation()}>
        <div className="modal-headerU">
          <div className="user-counter">
            {currentIndex + 1} / {totalUsers}
          </div>
          <button className="close-btnU" onClick={handleClose}>×</button>
          <h2>{isEditing ? 'Editar Usuario' : user.name}</h2>
        </div>
        
        {isEditing ? (
          <div className="edit-form">
            {errors.form && <div className="error-message">{errors.form}</div>}

            <div className="image-upload-containerU">
              <label>Foto del Usuario:</label>
              {editedUser.imageBase64 ? (
                <div className="image-previewU">
                  {editedUser.imageBase64.startsWith('data:image/') ? (
                    <img 
                      src={editedUser.imageBase64}
                      alt="Vista previa" 
                      className="user-image-preview"
                    />
                  ) : (
                    <p className="image-error">Formato de imagen no válido</p>
                  )}
                  <div className="image-actions">
                    <label className="change-image-btn">
                      Cambiar foto
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                        disabled={isCompressing}
                      />
                    </label>
                    <button 
                      type="button" 
                      className="remove-image-btn"
                      onClick={() => setEditedUser(prev => ({ ...prev, imageBase64: '' }))}
                    >
                      Eliminar foto
                    </button>
                  </div>
                </div>
              ) : (
                <div className="upload-image-containerU">
                  <label className="upload-image-labelU">
                    <span>+ Seleccionar foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                      disabled={isCompressing}
                    />
                  </label>
                </div>
              )}
              {isCompressing && <p className="compressing-message">Comprimiendo imagen...</p>}
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
                  <label>Correo:</label>
                  <input
                    name="correo"
                    type="email"
                    value={editedUser.correo}
                    onChange={handleInputChange}
                    className={`form-inputU ${errors.correo ? 'error' : ''}`}
                    placeholder="Correo electrónico"
                  />
                  {errors?.correo && <span className="error-message">{errors.correo}</span>}
                </div>

                <div className="form-groupU">
                  <label>Tipo VPN:</label>
                  <input
                    name="tipoVpn"
                    value={editedUser.tipoVpn}
                    onChange={handleInputChange}
                    className={`form-inputU ${errors.tipoVpn ? 'error' : ''}`}
                    placeholder="Tipo de VPN"
                  />
                  {errors?.tipoVpn && <span className="error-message">{errors.tipoVpn}</span>}
                </div>

                <div className="form-groupU">
                  <label>Departamento:</label>
                  {renderDepartmentSelect()}
                </div>

                <div className="form-groupU">
                  <label>Estado:</label>
                  <select
                    name="estado"
                    value={editedUser.estado}
                    onChange={handleInputChange}
                    className={`form-inputU ${errors.estado ? 'error' : ''}`}
                  >
                    <option value="">Seleccione estado</option>
                    <option value="Teletrabajo">Teletrabajo</option>
                    <option value="Trabajando">Trabajando</option>
                    <option value="Eliminado">Eliminado</option>
                  </select>
                  {errors?.estado && <span className="error-message">{errors.estado}</span>}
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

 <div className="form-groupU">
   <label>equipos:</label>
                 {renderEquipmentSelects()}
        </div>
       
                
              </div>

              <div className="modal-actionsU">
                <button
                  className="save-btn"
                  onClick={handleSave}
                  disabled={isSaving || isCompressing}
                >
                  {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
                <button 
                  className="cancel-btn"
                  onClick={() => {
                    setIsEditing(false);
                    setEditedUser({...user});
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
                      <div className="nombreM">{user.name.split(' ')[0]}</div> {/* Primer nombre */}
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
                      width: 'max-content' 
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

         
<div className="assigned-equipment-section">
            {assignedEquipment.casa.length > 0 && (
              <div className="equipment-category">
                <h4>Equipos para Casa ({assignedEquipment.casa.length})</h4>
                <div className="equipment-list">
                  {assignedEquipment.casa.map(equipo => (
                    <div key={equipo.id} className="equipment-item" onClick={() => handleEquipmentClick(equipo)}>
                      <span className="equipment-name">{equipo.nombre}</span>
                      <span className="equipment-ip">{equipo.IpEquipo}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
  
  {assignedEquipment.remoto.length > 0 && (
    <div className="equipment-category">
      <h4>Equipos para Remoto ({assignedEquipment.remoto.length})</h4>
      <div className="equipment-list">
        {assignedEquipment.remoto.map(equipo => (
          <div key={equipo.id} className="equipment-item" onClick={() => handleEquipmentClick(equipo)}>
            <span className="equipment-name">{equipo.nombre}</span>
            <span className="equipment-ip">{equipo.IpEquipo}</span>
          </div>
        ))}
      </div>
    </div>
  )}
  
  {assignedEquipment.oficina.length > 0 && (
    <div className="equipment-category">
      <h4>Equipos para Oficina ({assignedEquipment.oficina.length})</h4>
      <div className="equipment-list">
        {assignedEquipment.oficina.map(equipo => (
          <div key={equipo.id} className="equipment-item" onClick={() => handleEquipmentClick(equipo)}>
            <span className="equipment-name">{equipo.nombre}</span>
            <span className="equipment-ip">{equipo.IpEquipo}</span>
          </div>
        ))}
      </div>
    </div>
  )}
</div>


            <div className="modal-actionsU">
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
              <div className="navigation-buttonsU">
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
                  disabled={currentIndex === totalUsers - 1}
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