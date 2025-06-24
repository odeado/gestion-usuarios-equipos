import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import './EquipDetailsModal.css';
import AutocompleteInput from './AutocompleteInput';
import CategoryModal from './CategoryModal';

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
  availableIps: parentAvailableIps = [],
  onAddNewIp,
  availableSerials: parentAvailableSerials = [],
  onAddNewSerial,
  availableModels = [],
  availableProcessors = [],
  availableBrands = []
}) {
  // Estados
  const [isEditing, setIsEditing] = useState(false);
  const [editedEquipment, setEditedEquipment] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

   const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [currentUserForCategory, setCurrentUserForCategory] = useState(null);

  // Normalizar arrays
  const normalizeArray = useCallback((value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return value.split(',').map(item => item.trim());
    return [String(value)];
  }, []);

  // Estado para opciones locales (similar al formulario)
  const [localOptions, setLocalOptions] = useState({
    model: availableModels,
    procesador: availableProcessors,
    marca: availableBrands
  });

  // Función para actualizar opciones locales (similar al formulario)
  const updateLocalOptions = useCallback((field, value) => {
    if (value && !localOptions[field].includes(value)) {
      setLocalOptions(prev => ({
        ...prev,
        [field]: [...prev[field], value]
      }));
    }
  }, [localOptions]);

  // Usuarios asignados con memoización
  const assignedUsers = useMemo(() => {
    const userIdsArray = normalizeArray(editedEquipment.usuariosAsignados || []);
    return userIdsArray
      .map(userId => users.find(u => u.id === userId))
      .filter(user => user !== undefined);
  }, [editedEquipment.usuariosAsignados, users, normalizeArray]);

  // Colores para estados
  const getEstadoColor = useCallback((estado) => {
    const colors = {
      'En uso': '#4caf50',
      'Mantenimiento': '#ffeb3b',
      'Eliminado': '#f44336',
    };
    return colors[estado] || '#666';
  }, []);

  // Inicializar datos del equipo
  useEffect(() => {
    const initialData = {
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
      usuariosAsignados: Array.isArray(equipment.usuariosAsignados) ? 
        equipment.usuariosAsignados : 
        (equipment.usuariosAsignados ? [equipment.usuariosAsignados] : []),
        categoriasAsignacion: equipment.categoriasAsignacion || {},
      imageBase64: equipment.imageBase64 || ''
    };
    setEditedEquipment(initialData);
    setIsEditing(false);
  }, [equipment, normalizeArray]);

  // Validación del formulario
  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!editedEquipment.nombre?.trim()) newErrors.nombre = 'Nombre es requerido';
    if (!editedEquipment.type?.trim()) newErrors.type = 'Tipo es requerido';
    if (!editedEquipment.model?.trim()) newErrors.model = 'Modelo es requerido';
    if (!editedEquipment.serialNumber?.trim()) newErrors.serialNumber = 'Número de serie es requerido';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [editedEquipment]);

  // Guardar cambios
  const handleSave = useCallback(async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const equipmentToUpdate = {
        id: equipment.id,
        ...editedEquipment,
        usuariosAsignados: normalizeArray(editedEquipment.usuariosAsignados)
      };
      
      await onEdit(equipmentToUpdate);
      setIsEditing(false);
    } catch (error) {
      console.error("Error al guardar:", error);
      setErrors({ form: error.message || 'Error al guardar los cambios' });
    } finally {
      setIsSaving(false);
    }
  }, [editedEquipment, equipment.id, onEdit, validateForm, normalizeArray]);

  // Manejo de cambios en inputs
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setEditedEquipment(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);


// Manejador para AutocompleteInput (similar al formulario)
  const handleAutocompleteChange = useCallback((field) => (e) => {
    const value = e.target.value;
    setEditedEquipment(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    e.target.name = field;
    handleInputChange(e);
  }, [handleInputChange, errors]);





  // Manejo de imágenes
  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedEquipment(prev => ({ ...prev, imageBase64: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Abrir modal de usuario
  const handleOpenUserModal = useCallback((userId) => {
    if (onOpenUserModal) {
      onClose();
      onOpenUserModal(userId);
    }
  }, [onClose, onOpenUserModal]);

  // Manejo de eventos táctiles
  const handleTouchStart = useCallback((e) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(null);
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!touchStart) return;
    setTouchEnd(e.targetTouches[0].clientX);
    e.preventDefault();
  }, [touchStart]);

  const handleTouchEnd = useCallback(() => {
  if (!touchStart || !touchEnd || isEditing) {
    setTouchStart(null);
    setTouchEnd(null);
    return;
  }
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentIndex < totalEquipment - 1) {
      onNext?.();
    } else if (isRightSwipe && currentIndex > 0) {
      onPrev?.();
    }

    setTouchStart(null);
    setTouchEnd(null);
  }, [touchStart, touchEnd, isEditing, currentIndex, totalEquipment, onNext, onPrev]);

  // Detectar si es móvil
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Navegación
  const handleNext = useCallback(() => {
    if (currentIndex < totalEquipment - 1 && onNext) {
      onNext();
    }
  }, [currentIndex, totalEquipment, onNext]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0 && onPrev) {
      onPrev();
    }
  }, [currentIndex, onPrev]);

  const handleClose = useCallback((e) => {
    e?.stopPropagation();
    setIsEditing(false);
    onClose();
  }, [onClose]);

  // Renderizado de selects
  const renderIpSelect = useCallback(() => {
    const currentIp = Array.isArray(editedEquipment.IpEquipo) && editedEquipment.IpEquipo.length > 0 
      ? editedEquipment.IpEquipo[0] 
      : editedEquipment.IpEquipo || '';

    const options = [
      ...parentAvailableIps.map(ip => ({ value: ip, label: ip })),
      ...(currentIp && !parentAvailableIps.includes(currentIp) ? 
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
  }, [editedEquipment.IpEquipo, parentAvailableIps, onAddNewIp]);

  // En EquipDetailsModal.js, en la función renderUserSelect
  // Función renderUserSelect actualizada para incluir categorías
  const renderUserSelect = () => {
    const options = users.map(user => ({
      value: user.id,
      label: `${user.name}`,
      category: editedEquipment.categoriasAsignacion?.[user.id] || 'casa'
    }));

   

    return (
      <div className="form-groupE">
        <label className="form-label">Usuarios Asignados</label>
        <Select
          isMulti
          options={options}
          value={options.filter(option => 
            editedEquipment.usuariosAsignados?.includes(option.value)
          )}
          onChange={(selectedOptions) => {
            const selectedUsers = selectedOptions ? selectedOptions.map(o => o.value) : [];
            const newCategories = {};
            
            selectedOptions?.forEach(option => {
              newCategories[option.value] = option.category || 'casa';
            });

            setEditedEquipment(prev => ({
              ...prev,
              usuariosAsignados: selectedUsers,
              categoriasAsignacion: newCategories
            }));
          }}
          formatOptionLabel={(user) => (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>{user.label}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setCurrentUserForCategory(user.value);
                  setShowCategoryModal(true);
                }}
                className="category-indicator"
                style={{
                  background: '#f0f0f0',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  fontSize: '0.8em',
                  cursor: 'pointer'
                }}
              >
                {editedEquipment.categoriasAsignacion?.[user.value] || 'casa'} ✏️
              </button>
            </div>
          )}
          className="react-select-container"
          classNamePrefix="react-select"
        />
        
        <CategoryModal
          isOpen={showCategoryModal}
          onClose={() => setShowCategoryModal(false)}
          currentUserId={currentUserForCategory}
          users={users}
          currentCategory={editedEquipment.categoriasAsignacion?.[currentUserForCategory]}
          onCategoryChange={(userId, category) => {
            const newCategories = {...editedEquipment.categoriasAsignacion};
            newCategories[userId] = category;
            setEditedEquipment(prev => ({
              ...prev,
              categoriasAsignacion: newCategories
            }));
          }}
        />
      </div>
    );
  };





  const renderSerialSelect = useCallback(() => {
    const currentSerial = editedEquipment.serialNumber || '';

    const options = [
      ...parentAvailableSerials.map(serial => ({ value: serial, label: serial })),
      ...(currentSerial && !parentAvailableSerials.includes(currentSerial) ? 
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
          className="react-select-container"
          classNamePrefix="react-select"
          placeholder="Seleccione o ingrese un número de serie..."
          noOptionsMessage={() => "No hay números de serie disponibles. Escriba para crear uno nuevo."}
          isSearchable
          formatCreateLabel={(inputValue) => `Usar nuevo serial: ${inputValue}`}
        />
        {errors?.serialNumber && <span className="error-message">{errors.serialNumber}</span>}
      </div>
    );
  }, [editedEquipment.serialNumber, parentAvailableSerials, onAddNewSerial, errors.serialNumber]);

  // Renderizado del modal
  return (
    <div 
      className="equipment-modalE" 
     onClick={(e) => {
    // Solo cerrar si se hace clic fuera del contenido
    if (e.target.classList.contains('equipment-modalE')) {
      handleClose(e);
    }
  }}
  onTouchStart={handleTouchStart}
  onTouchMove={handleTouchMove}
  onTouchEnd={handleTouchEnd}
>
      <div className="modal-contentE" onClick={e => e.stopPropagation()}>
        <div className="modal-headerE">
          <div className="equipment-counter">
            {currentIndex + 1} / {totalEquipment}
          </div>
          <button className="close-btnE" onClick={(e) => {
  e.stopPropagation();
  handleClose(e);
}}>×</button>
          <h2>{isEditing ? 'Editar Equipo' : equipment.nombre || 'Detalles del Equipo'}</h2>
        </div>
        
        {isEditing ? (
          <EditForm 
            editedEquipment={editedEquipment}
            errors={errors}
            handleInputChange={handleInputChange}
            handleImageChange={handleImageChange}
            handleSave={handleSave}
            isSaving={isSaving}
            setIsEditing={setIsEditing}
            equipment={equipment}
            availableBrands={availableBrands}
            availableModels={availableModels}
            availableProcessors={availableProcessors}
            renderIpSelect={renderIpSelect}
            renderUserSelect={renderUserSelect}
            renderSerialSelect={renderSerialSelect}
            setEditedEquipment={setEditedEquipment}
            setErrors={setErrors}
            handleAutocompleteChange={handleAutocompleteChange}  // Añadido
            localOptions={localOptions}  // Añadido
            updateLocalOptions={updateLocalOptions}  // Añadido         
          />
        ) : (
          <ViewMode 
            equipment={equipment}
            assignedUsers={assignedUsers}
            handleOpenUserModal={handleOpenUserModal}
            getEstadoColor={getEstadoColor}
            isMobile={isMobile}
            handlePrev={handlePrev}
            handleNext={handleNext}
            currentIndex={currentIndex}
            totalEquipment={totalEquipment}
            setIsEditing={setIsEditing}
          />
        )}
      </div>
    </div>
  );
}

// Componente para el modo de edición
const EditForm = ({
  editedEquipment,
  errors,
  handleInputChange,
  handleImageChange,
  handleSave,
  isSaving,
  setIsEditing,
  equipment,
  availableBrands,
  availableModels,
  availableProcessors,
  renderIpSelect,
  renderUserSelect,
  renderSerialSelect,
  setEditedEquipment,
  setErrors,
  handleAutocompleteChange,
  localOptions,
  updateLocalOptions
}) => (
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
            className={`form-inputE ${errors.type ? 'error' : ''}`}
          />
          {errors?.type && <span className="error-message">{errors.type}</span>}
        </div>

        <div className="form-groupE">
         <AutocompleteInput
                    value={editedEquipment.marca}
                    onChange={handleAutocompleteChange('marca')}
                    options={localOptions.marca}
                    onAddNewOption={(newOption) => updateLocalOptions('marca', newOption)}
                    placeholder="Ej: Dell, Apple, Samsung"
                    label="Marca"
                    error={errors.marca}
                  />
        </div>

        <div className="form-groupE">
         <AutocompleteInput
                    value={editedEquipment.model}
                    onChange={handleAutocompleteChange('model')}
                    options={localOptions.model}
                    onAddNewOption={(newOption) => updateLocalOptions('model', newOption)}
                    placeholder="Ej: Dell, Apple, Samsung"
                    label="Modelo"
                    error={errors.model}
                  />
          
        </div>

        {renderSerialSelect()}
        {renderUserSelect()}

        <div className="form-groupE">
          <label>Estado:</label>
          <input
            name="estado"
            value={editedEquipment.estado}
            onChange={handleInputChange}
            className={`form-inputE ${errors.estado ? 'error' : ''}`}
          />
          {errors?.estado && <span className="error-message">{errors.estado}</span>}
        </div>
      
        {renderIpSelect()}
        {errors?.IpEquipo && <span className="error-message">{errors.IpEquipo}</span>}
        
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
          <label>Descripción:</label>
          <textarea
            name="descripcion"
            value={editedEquipment.descripcion}
            onChange={handleInputChange}
            className={`form-textareaE ${errors.descripcion ? 'error' : ''}`}
          />
          {errors?.descripcion && <span className="error-message">{errors.descripcion}</span>}
        </div>
        
        <label className='titulo-datos'>Hardware</label>
        <div className="form-groupE">
                  <AutocompleteInput
                    value={editedEquipment.procesador}
                    onChange={handleAutocompleteChange('procesador')}
                    options={localOptions.procesador}
                    onAddNewOption={(newOption) => updateLocalOptions('procesador', newOption)}
                    placeholder="Ej: Dell, Apple, Samsung"
                    label="Procesador"
                    error={errors.procesador}
                  />
                </div>

        
        <div className="form-groupE">
          <label>RAM:</label>
          <input
            name="ram"
            value={editedEquipment.ram}
            onChange={handleInputChange}
            className={`form-inputE ${errors.ram ? 'error' : ''}`}
          />
          {errors?.ram && <span className="error-message">{errors.ram}</span>}
        </div>
        
        <div className="form-groupE">
          <label>Disco Duro:</label>
          <input
            name="discoDuro"
            value={editedEquipment.discoDuro}
            onChange={handleInputChange}
            className={`form-inputE ${errors.discoDuro ? 'error' : ''}`}
          />
          {errors?.discoDuro && <span className="error-message">{errors.discoDuro}</span>}
        </div>
        
        <div className="form-groupE">
          <label>Tarjeta Gráfica:</label>
          <input
            name="tarjetaGrafica"
            value={editedEquipment.tarjetaGrafica}
            onChange={handleInputChange}
            className={`form-inputE ${errors.tarjetaGrafica ? 'error' : ''}`}
          />
          {errors?.tarjetaGrafica && <span className="error-message">{errors.tarjetaGrafica}</span>}
        </div>
        
        <div className="form-groupE">
          <label>Sistema Operativo:</label>
          <input
            name="windows"
            value={editedEquipment.windows}
            onChange={handleInputChange}
            className={`form-inputE ${errors.windows ? 'error' : ''}`}
          />
          {errors?.windows && <span className="error-message">{errors.windows}</span>}
        </div>
        
        <div className="form-groupE">
          <label>Antivirus:</label>
          <input
            name="antivirus"
            value={editedEquipment.antivirus}
            onChange={handleInputChange}
            className={`form-inputE ${errors.antivirus ? 'error' : ''}`}
          />
          {errors?.antivirus && <span className="error-message">{errors.antivirus}</span>}
        </div>
        
        <div className="form-groupE">
          <label>Office:</label>
          <input
            name="office"
            value={editedEquipment.office}
            onChange={handleInputChange}
            className={`form-inputE ${errors.office ? 'error' : ''}`}
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
);

// Componente para el modo de visualización
const ViewMode = ({
  equipment,
  assignedUsers,
  handleOpenUserModal,
  getEstadoColor,
  isMobile,
  handlePrev,
  handleNext,
  currentIndex,
  totalEquipment,
  setIsEditing
}) => (
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
          {assignedUsers.map(user => user && (
            <div 
              key={user.id} 
              className="user-infoE clickable-user"
              onClick={(e) => {
                e.stopPropagation();
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
);

export default EquipDetailsModal;