import React, { useEffect, useState } from 'react';
import './UserDetailsModal.css';

function UserDetailsModal({ 
  user, 
  users, 
  equipment, 
  onClose, 
  onEdit, 
  onNext,
  imageCompression,
  onDelete, 
  onPrev, 
  onAddDepartment,
  departments = [] 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({ ...user });
  const [showAddDepartment, setShowAddDepartment] = useState(false);
  const [newDepartment, setNewDepartment] = useState('');
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const currentIndex = users.findIndex(u => u.id === user.id);
  const userEquipment = equipment.filter(item => item.assignedTo === user.id);

  useEffect(() => {
    setEditedUser({ ...user });
    setImagePreview(user.imageBase64 || null);
  }, [user]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if(e.key === 'ArrowLeft') onPrev();
      else if(e.key === 'ArrowRight') onNext();
      else if(e.key === 'Escape') onClose();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPrev, onNext, onClose]);

  const validateForm = () => {
    const newErrors = {};
    if (!editedUser.name?.trim()) newErrors.name = 'Nombre es requerido';
    if (!editedUser.name?.trim()) newErrors.tipoVpn = 'Tipo de Vpn';
    if (!editedUser.correo?.trim()) newErrors.correo = 'Correo es requerido';
    else if (!/\S+@\S+\.\S+/.test(editedUser.correo)) newErrors.correo = 'Correo inválido';
    if (!editedUser.department?.trim()) newErrors.department = 'Departamento es requerido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
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
          setImagePreview(reader.result);
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

  const handleSave = async () => {
    if (!validateForm()) return;
    await onEdit(editedUser);  // <-- Espera que se actualice
    setIsEditing(false);
  };
  

  const renderDepartmentSelect = () => {
    const currentDept = editedUser.department;
    const deptExists = departments.some(d => (d.name || d) === currentDept);

    return (
      <div className="department-select-container">
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
          className={`edit-input ${errors.department ? 'input-error' : ''}`}
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
                className="add-button"
              >
                Agregar
              </button>
              <button 
                type="button" 
                onClick={() => setShowAddDepartment(false)}
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
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>×</button>

        <div className="modal-header">
          {isEditing ? (
            <div className="image-upload-container">
              <label htmlFor="modal-image-upload" className="image-upload-label">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="modal-user-image editable" />
                ) : (
                  <div className="image-placeholder">+ Imagen</div>
                )}
                <input
                  id="modal-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isCompressing}
                  className="image-upload-input"
                />
              </label>
              {errors.image && <span className="error-text">{errors.image}</span>}
            </div>
          ) : (
            user.imageBase64 && (
              <img src={user.imageBase64} alt={user.name} className="modal-user-image" />
            )
          )}
          
          {isEditing ? (
            <div className="edit-fields">
              <div className="form-group">
                <input
                  name="name"
                  value={editedUser.name}
                  onChange={handleInputChange}
                  placeholder="Nombre"
                  className={`edit-input ${errors.name ? 'input-error' : ''}`}
                />
                {errors.name && <div className="error-text">{errors.name}</div>}
              </div>
              
              <div className="form-group">
                <input
                  name="correo"
                  type="email"
                  value={editedUser.correo}
                  onChange={handleInputChange}
                  placeholder="Correo electrónico"
                  className={`edit-input ${errors.correo ? 'input-error' : ''}`}
                />
                {errors.correo && <div className="error-text">{errors.correo}</div>}
              </div>

                  <div className="form-group">
                <input
                  name="tipoVpn"
                  type="tipoVpn"
                  value={editedUser.tipoVpn}
                  onChange={handleInputChange}
                  placeholder="Tipo Vpn"
                  className={`edit-input ${errors.tipoVpn ? 'input-error' : ''}`}
                />
                {errors.tipoVpn && <div className="error-text">{errors.tipoVpn}</div>}
              </div>



                  
              
              <div className="form-group">
                <label className="form-label">Departamento</label>
                {renderDepartmentSelect()}
              </div>
            </div>
          ) : (
            <div className="view-mode">
              <h2>{user.name}</h2>
              <p>{user.correo}</p>
            
            <p className="form-label">{user.tipoVpn}</p>
              <p className="department-badge">{user.department}</p>
            </div>
          )}
        </div>

        <div className="modal-body">
          <h3>Equipos en uso</h3>
          {userEquipment.length > 0 ? (
            <ul className="equipment-list">
              {userEquipment.map(item => (
                <li key={item.id}>
                  <strong>{item.name}</strong> - {item.type} (N° Serie: {item.serialNumber})
                </li>
              ))}
            </ul>
          ) : (
            <p>Sin equipos asignados actualmente</p>
          )}
        </div>

        <div className="modal-footer">
          <div className="navigation-buttons">
            <button 
              onClick={onPrev} 
              disabled={currentIndex === 0}
              className="nav-button prev-button"
            >
              &larr; Anterior
            </button>

            {isEditing ? (
              <>
                <button 
                  onClick={handleSave} 
                  className="action-button save-button"
                  disabled={isCompressing}
                >
                  {isCompressing ? 'Guardando...' : '✅ Guardar'}
                </button>
                <button 
                  onClick={() => {
                    setIsEditing(false);
                    setEditedUser({ ...user });
                    setErrors({});
                  }} 
                  className="action-button cancel-button"
                >
                  ❌ Cancelar
                </button>
              </>
            ) : (
              <button 
                onClick={() => setIsEditing(true)} 
                className="action-button edit-button"
              >
                ✏️ Editar
              </button>
            )}

            <button 
              onClick={onNext} 
              disabled={currentIndex === users.length - 1}
              className="nav-button next-button"
            >
              Siguiente &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDetailsModal;
