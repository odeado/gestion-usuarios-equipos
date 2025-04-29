// src/components/EquipmentList.js
import React from 'react';
import EquipmentCard from './EquipmentCard';
import './EquipmentList.css';

function EquipmentList({ equipment, users }) {
  return (
    <div className="user-list">
      <h2>Equipos Registrados</h2>
      <div className="user-list-grid">
        {equipment.map(item => {
          const assignedUser = users.find(u => u.id === item.assignedTo);
          return (
            <EquipmentCard 
              key={item.id} 
              equipment={item} 
              assignedUser={assignedUser} 
            />
          );
        })}
      </div>
    </div>
  );
}

export default EquipmentList;
// src/components/EquipmentList.css
// src/components/EquipmentList.css