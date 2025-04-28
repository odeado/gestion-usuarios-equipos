import React from 'react';
import './UserDetailsModal.css';

function UserDetailsModal({ user, equipment, onClose, onEdit }) {
  const userEquipment = equipment.filter(item => item.assignedTo === user.id);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="modal-header">
          {user.imageBase64 && (
            <img src={user.imageBase64} alt={user.name} className="modal-user-image" />
          )}
          <h2>{user.name}</h2>
          <p>{user.correo}</p>
          <p className="department-badge">{user.department}</p>
        </div>

        <div className="modal-body">
          <h3>Equipos asignados</h3>
          {userEquipment.length > 0 ? (
            <ul className="equipment-list">
              {userEquipment.map(item => (
                <li key={item.id}>
                  <strong>{item.name}</strong> - {item.type} (Serial: {item.serialNumber})
                </li>
              ))}
            </ul>
          ) : (
            <p>No tiene equipos asignados</p>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={() => onEdit(user)} className="edit-button">
            Editar Usuario
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserDetailsModal;