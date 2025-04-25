import React from 'react';

function EquipmentList({ equipment, users }) {
  const getAssignedUserName = (userId) => {
    if (!userId) return 'No asignado';
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Usuario desconocido';
  };

  return (
    <div className="equipment-list">
      <h2>Equipos</h2>
      <ul>
        {equipment.map(item => (
          <li key={item.id}>
            {item.type} - {item.model}
            <br />
            <small>Asignado a: {getAssignedUserName(item.assignedTo)}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default EquipmentList;