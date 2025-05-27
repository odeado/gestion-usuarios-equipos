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


  const handleEditUser = async (userData) => {
    try {
      // Debes usar updateDoc en lugar de addDoc para edición
      await updateDoc(doc(db, 'users', userData.id), {
        name: userData.name,
        correo: userData.correo,
        ciudad: userData.ciudad,
        tipoVpn: userData.tipoVpn,
        department: userData.department,
        EquipoAsignado: userData.EquipoAsignado || null, // Nuevo campo
        imageBase64: userData.imageBase64,
        updatedAt: new Date()  // Agrega campo de actualización
      });
            // Actualiza el estado local
    setUsers(users.map(user => 
      user.id === userData.id ? { ...userData } : user
    ));
    
    setEditingUser(null); // Limpia el usuario en edición
  } catch (error) {
    console.error("Error editando usuario: ", error);
    throw error; // Propaga el error
  }
};


/*datos de equipmento*/
const handleEditEquipment = async (equipmentData) => {
  try {
    await updateDoc(doc(db, 'equipment', equipmentData.id), {
      nombre: equipmentData.nombre,
      type: equipmentData.type,
      model: equipmentData.model,
      serialNumber: equipmentData.serialNumber, // Asegúrate de que este campo exista en tu formulario
      IpEquipo: equipmentData.IpEquipo,
      assignedTo: equipmentData.assignedTo,
      imageBase64: equipmentData.imageBase64,
      updatedAt: new Date()  // Agrega campo de actualización
    });

   // Actualiza el estado local
   setEquipment(equipment.map(equipment => 
    equipment.id === equipmentData.id ? { ...equipmentData } : equipment
  ));
  
  setEditingEquipment(null); // Limpia el usuario en edición
} catch (error) {
  console.error("Error editando Equipo: ", error);
  throw error; // Propaga el error
}
};


const handleAddEquipment = async (equipmentData) => {
  try {
    const docRef = await addDoc(collection(db, 'equipment'), {
      nombre: equipmentData.nombre,
      type: equipmentData.type,
      model: equipmentData.model,
      serialNumber: equipmentData.serialNumber, // Asegúrate de que este campo exista en tu formulario
      IpEquipo: equipmentData.IpEquipo,
      assignedTo: equipmentData.assignedTo,
      imageBase64: equipmentData.imageBase64,
      createdAt: new Date()
    });

    return { id: docRef.id, ...equipmentData };
  } catch (error) {
    console.error("Error añadiendo equipo: ", error);
    throw error;
  }
};

const handleDeleteEquipment = async (equipmentId) => {
  if (window.confirm('¿Estás seguro de eliminar este equipo?')) {
    try {
      await deleteDoc(doc(db, 'equipment', equipmentId));
      setEquipment(equipment.filter(item => item.id !== equipmentId));
    } catch (error) {
      console.error("Error eliminando equipo: ", error);
    }
  }
};

const handleSelectEquipment = (equipmentId) => {
  setSelectedEquipmentId(equipmentId); 
  setShowModal(true);
};


  /*datos de usuario*/

   
const handleAddUser = async (userData) => {
  try {
    const docRef = await addDoc(collection(db, 'users'), {
      name: userData.name,
      correo: userData.correo,
      ciudad: userData.ciudad,
      tipoVpn: userData.tipoVpn,
      department: userData.department,
      EquipoAsignado: userData.EquipoAsignado || null, // Nuevo campo
      imageBase64: userData.imageBase64,
      createdAt: new Date()
    });

    return { id: docRef.id, ...userData };
  } catch (error) {
    console.error("Error añadiendo usuario: ", error);
    throw error;
  }
};

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

  const handleAddDepartment = async (departmentName) => {
    try {
      const docRef = await addDoc(collection(db, 'departments'), {
        name: departmentName,
        createdAt: new Date()
      });
      
      // Actualiza el estado de departamentos
      const updatedDepartments = [...departments, { id: docRef.id, name: departmentName }];
      setDepartments(updatedDepartments);
      
      // Retorna el nuevo departamento además del éxito
      return { success: true, newDepartment: { id: docRef.id, name: departmentName } };
    } catch (error) {
      console.error("Error añadiendo departamento: ", error);
      return { success: false };
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
  
        {/* Botones para mostrar/ocultar formularios */}
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
  
        {/* Formularios condicionales */}
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
        
        {/* Listados (siempre visibles) */}
        <div className="content">
          <UserList 
            users={users} 
            equipment={equipment}
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
            onSelectEquipment={handleSelectEquipment}
            onEditEquipment={(equipment) => {
              setEditingEquipment(equipment);
              setShowEquipmentForm(true);
              setShowUserForm(false);
            }}
            onDeleteEquipment={handleDeleteEquipment}
          />
        </div>
  
        {/* Modal de detalles */}
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
