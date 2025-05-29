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
      String(item.model || '').toLowerCase().includes(searchLower) ||
      String(item.IpEquipo || '').toLowerCase().includes(searchLower) ||
      String(item.serialNumber || '').toLowerCase().includes(searchLower) ||
      assignedUserName.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="equipment-list">
      <div className="equipment-header">
        <h2>Lista de Equipos</h2>
        
        
      </div>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Modelo</th>
            <th>IP Equipo</th>
            <th>Serie</th>
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
                <td data-label="Modelo">{item.model}</td>
                <td data-label="IP Equipo">{item.IpEquipo}</td>
                <td data-label="Serie">{item.serialNumber}</td>
                <td data-label="Asignado a">{getAssignedUserName(item.assignedTo)}</td>
                <td className="actions">
                  <button 
                    onClick={() => onEditEquipment(item)}
                    className="edit-button"
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => onDeleteEquipment(item.id)}
                    className="delete-button"
                  >
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
    </div>
  );
}

export default EquipmentList;