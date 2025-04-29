// src/components/EquipmentCard.js
import React from 'react';
import './EquipmentCard.css';

function EquipmentCard({ equipment, assignedUser }) {
  return (
    <div className="user-card">
      {equipment.imageBase64 && (
        <img 
          src={equipment.imageBase64} 
          alt={`${equipment.type} - ${equipment.model}`} 
          className="user-avatar"
        />
      )}
      <h3>{equipment.type}</h3>
      <p><strong>Modelo:</strong> {equipment.model}</p>
      <p>
        <strong>Asignado a:</strong>{' '}
        {assignedUser ? `${assignedUser.name} (${assignedUser.department})` : 'Sin asignar'}
      </p>
    </div>
  );
}

export default EquipmentCard;
