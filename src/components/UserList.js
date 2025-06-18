import React, { useState } from 'react';
import './UserList.css';

function UserList({ users, equipment, searchTerm, onSelectUser, onDeleteUser, onEditUser }) {
  
  
  const getDepartmentColor = (dept) => {
    const colors = {
      'Gerencia': '#ffeb3b',
      'UDG': '#4caf50',
      'Marketing': '#f44336',
      'Recursos Humanos': '#9c27b0',
      'Dirección': '#ff9800',
      'default': '#2196f3'
    };
    return colors[dept] || colors.default;
  };

  const getEstadoColor = (estado) => {
    const colors = {
      'Teletrabajo': '#4caf50',
      'Trabajando': '#ffeb3b',
      'Eliminada': '#f44336',

    };
    return colors[estado] || colors.default;
  };

 const getEquipmentName = (userId) => {
  if (!userId || !equipment) return 'Sin equipo';
  
  const assignedEquipments = equipment.filter(eq => 
    Array.isArray(eq.equiposAsignados) 
      ? eq.equiposAsignados.includes(userId)
      : eq.equiposAsignados === userId
  );

  if (assignedEquipments.length === 0) return 'Sin equipo';
  
  return assignedEquipments
    .map(eq => eq.IpEquipo || eq.nombre || 'Equipo sin nombre')
    .join(', ');
};

 const filteredUsers = users.filter(user => {
  if (!searchTerm) return true;
  
  const searchLower = searchTerm.toLowerCase();
  const userEquipments = equipment.filter(eq => 
    Array.isArray(eq.equiposAsignados) 
      ? eq.equiposAsignados.includes(user.id)
      : eq.equiposAsignados === user.id
  );
  const equipmentNames = userEquipments.map(eq => eq.IpEquipo || eq.nombre).join(' ');
  
  return (
    String(user.name || '').toLowerCase().includes(searchLower) ||
    String(user.department || '').toLowerCase().includes(searchLower) ||
    String(user.correo || '').toLowerCase().includes(searchLower) ||
    String(user.tipoVpn || '').toLowerCase().includes(searchLower) ||
    String(user.estado || '').toLowerCase().includes(searchLower) ||
    String(user.ciudad || '').toLowerCase().includes(searchLower) ||
    equipmentNames.toLowerCase().includes(searchLower)
  );
});

  return (
    <div className="users-grid">
      <div className="users-headerL">
        <h2>Usuarios Registrados</h2>
      </div>
      <div className="cards-container">
        {filteredUsers.length > 0 ? (
          filteredUsers.map(user => (
            <div 
              key={user.id} 
              className="user-card"
              onClick={(e) => {
  console.log("Card clicked", user.id); // Verifica que esto se muestre en la consola
  onSelectUser(user.id);
}}
            >
              {user.imageBase64 && (
                
                <div className="user-avatar">
                  <img src={user.imageBase64} alt={user.name} />
                </div>
              )}
              <div className='caja-datoUser'>
                <div className="user-info">
                  <div className='nombre-apellidoList'>
                    <div className="nombreList">{user.name.split(' ')[0]}</div> {/* Primer nombre */}
                    <div className="apellidoList">{user.name.split(' ').slice(1).join(' ')}</div>
                 </div>

                 <div className="user-datito">
                 <p 
                  className="user-estado" 
                  style={{ 
                    color: getEstadoColor(user.estado),
                    fontWeight: 'bold',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    width: 'fit-content',
                    display: 'inline-block',
                    backgroundColor: `${getEstadoColor(user.estado)}20`
                  }}
                >
                  {user.estado}
                </p>

                <p 
                  className="department" 
                  style={{ 
                    color: getDepartmentColor(user.department),
                    fontWeight: 'bold',
                    width: 'fit-content',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    display: 'inline-block',
                    backgroundColor: `${getDepartmentColor(user.department)}20`
                  }}
                >
                  {user.department}
                </p>
                 </div>
                 
                
<div className="user-datos">
<p className="user-equipo">{getEquipmentName(user.id)}</p>

</div>
                <p className="user-email">{user.correo}</p>
                <p className="user-tipo">{user.tipoVpn}</p>
               </div>

                <div className="user-actions">
                  <button
                    className="edit-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditUser(user);
                    }}
                  >
                    Editar
                  </button>
                  <button 
                    className="delete-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteUser(user.id);
                    }}
                  >
                    Eliminar
                  </button>
                  <button 
                    className="details-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectUser(user.id);
                    }}
                  >
                    Detalles
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            No se encontraron usuarios que coincidan con la búsqueda
          </div>
        )}
      </div>
    </div>
  );
}

export default UserList;