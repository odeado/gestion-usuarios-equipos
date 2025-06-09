import React, { useState, useEffect, useRef, forwardRef } from 'react';
import imageCompression from 'browser-image-compression';
import './AddEquipmentForm.css';
// Eliminé esta línea que causaba conflicto
import { ref } from 'firebase/storage';


const AddEquipmentForm = forwardRef((props, ref) => {
  const { 
    users, 
    onEquipmentAdded, 
    equipmentToEdit, 
    onEditEquipment, 
    onCancelEdit 
  } = props;

  const [formData, setFormData] = useState({
    nombre: '',
    type: '',
    ciudad: '',
    estado: '',
    lugar: '',
    descripcion: '',
    marca: '',
    model: '',
    serialNumber: '',

procesador: '',
ram: '',
discoDuro: '',
tarjetaGrafica: '',

    IpEquipo: '',
    assignedTo: '',
    imageBase64: ''
  });

  const [isCompressing, setIsCompressing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef();

  // Cargar datos del equipo a editar
  useEffect(() => {
    if (equipmentToEdit) {
      setFormData({
        nombre: equipmentToEdit.nombre || '',
        type: equipmentToEdit.type || '',
        ciudad: equipmentToEdit.ciudad || '',
        estado: equipmentToEdit.estado || '',
        lugar: equipmentToEdit.lugar || '',
        descripcion: equipmentToEdit.descripcion || '',
        marca: equipmentToEdit.marca || '',
        model: equipmentToEdit.model || '',
        serialNumber: equipmentToEdit.serialNumber || '',


procesador: equipmentToEdit.procesador || '',
        ram: equipmentToEdit.ram || '',
        discoDuro: equipmentToEdit.discoDuro || '',
        tarjetaGrafica: equipmentToEdit.tarjetaGrafica || '',

        IpEquipo: equipmentToEdit.IpEquipo || '',
        assignedTo: equipmentToEdit.assignedTo || '',
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
      estado: '',
      lugar: '',
      descripcion: '',
      marca: '',
      model: '',
      serialNumber: '',

procesador: '',
      ram: '',
      discoDuro: '',
      tarjetaGrafica: '',

      IpEquipo: '',
      assignedTo: '',
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
    if (!formData.assignedTo) newErrors.assignedTo = 'Debe asignar a un usuario';
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
    if (!validateForm()) return;

    try {
      if (isEditing && equipmentToEdit) {
        await onEditEquipment({
          id: equipmentToEdit.id,
          ...formData
        });
      } else {
        await onEquipmentAdded(formData);
      }
      resetForm();
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors(prev => ({ ...prev, form: 'Error al guardar los datos' }));
    }
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

</div>



        <div className="form-row">
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
            </div>

        <div className="form-row">
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
            <option value="">Seleccione un estado...</option> 
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
            <label htmlFor="marca" className="form-label">Marca</label>
            <input
              id="marca"
              name="marca"
              type="text"
              value={formData.marca}
              onChange={handleChange}
              placeholder="Ej: Dell, Apple, Samsung"
              required
              className={`form-input ${errors.marca ? 'input-error' : ''}`}
            />
            {errors.marca && <div className="error-text">{errors.marca}</div>}
          </div>
          </div>
          


          <div className="form-group">
            <label htmlFor="model" className="form-label">Modelo</label>
            <input
              id="model"
              name="model"
              type="text"
              value={formData.model}
              onChange={handleChange}
              placeholder="Ej: Dell XPS 15, iPhone 13"
              required
              className={`form-input ${errors.model ? 'input-error' : ''}`}
            />
            {errors.model && <div className="error-text">{errors.model}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="serialNumber" className="form-label">Número de Serie</label>
            <input
              id="serialNumber"
              name="serialNumber"
              type="text"
              value={formData.serialNumber}
              onChange={handleChange}
              placeholder="Ej: SN123456789"
              required
              className={`form-input ${errors.serialNumber ? 'input-error' : ''}`}
            />
            {errors.serialNumber && <div className="error-text">{errors.serialNumber}</div>}
          </div>
        
          <div className="form-group">
            <label htmlFor="IpEquipo" className="form-label">IP Equipo</label>
            <input
              id="IpEquipo"
              name="IpEquipo"
              type="text"
              value={formData.IpEquipo}
              onChange={handleChange}
              placeholder="Ej: Dell XPS 15, iPhone 13"
              required
              className={`form-input ${errors.IpEquipo ? 'input-error' : ''}`}
            />
            {errors.IpEquipo && <div className="error-text">{errors.IpEquipo}</div>}
          </div>


        <div className="form-row">
          <div className="form-group department-group">
            <label className="form-label">Asignar a</label>
            <select
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              className="user-selector"
            >
              <option value="">Seleccione un usuario...</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} - {user.department}
                </option>
              ))}
            </select>
          </div>
        </div>


<div className="form-row">
          <div className="form-group">
            <label htmlFor="procesador" className="form-label">Procesador</label>
            <input
              id="procesador"
              name="procesador"
              type="text"
              value={formData.procesador}
              onChange={handleChange}
              placeholder="Ej: Intel i7, AMD Ryzen 5"
              className={`form-input ${errors.procesador ? 'input-error' : ''}`}
            />
            {errors.procesador && <div className="error-text">{errors.procesador}</div>}
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
