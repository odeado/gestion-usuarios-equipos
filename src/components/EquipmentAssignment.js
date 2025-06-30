import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import PropTypes from 'prop-types';
import './EquipmentAssignment.css';

const EquipmentAssignment = ({ 
  equipmentId, 
  users = [], 
  assignedUsers = [], 
  categories = {}, 
  onAssign, 
  onUnassign,
  onAssignmentChange
}) => {
  const [editing, setEditing] = useState(false);
  const [newAssignments, setNewAssignments] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Efecto para debug
  useEffect(() => {
    console.log("EquipmentAssignment mounted with:", {
      equipmentId,
      assignedUsers: assignedUsers.map(u => u.id),
      categories
    });
  }, [equipmentId, assignedUsers, categories]);

  const availableUsers = users.filter(
    user => !assignedUsers.some(au => au.id === user.id)
  );

  const handleAssign = (selectedOptions) => {
    setNewAssignments(selectedOptions.map(opt => opt.value));
  };

  const handleSaveAssignments = async () => {
    if (newAssignments.length === 0) {
      setEditing(false);
      return;
    }

    setIsProcessing(true);
    try {
      // Crear array de updates para bulk assignment
      const updates = newAssignments.map(userId => ({
        userId,
        equipmentId,
        category: 'casa' // Valor por defecto
      }));

      await onAssign(updates);
      setNewAssignments([]);
      setEditing(false);
    } catch (error) {
      console.error("Error saving assignments:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCategoryChange = async (userId, newCategory) => {
    if (!userId || !equipmentId) {
      console.error("Faltan parámetros para cambiar categoría");
      return;
    }

     // Verificar que el usuario existe en la lista local
    const userExists = users.some(u => u.id === userId);
    if (!userExists) {
      console.error(`Usuario ${userId} no encontrado en la lista local`);
      return;
    }

    setIsProcessing(true);
    try {
      console.log(`Actualizando categoría: Usuario ${userId}, Equipo ${equipmentId}, Categoría ${newCategory}`);
      await onAssignmentChange(userId, equipmentId, newCategory);
    } catch (error) {
      console.error("Error cambiando categoría:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnassign = async (userId) => {
    if (!userId || !equipmentId) {
      console.error("Faltan parámetros para desasignar");
      return;
    }

    setIsProcessing(true);
    try {
      console.log(`Desasignando usuario ${userId} del equipo ${equipmentId}`);
      await onUnassign(userId, equipmentId);
    } catch (error) {
      console.error("Error desasignando usuario:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Determinar categoría actual para un usuario
  const getCurrentCategory = (userId) => {
    return categories[userId] || 
           assignedUsers.find(u => u.id === userId)?.categoriasTemporales?.[equipmentId] || 
           'casa';
  };

  return (
    <div className="equipment-assignment-container">
      <div className="assignment-header">
        <h3>Usuarios Asignados ({assignedUsers.length})</h3>
        {availableUsers.length > 0 && (
          <button 
            onClick={() => setEditing(!editing)}
            disabled={isProcessing}
            className={`toggle-edit-btn ${editing ? 'active' : ''}`}
          >
            {editing ? 'Cancelar' : 'Asignar Usuarios'}
          </button>
        )}
      </div>

      {editing && (
        <div className="edit-mode">
          <Select
            isMulti
            options={availableUsers.map(user => ({
              value: user.id,
              label: `${user.name} (${user.department || 'Sin departamento'})`,
              user // Guardar referencia completa para debug
            }))}
            onChange={handleAssign}
            placeholder="Seleccione usuarios para asignar..."
            className="equipment-select"
            isDisabled={isProcessing}
          />
          
          <div className="assignment-actions">
            <button 
              onClick={handleSaveAssignments}
              disabled={newAssignments.length === 0 || isProcessing}
              className="save-btn"
            >
              {isProcessing ? 'Procesando...' : 'Guardar Asignaciones'}
            </button>
          </div>
        </div>
      )}

      <div className="assigned-users-list">
        {assignedUsers.length === 0 ? (
          <p className="no-users-message">No hay usuarios asignados a este equipo</p>
        ) : (
          <ul>
            {assignedUsers.map(user => {
              const currentCategory = getCurrentCategory(user.id);
              
              return (
                <li key={user.id} className="assigned-user-item">
                  <div className="user-info">
                    <span className="name">{user.name}</span>
                    <span className="department">{user.department}</span>
                  </div>
                  
                  <div className="user-actions">
                    <select
                      value={currentCategory}
                      onChange={(e) => handleCategoryChange(user.id, e.target.value)}
                      className="category-select"
                      disabled={isProcessing}
                    >
                      <option value="casa">Casa</option>
                      <option value="oficina">Oficina</option>
                      <option value="remoto">Remoto</option>
                    </select>
                    
                    <button 
                      onClick={() => handleUnassign(user.id)}
                      disabled={isProcessing}
                      className="unassign-btn"
                    >
                      {isProcessing ? '...' : 'Desasignar'}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

EquipmentAssignment.propTypes = {
  equipmentId: PropTypes.string.isRequired,
  users: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    department: PropTypes.string,
    categoriasTemporales: PropTypes.object
  })),
  assignedUsers: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    department: PropTypes.string,
    categoriasTemporales: PropTypes.object
  })),
  categories: PropTypes.object, // Mapa de {userId: category}
  onAssign: PropTypes.func.isRequired, // (updates: Array<{userId, equipmentId, category}>) => Promise<void>
  onUnassign: PropTypes.func.isRequired, // (userId, equipmentId) => Promise<void>
  onAssignmentChange: PropTypes.func.isRequired // (userId, equipmentId, category) => Promise<void>
};

export default EquipmentAssignment;