import React, { useState, useEffect, useRef } from 'react';
import { collection, getDocs, addDoc, doc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import UserList from './components/UserList';
import EquipmentList from './components/EquipmentList';
import AddUserForm from './components/AddUserForm';
import AddEquipmentForm from './components/AddEquipmentForm';
import UserDetailsModal from './components/UserDetailsModal';
import EquipDetailsModal from './components/EquipDetailsModal';
import './App.css';
import './components/UserList.css';

function App() {
  // Referencias y estados
  const formRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(null);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showEquipmentForm, setShowEquipmentForm] = useState(false);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');

  
  const [currentEquipmentIndex, setCurrentEquipmentIndex] = useState(0);


  // ==================== FUNCIONES DE NAVEGACIÓN PARA EQUIPOS ====================
  const handleNextEquipment = () => {
    if (currentEquipmentIndex < equipment.length - 1) {
      setCurrentEquipmentIndex(currentEquipmentIndex + 1);
      setSelectedEquipmentId(equipment[currentEquipmentIndex + 1].id);
    }
  };

  const handlePrevEquipment = () => {
    if (currentEquipmentIndex > 0) {
      setCurrentEquipmentIndex(currentEquipmentIndex - 1);
      setSelectedEquipmentId(equipment[currentEquipmentIndex - 1].id);
    }
  };

  const closeModal = () => {
    setShowEquipmentModal(false);
    setSelectedEquipmentId(null);
  };

  // ==================== FUNCIONES DE ASIGNACIÓN ====================
  const updateUserEquipment = async (userId, equipmentId) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        EquipoAsignado: equipmentId || null,
        updatedAt: new Date()
      });
      
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

 const updateEquipmentAssignment = async (equipmentId, userId) => {
  try {
    await updateDoc(doc(db, 'equipment', equipmentId), {
      assignedTo: userId || null,
      updatedAt: new Date()
    });
    
    // Actualización más completa del estado
    setEquipment(prevEquipment => prevEquipment.map(equip => {
      if (equip.id === equipmentId) {
        return { ...equip, assignedTo: userId || null };
      }
      // Limpiar asignación si este equipo estaba asignado al usuario
      if (userId && equip.assignedTo === userId && equip.id !== equipmentId) {
        return { ...equip, assignedTo: null };
      }
      return equip;
    }));
  } catch (error) {
    console.error("Error actualizando asignación de equipo:", error);
    throw error;
  }
};

  // ==================== MANEJO DE USUARIOS ====================
  const handleEditUser = async (userData) => {
    try {
      const oldUser = users.find(u => u.id === userData.id);
      const equipmentChanged = oldUser?.EquipoAsignado !== userData.EquipoAsignado;

      if (equipmentChanged) {
        if (oldUser?.EquipoAsignado) {
          await updateEquipmentAssignment(oldUser.EquipoAsignado, null);
        }
        if (userData.EquipoAsignado) {
          await updateEquipmentAssignment(userData.EquipoAsignado, userData.id);
        }
      }

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

      setUsers(users.map(user => 
        user.id === userData.id ? { ...userData } : user
      ));
      
      setEditingUser(null);
    } catch (error) {
      console.error("Error editando usuario:", error);
      throw error;
    }
  };

  const handleAddUser = async (userData) => {
    try {
      const docRef = await addDoc(collection(db, 'users'), {
        ...userData,
        EquipoAsignado: userData.EquipoAsignado || null,
        createdAt: new Date()
      });

      const newUser = { id: docRef.id, ...userData };

      if (userData.EquipoAsignado) {
        await updateEquipmentAssignment(userData.EquipoAsignado, docRef.id);
      }

      return newUser;
    } catch (error) {
      console.error("Error añadiendo usuario:", error);
      throw error;
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        const userToDelete = users.find(u => u.id === userId);
        
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

  // ==================== MANEJO DE EQUIPOS ====================
  const handleEditEquipment = async (equipmentData) => {
    try {
      if (!equipmentData.id) {
        throw new Error("ID de equipo no proporcionado");
      }

      const equipmentRef = doc(db, 'equipment', equipmentData.id);
      const equipmentSnap = await getDoc(equipmentRef);
      
      if (!equipmentSnap.exists()) {
        throw new Error("El equipo no existe en la base de datos");
      }

      const updateData = {
        nombre: equipmentData.nombre,
        type: equipmentData.type,
        model: equipmentData.model,
        marca: equipmentData.marca,
        serialNumber: equipmentData.serialNumber,
        IpEquipo: equipmentData.IpEquipo,
        ciudad: equipmentData.ciudad,
        estado: equipmentData.estado,
        lugar: equipmentData.lugar,

        procesador: equipmentData.procesador,
        ram: equipmentData.ram,
        discoDuro: equipmentData.discoDuro,
        tarjetaGrafica: equipmentData.tarjetaGrafica,


        descripcion: equipmentData.descripcion,
        assignedTo: equipmentData.assignedTo || null,
        updatedAt: new Date()
      };

      if (equipmentData.imageBase64) {
        updateData.imageBase64 = equipmentData.imageBase64;
      }

      await updateDoc(equipmentRef, updateData);

      const oldEquipment = equipment.find(e => e.id === equipmentData.id);
      const assignmentChanged = oldEquipment?.assignedTo !== equipmentData.assignedTo;

      if (assignmentChanged) {
        if (oldEquipment?.assignedTo) {
          await updateUserEquipment(oldEquipment.assignedTo, null);
        }
        if (equipmentData.assignedTo) {
          await updateUserEquipment(equipmentData.assignedTo, equipmentData.id);
        }
      }

      setEquipment(prev => prev.map(eq => 
        eq.id === equipmentData.id ? { ...eq, ...updateData } : eq
      ));

      return true;
    } catch (error) {
      console.error("Error en handleEditEquipment:", error);
      throw error;
    }
  };

  const handleAddEquipment = async (equipmentData) => {
    try {
      const docRef = await addDoc(collection(db, 'equipment'), {
        ...equipmentData,
        createdAt: new Date()
      });

      const newEquipment = { id: docRef.id, ...equipmentData };

      if (equipmentData.assignedTo) {
        await updateUserEquipment(equipmentData.assignedTo, docRef.id);
      }

      return newEquipment;
    } catch (error) {
      console.error("Error añadiendo equipo:", error);
      throw error;
    }
  };

  const handleDeleteEquipment = async (equipmentId) => {
    if (window.confirm('¿Estás seguro de eliminar este equipo?')) {
      try {
        const equipmentToDelete = equipment.find(e => e.id === equipmentId);
        
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

  // ==================== FUNCIONES AUXILIARES ====================
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
    setShowUserModal(true);
    setShowEquipmentModal(false);
  };

  const handleSelectEquipment = (equipmentId) => {
    setSelectedEquipmentId(equipmentId); 
    setShowEquipmentModal(true);
  };

  // ==================== EFECTOS ====================
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

  // ==================== RENDER ====================
 if (loading) {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-spinner"></div>
        <h2>Cargando Sistema de Gestión</h2>
        <p>Por favor espere mientras cargamos todos los recursos...</p>
        <div className="loading-progress">
          <div className="progress-bar"></div>
        </div>
      </div>
    </div>
  );
}

  return (
    <div className="app-background">
      <div className="app-container">
        <div className="app">
          {/* Encabezado de la aplicación */}
          <div className="app-header">
            <h2>Gestión de Usuarios y Equipos</h2>
          </div>

          

<div className="global-search-container">
  <div className="global-search">
            <input
              type="text"
              placeholder="Buscar en usuarios y equipos..."
              value={globalSearchTerm}
              onChange={(e) => setGlobalSearchTerm(e.target.value)}
            />
          </div>
</div>

{/* Contenido con scroll */}
<div className="scrollable-content">
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
                onEditUser={handleEditUser}
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
                ref={formRef}
                users={users}
                onEquipmentAdded={(equipData) => {
                  handleAddEquipment(equipData);
                  setShowEquipmentForm(false);
                }}
                equipmentToEdit={editingEquipment}
                onEditEquipment={handleEditEquipment}
                onCancelEdit={() => {
                  setEditingEquipment(null);
                  setShowEquipmentForm(false);
                }}
              />
            </div>
          )}

        
          
          <div className="content">
          <div className="listsUser-container">
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
          </div>
          <div className="listsEquipment-container">
            <EquipmentList 
              equipment={equipment}
              users={users}
              searchTerm={globalSearchTerm}
              onSelectEquipment={handleSelectEquipment}
              onEditEquipment={(equipment) => {
                setEditingEquipment(equipment);
                setShowEquipmentForm(true);
                setShowUserForm(false);
                formRef.current?.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'start'
                });
              }}
              onDeleteEquipment={handleDeleteEquipment}
            />
          </div>
</div>
</div>
          {showUserModal && selectedUserId && (
            <UserDetailsModal 
              user={users.find(u => u.id === selectedUserId)}
              users={users}
              equipment={equipment}
              onClose={() => setShowUserModal(false)}
              onEdit={handleEditUser}
              onEditEquipment={handleEditEquipment}
              onEquipmentSelect={handleSelectEquipment}
              onDelete={handleDeleteUser}
              onNext={handleNextUser}
              onPrev={handlePrevUser}
              departments={departments}
              onAddDepartment={handleAddDepartment}
            />
          )}

          {showEquipmentModal && selectedEquipmentId && (
            <EquipDetailsModal 
              equipment={equipment.find(e => e.id === selectedEquipmentId)}
      onEdit={handleEditEquipment}
      
       onClose={closeModal}
      users={users}
      currentIndex={equipment.findIndex(e => e.id === selectedEquipmentId)}
      totalEquipment={equipment.length}
      onNext={handleNextEquipment}  
      onPrev={handlePrevEquipment}  
            />
          )}
        
      </div> {/* Cierra div.app */}
    </div>  {/* Cierra div.app-container */}
    </div> /* Cierra div.app-background */
  );
}

export default App;