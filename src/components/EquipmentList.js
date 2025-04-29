import React from 'react';
import './EquipmentList.css';

function EquipmentList({ equipment, users, onSelectEquipment, onDeleteEquipment, onEditEquipment }) {
  const getAssignedUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'No asignado';
  };

  return (
    <div className="equipment-list">
      <h2>Lista de Equipos</h2>
      <table>
        <thead>
          <tr>
    
            <th>Tipo</th>
            <th>Modelo</th>
            <th>Asignado a</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {equipment.map(item => (
            <tr key={item.id}>
              
              <td>{item.type}</td>
              <td>{item.model}</td>
              <td>{getAssignedUserName(item.assignedTo)}</td>
              <td className="actions">
                <button 
                  onClick={() => onEditEquipment(item)}
                  className="edit-button"
                >
                  Editar
                </button>
                <button 
                  onClick={() => onDeleteEquipment(item.id)}
                  className="delete-button"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EquipmentList;
