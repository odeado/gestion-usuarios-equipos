import React, { useState, useRef } from 'react';
import './EquipmentList.css';
import EquipDetailsModal from './EquipDetailsModal';

function EquipmentList({ equipment, users, searchTerm, onSelectEquipment, onDeleteEquipment, onEditEquipment }) {

  const [selectedEquipment, setSelectedEquipment] = useState(null);



// inicio de la funcion ordenar


  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'ascending'
  });

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

const getSortedItems = () => {
  const sortableItems = [...filteredEquipment];
  if (!sortConfig.key) return sortableItems;

  sortableItems.sort((a, b) => {
    // Manejo especial para IPs
    if (sortConfig.key === 'IpEquipo') {
      const ipA = a.IpEquipo || '';
      const ipB = b.IpEquipo || '';

      // Caso 1: Ambos son IPs numéricas
      if (isValidIP(ipA) && isValidIP(ipB)) {
        return compareNumericIPs(ipA, ipB, sortConfig.direction);
      }
      // Caso 2: Solo A es IP numérica
      else if (isValidIP(ipA)) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      // Caso 3: Solo B es IP numérica
      else if (isValidIP(ipB)) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      // Caso 4: Ninguno es IP numérica (ej. "dinámica")
      else {
        return ipA.localeCompare(ipB) * (sortConfig.direction === 'ascending' ? 1 : -1);
      }
    }
    // Ordenamiento normal para otras columnas
    else {
      const aValue = a[sortConfig.key] || '';
      const bValue = b[sortConfig.key] || '';
      return aValue.toString().localeCompare(bValue.toString()) * 
             (sortConfig.direction === 'ascending' ? 1 : -1);
    }
  });
  
  return sortableItems;
};

// Función auxiliar para validar IPs
const isValidIP = (ip) => {
  if (!ip) return false;
  const parts = ip.split('.');
  if (parts.length !== 4) return false;
  return parts.every(part => {
    const num = parseInt(part, 10);
    return !isNaN(num) && num >= 0 && num <= 255;
  });
};

// Función auxiliar para comparar IPs numéricas por subredes
const compareNumericIPs = (ipA, ipB, direction) => {
  const partsA = ipA.split('.').map(part => parseInt(part, 10));
  const partsB = ipB.split('.').map(part => parseInt(part, 10));
  
  // Comparar octeto por octeto
  for (let i = 0; i < 4; i++) {
    if (partsA[i] !== partsB[i]) {
      const result = partsA[i] - partsB[i];
      return direction === 'ascending' ? result : -result;
    }
  }
  return 0;
};
  

// final de la funcion ordenar


// Obtener todos los usuarios asignados (array de objetos usuario)
const getAssignedUsers = (userIds) => {
  if (!userIds) return [];
  
  // Asegurarse que userIds es un array
  const userIdsArray = Array.isArray(userIds) ? userIds : [userIds].filter(Boolean);
  
  return userIdsArray
    .map(userId => users.find(u => u.id === userId))
    .filter(user => user !== undefined);
};

// Obtener nombres de usuarios asignados como string
const getAssignedUserNames = (userIds) => {
  const assignedUsers = getAssignedUsers(userIds);
  return assignedUsers.length > 0 
    ? assignedUsers.map(user => user.name).join(', ') 
    : 'No asignado';
};



 

  // En EquipmentList.js
const handleEquipmentClick = (item) => {
  if (!Array.isArray(equipment)) {
    console.error("equipment no es un array:", equipment);
    return;
  }
  
  const index = equipment.findIndex(equip => equip.id === item.id);
  setSelectedEquipment(item);
  
  if (onSelectEquipment) {
    onSelectEquipment(item.id);
  }
};




  const filteredEquipment = equipment.filter(item => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const assignedUsers = getAssignedUsers(item.usuariosAsignados); // Asumo que puedes obtener el objeto usuario completo
    const assignedUserNames = assignedUsers.map(user => user.name).join(', ');
    const assignedUserCities = assignedUsers.map(user => user.ciudad).join(', ');

    return (
      String(item.nombre || '').toLowerCase().includes(searchLower) ||
      String(item.type || '').toLowerCase().includes(searchLower) ||
      String(item.marca || '').toLowerCase().includes(searchLower) ||
      String(item.ciudad || '').toLowerCase().includes(searchLower) ||
      String(assignedUserCities || '').toLowerCase().includes(searchLower) || // Nueva línea para buscar en ciudad del usuario
      String(item.estado || '').toLowerCase().includes(searchLower) ||
      String(item.lugar || '').toLowerCase().includes(searchLower) ||
      String(item.model || '').toLowerCase().includes(searchLower) ||
      String(item.IpEquipo || '').toLowerCase().includes(searchLower) ||
      String(item.descripcion || '').toLowerCase().includes(searchLower) ||
      String(item.serialNumber || '').toLowerCase().includes(searchLower) ||
      assignedUserNames.toLowerCase().includes(searchLower)
    );
});

  return (
    <div className="equipment-list-container">
      <div className="equipment-headerL">
        <h2>Lista de Equipos</h2>
        
        
      </div>
      <table className="equipment-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Marca</th>
            <th 
            className={`sortable ${sortConfig.key === 'ciudad' ? sortConfig.direction : ''}`}
              onClick={() => requestSort('ciudad')}
              style={{cursor: 'pointer'}}
            >
              Ciudad 
              {sortConfig.key === 'ciudad' && (
                sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'
              )}
            </th>
            <th>Estado</th>
            <th>Lugar</th>
            <th>Modelo</th>
            <th 
            className={`sortable ${sortConfig.key === 'IpEquipo' ? sortConfig.direction : ''}`}
              onClick={() => requestSort('IpEquipo')}
              style={{cursor: 'pointer'}}
            >
              IP Equipo 
              {sortConfig.key === 'IpEquipo' && (
                sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'
              )}
            </th>
            <th>Serie</th>
            <th>descripcion</th>
            <th>Asignado a</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
{getSortedItems().length > 0 ? (
            getSortedItems().map(item => (
         
              <tr key={item.id} onClick={() => handleEquipmentClick(item)} style={{cursor: 'pointer'}}>
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
                <td data-label="Asignado a">
  {getAssignedUsers(item.usuariosAsignados).map(user => ( // Asumo que puedes obtener el objeto usuario completo
    <div 
      key={user.id} 
      className="assigned-user-chip"
      title={`${user.name} - ${user.department}`}
    >
      {user.name}
    </div>
  ))}
   {getAssignedUsers(item.usuariosAsignados).length === 0 && 'No asignado'}
</td>

                <td className="actions-buttons" onClick={(e) => e.stopPropagation()}>
                  <button 
                  className="edit-btn" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditEquipment(item);
                  }}
                >
                  Editar
                </button>
                <button 
                  className="delete-btn" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteEquipment(item.id);
                  }}
                >
                  Eliminar
                </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="12" className="no-results">No se encontraron equipos</td>
            </tr>
          )}
        </tbody>
      </table>

</div>

 

 
        
        );

        }

  export default EquipmentList;