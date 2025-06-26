import React, { useState } from 'react';
import Select from 'react-select';
import './EquipmentAssignment.css';

const EquipmentAssignment = ({ 
  userId, 
  users = [], 
  assignedUsers = [], 
  onAssign, 
  onUnassign,
  onCategoryChange
}) => {
  const [editing, setEditing] = useState(false);
  const [newAssignments, setNewAssignments] = useState([]);
  const [categories, setCategories] = useState({});

  // users disponibles para asignar (no asignados aún)
  const availableUsers = users.filter(
    user => !assignedUsers.some(ae => ae.id === user.id)
  );

  const handleAssign = (selectedOptions) => {
    const selectedIds = selectedOptions.map(opt => opt.value);
    setNewAssignments(selectedIds);
  };

  const handleSaveAssignments = () => {
    if (newAssignments.length > 0) {
      onAssign(userId, newAssignments);
      setNewAssignments([]);
    }
    setEditing(false);
  };

  const handleCategoryChange = (equipmentId, category) => {
    setCategories(prev => ({ ...prev, [equipmentId]: category }));
    if (onCategoryChange) {
      onCategoryChange(equipmentId, category);
    }
  };

  return (
    <div className="equipment-assignment-container">
      <div className="assignment-header">
        <h3>Gestión de users</h3>
        <button 
          onClick={() => setEditing(!editing)}
          className={`toggle-edit-btn ${editing ? 'active' : ''}`}
        >
          {editing ? 'Cancelar' : 'Asignar users'}
        </button>
      </div>

      {editing ? (
        <div className="edit-mode">
          <Select
            isMulti
            options={availableUsers.map(user => ({
              value: user.id,
              label: `${user.name} (${user.department || 'Sin departamento'})`
            }))}
            onChange={handleAssign}
            placeholder="Seleccione users para asignar..."
            className="equipment-select"
          />
          
          <div className="assignment-actions">
            <button 
              onClick={handleSaveAssignments}
              disabled={newAssignments.length === 0}
              className="save-btn"
            >
              Guardar Asignaciones
            </button>
          </div>
        </div>
      ) : null}

      <div className="assigned-equipment-list">
        <h4>Usuarios Asignados ({assignedUsers.length})</h4>
        {assignedUsers.length === 0 ? (
          <p>No hay usuarios asignados</p>
        ) : (
          <ul>
            {assignedUsers.map(user => (
              <li key={user.id}>
                <div className="equipment-info">
                  <span className="name">{user.name}</span>
                  <span className="type">{user.department}</span>
                  <span className="ip">{user.email || 'Sin Email'}</span>
                </div>
                
                <div className="equipment-actions">
                  <select
                    value={categories[user.id] || 'casa'}
                    onChange={(e) => handleCategoryChange(user.id, e.target.value)}
                    className="category-select"
                  >
                    <option value="casa">Casa</option>
                    <option value="oficina">Oficina</option>
                    <option value="remoto">Remoto</option>
                  </select>
                  
                  <button 
                    onClick={() => onUnassign(userId, user.id)}
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
  );
};

export default EquipmentAssignment;