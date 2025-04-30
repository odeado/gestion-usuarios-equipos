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
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Modelo</th>
            <th>Asignado a</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {equipment.map(item => (
            <tr key={item.id}>
              <td data-label="Nombre">{item.nombre}</td>
              <td data-label="Tipo">{item.type}</td>
              <td data-label="Modelo">{item.model}</td>
              <td data-label="Asignado a">{getAssignedUserName(item.assignedTo)}</td>
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
