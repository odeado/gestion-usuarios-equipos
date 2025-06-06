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
      'Eliminado': '#f44336',
     
    };
    return colors[estado] || colors.default;
  };

  const getEquipmentName = (EquipoAsignado) => {
    if (!EquipoAsignado || !equipment) return 'Sin equipo';
    const foundEquipment = equipment.find(eq => eq.id === EquipoAsignado);
    return foundEquipment ? foundEquipment.IpEquipo : 'Equipo no encontrado';
  };

 const filteredUsers = users.filter(user => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const userEquipment = getEquipmentName(user.EquipoAsignado);
    
    return (
      String(user.name || '').toLowerCase().includes(searchLower) ||
      String(user.department || '').toLowerCase().includes(searchLower) ||
      String(user.correo || '').toLowerCase().includes(searchLower) ||
      String(user.tipoVpn || '').toLowerCase().includes(searchLower) ||
      String(user.estado || '').toLowerCase().includes(searchLower) ||
      String(user.ciudad || '').toLowerCase().includes(searchLower) ||
      String(userEquipment || '').toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="users-grid">
      <div className="users-header">
        <h2>Usuarios Registrados</h2>
        
      </div>
      <div className="cards-container">
        {filteredUsers.length > 0 ? (
          filteredUsers.map(user => (
            <div 
              key={user.id} 
              className="user-card"
              onClick={() => onSelectUser(user.id)}
            >
              {user.imageBase64 && (
                
                <div className="user-avatar">
                  <img src={user.imageBase64} alt={user.name} />
                </div>
              )}

              <div className="user-info">
               <div className='nombre-apellidoList'>
                  <div className="nombreList">{user.name.split(' ')[0]}</div> {/* Primer nombre */}
                  <div className="apellidoList">{user.name.split(' ').slice(1).join(' ')}</div>
                 </div>
                

<p className="user-equipo">{getEquipmentName(user.EquipoAsignado)}</p>
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