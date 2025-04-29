import React, { useEffect, useState } from 'react';
import './UserDetailsModal.css';

function UserDetailsModal({ user, users, equipment, onClose, onEdit, onNext, onPrev }) {
  // Estados para controlar la edición
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({ ...user });
  
  // Índice actual y equipos del usuario
  const currentIndex = users.findIndex(u => u.id === user.id);
  const userEquipment = equipment.filter(item => item.assignedTo === user.id);

  // Sincroniza los datos cuando cambia el usuario
  useEffect(() => {
    setEditedUser(user);
  }, [user]);

  // Manejo de teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if(e.key === 'ArrowLeft') onPrev();
      else if(e.key === 'ArrowRight') onNext();
      else if(e.key === 'Escape') onClose();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPrev, onNext, onClose]);

  // Maneja cambios en los inputs de edición
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({ ...prev, [name]: value }));
  };

  // Envía los cambios al componente padre
  const handleSave = () => {
    onEdit(editedUser);
    setIsEditing(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>×</button>
        
        {/* Encabezado del modal */}
        <div className="modal-header">
          {user.imageBase64 && (
            <img src={user.imageBase64} alt={user.name} className="modal-user-image" />
          )}
          
          {isEditing ? (
            // Campos editables
            <>
              <input
                name="name"
                value={editedUser.name}
                onChange={handleInputChange}
                className="edit-input"
                placeholder="Nombre"
              />
              <input
                name="correo"
                value={editedUser.correo}
                onChange={handleInputChange}
                className="edit-input"
                placeholder="Correo"
              />
              <select
                name="department"
                value={editedUser.department}
                onChange={handleInputChange}
                className="edit-select"
              >
                <option value="IT">IT</option>
                <option value="HR">RRHH</option>
                <option value="Finanzas">Finanzas</option>
              </select>
            </>
          ) : (
            // Vista normal
            <>
              <h2>{user.name}</h2>
              <p>{user.correo}</p>
              <p className="department-badge">{user.department}</p>
            </>
          )}
        </div>

        {/* Lista de equipos */}
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

        {/* Pie del modal con botones */}
        <div className="modal-footer">
          <div className="navigation-buttons">
            <button 
              onClick={onPrev} 
              disabled={currentIndex === 0}
              className="nav-button prev-button"
            >
              &larr; Anterior
            </button>

            {isEditing ? (
              // Botones durante edición
              <>
                <button onClick={handleSave} className="save-button">
                  Guardar
                </button>
                <button 
                  onClick={() => setIsEditing(false)} 
                  className="cancel-button"
                >
                  Cancelar
                </button>
              </>
            ) : (
              // Botón normal de editar
              <button 
                onClick={() => setIsEditing(true)} 
                className="edit-button"
              >
                Editar Usuario
              </button>
            )}

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
