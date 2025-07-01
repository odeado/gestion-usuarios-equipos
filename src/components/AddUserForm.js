// AddUserForm.js
import React, { useState, useMemo } from 'react';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import AutocompleteInput from './AutocompleteInput';
import imageCompression from 'browser-image-compression';
import './AddUserForm.css';

function AddUserForm({ 
  onSave, 
  onCancel,
  equipment = [],
  availableDepartments = [],
  onAddDepartment,
  onAssignmentChange,
  onBulkAssignmentChange,
  availableCorreos,
  setAvailableCorreos
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [isCompressing, setIsCompressing] = useState(false);
  const [showAddDepartment, setShowAddDepartment] = useState(false);
  const [newDepartment, setNewDepartment] = useState('');
  
  // Estado para el nuevo usuario
  const [newUser, setNewUser] = useState({
    name: '',
    correo: '',
    department: '',
    estado: 'Teletrabajo',
    ciudad: '',
    tipoVpn: '',
    imageBase64: '',
    equiposAsignados: [],
    categoriasTemporales: {}
  });

  const validateForm = () => {
    const newErrors = {};
    if (!newUser.name?.trim()) newErrors.name = 'Nombre es requerido';
    if (!newUser.correo?.trim()) newErrors.correo = 'Correo es requerido';
    if (!newUser.department?.trim()) newErrors.department = 'Departamento es requerido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const userToSave = {
      ...newUser,
      equiposAsignados: newUser.equiposAsignados || [],
      categoriasTemporales: newUser.categoriasTemporales || {}
    };

    setIsSaving(true);
    try {
      await onSave(userToSave);
    } catch (error) {
      console.error("Error al guardar:", error);
      setErrors({ form: error.message || 'Error al guardar el usuario' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
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
          setNewUser(prev => ({ ...prev, imageBase64: reader.result }));
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

  // Obtener equipos asignados
  const assignedEquipment = useMemo(() => {
    return equipment.filter(eq => 
      newUser.equiposAsignados?.includes(eq.id)
    );
  }, [equipment, newUser.equiposAsignados]);

  // Equipos disponibles para asignar
  const availableEquipment = useMemo(() => {
    return equipment.filter(eq => 
      !newUser.equiposAsignados?.includes(eq.id)
    );
  }, [equipment, newUser.equiposAsignados]);

  const handleAssignEquipment = (selectedOptions) => {
    const selectedIds = selectedOptions?.map(opt => opt.value) || [];
    
    if (newUser.equiposAsignados.length + selectedIds.length > 10) {
      alert('Máximo 10 equipos por usuario');
      return;
    }

    const updates = selectedIds.map(equipmentId => ({
      equipmentId,
      category: 'casa' // Valor por defecto
    }));

    // Notificar al padre
    if (typeof onBulkAssignmentChange === 'function') {
      onBulkAssignmentChange(updates);
    }

    // Actualizar estado local
    const newCategories = {...newUser.categoriasTemporales};
    selectedIds.forEach(id => newCategories[id] = 'casa');
    
    setNewUser(prev => ({
      ...prev,
      equiposAsignados: [...new Set([...prev.equiposAsignados, ...selectedIds])],
      categoriasTemporales: newCategories
    }));
  };

  const handleUnassignEquipment = (equipmentId) => {
    // Notificar al padre
    if (typeof onAssignmentChange === 'function') {
      onAssignmentChange(equipmentId, null);
    }

    // Actualizar estado local
    const newCategories = {...newUser.categoriasTemporales};
    delete newCategories[equipmentId];
    
    setNewUser(prev => ({
      ...prev,
      equiposAsignados: prev.equiposAsignados.filter(id => id !== equipmentId),
      categoriasTemporales: newCategories
    }));
  };

  const handleCategoryChange = (equipmentId, category) => {
    // Notificar al padre
    if (typeof onAssignmentChange === 'function') {
      onAssignmentChange(equipmentId, category);
    }

    // Actualizar estado local
    setNewUser(prev => ({
      ...prev,
      categoriasTemporales: {
        ...prev.categoriasTemporales,
        [equipmentId]: category
      }
    }));
  };

  const renderDepartmentSelect = () => {
    const currentDept = newUser.department;
    const deptOptions = availableDepartments.map(dept => ({
      value: dept.name || dept,
      label: dept.name || dept
    }));

    return (
      <div className="department-select-container">
        <CreatableSelect
          options={deptOptions}
          value={currentDept ? { value: currentDept, label: currentDept } : null}
          onChange={(selectedOption, actionMeta) => {
            if (actionMeta.action === "create-option") {
              // Cuando se crea una nueva opción
              setShowAddDepartment(true);
              setNewDepartment(selectedOption.value);
            } else if (actionMeta.action === "select-option") {
              // Cuando se selecciona una opción existente
              setNewUser(prev => ({
                ...prev,
                department: selectedOption.value
              }));
            } else if (actionMeta.action === "clear") {
              // Cuando se limpia la selección
              setNewUser(prev => ({ ...prev, department: '' }));
            }
          }}
          placeholder="Selecciona o escribe un departamento"
          noOptionsMessage={() => "Escribe para agregar un nuevo departamento"}
          formatCreateLabel={(inputValue) => `Crear "${inputValue}"`}
          isClearable
          className={`react-select-container ${errors.department ? 'input-error' : ''}`}
          classNamePrefix="react-select"
        />

        {showAddDepartment && (
          <div className="add-department-form">
            <p>¿Deseas agregar el departamento <strong>{newDepartment}</strong>?</p>
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
                      setNewUser(prev => ({ 
                        ...prev, 
                        department: addedDept.name || addedDept 
                      }));
                      setShowAddDepartment(false);
                      setNewDepartment('');
                      setErrors(prev => ({ ...prev, department: '' }));
                    }
                  } catch (error) {
                    console.error('Error adding department:', error);
                    setErrors(prev => ({ 
                      ...prev, 
                      department: 'Error al agregar departamento' 
                    }));
                  }
                }}
                className="add-button"
                disabled={isSaving}
              >
                Confirmar y agregar
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setShowAddDepartment(false);
                  setNewUser(prev => ({ ...prev, department: '' }));
                }}
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
    <div className="user-edit-form-container">
      <h2 className="form-title">Agregar Nuevo Usuario</h2>
      
      {errors.form && <div className="error-message form-error">{errors.form}</div>}
      {isCompressing && <div className="loading-message">Comprimiendo imagen...</div>}

      <div className="form-section">
        <div className="image-upload-section">
          <label>Imagen del Usuario:</label>
          {newUser.imageBase64 ? (
            <div className="image-preview-container">
              <img 
                src={newUser.imageBase64}
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
                  onClick={() => setNewUser(prev => ({ ...prev, imageBase64: '' }))}
                >
                  Eliminar imagen
                </button>
              </div>
            </div>
          ) : (
            <div className="upload-image-container">
              <label className="upload-image-label">
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

        <div className="form-fields">
          <div className="form-group">
            <label>Nombre:</label>
            <input
              name="name"
              value={newUser.name}
              onChange={handleInputChange}
              className={`form-input ${errors.name ? 'input-error' : ''}`}
              placeholder="Nombre completo"
            />
            {errors?.name && <span className="error-message">{errors.name}</span>}    
          </div>

         <div className="form-group">
  
  <AutocompleteInput
  key={`correo-select-form-${availableCorreos.length}`}
    value={newUser.correo || ''} 
    onChange={(value) => {
      setNewUser(prev => ({ ...prev, correo: value }));
      if (errors.correo) setErrors(prev => ({ ...prev, correo: '' }));
    }}
    options={availableCorreos.map(p => ({ value: p, label: p }))}
    onAddNewOption={(newOption) => {
      if (typeof setAvailableCorreos === 'function') {
        setAvailableCorreos(prev => [...prev, newOption]);
      }
      setNewUser(prev => ({ ...prev, correo: newOption }));
    }}
    onRemoveOption={(optionToRemove) => {
      setAvailableCorreos(prev => prev.filter(p => p !== optionToRemove));
      if (newUser.correo === optionToRemove) {
        setNewUser(prev => ({ ...prev, correo: '' }));
      }
      }}
    placeholder="Ej: usuario@dominio.com"
    label="Correo electrónico"
    error={errors.correo}
    enableDelete={true}
  />
  
</div>

          <div className="form-group">
            <label>Departamento:</label>
            {renderDepartmentSelect()}
          </div>

          <div className="form-group">
            <label>Estado:</label>
            <select
              name="estado"
              value={newUser.estado}
              onChange={handleInputChange}
              className={`form-input ${errors.estado ? 'input-error' : ''}`}
            >
              <option value="Teletrabajo">Teletrabajo</option>
              <option value="Trabajando">Trabajando</option>
              <option value="Eliminado">Eliminado</option>
            </select>
            {errors?.estado && <span className="error-message">{errors.estado}</span>}
          </div>

          <div className="form-group">
            <label>Tipo VPN:</label>
            <input
              name="tipoVpn"
              value={newUser.tipoVpn}
              onChange={handleInputChange}
              className={`form-input ${errors.tipoVpn ? 'input-error' : ''}`}
            />
            {errors?.tipoVpn && <span className="error-message">{errors.tipoVpn}</span>}
          </div>

          <div className="form-group">
            <label>Ciudad:</label>
            <input
              name="ciudad"
              value={newUser.ciudad}
              onChange={handleInputChange}
              className={`form-input ${errors.ciudad ? 'input-error' : ''}`}
            />
            {errors?.ciudad && <span className="error-message">{errors.ciudad}</span>}
          </div>
        </div>
      </div>

      <div className="equipment-assignment-section">
        <h3>Equipos Asignados</h3>
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
                      .filter(eq => (newUser.categoriasTemporales[eq.id] || 'casa') === 'casa')
                      .map(eq => (
                        <li key={eq.id}>
                          <div className="equipment-info">
                            <span className="name">{eq.nombre}</span>
                            <span className="type">{eq.type}</span>
                            <span className="ip">{eq.IpEquipo || 'Sin IP'}</span>
                          </div>
                          
                          <div className="equipment-actions">
                            <select
                              value={newUser.categoriasTemporales[eq.id] || 'casa'}
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
                      .filter(eq => newUser.categoriasTemporales[eq.id] === 'oficina')
                      .map(eq => (
                        <li key={eq.id}>
                          <div className="equipment-info">
                            <span className="name">{eq.nombre}</span>
                            <span className="type">{eq.type}</span>
                            <span className="ip">{eq.IpEquipo || 'Sin IP'}</span>
                          </div>
                          <div className="equipment-actions">
                            <select
                              value={newUser.categoriasTemporales[eq.id] || 'oficina'}
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
                      .filter(eq => newUser.categoriasTemporales[eq.id] === 'remoto')
                      .map(eq => (
                        <li key={eq.id}>
                          <div className="equipment-info">
                            <span className="name">{eq.nombre}</span>
                            <span className="type">{eq.type}</span>
                            <span className="ip">{eq.IpEquipo || 'Sin IP'}</span>
                          </div>
                          
                          <div className="equipment-actions">
                            <select
                              value={newUser.categoriasTemporales[eq.id] || 'remoto'}
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

      <div className="form-actions">
        <button
          className="save-btn"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Guardando...' : 'Agregar Usuario'}
        </button>
        <button 
          className="cancel-btn"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

export default AddUserForm;