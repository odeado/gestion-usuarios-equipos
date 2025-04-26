import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase'; // Asegúrate de tener tu configuración Firebase
// Importaciones (fíjate en las mayúsculas)
import UserList from './components/UserList';  // Verifica que el archivo se llame EXACTAMENTE así
import EquipmentList from './components/EquipmentList'; // Igual aquí
import UserEquipment from './components/UserEquipment';

import AddUserForm from './components/AddUserForm';
import AddEquipmentForm from './components/AddEquipmentForm';

import './App.css';

function App() {
  const [users, setUsers] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  // App.js
// Agrega esta función dentro del componente App antes del return
const handleDeleteUser = async (userId) => {
  if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsers(users.filter(user => user.id !== userId));
    } catch (error) {
      console.error("Error eliminando usuario: ", error);
    }
  }
};

// Modifica el renderizado de UserList para pasar la función
<UserList 
  users={users} 
  onSelectUser={setSelectedUserId}
  onDeleteUser={handleDeleteUser} // Nueva prop
/>

  // Cargar datos de Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener usuarios
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Obtener equipos
        const equipmentSnapshot = await getDocs(collection(db, 'equipment'));
        const equipmentData = equipmentSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setUsers(usersData);
        setEquipment(equipmentData);
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const selectedUser = users.find(user => user.id === selectedUserId);

  if (loading) {
    return <div className="loading">Cargando datos...</div>;
  }

  return (

    

    
    <div className="app-container">
      <div className="app">
        <h1>Sistema de Gestión de Equipos</h1>

        <div className="forms-row">
        <AddUserForm />

<div className="form-container">
  
</div>

        <AddEquipmentForm users={users} />
      </div>
        
        <div className="content">
          <UserList 
            users={users} 
            onSelectUser={setSelectedUserId} 
          />
          
          <EquipmentList 
            equipment={equipment} 
            users={users} 
          />
        </div>

        {selectedUser && (
          <UserEquipment 
            user={selectedUser} 
            equipment={equipment} 
          />
        )}
      </div>
    </div>
  );
}

export default App;
