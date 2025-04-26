import React from 'react';

function EquipmentCard({ equipment, users }) {
  const assignedUser = users.find(user => user.id === equipment.assignedTo);

  return (
    <div className="equipment-card">
      {equipment.imageBase64 && (
        <img 
          src={equipment.imageBase64} 
          alt={equipment.type}
          className="equipment-image"
        />
      )}
      <h3>{equipment.type}</h3>
      <p>Modelo: {equipment.model}</p>
      <p>
        Asignado a: {assignedUser 
          ? `${assignedUser.name}` 
          : 'No asignado'}
      </p>
      <p>
        Fecha registro: {new Date(equipment.createdAt?.seconds * 1000).toLocaleDateString()}
      </p>
    </div>
  );
}

export default EquipmentCard;
