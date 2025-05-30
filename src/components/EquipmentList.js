import React, { useState } from 'react';
import './EquipmentList.css';

function EquipmentList({ equipment, users, searchTerm, onSelectEquipment, onDeleteEquipment, onEditEquipment }) {
  
  
  const getAssignedUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'No asignado';
  };

   const filteredEquipment = equipment.filter(item => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const assignedUserName = getAssignedUserName(item.assignedTo);
    
    return (
      String(item.nombre || '').toLowerCase().includes(searchLower) ||
      String(item.type || '').toLowerCase().includes(searchLower) ||
      String(item.marca || '').toLowerCase().includes(searchLower) ||
      String(item.ciudad || '').toLowerCase().includes(searchLower) ||
      String(item.estado || '').toLowerCase().includes(searchLower) ||
      String(item.lugar || '').toLowerCase().includes(searchLower) ||
      String(item.model || '').toLowerCase().includes(searchLower) ||
      String(item.IpEquipo || '').toLowerCase().includes(searchLower) ||
      String(item.descripcion || '').toLowerCase().includes(searchLower) ||
      String(item.serialNumber || '').toLowerCase().includes(searchLower) ||
      assignedUserName.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="equipment-list-container">
      <div className="equipment-header">
        <h2>Lista de Equipos</h2>
        
        
      </div>
      <table className="equipment-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Marca</th>
            <th>ciudad</th>
            <th>Estado</th>
            <th>Lugar</th>
            <th>Modelo</th>
            <th>IP Equipo</th>
            <th>Serie</th>
            <th>descripcion</th>
            <th>Asignado a</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredEquipment.length > 0 ? (
            filteredEquipment.map(item => (
              <tr key={item.id}>
                <td data-label="Nombre">{item.nombre}</td>
                <td data-label="Tipo">{item.type}</td>
                <td data-label="Marca">{item.marca}</td>
                <td data-label="Ciudad">{item.ciudad}</td>
                <td 
  data-label="Estado" 
  className="status" 
  style={{ 
    color: '#ffffff', // Texto blanco para todos los estados
    backgroundColor: 
      item.estado === 'Eliminado' ? '#f44336' : // Rojo para Eliminado
      item.estado === 'En uso' ? '#4caf50' :    // Verde para En uso
      item.estado === 'Mantenimiento' ? '#ff9800' : // Naranja para Mantenimiento
      '#2196f3', // Azul para otros estados (como Disponible)
    padding: '4px 8px',
    borderRadius: '4px',
    fontWeight: 'bold',
    textAlign: 'center'
  }}
>
  {item.estado}
</td>
                <td data-label="Lugar">{item.lugar}</td>
                <td data-label="Modelo">{item.model}</td>
                <td data-label="IP Equipo">{item.IpEquipo}</td>
                <td data-label="Serie">{item.serialNumber}</td>
                <td data-label="Descripcion" style={{color: 'rgb(20 20 20)', backgroundColor: 'rgb(249 251 188 / 94%)'}}>{item.descripcion}</td>
                <td data-label="Asignado a">{getAssignedUserName(item.assignedTo)}</td>
                <td className="actions-buttons">
                  <button className="edit-btn" onClick={() => onEditEquipment(item)}>
                  Editar
                </button>
                <button className="delete-btn" onClick={() => onDeleteEquipment(item.id)}>
                  Eliminar
                </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="no-results">No se encontraron equipos</td>
            </tr>
          )}
        </tbody>
      </table>



 {/* Cards para móviles */}
      <div className="mobile-equipment-cards">
        {filteredEquipment.map(item => (
          <div key={item.id} className="equipment-card">
            <div className="card-row">
              <span className="card-label">Nombre:</span>
              <span>{item.nombre}</span>
            </div>
            <div className="card-row">
              <span className="card-label">IP Equipo:</span>
              <span>{item.IpEquipo}</span>
            </div>
            {/* Añade más campos según necesites */}
            <div className="card-actions">
              <button className="edit-btn" onClick={() => onEditEquipment(item)}>
                Editar
              </button>
              <button className="delete-btn" onClick={() => onDeleteEquipment(item.id)}>
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredEquipment.length === 0 && (
        <div className="no-results">No se encontraron equipos</div>
      )}




    </div>
  );
}

export default EquipmentList;