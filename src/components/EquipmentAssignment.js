import React from 'react';
import Select from 'react-select';

const EquipmentAssignment = ({
  equipmentId,
  users = [],
  assignedUsers = [],
  categories = {},
  onAssign,
  onUnassign,
  onCategoryChange
}) => {
  // Filtrar usuarios no asignados
  const availableUsers = users.filter(
    user => !assignedUsers.some(assigned => assigned.id === user.id)
  );

  // Opciones para el select
  const userOptions = availableUsers.map(user => ({
    value: user.id,
    label: `${user.name} (${user.department})`
  }));

  // Manejar asignación de múltiples usuarios
  const handleAssignUsers = (selectedOptions) => {
    if (!selectedOptions || selectedOptions.length === 0) return;
    
    const userIds = selectedOptions.map(option => option.value);
    if (typeof onAssign === 'function') {
      onAssign(equipmentId, userIds);
    }
  };

  // Manejar cambio de categoría
  const handleUserCategoryChange = (userId, newCategory) => {
    if (typeof onCategoryChange === 'function') {
      onCategoryChange(equipmentId, userId, newCategory);
    }
  };

  // Manejar desasignación
  const handleUnassignUser = (userId) => {
    if (typeof onUnassign === 'function') {
      onUnassign(equipmentId, userId);
    }
  };

  return (
    <div className="equipment-assignment-container">
      {/* Selector para asignar nuevos usuarios */}
      <Select
        isMulti
        options={userOptions}
        onChange={handleAssignUsers}
        placeholder="Seleccionar usuarios para asignar..."
        className="user-select"
      />

      {/* Lista de usuarios asignados */}
      <div className="assigned-users-list">
        {assignedUsers.length === 0 ? (
          <p>No hay usuarios asignados</p>
        ) : (
          <div>
            {/* Sección por categorías */}
            {['casa', 'oficina', 'remoto'].map(category => {
              const categoryUsers = assignedUsers.filter(
                user => (categories[user.id] || 'casa') === category
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
                        <div className="user-info">
                          {user.imageBase64 ? (
                            <img 
                              src={user.imageBase64} 
                              alt={user.name}
                              className="user-avatar"
                            />
                          ) : (
                            <div className="user-avatar-placeholder">
                              {user.name.charAt(0)}
                            </div>
                          )}
                          <span className="user-name">{user.name}</span>
                          <span className="user-department">{user.department}</span>
                        </div>

                        <div className="user-actions">
                          <select
                            value={categories[user.id] || 'casa'}
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
  );
};

export default EquipmentAssignment;