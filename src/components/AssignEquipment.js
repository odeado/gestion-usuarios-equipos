import React, { useState } from 'react';

function AssignEquipment({ users, equipment, onAssign }) {
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [selectedUser, setSelectedUser] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAssign(selectedEquipment, selectedUser);
  };

  return (
    <form onSubmit={handleSubmit}>
      <select 
        value={selectedEquipment} 
        onChange={(e) => setSelectedEquipment(e.target.value)}
        required
      >
        <option value="">Seleccione equipo</option>
        {equipment.map(item => (
          <option key={item.id} value={item.id}>
            {item.type} - {item.model}
          </option>
        ))}
      </select>

      <select
        value={selectedUser}
        onChange={(e) => setSelectedUser(e.target.value)}
        required
      >
        <option value="">Seleccione usuario</option>
        {users.map(user => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>

      <button type="submit">Asignar</button>
    </form>
  );
}

export default AssignEquipment;