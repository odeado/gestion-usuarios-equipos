import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore'; // Añade updateDoc
import { db } from './firebase';
import UserList from './components/UserList';
import EquipmentList from './components/EquipmentList';
import UserEquipment from './components/UserEquipment';
import AddUserForm from './components/AddUserForm';
import AddEquipmentForm from './components/AddEquipmentForm';
import './App.css';

function App() {
  const [users, setUsers] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [departments, setDepartments] = useState([]); // Nuevo estado para departamentos
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);

  // Función de edición corregida
  const handleEditUser = async (userData) => {
    try {
      await updateDoc(doc(db, 'users', userData.id), {
        name: userData.name,
        department: userData.department,
        correo: userData.correo,
        imageBase64: userData.imageBase64
      });
      setUsers(users.map(user => user.id === userData.id ? userData : user));
      setEditingUser(null);
    } catch (error) {
      console.error("Error editando usuario: ", error);
    }
  };

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        const equipmentSnapshot = await getDocs(collection(db, 'equipment'));
        const equipmentData = equipmentSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));


          // Obtener departamentos (nuevo)
          const departmentsSnapshot = await getDocs(collection(db, 'departments'));
          const departmentsData = departmentsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
        
        setUsers(usersData);
        setEquipment(equipmentData);
        setDepartments(departmentsData);
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
          <AddUserForm 
            onUserAdded={(newUser) => setUsers([...users, newUser])}
            userToEdit={editingUser}  // Pasa el usuario a editar
            onEditUser={handleEditUser} // Pasa la función de edición
            onCancelEdit={() => setEditingUser(null)}
            departments={departments} // Pasamos los departamentos como prop
          />
          <div className="form-container"></div>
          <AddEquipmentForm users={users} />
        </div>
        
        <div className="content">
          <UserList 
            users={users} 
            onSelectUser={setSelectedUserId}
            onDeleteUser={handleDeleteUser}
            onEditUser={(user) => setEditingUser(user)} // Pasamos el usuario a editar
          />
          
          <EquipmentList equipment={equipment} users={users} />
        </div>

        {selectedUser && (
          <UserEquipment user={selectedUser} equipment={equipment} />
        )}
      </div>
    </div>
  );
}

export default App;
