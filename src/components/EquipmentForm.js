// EquipmentForm.js
import React, { useState, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import AutocompleteInput from './AutocompleteInput';



const EquipmentForm = ({
  equipment = {}, // Datos del equipo (vacío para nuevo equipo)
  onEquipmentAdded,
  onCancel,
  isSaving = false,
  errors = {},
  mode = 'edit', // 'edit' o 'add'
  
  // Propiedades para autocompletar
  availableIps = [],
  onAddNewIp,
  availableSerials = [],
  onAddNewSerial,
  availableMarcas = [],
  onAddNewMarca,
  availableLugares = [],
  onAddNewLugar,
  availableCiudades = [],
  onAddNewCiudad,
  availableNombres = [],
  onAddNewNombre,
  availableTypes = [],
  onAddNewType,
  availableModels = [],
  onAddNewModel,
  availableProcessors = [],
  setAvailableProcessors,
  availableRams = [],
  onAddNewRam,
  availableDiscoDuros = [],
  onAddNewDiscoDuro,
  availableTarjetasGraficas = [],
  onAddNewTarjetaGrafica,
  availableWindows = [],
  onAddNewWindows,
  availableOffices = [],
  onAddNewOffice,
  availableAntivirus = [],
  onAddNewAntivirus,
  
  // Para asignación de usuarios (solo en edición)
  users = [],
  onAssignmentChange,
  onBulkAssignmentChange,
  onOpenUserModal,
  onEquipmentChange,
  onInputChange
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    type: '',
    ciudad: '',
    estado: 'En uso',
    lugar: '',
    descripcion: '',
    marca: '',
    model: '',
    serialNumber: '',
    procesador: '',
    ram: '',
    discoDuro: '',
    tarjetaGrafica: '',
    windows: '',
    antivirus: '',
    office: '',
    IpEquipo: [],
    imageBase64: '',
    usuariosAsignados: [],
    categoriasAsignacion: {}
  });

  const [isCompressing, setIsCompressing] = useState(false);
  const [localErrors, setLocalErrors] = useState({});

  // Inicializar formData con los datos del equipo cuando cambia
  useEffect(() => {
    if (equipment) {
      setFormData({
        nombre: equipment.nombre || '',
        type: equipment.type || '',
        ciudad: equipment.ciudad || '',
        estado: equipment.estado || 'En uso',
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
        IpEquipo: equipment.IpEquipo || [],
        imageBase64: equipment.imageBase64 || '',
        usuariosAsignados: equipment.usuariosAsignados || [],
        categoriasAsignacion: equipment.categoriasAsignacion || {}
      });
    }
  }, [equipment]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'Nombre requerido';
    if (!formData.type.trim()) newErrors.type = 'Tipo es requerido';
    if (!formData.model.trim()) newErrors.model = 'Modelo es requerido';
    if (!formData.serialNumber.trim()) newErrors.serialNumber = 'Número de serie es requerido';
    if (mode === 'add' && !formData.imageBase64) newErrors.image = 'Imagen es requerida';
    
    setLocalErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const dataToSave = {
        ...formData,
        categoriasAsignacion: formData.categoriasAsignacion || {}
      };
      console.log('Datos a guardar desde el formulario:', dataToSave);

      // Si tenemos onEquipmentChange, actualizamos primero el estado padre
    if (onEquipmentChange) {
      onEquipmentChange(dataToSave);
    }
    
     // Luego llamamos a onEquipmentAdded si existe
    if (onEquipmentAdded) {
      await onEquipmentAdded(dataToSave);
    }
  } catch (error) {
    console.error('Error submitting form:', error);
    setLocalErrors(prev => ({ ...prev, form: 'Error al guardar los datos' }));
  }
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (localErrors[name]) setLocalErrors(prev => ({ ...prev, [name]: '' }));
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
        setLocalErrors(prev => ({ ...prev, image: 'Error al procesar la imagen' }));
      }
    }
  };

  // Funciones para manejar usuarios asignados (solo en modo edición)
  const handleAssignUsers = (selectedOptions) => {
    const selectedIds = selectedOptions.map(opt => opt.value);
    
    const updates = selectedIds.map(userId => ({
      userId,
      equipmentId: equipment.id,
      category: 'casa'
    }));

    if (typeof onBulkAssignmentChange === 'function') {
      onBulkAssignmentChange(updates);
    }

    const newCategories = {...formData.categoriasAsignacion};
    selectedIds.forEach(id => newCategories[id] = 'casa');
    
    setFormData(prev => ({
      ...prev,
      usuariosAsignados: [...new Set([...prev.usuariosAsignados, ...selectedIds])],
      categoriasAsignacion: newCategories
    }));
  };

  const handleUnassignUser = (userId) => {
    if (typeof onAssignmentChange === 'function') {
      onAssignmentChange(userId, equipment.id, null);
    }

    const newCategories = {...formData.categoriasAsignacion};
    delete newCategories[userId];
    
    setFormData(prev => ({
      ...prev,
      usuariosAsignados: prev.usuariosAsignados.filter(id => id !== userId),
      categoriasAsignacion: newCategories
    }));
  };

  const handleUserCategoryChange = (userId, category) => {
    if (typeof onAssignmentChange === 'function') {
      onAssignmentChange(userId, equipment.id, category);
    }

    setFormData(prev => ({
      ...prev,
      categoriasAsignacion: {
        ...prev.categoriasAsignacion,
        [userId]: category
      }
    }));
  };

  // Componentes reutilizables del formulario
  const renderIpSelect = () => {
    const currentIp = Array.isArray(formData.IpEquipo) && formData.IpEquipo.length > 0 
      ? formData.IpEquipo[0] 
      : '';

    const options = [
      ...availableIps.map(ip => ({ value: ip, label: ip })),
      ...(currentIp && !availableIps.includes(currentIp) ? 
        [{ value: currentIp, label: currentIp }] : [])
    ].filter(option => option.value && option.value.trim() !== '');

    return (
      <div className="form-groupE">
        <label className="form-label">IP del Equipo</label>
        <CreatableSelect  
          isMulti={false}
          options={options}
          value={options.find(option => option.value === currentIp) || null}
          onChange={(selectedOption) => {
            const ipValue = selectedOption?.value || '';
            setFormData(prev => ({
              ...prev,
              IpEquipo: ipValue ? [ipValue] : []
            }));
          }}
          onCreateOption={(inputValue) => {
            const newIp = inputValue.trim();
            if (newIp) {
              setFormData(prev => ({
                ...prev,
                IpEquipo: [newIp]
              }));
              onAddNewIp && onAddNewIp(newIp);
            }
          }}
          className="react-select-container"
          classNamePrefix="react-select"
          placeholder="Seleccione o cree una IP..."
          noOptionsMessage={() => "No hay IPs disponibles. Escriba para crear una nueva."}
          isClearable
          formatCreateLabel={(inputValue) => `Crear nueva IP: ${inputValue}`}
        />
      </div>
    );
  };

  const CreatableInput = ({
    label,
    value,
    options = [],
    onChange,
    onCreateNew,
    error,
    placeholder = 'Seleccione o ingrese un valor',
    noOptionsMessage = "No hay opciones disponibles. Escriba para crear una nueva.",
    formatCreateLabel = (inputValue) => `Crear nuevo: ${inputValue}`,
    isClearable = true
  }) => {
    const currentValue = value || '';
    
    const selectOptions = [
      ...options.map(option => ({ value: option, label: option })),
      ...(currentValue && !options.includes(currentValue) ? 
        [{ value: currentValue, label: currentValue }] : [])
    ].filter(option => option.value && option.value.trim() !== '');

    return (
      <div className="form-groupE">
        <label className="form-label">{label}</label>
        <CreatableSelect  
          isMulti={false}
          options={selectOptions}
          value={selectOptions.find(option => option.value === currentValue) || null}
          onChange={(selectedOption) => {
            const newValue = selectedOption?.value || '';
            onChange(newValue);
          }}
          onCreateOption={(inputValue) => {
            const newOption = inputValue.trim();
            if (newOption) {
              onCreateNew?.(newOption);
              onChange(newOption);
            }
          }}
          className="react-select-container"
          classNamePrefix="react-select"
          placeholder={placeholder}
          noOptionsMessage={() => noOptionsMessage}
          isClearable={isClearable}
          formatCreateLabel={formatCreateLabel}
        />
        {error && <div className="error-text">{error}</div>}
      </div>
    );
  };

  const FormInput = ({
    label,
    name,
    value,
    onChange,
    error,
    placeholder = '',
    type = 'text',
    className = '',
    textarea = false
  }) => {
    const InputComponent = textarea ? 'textarea' : 'input';
    
    return (
      <div className={`form-groupE ${className}`}>
        <label>{label}</label>
        <InputComponent
          name={name}
          value={value}
          onChange={onChange}
          className={`form-inputE ${error ? 'error' : ''}`}
          placeholder={placeholder}
          type={type}
        />
        {error && <div className="error-text">{error}</div>}
      </div>
    );
  };

  // Obtener usuarios asignados (para modo edición)
  const assignedUsers = users.filter(
    user => formData.usuariosAsignados?.includes(user.id)
  ).map(user => ({
    ...user,
    categoria: formData.categoriasAsignacion?.[user.id] || 'casa'
  }));

  // Usuarios disponibles para asignar (para modo edición)
  const availableUsers = users.filter(
    user => !formData.usuariosAsignados?.includes(user.id)
  );

  return (
    <div className="equipment-form">
      <form onSubmit={handleSubmit}>
        {(isCompressing || isSaving) && (
          <div className="loading-message">
            {isCompressing ? 'Comprimiendo imagen...' : 'Guardando cambios...'}
          </div>
        )}
        
        {(errors.form || localErrors.form) && (
          <div className="error-message">{errors.form || localErrors.form}</div>
        )}

        <div className="image-upload-containerE">
          <label>Imagen del Equipo:</label>
          {formData.imageBase64 ? (
            <div className="image-previewE">
              <img 
                src={formData.imageBase64}
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
                  onClick={() => setFormData(prev => ({ ...prev, imageBase64: '' }))}
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
              {(errors.image || localErrors.image) && (
                <div className="error-text">{errors.image || localErrors.image}</div>
              )}
            </div>
          )}
        </div>

        <div className="form-fields-container">
          <div className="form-groupDatosE">
            <CreatableInput
              label="Nombre del Equipo"
              value={formData.nombre}
              options={availableNombres}
              onChange={(value) => setFormData(prev => ({ ...prev, nombre: value }))}
              onCreateNew={onAddNewNombre}
              error={errors.nombre || localErrors.nombre}
            />

            <CreatableInput
              label="Tipo de Equipo"
              value={formData.type}
              options={availableTypes}
              onChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              onCreateNew={onAddNewType}
              error={errors.type || localErrors.type}
            />

            <CreatableInput
              label="Marca"
              value={formData.marca}
              options={availableMarcas}
              onChange={(value) => setFormData(prev => ({ ...prev, marca: value }))}
              onCreateNew={onAddNewMarca}
              error={errors.marca || localErrors.marca}
            />

            <CreatableInput
              label="Ciudad"
              value={formData.ciudad}
              options={availableCiudades}
              onChange={(value) => setFormData(prev => ({ ...prev, ciudad: value }))}
              onCreateNew={onAddNewCiudad}
              error={errors.ciudad || localErrors.ciudad}
            />

            <CreatableInput
              label="Modelo"
              value={formData.model}
              options={availableModels}
              onChange={(value) => setFormData(prev => ({ ...prev, model: value }))}
              onCreateNew={onAddNewModel}
              error={errors.model || localErrors.model}
              noOptionsMessage="No hay modelos disponibles. Escriba para crear uno nuevo."
              formatCreateLabel={(inputValue) => `Usar nuevo modelo: ${inputValue}`}
            />

            <CreatableInput
              label="Número de Serie"
              value={formData.serialNumber}
              options={availableSerials}
              onChange={(value) => setFormData(prev => ({ ...prev, serialNumber: value }))}
              onCreateNew={onAddNewSerial}
              error={errors.serialNumber || localErrors.serialNumber}
              noOptionsMessage="No hay números de serie disponibles. Escriba para crear uno nuevo."
              formatCreateLabel={(inputValue) => `Usar nuevo serial: ${inputValue}`}
            />

            {renderIpSelect()}

            <div className="form-groupE">
              <label>Estado:</label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className={`form-inputE ${errors.estado || localErrors.estado ? 'error' : ''}`}
              >
                <option value="Disponible">Disponible</option>
                <option value="En uso">En uso</option>
                <option value="Mantenimiento">Mantenimiento</option>
                <option value="Eliminado">Eliminado</option>
              </select>
              {(errors.estado || localErrors.estado) && (
                <div className="error-text">{errors.estado || localErrors.estado}</div>
              )}
            </div>

            <CreatableInput
              label="Lugar"
              value={formData.lugar}
              options={availableLugares}
              onChange={(value) => setFormData(prev => ({ ...prev, lugar: value }))}
              onCreateNew={onAddNewLugar}
              error={errors.lugar || localErrors.lugar}
            />

            <div className="form-groupE">
              <label>Descripción:</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                className={`form-textareaE ${errors.descripcion || localErrors.descripcion ? 'error' : ''}`}
                placeholder="Descripción del equipo"
              />
              {(errors.descripcion || localErrors.descripcion) && (
                <div className="error-text">{errors.descripcion || localErrors.descripcion}</div>
              )}
            </div>
          </div>

          <div className="form-groupDatosE">
            <div className="form-groupE">
              <AutocompleteInput
                key={`processor-select-${formData.id}-${availableProcessors.length}`}
                value={formData.procesador || ''}
                onChange={(value) => {
                  setFormData(prev => ({ ...prev, procesador: value }));
                }}
                options={availableProcessors.map(p => ({ 
                  value: p, 
                  label: p  
                }))}
                onAddNewOption={(newOption) => {
                  if (!availableProcessors.includes(newOption)) {
                    setAvailableProcessors(prev => [...prev, newOption]);
                  }
                  setFormData(prev => ({ ...prev, procesador: newOption }));
                }}
                onRemoveOption={(optionToRemove) => {
                  setAvailableProcessors(prev => prev.filter(p => p !== optionToRemove));
                  if (formData.procesador === optionToRemove) {
                    setFormData(prev => ({ ...prev, procesador: '' }));
                  }
                }}
                placeholder="Ej: Intel i7, AMD Ryzen 5"
                label="Procesador"
                error={errors.procesador || localErrors.procesador}
                enableDelete={true}
              />
            </div>

            <FormInput
              label="RAM"
              name="ram"
              value={formData.ram}
              onChange={handleChange}
              error={errors.ram || localErrors.ram}
              placeholder="Ej: 16GB, 32GB"
            />

            <FormInput
              label="Disco Duro"
              name="discoDuro"
              value={formData.discoDuro}
              onChange={handleChange}
              error={errors.discoDuro || localErrors.discoDuro}
              placeholder="Ej: 512GB SSD, 1TB HDD"
            />

            <FormInput
              label="Tarjeta Gráfica"
              name="tarjetaGrafica"
              value={formData.tarjetaGrafica}
              onChange={handleChange}
              error={errors.tarjetaGrafica || localErrors.tarjetaGrafica}
              placeholder="Ej: NVIDIA GTX 1660, AMD Radeon RX 580"
            />

            <FormInput
              label="Windows"
              name="windows"
              value={formData.windows}
              onChange={handleChange}
              error={errors.windows || localErrors.windows}
              placeholder="Ej: Windows 10 Pro"
            />

            <FormInput
              label="Antivirus"
              name="antivirus"
              value={formData.antivirus}
              onChange={handleChange}
              error={errors.antivirus || localErrors.antivirus}
              placeholder="Ej: Norton, McAfee"
            />

            <FormInput
              label="Office"
              name="office"
              value={formData.office}
              onChange={handleChange}
              error={errors.office || localErrors.office}
              placeholder="Ej: Office 2019"
            />
          </div>

          {/* Sección de usuarios asignados (solo en modo edición) */}
          {mode === 'edit' && (
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
                          user => (formData.categoriasAsignacion[user.id] || 'casa') === category
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
                                    onClick={() => onOpenUserModal && onOpenUserModal(user.id)}
                                  >
                                    {user.imageBase64 ? (
                                      <img 
                                        src={user.imageBase64} 
                                        alt={user.name}
                                        className="user-avatarF"
                                      />
                                    ) : (
                                      <div className="user-avatarF-placeholder">
                                        {user.name.charAt(0)}
                                      </div>
                                    )}
                                    <span className="user-name">{user.name}</span>
                                    <span className="user-department">{user.department}</span>
                                  </div>

                                  <div className="user-actions">
                                    <select
                                      value={formData.categoriasAsignacion[user.id] || 'casa'}
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
          )}
        </div>

        <div className="modal-actionsE">
          <button
            type="button"
            className="cancel-btn"
            onClick={onCancel}
            disabled={isSaving || isCompressing}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="save-btn"
            disabled={isSaving || isCompressing}
          >
            {mode === 'add' ? 'Agregar Equipo' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EquipmentForm;