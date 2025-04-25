import React from 'react';

function UserList({ users, onSelectUser }) {
  // Función para obtener color según departamento
  const getDepartmentColor = (dept) => {
    const colors = {
      'Ventas': '#ffeb3b',
      'TI': '#4caf50',
      'Marketing': '#f44336',
      'Recursos Humanos': '#9c27b0',
      'Dirección': '#ff9800',
      'default': '#2196f3'
    };
    return colors[dept] || colors.default;
  };

  return (
    <div className="users-grid">
      <h2>Usuarios Registrados</h2>
      <div className="cards-container">
        {users.map(user => (
          <div 
            key={user.id} 
            className="user-card"
            onClick={() => onSelectUser(user.id)}
          >
            {user.imageBase64 && (
              <div className="user-avatar">
                <img 
                  src={user.imageBase64} 
                  alt={user.name}
                />
              </div>
            )}
            <div className="user-info">
              <h3>{user.name}</h3>
              <p 
                className="department" 
                style={{ 
                  color: getDepartmentColor(user.department),
                  fontWeight: 'bold',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  display: 'inline-block',
                  backgroundColor: `${getDepartmentColor(user.department)}20` // Añade transparencia
                }}
              >
                {user.department}
              </p>
              <button 
                className="details-button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectUser(user.id);
                }}
              >
                Ver Detalles
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserList;