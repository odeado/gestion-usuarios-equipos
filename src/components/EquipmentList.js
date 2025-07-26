import React, { useState, useRef } from 'react';
import './EquipmentList.css';
import EquipDetailsModal from './EquipDetailsModal';



import EquipmentForm from './EquipmentForm';






const normalizeIP = (ip) => {
  if (ip === null || ip === undefined) return '';
  if (typeof ip === 'number') return String(ip);
  return ip;
};

// Función auxiliar para validar IPs
const isValidIP = (ip) => {
  ip = normalizeIP(ip);
  // Verifica que ip exista y sea string
  if (!ip || typeof ip !== 'string') return false;
  
  const parts = ip.split('.');
  if (parts.length !== 4) return false;
  
  return parts.every(part => {
    const num = parseInt(part, 10);
    return !isNaN(num) && num >= 0 && num <= 255;
  });
};

// Función auxiliar para comparar IPs numéricas por subredes
const compareNumericIPs = (ipA, ipB, direction) => {
  // Asegúrate de que sean strings válidos
  if (typeof ipA !== 'string' || typeof ipB !== 'string') return 0;
  
  const partsA = ipA.split('.').map(part => parseInt(part, 10));
  const partsB = ipB.split('.').map(part => parseInt(part, 10));
  
  for (let i = 0; i < 4; i++) {
    if (partsA[i] !== partsB[i]) {
      const result = partsA[i] - partsB[i];
      return direction === 'ascending' ? result : -result;
    }
  }
  return 0;
};



function EquipmentList({
   equipment, 
  users, 
  searchTerm, 
  onSelectEquipment, 
  onDeleteEquipment, 
  onEditEquipment, 
  onOpenUserModal,
  equipmentData,
  availableIps = [],
  onAddNewIp,
  availableSerials = [],
  onAddNewSerial,
  availableMarcas = [],
  onAddNewMarca,
  availableLugares = [],
  onAddNewLugar,
  availableCiudades = [],
  onAddNewCiudad,
  availableNombres = [],
  onAddNewNombre,
  availableTypes = [],
  onAddNewType,
  availableModels = [],
  onAddNewModel,
  availableProcessors = [],
  setAvailableProcessors,
  availableRams = [],
  onAddNewRam,
  availableDiscoDuros = [],
  onAddNewDiscoDuro,
  availableTarjetasGraficas = [],
  onAddNewTarjetaGrafica,
  availableWindows = [],
  onAddNewWindows,
  availableOffices = [],
  onAddNewOffice,
  availableAntivirus = [],
  onAddNewAntivirus
}) {
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editedEquipment, setEditedEquipment] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'ascending'
  });

// inicio de la funcion ordenar


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

      // Debug: Muestra valores problemáticos
      if (typeof ipA !== 'string' || typeof ipB !== 'string') {
        console.warn('Valores de IP no son strings:', { ipA, ipB, a, b });
      }

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
        return String(ipA).localeCompare(String(ipB)) * 
               (sortConfig.direction === 'ascending' ? 1 : -1);
      }
    }
    // Ordenamiento normal para otras columnas
    else {
      const aValue = a[sortConfig.key] || '';
      const bValue = b[sortConfig.key] || '';
      return String(aValue).localeCompare(String(bValue)) * 
             (sortConfig.direction === 'ascending' ? 1 : -1);
    }
  });
  
  return sortableItems;
};





  

// final de la funcion ordenar


// funcion edicion

const handleEdit = (equip) => {
  setEditingEquipment({
    ...equip,
    usuariosAsignados: equip.usuariosAsignados || [],
    categoriasAsignacion: equip.categoriasAsignacion || {}
  });
};

console.log('Datos enviados a onEditEquipment:', {
  ...editingEquipment,
  id: editingId
});

// Función de guardado mejorada
const handleSave = async (equipmentData) => {
  if (!editingEquipment) return;
  
  try {
    await onEditEquipment({
      ...equipmentData,
      id: editingEquipment.id // Asegurar que mantenemos el ID correcto
    });
    setEditingEquipment(null); // Cerrar el modo edición
  } catch (error) {
    console.error("Error al guardar equipo:", error);
    alert(`Error al guardar: ${error.message}`);
  }
};



  const handleCancel = () => {
    setEditingId(null);
    setEditedEquipment(null);
  };

   const handleInputChange = (e) => {
  const { name, value } = e.target;
  setEditedEquipment(prev => ({ 
    ...prev, 
    [name]: value 
  }));
};

const handleEquipmentChange = (updatedData) => {
  setEditedEquipment(prev => ({
    ...prev,
    ...updatedData
  }));
};


  // termino de la funcion edicion


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


// función que maneje el clic en el usuario y muestre su información



 const handleUserClick = (user, e) => {
    e.stopPropagation(); // Evita que se active el clic en la fila del equipo
    if (onOpenUserModal) {
      onOpenUserModal(user.id);
    }
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





console.log('Datos disponibles para autocompletar:', {
  availableNombres,
  availableTypes,
  availableMarcas,
  availableModels,
  availableSerials
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
            <React.Fragment key={item.id}>
              {editingEquipment && editingEquipment.id === item.id ? (
                <tr style={{ backgroundColor: '#503b57ff' }}>
                  <td colSpan="12" style={{ padding: '20px' }}>
                    <div style={{ border: '2px solid #ddd', borderRadius: '8px', padding: '20px' }}>
                    <EquipmentForm
                    equipment={editingEquipment}
                    onEquipmentAdded={handleSave}
                    onCancel={() => setEditingEquipment(null)}
                    users={users}
                    availableIps={availableIps}
        onAddNewIp={onAddNewIp}
        availableSerials={availableSerials}
        onAddNewSerial={onAddNewSerial}
        availableMarcas={availableMarcas}
        onAddNewMarca={onAddNewMarca}
        availableLugares={availableLugares}
        onAddNewLugar={onAddNewLugar}
        availableCiudades={availableCiudades}
        onAddNewCiudad={onAddNewCiudad}
        availableNombres={availableNombres}
        onAddNewNombre={onAddNewNombre}
        availableTypes={availableTypes}
        onAddNewType={onAddNewType}
        availableModels={availableModels}
        onAddNewModel={onAddNewModel}
        availableProcessors={availableProcessors}
        setAvailableProcessors={setAvailableProcessors}
        availableRams={availableRams}
        onAddNewRam={onAddNewRam}
        availableDiscoDuros={availableDiscoDuros}
        onAddNewDiscoDuro={onAddNewDiscoDuro}
        availableTarjetasGraficas={availableTarjetasGraficas}
        onAddNewTarjetaGrafica={onAddNewTarjetaGrafica}
        availableWindows={availableWindows}
        onAddNewWindows={onAddNewWindows}
        availableOffices={availableOffices}
        onAddNewOffice={onAddNewOffice}
        availableAntivirus={availableAntivirus}
        onAddNewAntivirus={onAddNewAntivirus}
        onOpenUserModal={onOpenUserModal}
        mode="edit"
        onEquipmentChange={setEditedEquipment}
                  />
                  </div>
                </td>
              </tr>
            ) : (
            
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
  {getAssignedUsers(item.usuariosAsignados).map(user => (
    <div 
      key={user.id} 
      className="assigned-user-chip"
      title={`${user.name} - ${user.department}`}
      onClick={(e) => handleUserClick(user, e)}
      style={{
        cursor: 'pointer',
        textDecoration: 'underline',
        display: 'inline-block',
        margin: '2px',
        padding: '4px 8px',
        backgroundColor: '#e0e0e0',
        borderRadius: '16px'
      }}
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
                    handleEdit(item);
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
            )}
            </React.Fragment>
          
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