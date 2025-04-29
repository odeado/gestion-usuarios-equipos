import React, { useEffect, useState } from 'react';
import './UserDetailsModal.css';

function UserDetailsModal({ user, users, equipment, onClose, onEdit, onNext, onPrev }) {
  // Estados para controlar la edición
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({ ...user });

  // Encuentra la posición del usuario actual en la lista
  const currentIndex = users.findIndex(u => u.id === user.id);
  
  // Filtra los equipos asignados al usuario
  const userEquipment = equipment.filter(item => item.assignedTo === user.id);

  // Sincroniza los datos cuando cambia el usuario
  useEffect(() => {
    setEditedUser(user);
  }, [user]);

  // Manejo de eventos del teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if(e.key === 'ArrowLeft') onPrev();
      else if(e.key === 'ArrowRight') onNext();
      else if(e.key === 'Escape') onClose();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPrev, onNext, onClose]);

  // Actualiza los datos editados mientras se escribe
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({ ...prev, [name]: value }));
  };

  // Guarda los cambios y sale del modo edición
  const handleSave = () => {
    onEdit(editedUser); // Envía los datos al componente padre
    setIsEditing(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>×</button>

        {/* Sección de información del usuario */}
        <div className="modal-header">
          {user.imageBase64 && (
            <img src={user.imageBase64} alt={user.name} className="modal-user-image" />
          )}
          
          {isEditing ? (
            // Campos editables en modo edición
            <div className="edit-fields">
              <input
                name="name"
                value={editedUser.name}
                onChange={handleInputChange}
                placeholder="Nombre"
                className="edit-input"
              />
              <input
                name="correo"
                value={editedUser.correo}
                onChange={handleInputChange}
                placeholder="Correo electrónico"
                className="edit-input"
              />
              <select
                name="department"
                value={editedUser.department}
                onChange={handleInputChange}
                className="edit-select"
              >
                <option value="IT">Departamento IT</option>
                <option value="RRHH">Recursos Humanos</option>
                <option value="Finanzas">Área Financiera</option>
              </select>
            </div>
          ) : (
            // Visualización normal de datos
            <div className="view-mode">
              <h2>{user.name}</h2>
              <p>{user.correo}</p>
              <p className="department-badge">{user.department}</p>
            </div>
          )}
        </div>

        {/* Lista de equipos asignados */}
        <div className="modal-body">
          <h3>Equipos en uso</h3>
          {userEquipment.length > 0 ? (
            <ul className="equipment-list">
              {userEquipment.map(item => (
                <li key={item.id}>
                  <strong>{item.name}</strong> - {item.type} (N° Serie: {item.serialNumber})
                </li>
              ))}
            </ul>
          ) : (
            <p>Sin equipos asignados actualmente</p>
          )}
        </div>

        {/* Botones de navegación y acciones */}
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
              // Botones durante la edición
              <>
                <button onClick={handleSave} className="action-button save-button">
                  ✅ Guardar
                </button>
                <button 
                  onClick={() => setIsEditing(false)} 
                  className="action-button cancel-button"
                >
                  ❌ Descartar
                </button>
              </>
            ) : (
              // Botón para iniciar edición
              <button 
                onClick={() => setIsEditing(true)} 
                className="action-button edit-button"
              >
                ✏️ Editar
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
