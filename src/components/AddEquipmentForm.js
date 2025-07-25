import React, { useState, useEffect, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import CreatableSelect from 'react-select/creatable';
import AutocompleteInput from './AutocompleteInput';
import './AddEquipmentForm.css';

const AddEquipmentForm = ({
  onEquipmentAdded,
  onCancel,
  parentAvailableIps = [],
  onAddNewIp,
  parentAvailableSerials = [],
  onAddNewSerial,
  parentAvailableMarcas = [],
  onAddNewMarca,
  parentAvailableLugares = [],
  onAddNewLugar,
  parentAvailableCiudades = [],
  onAddNewCiudad,
  parentAvailableNombres = [],
  onAddNewNombre,
  parentAvailableTypes = [],
  onAddNewType,
  parentAvailableModels = [],
  onAddNewModel,
  
  setAvailableProcessors = () => console.warn('setAvailableProcessors no está definido'),
  availableModels = [],
  availableProcessors = [],
  
  availableBrands = []
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
    imageBase64: ''
  });

  const [isCompressing, setIsCompressing] = useState(false);
  
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef();

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'Nombre requerido';
    if (!formData.type.trim()) newErrors.type = 'Tipo es requerido';
    if (!formData.model.trim()) newErrors.model = 'Modelo es requerido';
    if (!formData.serialNumber.trim()) newErrors.serialNumber = 'Número de serie es requerido';
    if (!formData.imageBase64) newErrors.image = 'Imagen es requerida';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
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
        setErrors(prev => ({ ...prev, image: 'Error al procesar la imagen' }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onEquipmentAdded(formData);
      resetForm();
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors(prev => ({ ...prev, form: 'Error al guardar los datos' }));
    }
  };

  const resetForm = () => {
    setFormData({
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
      imageBase64: ''
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
    setErrors({});
  };

  const renderIpSelect = () => {
    const currentIp = Array.isArray(formData.IpEquipo) && formData.IpEquipo.length > 0 
      ? formData.IpEquipo[0] 
      : '';

    const options = [
      ...parentAvailableIps.map(ip => ({ 
        value: ip, 
        label: ip 
      })),
      ...(currentIp && !parentAvailableIps.includes(currentIp) ? 
        [{ 
          value: currentIp, 
          label: currentIp 
        }] : [])
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



  return (
    <div className="equipment-form-modal">
      <div className="modal-contentE">
        <div className="modal-headerE">
          <button className="close-btnE" onClick={onCancel}>×</button>
          <h2>Agregar Nuevo Equipo</h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          {isCompressing && <div className="loading-message">Comprimiendo imagen...</div>}
          {errors.form && <div className="error-message">{errors.form}</div>}

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
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <button 
                    type="button" 
                    className="remove-image-btn"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, imageBase64: '' }));
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
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
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                  />
                </label>
                {errors.image && <div className="error-text">{errors.image}</div>}
              </div>
            )}
          </div>

          <div className="form-fields-container">
            <div className="form-groupDatosE">
               <CreatableInput
                label="Nombre del Equipo"
                value={formData.nombre}
                options={parentAvailableNombres}
                onChange={(value) => setFormData(prev => ({ ...prev, nombre: value }))}
                onCreateNew={onAddNewNombre}
                error={errors.nombre}
              />

              <CreatableInput
                label="Tipo de Equipo"
                value={formData.type}
                options={parentAvailableTypes}
                onChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                onCreateNew={onAddNewType}
                error={errors.type}
              />
              

              <CreatableInput
                label="Marca"
                value={formData.marca}
                options={parentAvailableMarcas}
                onChange={(value) => setFormData(prev => ({ ...prev, marca: value }))}
                onCreateNew={onAddNewMarca}
                error={errors.marca}
              />

              <CreatableInput
                label="Ciudad"
                value={formData.ciudad}
                options={parentAvailableCiudades}
                onChange={(value) => setFormData(prev => ({ ...prev, ciudad: value }))}
                onCreateNew={onAddNewCiudad}
                error={errors.ciudad}
              />



              <CreatableInput
                label="Modelo"
                value={formData.model}
                options={parentAvailableModels}
                onChange={(value) => setFormData(prev => ({ ...prev, model: value }))}
                onCreateNew={onAddNewModel}
                error={errors.model}
                noOptionsMessage="No hay números de Modelo disponibles. Escriba para crear uno nuevo."
                formatCreateLabel={(inputValue) => `Usar nuevo modelo: ${inputValue}`}
              />

               <CreatableInput
                label="Número de Serie"
                value={formData.serialNumber}
                options={parentAvailableSerials}
                onChange={(value) => setFormData(prev => ({ ...prev, serialNumber: value }))}
                onCreateNew={onAddNewSerial}
                error={errors.serialNumber}
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
                  className={`form-inputE ${errors.estado ? 'error' : ''}`}
                >
                  <option value="Disponible">Disponible</option>
                  <option value="En uso">En uso</option>
                  <option value="Mantenimiento">Mantenimiento</option>
                  <option value="Eliminado">Eliminado</option>
                </select>
                {errors.estado && <div className="error-text">{errors.estado}</div>}
              </div>
            
                <CreatableInput
                label="Lugar"
                value={formData.lugar}
                options={parentAvailableLugares}
                onChange={(value) => setFormData(prev => ({ ...prev, lugar: value }))}
                onCreateNew={onAddNewLugar}
                error={errors.lugar}
              />

              <div className="form-groupE">
                <label>Descripción:</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  className={`form-textareaE ${errors.descripcion ? 'error' : ''}`}
                  placeholder="Descripción del equipo"
                />
                {errors.descripcion && <div className="error-text">{errors.descripcion}</div>}
              </div>
            </div>

            <div className="form-groupDatosE">
              <div className="form-groupE">
  <AutocompleteInput
    key={`processor-select-form-${availableProcessors.length}`}
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
    error={errors.procesador}
    enableDelete={true}
  />
</div>

              <div className="form-groupE">
                <label>RAM:</label>
                <input
                  name="ram"
                  value={formData.ram}
                  onChange={handleChange}
                  className={`form-inputE ${errors.ram ? 'error' : ''}`}
                  placeholder="Ej: 16GB, 32GB"
                />
                {errors.ram && <div className="error-text">{errors.ram}</div>}
              </div>

              <div className="form-groupE">
                <label>Disco Duro:</label>
                <input
                  name="discoDuro"
                  value={formData.discoDuro}
                  onChange={handleChange}
                  className={`form-inputE ${errors.discoDuro ? 'error' : ''}`}
                  placeholder="Ej: 512GB SSD, 1TB HDD"
                />
                {errors.discoDuro && <div className="error-text">{errors.discoDuro}</div>}
              </div>

              <div className="form-groupE">
                <label>Tarjeta Gráfica:</label>
                <input
                  name="tarjetaGrafica"
                  value={formData.tarjetaGrafica}
                  onChange={handleChange}
                  className={`form-inputE ${errors.tarjetaGrafica ? 'error' : ''}`}
                  placeholder="Ej: NVIDIA GTX 1660, AMD Radeon RX 580"
                />
                {errors.tarjetaGrafica && <div className="error-text">{errors.tarjetaGrafica}</div>}
              </div>

              <div className="form-groupE">
                <label>Windows:</label>
                <input
                  name="windows"
                  value={formData.windows}
                  onChange={handleChange}
                  className={`form-inputE ${errors.windows ? 'error' : ''}`}
                  placeholder="Ej: Windows 10 Pro"
                />
                {errors.windows && <div className="error-text">{errors.windows}</div>}
              </div>

              <div className="form-groupE">
                <label>Antivirus:</label>
                <input
                  name="antivirus"
                  value={formData.antivirus}
                  onChange={handleChange}
                  className={`form-inputE ${errors.antivirus ? 'error' : ''}`}
                  placeholder="Ej: Norton, McAfee"
                />
                {errors.antivirus && <div className="error-text">{errors.antivirus}</div>}
              </div>

              <div className="form-groupE">
                <label>Office:</label>
                <input
                  name="office"
                  value={formData.office}
                  onChange={handleChange}
                  className={`form-inputE ${errors.office ? 'error' : ''}`}
                  placeholder="Ej: Office 2019"
                />
                {errors.office && <div className="error-text">{errors.office}</div>}
              </div>
            </div>
          </div>

          <div className="modal-actionsE">
            <button
              type="button"
              className="cancel-btn"
              onClick={onCancel}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="save-btn"
              disabled={isCompressing}
            >
              {isCompressing ? 'Guardando...' : 'Guardar Equipo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEquipmentForm;