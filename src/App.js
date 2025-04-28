import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import UserList from './components/UserList';
import EquipmentList from './components/EquipmentList';
import AddUserForm from './components/AddUserForm';
import AddEquipmentForm from './components/AddEquipmentForm';
import UserDetailsModal from './components/UserDetailsModal';
import './App.css';

function App() {
  const [users, setUsers] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

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

  const handleSelectUser = (userId) => {
    setSelectedUserId(userId);
    setShowModal(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersSnapshot, equipmentSnapshot, departmentsSnapshot] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'equipment')),
          getDocs(collection(db, 'departments'))
        ]);

        setUsers(usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setEquipment(equipmentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setDepartments(departmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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
            userToEdit={editingUser}
            onEditUser={handleEditUser}
            onCancelEdit={() => setEditingUser(null)}
            departments={departments}
          />
          <AddEquipmentForm users={users} />
        </div>
        
        <div className="content">
          <UserList 
            users={users} 
            onSelectUser={handleSelectUser}
            onDeleteUser={handleDeleteUser}
            onEditUser={(user) => setEditingUser(user)}
          />
          <EquipmentList equipment={equipment} users={users} />
        </div>

        {showModal && selectedUser && (
          <UserDetailsModal 
            user={selectedUser}
            equipment={equipment}
            onClose={() => setShowModal(false)}
            onEdit={(user) => {
              setEditingUser(user);
              setShowModal(false);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default App;