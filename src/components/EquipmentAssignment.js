import React from 'react';
import Select from 'react-select';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Componente para los usuarios asignados (ahora draggable)
const DraggableUserItem = ({ 
  user, 
  category, 
  onCategoryChange, 
  onUnassign 
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ASSIGNED_USER',
    item: { userId: user.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <li 
      ref={drag}
      className={`assigned-user-item ${isDragging ? 'dragging' : ''}`}
    >
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
          value={category}
          onChange={(e) => onCategoryChange(user.id, e.target.value)}
          className="category-select"
        >
          <option value="casa">Casa</option>
          <option value="oficina">Oficina</option>
          <option value="remoto">Remoto</option>
        </select>

        <button
          onClick={() => onUnassign(user.id)}
          className="unassign-btn"
        >
          Quitar
        </button>
      </div>
    </li>
  );
};

// Componente para la zona de drop de categorías
const CategoryDropZone = ({ 
  category, 
  children, 
  onDropUser 
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'ASSIGNED_USER',
    drop: (item) => onDropUser(item.userId, category),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div 
      ref={drop}
      className={`user-category-section ${isOver ? 'drop-active' : ''}`}
    >
      {children}
    </div>
  );
};

const EquipmentAssignment = ({
  equipmentId,
  users = [],
  assignedUsers = [],
  categories = {},
  onAssign,
  onUnassign,
  onCategoryChange
}) => {
  const availableUsers = users.filter(
    user => !assignedUsers.some(assigned => assigned.id === user.id)
  );

  const userOptions = availableUsers.map(user => ({
    value: user.id,
    label: `${user.name} (${user.department})`
  }));

  const handleAssignUsers = (selectedOptions) => {
    if (!selectedOptions || selectedOptions.length === 0) return;
    const userIds = selectedOptions.map(option => option.value);
    onAssign?.(equipmentId, userIds);
  };

  const handleDropUser = (userId, newCategory) => {
    onCategoryChange?.(equipmentId, userId, newCategory);
  };

  const handleUnassignUser = (userId) => {
    onUnassign?.(equipmentId, userId);
  };

  // Agrupar usuarios por categoría para el renderizado
  const usersByCategory = {
    casa: assignedUsers.filter(user => (categories[user.id] || 'casa') === 'casa'),
    oficina: assignedUsers.filter(user => (categories[user.id] || 'casa') === 'oficina'),
    remoto: assignedUsers.filter(user => (categories[user.id] || 'casa') === 'remoto')
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="equipment-assignment-container">
        <h3>Asignar Usuarios</h3>
        
        <Select
          isMulti
          options={userOptions}
          onChange={handleAssignUsers}
          placeholder="Seleccionar usuarios para asignar..."
          className="user-select"
        />

        <div className="assigned-users-list">
          {assignedUsers.length === 0 ? (
            <p>No hay usuarios asignados</p>
          ) : (
            <div>
              {/* Zona de drop para Casa */}
              <CategoryDropZone 
                category="casa" 
                onDropUser={handleDropUser}
              >
                <h4 className="user-category-title">🏠 En Casa</h4>
                <ul>
                  {usersByCategory.casa.map(user => (
                    <DraggableUserItem
                      key={user.id}
                      user={user}
                      category={categories[user.id] || 'casa'}
                      onCategoryChange={(userId, newCat) => 
                        onCategoryChange(userId, newCat)
                      }
                      onUnassign={handleUnassignUser}
                    />
                  ))}
                </ul>
              </CategoryDropZone>

              {/* Zona de drop para Oficina */}
              <CategoryDropZone 
                category="oficina" 
                onDropUser={handleDropUser}
              >
                <h4 className="user-category-title">🏢 En Oficina</h4>
                <ul>
                  {usersByCategory.oficina.map(user => (
                    <DraggableUserItem
                      key={user.id}
                      user={user}
                      category={categories[user.id] || 'casa'}
                      onCategoryChange={(userId, newCat) => 
                        onCategoryChange(userId, newCat)
                      }
                      onUnassign={handleUnassignUser}
                    />
                  ))}
                </ul>
              </CategoryDropZone>

              {/* Zona de drop para Remoto */}
              <CategoryDropZone 
                category="remoto" 
                onDropUser={handleDropUser}
              >
                <h4 className="user-category-title">🌐 Remotos</h4>
                <ul>
                  {usersByCategory.remoto.map(user => (
                    <DraggableUserItem
                      key={user.id}
                      user={user}
                      category={categories[user.id] || 'casa'}
                      onCategoryChange={(userId, newCat) => 
                        onCategoryChange(userId, newCat)
                      }
                      onUnassign={handleUnassignUser}
                    />
                  ))}
                </ul>
              </CategoryDropZone>
            </div>
          )}
        </div>
      </div>
    </DndProvider>
  );
};

export default EquipmentAssignment;