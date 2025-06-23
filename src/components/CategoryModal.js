// CategoryModal.js
import React from 'react';
import Select from 'react-select';
import './AddEquipmentForm.css'; // Importamos los mismos estilos

const CategoryModal = ({ 
  isOpen, 
  onClose, 
  currentUserId, 
  users,
  currentCategory,
  onCategoryChange 
}) => {
  if (!isOpen) return null;

  const user = users.find(u => u.id === currentUserId);
  const userName = user ? `${user.name} - ${user.department}` : 'Usuario desconocido';

  const categoryOptions = [
    { value: 'casa', label: 'Casa' },
    { value: 'oficina', label: 'Oficina' },
    { value: 'remoto', label: 'Remoto' }
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '400px' }}>
        <h3>Seleccionar categoría para {userName}</h3>
        
        <div className="form-group">
          <Select
            options={categoryOptions}
            value={categoryOptions.find(opt => opt.value === currentCategory)}
            onChange={(selectedOption) => {
              onCategoryChange(currentUserId, selectedOption.value);
              onClose();
            }}
            className="react-select-container"
            classNamePrefix="react-select"
            placeholder="Seleccione categoría..."
            menuPlacement="auto"
            autoFocus
          />
        </div>

        <div className="modal-actions">
          <button 
            onClick={onClose} 
            className="btn btn-cancel"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;