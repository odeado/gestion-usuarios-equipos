import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import UserList from './components/UserList';
import EquipmentList from './components/EquipmentList';
import AddUserForm from './components/AddUserForm';
import AddEquipmentForm from './components/AddEquipmentForm';
import UserDetailsModal from './components/UserDetailsModal';
import './App.css';
import './components/UserList.css';

function App() {
  const [users, setUsers] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(null);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showEquipmentForm, setShowEquipmentForm] = useState(false);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');

  // Función para actualizar el equipo asignado en el usuario
  const updateUserEquipment = async (userId, equipmentId) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        EquipoAsignado: equipmentId || null,
        updatedAt: new Date()
      });
      
      // Actualiza el estado local
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, EquipoAsignado: equipmentId || null }
          : user
      ));
    } catch (error) {
      console.error("Error actualizando equipo de usuario:", error);
      throw error;
    }
  };

  // Función para actualizar el usuario asignado en el equipo
  const updateEquipmentAssignment = async (equipmentId, userId) => {
    try {
      await updateDoc(doc(db, 'equipment', equipmentId), {
        assignedTo: userId || null,
        updatedAt: new Date()
      });
      
      // Actualiza el estado local
      setEquipment(equipment.map(equip => 
        equip.id === equipmentId 
          ? { ...equip, assignedTo: userId || null }
          : equip
      ));
    } catch (error) {
      console.error("Error actualizando asignación de equipo:", error);
      throw error;
    }
  };

  // Edición de usuario con sincronización de equipo
  const handleEditUser = async (userData) => {
    try {
      const oldUser = users.find(u => u.id === userData.id);
      const equipmentChanged = oldUser?.EquipoAsignado !== userData.EquipoAsignado;

      // Si cambió el equipo asignado, actualiza ambos registros
      if (equipmentChanged) {
        // Limpia la asignación anterior (si existía)
        if (oldUser?.EquipoAsignado) {
          await updateEquipmentAssignment(oldUser.EquipoAsignado, null);
        }

        // Asigna el nuevo equipo (si existe)
        if (userData.EquipoAsignado) {
          await updateEquipmentAssignment(userData.EquipoAsignado, userData.id);
        }
      }

      // Actualiza el usuario en Firestore
      await updateDoc(doc(db, 'users', userData.id), {
        name: userData.name,
        correo: userData.correo,
        ciudad: userData.ciudad,
        tipoVpn: userData.tipoVpn,
        department: userData.department,
        estado: userData.estado,
        EquipoAsignado: userData.EquipoAsignado || null,
        imageBase64: userData.imageBase64,
        updatedAt: new Date()
      });

      // Actualiza el estado local
      setUsers(users.map(user => 
        user.id === userData.id ? { ...userData } : user
      ));
      
      setEditingUser(null);
    } catch (error) {
      console.error("Error editando usuario:", error);
      throw error;
    }
  };

  // Edición de equipo con sincronización de usuario
  const handleEditEquipment = async (equipmentData) => {
    try {
      const oldEquipment = equipment.find(e => e.id === equipmentData.id);
      const assignmentChanged = oldEquipment?.assignedTo !== equipmentData.assignedTo;

      // Si cambió la asignación, actualiza ambos registros
      if (assignmentChanged) {
        // Limpia la asignación anterior (si existía)
        if (oldEquipment?.assignedTo) {
          await updateUserEquipment(oldEquipment.assignedTo, null);
        }

        // Asigna el nuevo usuario (si existe)
        if (equipmentData.assignedTo) {
          await updateUserEquipment(equipmentData.assignedTo, equipmentData.id);
        }
      }

      // Actualiza el equipo en Firestore
      await updateDoc(doc(db, 'equipment', equipmentData.id), {
        nombre: equipmentData.nombre,
        type: equipmentData.type,
        model: equipmentData.model,
        marca: equipmentData.marca,
        serialNumber: equipmentData.serialNumber,
        IpEquipo: equipmentData.IpEquipo,
        ciudad: equipmentData.ciudad,
        estado: equipmentData.estado,
        lugar: equipmentData.lugar,
        descripcion: equipmentData.descripcion,
        assignedTo: equipmentData.assignedTo,
        imageBase64: equipmentData.imageBase64,
        updatedAt: new Date()
      });

      // Actualiza el estado local
      setEquipment(equipment.map(equip => 
        equip.id === equipmentData.id ? { ...equipmentData } : equip
      ));
      
      setEditingEquipment(null);
    } catch (error) {
      console.error("Error editando equipo:", error);
      throw error;
    }
  };

  // Agregar nuevo equipo con sincronización
  const handleAddEquipment = async (equipmentData) => {
    try {
      // Primero crea el equipo
      const docRef = await addDoc(collection(db, 'equipment'), {
        ...equipmentData,
        createdAt: new Date()
      });

      const newEquipment = { id: docRef.id, ...equipmentData };

      // Si se asignó a un usuario, actualiza su registro
      if (equipmentData.assignedTo) {
        await updateUserEquipment(equipmentData.assignedTo, docRef.id);
      }

      return newEquipment;
    } catch (error) {
      console.error("Error añadiendo equipo:", error);
      throw error;
    }
  };

  // Eliminar equipo con limpieza de asignación
  const handleDeleteEquipment = async (equipmentId) => {
    if (window.confirm('¿Estás seguro de eliminar este equipo?')) {
      try {
        const equipmentToDelete = equipment.find(e => e.id === equipmentId);
        
        // Si el equipo estaba asignado, limpia la asignación del usuario
        if (equipmentToDelete?.assignedTo) {
          await updateUserEquipment(equipmentToDelete.assignedTo, null);
        }

        await deleteDoc(doc(db, 'equipment', equipmentId));
        setEquipment(equipment.filter(item => item.id !== equipmentId));
      } catch (error) {
        console.error("Error eliminando equipo:", error);
      }
    }
  };

  // Agregar nuevo usuario
  const handleAddUser = async (userData) => {
    try {
      const docRef = await addDoc(collection(db, 'users'), {
        ...userData,
        EquipoAsignado: userData.EquipoAsignado || null,
        createdAt: new Date()
      });

      const newUser = { id: docRef.id, ...userData };

      // Si se asignó un equipo, actualiza su registro
      if (userData.EquipoAsignado) {
        await updateEquipmentAssignment(userData.EquipoAsignado, docRef.id);
      }

      return newUser;
    } catch (error) {
      console.error("Error añadiendo usuario:", error);
      throw error;
    }
  };

  // Eliminar usuario con limpieza de asignación
  const handleDeleteUser = async (userId) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        const userToDelete = users.find(u => u.id === userId);
        
        // Si el usuario tenía equipo asignado, limpia la asignación
        if (userToDelete?.EquipoAsignado) {
          await updateEquipmentAssignment(userToDelete.EquipoAsignado, null);
        }

        await deleteDoc(doc(db, 'users', userId));
        setUsers(users.filter(user => user.id !== userId));
      } catch (error) {
        console.error("Error eliminando usuario:", error);
      }
    }
  };

  // Resto de funciones auxiliares
  const handleNextUser = () => {
    const currentIndex = users.findIndex(u => u.id === selectedUserId);
    if (currentIndex < users.length - 1) {
      setSelectedUserId(users[currentIndex + 1].id);
    }
  };
  
  const handlePrevUser = () => {
    const currentIndex = users.findIndex(u => u.id === selectedUserId);
    if (currentIndex > 0) {
      setSelectedUserId(users[currentIndex - 1].id);
    }
  };

  const handleAddDepartment = async (departmentName) => {
    try {
      const docRef = await addDoc(collection(db, 'departments'), {
        name: departmentName,
        createdAt: new Date()
      });
      
      const updatedDepartments = [...departments, { id: docRef.id, name: departmentName }];
      setDepartments(updatedDepartments);
      
      return { success: true, newDepartment: { id: docRef.id, name: departmentName } };
    } catch (error) {
      console.error("Error añadiendo departamento:", error);
      return { success: false };
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUserId(userId);
    setShowModal(true);
  };

  const handleSelectEquipment = (equipmentId) => {
    setSelectedEquipmentId(equipmentId); 
    setShowModal(true);
  };

  // Carga inicial de datos
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
        console.error("Error fetching data:", error);
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

 

        
  
        <div className="form-toggle-buttons">
          <button 
            onClick={() => {
              setShowUserForm(!showUserForm);
              setShowEquipmentForm(false);
              setEditingUser(null);
            }}
            className="toggle-form-btn"
          >
            {showUserForm ? 'Ocultar Formulario Usuario' : 'Mostrar Formulario Usuario'}
          </button>
          
          <button 
            onClick={() => {
              setShowEquipmentForm(!showEquipmentForm);
              setShowUserForm(false);
              setEditingEquipment(null);
            }}
            className="toggle-form-btn"
          >
            {showEquipmentForm ? 'Ocultar Formulario Equipo' : 'Mostrar Formulario Equipo'}
          </button>
        </div>
  
        {showUserForm && (
          <div className="forms-usuarios-equipos">
            <AddUserForm 
              onUserAdded={(userData) => {
                handleAddUser(userData);
                setShowUserForm(false);
              }} 
              userToEdit={editingUser}
              onEditUser={(userData) => {
                handleEditUser(userData);
                setShowUserForm(false);
              }}
              onCancelEdit={() => {
                setEditingUser(null);
                setShowUserForm(false);
              }}
              departments={departments}
              onAddDepartment={handleAddDepartment}
              equipment={equipment}
            />
          </div>
        )}
  
        {showEquipmentForm && (
          <div className="forms-usuarios-equipos">
            <AddEquipmentForm 
              users={users}
              onEquipmentAdded={(equipData) => {
                handleAddEquipment(equipData);
                setShowEquipmentForm(false);
              }}
              equipmentToEdit={editingEquipment}
              onEditEquipment={(equipData) => {
                handleEditEquipment(equipData);
                setShowEquipmentForm(false);
              }}
              onCancelEdit={() => {
                setEditingEquipment(null);
                setShowEquipmentForm(false);
              }}
            />
          </div>
        )}


          <div className="global-search">
        <input
          type="text"
          placeholder="Buscar en usuarios y equipos..."
          value={globalSearchTerm}
          onChange={(e) => setGlobalSearchTerm(e.target.value)}
        />
      </div>
        
        <div className="content">
          <UserList 
            users={users} 
            equipment={equipment}
            searchTerm={globalSearchTerm}
            onSelectUser={handleSelectUser}
            onDeleteUser={handleDeleteUser}
            onEditUser={(user) => {
              setEditingUser(user);
              setShowUserForm(true);
              setShowEquipmentForm(false);
            }}
          />
          <EquipmentList 
            equipment={equipment}
            users={users}
            searchTerm={globalSearchTerm}
            onSelectEquipment={handleSelectEquipment}
            onEditEquipment={(equipment) => {
              setEditingEquipment(equipment);
              setShowEquipmentForm(true);
              setShowUserForm(false);
            }}
            onDeleteEquipment={handleDeleteEquipment}
          />
        </div>
  
        {showModal && selectedUser && (
          <UserDetailsModal 
            user={selectedUser}
            users={users}
            equipment={equipment}
            onClose={() => setShowModal(false)}
            onEdit={handleEditUser}
            onNext={handleNextUser}
            onPrev={handlePrevUser}
            departments={departments}
            onAddDepartment={handleAddDepartment}
          />
        )}
      </div>
    </div>
  );
}

export default App;