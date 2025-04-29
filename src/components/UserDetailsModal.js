import React, {useEffect} from 'react';
import './UserDetailsModal.css';

function UserDetailsModal({ user, users, equipment, onClose, onEdit, onNext, onPrev }) {
  const currentIndex = users.findIndex(u => u.id === user.id);
  const userEquipment = equipment.filter(item => item.assignedTo === user.id);



useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        onPrev();
      } else if (e.key === 'ArrowRight') {
        onNext();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
  
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onPrev, onNext, onClose]);



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
          <div className="navigation-buttons">
            <button 
              onClick={onPrev} 
              disabled={currentIndex === 0}
              className="nav-button prev-button"
            >
              &larr; Anterior
            </button>

          <button
                  className="edit-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditUser(user); // ✅ Asegúrate de que App.js pase esta prop
                  }}
                >
                  Editar
                </button>

              



                
            <button 
              onClick={onNext} 
              disabled={currentIndex === users.length - 1}
              className="nav-button next-button"
            >
              Siguiente &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDetailsModal;
