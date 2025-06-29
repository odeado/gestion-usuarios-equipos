import React, { useState, useMemo, useEffect } from 'react';
import './UserDetailsModal.css';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';

function UserDetailsModal({ 
  user = {}, 
  onClose, 
  onEdit,
  users = [],
  equipment = [],
  onNext,
  onPrev,
  onOpenEquipmentModal,
  availableDepartments = []
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [editedUser, setEditedUser] = useState({
    ...user,
    equiposAsignados: user.equiposAsignados || [],
    categoriasTemporales: user.categoriasTemporales || {}
  });
  



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

    setIsSaving(true);
    try {
      await onEdit({
        ...editedUser,
        id: user.id,
        equiposAsignados: editedUser.equiposAsignados,
        categoriasTemporales: editedUser.categoriasTemporales
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
    const newCategories = {...editedUser.categoriasTemporales};
    
    selectedIds.forEach(id => {
      newCategories[id] = 'casa'; // Categoría por defecto
    });

    setEditedUser(prev => ({
      ...prev,
      equiposAsignados: [...prev.equiposAsignados, ...selectedIds],
      categoriasTemporales: newCategories
    }));
  };

  const handleUnassignEquipment = (equipmentId) => {
    const newCategories = {...editedUser.categoriasTemporales};
    delete newCategories[equipmentId];

    setEditedUser(prev => ({
      ...prev,
      equiposAsignados: prev.equiposAsignados.filter(id => id !== equipmentId),
      categoriasTemporales: newCategories
    }));
  };

  const handleCategoryChange = (equipmentId, category) => {
    setEditedUser(prev => ({
      ...prev,
      categoriasTemporales: {
        ...prev.categoriasTemporales,
        [equipmentId]: category
      }
    }));
  };

  return (
    <div className="user-modalU" onClick={e => e.stopPropagation()}>
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
                  <label>Correo:</label>
                  <input
                    name="correo"
                    value={editedUser.correo}
                    onChange={handleInputChange}
                    className={`form-inputU ${errors.correo ? 'error' : ''}`}
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
                        <ul>
                          {assignedEquipment.map(eq => (
                            <li key={eq.id}>
                              <div className="equipment-info">
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
            <h4>Equipos Asignados ({assignedEquipment.length})</h4>
            {assignedEquipment.length > 0 ? (
              <div className="equipment-list">
                {assignedEquipment.map(equipo => (
                  <div 
                    key={equipo.id} 
                    className="equipment-item"
                    onClick={() => handleEquipmentClick(equipo)}
                  >
                    <div className="equipment-info">
                      <span className="equipment-name">{equipo.nombre}</span>
                      <span className="equipment-type">{equipo.type}</span>
                      <span className="equipment-ip">{equipo.IpEquipo || 'Sin IP'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No hay equipos asignados</p>
            )}
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