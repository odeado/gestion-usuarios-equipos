// AddEquipmentForm.js
import React, { useState, useEffect, useRef, forwardRef } from 'react';
import imageCompression from 'browser-image-compression';
import CreatableSelect from 'react-select/creatable';
import './AddEquipmentForm.css';
import AutocompleteInput from './AutocompleteInput';

const AddEquipmentForm = forwardRef((props, ref) => {
  const { 
    onEquipmentAdded, 
    equipmentToEdit, 
    onEditEquipment, 
    onCancelEdit,
    parentAvailableIps = [],
    onAddNewIp,
    parentAvailableSerials = [],
    onAddNewSerial,
    availableModels = [],
    availableProcessors = [],
    availableBrands = []
  } = props;

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
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef();
  const [localOptions, setLocalOptions] = useState({
    model: availableModels,
    procesador: availableProcessors,
    marca: availableBrands
  });

  useEffect(() => {
    if (equipmentToEdit) {
      const ipEquipoArray = Array.isArray(equipmentToEdit.IpEquipo) ? 
        equipmentToEdit.IpEquipo : 
        (equipmentToEdit.IpEquipo ? [equipmentToEdit.IpEquipo] : []);

      setFormData({
        nombre: equipmentToEdit.nombre || '',
        type: equipmentToEdit.type || '',
        ciudad: equipmentToEdit.ciudad || '',
        estado: equipmentToEdit.estado || 'En uso',
        lugar: equipmentToEdit.lugar || '',
        descripcion: equipmentToEdit.descripcion || '',
        marca: equipmentToEdit.marca || '',
        model: equipmentToEdit.model || '',
        serialNumber: equipmentToEdit.serialNumber || '',
        procesador: equipmentToEdit.procesador || '',
        ram: equipmentToEdit.ram || '',
        discoDuro: equipmentToEdit.discoDuro || '',
        tarjetaGrafica: equipmentToEdit.tarjetaGrafica || '',
        windows: equipmentToEdit.windows || '',
        antivirus: equipmentToEdit.antivirus || '',
        office: equipmentToEdit.office || '',
        IpEquipo: ipEquipoArray,
        imageBase64: equipmentToEdit.imageBase64 || ''
      });
      setIsEditing(true);
    } else {
      resetForm();
    }
  }, [equipmentToEdit]);

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
    setIsEditing(false);
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

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
      if (isEditing && equipmentToEdit) {
        await onEditEquipment({
          ...formData,
          id: equipmentToEdit.id
        });
      } else {
        await onEquipmentAdded(formData);
        resetForm();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors(prev => ({ ...prev, form: 'Error al guardar los datos' }));
    }
  };

  const updateLocalOptions = (field, value) => {
    if (value && !localOptions[field].includes(value)) {
      setLocalOptions(prev => ({
        ...prev,
        [field]: [...prev[field], value]
      }));
    }
  };

  const handleAutocompleteChange = (field) => (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    e.target.name = field;
    handleChange(e);
  };

  const renderIpSelect = () => {
    const currentIps = Array.isArray(formData.IpEquipo) ? formData.IpEquipo : 
                     (formData.IpEquipo ? [formData.IpEquipo] : []);

    const options = [
      ...parentAvailableIps.map(ip => ({
        value: ip,
        label: ip
      })),
      ...(currentIps.length > 0 && !parentAvailableIps.includes(currentIps[0]) ? [{
        value: currentIps[0],
        label: currentIps[0]
      }] : [])
    ].filter(option => option.value);

    return (
      <div className="form-groupE">
        <label className="form-label">IP del Equipo</label>
        <CreatableSelect  
          isMulti={false}
          options={options}
          value={currentIps.length > 0 ? options.find(option => option.value === currentIps[0]) : null}
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
              onAddNewIp(newIp);
            }
          }}
          className="react-select-container"
          classNamePrefix="react-select"
          placeholder="Seleccione o cree una IP..."
          noOptionsMessage={() => "No hay IPs disponibles. Escriba para crear una nueva."}
          isSearchable
          formatCreateLabel={(inputValue) => `Crear nueva IP: ${inputValue}`}
        />
      </div>
    );
  };

  const renderSerialSelect = () => {
    const currentSerial = formData.serialNumber || '';

    const options = [
      ...parentAvailableSerials.map(serial => ({
        value: serial,
        label: serial
      })),
      ...(currentSerial && !parentAvailableSerials.includes(currentSerial) ? [{
        value: currentSerial,
        label: currentSerial
      }] : [])
    ].filter(option => option.value);

    return (
      <div className="form-groupE">
        <label className="form-label">Número de Serie</label>
        <CreatableSelect  
          isMulti={false}
          options={options}
          value={options.find(option => option.value === currentSerial)}
          onChange={(selectedOption) => {
            const serialValue = selectedOption?.value || '';
            setFormData(prev => ({
              ...prev,
              serialNumber: serialValue
            }));
          }}
          onCreateOption={(inputValue) => {
            const newSerial = inputValue.trim();
            if (newSerial) {
              setFormData(prev => ({
                ...prev,
                serialNumber: newSerial
              }));
              onAddNewSerial(newSerial);
            }
          }}
          className="react-select-container"
          classNamePrefix="react-select"
          placeholder="Seleccione o ingrese un número de serie..."
          noOptionsMessage={() => "No hay números de serie disponibles. Escriba para crear uno nuevo."}
          isSearchable
          formatCreateLabel={(inputValue) => `Usar nuevo serial: ${inputValue}`}
        />
        {errors.serialNumber && <div className="error-text">{errors.serialNumber}</div>}
      </div>
    );
  };

  return (
    <div className="eqipment-form" ref={ref}>
      <h3>{isEditing ? 'Editar Equipo' : 'Agregar Nuevo Equipo'}</h3>
      <form onSubmit={handleSubmit}>
        {isCompressing && <div className="loading-message">Comprimiendo imagen...</div>}
        {errors.form && <div className="error-message">{errors.form}</div>}
        
        {formData.imageBase64 && !isCompressing && (
          <div className="image-preview-container">
            <img src={formData.imageBase64} alt="Vista previa del equipo" />
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="nombre" className="form-label">Nombre de Equipo</label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Nombre de equipo"
              required
              className={`form-input ${errors.nombre ? 'input-error' : ''}`}
            />
            {errors.nombre && <div className="error-text">{errors.nombre}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="type" className="form-label">Tipo de Equipo</label>
            <input
              id="type"
              name="type"
              type="text"
              value={formData.type}
              onChange={handleChange}
              placeholder="Ej: Laptop, Teléfono, Monitor"
              required
              className={`form-input ${errors.type ? 'input-error' : ''}`}
            />
            {errors.type && <div className="error-text">{errors.type}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="ciudad" className="form-label">Ciudad</label>
            <input
              id="ciudad"
              name="ciudad"
              type="text"
              value={formData.ciudad}
              onChange={handleChange}
              placeholder="Ej: Ciudad de México, Bogotá"
              required
              className={`form-input ${errors.ciudad ? 'input-error' : ''}`}
            />
            {errors.ciudad && <div className="error-text">{errors.ciudad}</div>}
          </div>

          <div className="form-group department-group">
            <label htmlFor="estado" className="form-label">Estado</label>
            <select
              id="estado"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              required
              className={`user-selector ${errors.estado ? 'input-error' : ''}`}
            >
              <option value="Disponible">Disponible</option>
              <option value="En uso">En uso</option>
              <option value="Mantenimiento">Mantenimiento</option>
              <option value="Eliminado">Eliminado</option>
            </select>
            {errors.estado && <div className="error-text">{errors.estado}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="lugar" className="form-label">Lugar</label>
            <input
              id="lugar"
              name="lugar"
              type="text"
              value={formData.lugar}
              onChange={handleChange}
              placeholder="Ej: Oficina, Casa"
              required
              className={`form-input ${errors.lugar ? 'input-error' : ''}`}
            />
            {errors.lugar && <div className="error-text">{errors.lugar}</div>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="descripcion" className="form-label">Descripción</label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            placeholder="Descripción del equipo"
            className={`form-textarea ${errors.descripcion ? 'input-error' : ''}`}
          />
          {errors.descripcion && <div className="error-text">{errors.descripcion}</div>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <AutocompleteInput
              value={formData.marca}
              onChange={handleAutocompleteChange('marca')}
              options={localOptions.marca}
              onAddNewOption={(newOption) => updateLocalOptions('marca', newOption)}
              placeholder="Ej: Dell, Apple, Samsung"
              label="Marca"
              error={errors.marca}
            />
          </div>

          <div className="form-group">
            <AutocompleteInput
              value={formData.model}
              onChange={handleAutocompleteChange('model')}
              options={localOptions.model}
              onAddNewOption={(newOption) => updateLocalOptions('model', newOption)}
              placeholder="Ej: XPS 13, MacBook Pro"
              label="Modelo"
              error={errors.model}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            {renderSerialSelect()}
          </div>
          
          <div className="form-group">
            {renderIpSelect()}
            {errors?.IpEquipo && <span className="error-message">{errors.IpEquipo}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <AutocompleteInput
              value={formData.procesador}
              onChange={handleAutocompleteChange('procesador')}
              options={localOptions.procesador}
              onAddNewOption={(newOption) => updateLocalOptions('procesador', newOption)}
              placeholder="Ej: Intel i7, AMD Ryzen 5"
              label="Procesador"
              error={errors.procesador}
            />
          </div>

          <div className="form-group">
            <label htmlFor="ram" className="form-label">RAM</label>
            <input
              id="ram"
              name="ram"
              type="text"
              value={formData.ram}
              onChange={handleChange}
              placeholder="Ej: 16GB, 32GB"
              className={`form-input ${errors.ram ? 'input-error' : ''}`}
            />
            {errors.ram && <div className="error-text">{errors.ram}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="discoDuro" className="form-label">Disco Duro</label>
            <input
              id="discoDuro"
              name="discoDuro"
              type="text"
              value={formData.discoDuro}
              onChange={handleChange}
              placeholder="Ej: 512GB SSD, 1TB HDD"
              className={`form-input ${errors.discoDuro ? 'input-error' : ''}`}
            />
            {errors.discoDuro && <div className="error-text">{errors.discoDuro}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="tarjetaGrafica" className="form-label">Tarjeta Gráfica</label>
            <input
              id="tarjetaGrafica"
              name="tarjetaGrafica"
              type="text"
              value={formData.tarjetaGrafica}
              onChange={handleChange}
              placeholder="Ej: NVIDIA GTX 1660, AMD Radeon RX 580"
              className={`form-input ${errors.tarjetaGrafica ? 'input-error' : ''}`}
            />
            {errors.tarjetaGrafica && <div className="error-text">{errors.tarjetaGrafica}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="windows" className="form-label">Windows</label>
            <input
              id="windows"
              name="windows"
              type="text"
              value={formData.windows}
              onChange={handleChange}
              placeholder="Ej: Windows 10 Pro"
              className={`form-input ${errors.windows ? 'input-error' : ''}`}
            />
            {errors.windows && <div className="error-text">{errors.windows}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="antivirus" className="form-label">Antivirus</label>
            <input
              id="antivirus"
              name="antivirus"
              type="text"
              value={formData.antivirus}
              onChange={handleChange}
              placeholder="Ej: Norton, McAfee"
              className={`form-input ${errors.antivirus ? 'input-error' : ''}`}
            />
            {errors.antivirus && <div className="error-text">{errors.antivirus}</div>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="office" className="form-label">Office</label>
          <input
            id="office"
            name="office"
            type="text"
            value={formData.office}
            onChange={handleChange}
            placeholder="Ej: Office 2019"
            className={`form-input ${errors.office ? 'input-error' : ''}`}
          />
          {errors.office && <div className="error-text">{errors.office}</div>}
        </div>

        <div className="form-group image-upload-group">
          <label className="form-label">Imagen del Equipo</label>
          <div className="image-upload-container">
            <label htmlFor="image-upload" className="image-upload-label">
              Seleccionar imagen
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                ref={fileInputRef}
                disabled={isCompressing}
                className="image-upload-input"
              />
            </label>
            {errors.image && <div className="error-text">{errors.image}</div>}
          </div>
        </div>

        <div className="form-actions">
          {isEditing && (
            <button 
              type="button" 
              onClick={() => {
                onCancelEdit();
                resetForm();
              }}
              className="btn btn-cancel"
            >
              Cancelar
            </button>
          )}
          
          <button 
            type="submit" 
            disabled={isCompressing}
            className="btn btn-submit"
          >
            {isCompressing ? 'Guardando...' : (isEditing ? 'Actualizar Equipo' : 'Guardar Equipo')}
          </button>
        </div>
      </form>
    </div>
  );
});

export default AddEquipmentForm;