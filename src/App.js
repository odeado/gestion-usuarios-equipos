import React, { useState, useEffect, useRef } from 'react';
import { collection, getDocs, addDoc, doc, deleteDoc, updateDoc, getDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from './firebase';
import UserList from './components/UserList';
import EquipmentList from './components/EquipmentList';
import AddUserForm from './components/AddUserForm';
import AddEquipmentForm from './components/AddEquipmentForm';
import UserDetailsModal from './components/UserDetailsModal';
import EquipDetailsModal from './components/EquipDetailsModal';
import './App.css';
import './components/UserList.css';
import { useSpring, animated } from 'react-spring';
import imageCompression from 'browser-image-compression';

function App() {
  // Referencias y estados
   const usersPageRef = useRef(null);
   const equipmentPageRef = useRef(null);

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

  const [activeView, setActiveView] = useState('users'); // 'users' o 'equipment'

// Estados para el gesto táctil y animación
const [touchStartY, setTouchStartY] = useState(null);
const [touchEndY, setTouchEndY] = useState(null);
const [panelPosition, setPanelPosition] = useState(0); // 0: oculto, 1: visible
const [isDragging, setIsDragging] = useState(false);
const [showCounters, setShowCounters] = useState(false);

const [selectedUser, setSelectedUser] = useState(null);


const handleSelectEquipment = (equipmentId) => {
  setSelectedEquipmentId(equipmentId);
  setCurrentEquipmentIndex(equipment.findIndex(e => e.id === equipmentId));
  setShowEquipmentModal(true);
};


// Handlers para el gesto táctil
const handleTouchStart = (e) => {
  // Solo activar si estamos cerca del borde superior
  if (window.scrollY <= 10) {
    setTouchStartY(e.touches[0].clientY);
    setTouchEndY(e.touches[0].clientY);
    setIsDragging(true);
  }
};

const handleTouchMove = (e) => {
  if (!isDragging) return;
  const currentY = e.touches[0].clientY;
  setTouchEndY(currentY);
  
  // Calcular posición relativa (0-1)
  const delta = currentY - touchStartY; // Cambiado a currentY - touchStartY
  const newPosition = Math.min(Math.max(delta / 100, 0), 1); // 100px para mostrar completo
  setPanelPosition(newPosition);
  
  // Mostrar si el desplazamiento es suficiente
  if (delta > 50) {
    setShowCounters(true);
  }
};

const handleTouchEnd = () => {
  setIsDragging(false);
  setTouchStartY(null);
  setTouchEndY(null);
};


useEffect(() => {
  if (!isDragging) {
    setPanelPosition(showCounters ? 1 : 0);
  }
}, [showCounters, isDragging]);

const [allAvailableIps, setAllAvailableIps] = useState([
  '192.168.1.1',
  '192.168.1.2',
  '10.0.0.1'
]);

// Función para agregar IPs nuevas
const handleAddNewIp = (newIp) => {
  if (!allAvailableIps.includes(newIp)) {
    setAllAvailableIps([...allAvailableIps, newIp]);
  }
};

// ==================== FUNCIONES DE NAVEGACIÓN ENTRE VISTAS ====================
  const scrollToView = (view) => {
    setActiveView(view);
    if (view === 'users' && usersPageRef.current) {
      usersPageRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (view === 'equipment' && equipmentPageRef.current) {
      equipmentPageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
        equiposAsignados: equipmentId ? [equipmentId] : [],
        updatedAt: new Date()
      });

      setUsers(users.map(user =>
        user.id === userId
          ? { ...user, equiposAsignados: equipmentId ? [equipmentId] : [] }
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
      usuariosAsignados: userId ? [userId] : [],
      updatedAt: new Date()
    });
    
    // Actualización más completa del estado
    setEquipment(prevEquipment => prevEquipment.map(equip => {
      if (equip.id === equipmentId) {
        return { ...equip, usuariosAsignados: userId ? [userId] : [] };
      }
      // Limpiar asignación si este equipo estaba asignado al usuario
      if (userId && equip.usuariosAsignados === userId && equip.id !== equipmentId) {
        return { ...equip, usuariosAsignados: null };
      }
      return equip;
    }));
  } catch (error) {
    console.error("Error actualizando asignación de equipo:", error);
    throw error;
  }
};

   // ==================== FUNCIONES DE USUARIOS ====================

 


  const handleEditUser = async (userData) => {
    try {
      const oldUser = users.find(u => u.id === userData.id);
      
      // Obtener equipos antiguos y nuevos (siempre como arrays)
      const oldEquipos = Array.isArray(oldUser?.equiposAsignados) 
        ? oldUser.equiposAsignados 
        : [];
        
      const newEquipos = Array.isArray(userData.equiposAsignados) 
        ? userData.equiposAsignados 
        : [];

      // Equipos que ya no están asignados
      const removedEquipos = oldEquipos.filter(id => !newEquipos.includes(id));
      // Nuevos equipos asignados
      const addedEquipos = newEquipos.filter(id => !oldEquipos.includes(id));

      // Actualizar equipos en Firestore
      await Promise.all([
        ...removedEquipos.map(equipoId => 
          updateDoc(doc(db, 'equipment', equipoId), {
            usuariosAsignados: arrayRemove(userData.id),
            updatedAt: new Date()
          })
        ),
        ...addedEquipos.map(equipoId => 
          updateDoc(doc(db, 'equipment', equipoId), {
            usuariosAsignados: arrayUnion(userData.id),
            updatedAt: new Date()
          })
        )
      ]);

      // Actualizar el usuario
      await updateDoc(doc(db, 'users', userData.id), {
        name: userData.name,
        correo: userData.correo,
        ciudad: userData.ciudad,
        tipoVpn: userData.tipoVpn,
        department: userData.department,
        estado: userData.estado,
        equiposAsignados: newEquipos,
        imageBase64: userData.imageBase64,
        updatedAt: new Date()
      });

      // Actualizar estado local
      setUsers(users.map(u => 
        u.id === userData.id ? { ...userData, equiposAsignados: newEquipos } : u
      ));

      setEquipment(prevEquipment => 
        prevEquipment.map(eq => {
          const usuarios = Array.isArray(eq.usuariosAsignados) ? eq.usuariosAsignados : [];
          
          if (removedEquipos.includes(eq.id)) {
            return {
              ...eq,
              usuariosAsignados: usuarios.filter(id => id !== userData.id)
            };
          }
          
          if (addedEquipos.includes(eq.id) && !usuarios.includes(userData.id)) {
            return {
              ...eq,
              usuariosAsignados: [...usuarios, userData.id]
            };
          }
          
          return eq;
        })
      );

      return true;
    } catch (error) {
      console.error("Error editando usuario:", error);
      throw error;
    }
  };

  const handleAddUser = async (userData) => {
    try {
      const equiposAsignados = Array.isArray(userData.equiposAsignados) 
        ? userData.equiposAsignados 
        : [];

      const docRef = await addDoc(collection(db, 'users'), {
        ...userData,
        equiposAsignados,
        createdAt: new Date()
      });

      // Actualizar equipos asignados
      await Promise.all(
        equiposAsignados.map(equipoId => 
          updateDoc(doc(db, 'equipment', equipoId), {
            usuariosAsignados: arrayUnion(docRef.id),
            updatedAt: new Date()
          })
        )
      );

      const newUser = { id: docRef.id, ...userData, equiposAsignados };
      
      // Actualizar estado local
      setUsers([...users, newUser]);
      setEquipment(prevEquipment => 
        prevEquipment.map(eq => 
          equiposAsignados.includes(eq.id)
            ? {
                ...eq,
                usuariosAsignados: Array.isArray(eq.usuariosAsignados)
                  ? [...eq.usuariosAsignados, docRef.id]
                  : [docRef.id]
              }
            : eq
        )
      );

      return newUser;
    } catch (error) {
      console.error("Error añadiendo usuario:", error);
      throw error;
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        const user = users.find(u => u.id === userId);
        
        // Quitar usuario de todos los equipos asignados
        await Promise.all(
          (user.equiposAsignados || []).map(equipoId => 
            updateDoc(doc(db, 'equipment', equipoId), {
              usuariosAsignados: arrayRemove(userId),
              updatedAt: new Date()
            })
          )
        );

        await deleteDoc(doc(db, 'users', userId));
        
        // Actualizar estado local
        setUsers(users.filter(u => u.id !== userId));
        setEquipment(prevEquipment => 
          prevEquipment.map(eq => ({
            ...eq,
            usuariosAsignados: Array.isArray(eq.usuariosAsignados)
              ? eq.usuariosAsignados.filter(id => id !== userId)
              : []
          }))
        );
      } catch (error) {
        console.error("Error eliminando usuario:", error);
      }
    }
  };

 

    // ==================== FUNCIONES DE EQUIPOS ====================

  const handleEditEquipment = async (equipmentData) => {
    try {
      const oldEquipment = equipment.find(e => e.id === equipmentData.id);
      
      // Obtener usuarios antiguos y nuevos (siempre como arrays)
      const oldUsuarios = Array.isArray(oldEquipment?.usuariosAsignados) 
        ? oldEquipment.usuariosAsignados 
        : [];
        
      const newUsuarios = Array.isArray(equipmentData.usuariosAsignados) 
        ? equipmentData.usuariosAsignados 
        : [];

      // Usuarios que ya no están asignados
      const removedUsers = oldUsuarios.filter(id => !newUsuarios.includes(id));
      // Nuevos usuarios asignados
      const addedUsers = newUsuarios.filter(id => !oldUsuarios.includes(id));

      // Actualizar usuarios en Firestore
      await Promise.all([
        ...removedUsers.map(userId => 
          updateDoc(doc(db, 'users', userId), {
            equiposAsignados: arrayRemove(equipmentData.id),
            updatedAt: new Date()
          })
        ),
        ...addedUsers.map(userId => 
          updateDoc(doc(db, 'users', userId), {
            equiposAsignados: arrayUnion(equipmentData.id),
            updatedAt: new Date()
          })
        )
      ]);

      // Actualizar el equipo
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
        procesador: equipmentData.procesador,
        ram: equipmentData.ram,
        discoDuro: equipmentData.discoDuro,
        tarjetaGrafica: equipmentData.tarjetaGrafica,
        windows: equipmentData.windows,
        antivirus: equipmentData.antivirus,
        office: equipmentData.office,
        descripcion: equipmentData.descripcion,
        usuariosAsignados: newUsuarios,
        imageBase64: equipmentData.imageBase64,
        updatedAt: new Date()
      });

      // Actualizar estado local
      setEquipment(equipment.map(e => 
        e.id === equipmentData.id 
          ? { ...equipmentData, usuariosAsignados: newUsuarios } 
          : e
      ));

      setUsers(prevUsers => 
        prevUsers.map(user => {
          const equipos = Array.isArray(user.equiposAsignados) ? user.equiposAsignados : [];
          
          if (removedUsers.includes(user.id)) {
            return {
              ...user,
              equiposAsignados: equipos.filter(id => id !== equipmentData.id)
            };
          }
          
          if (addedUsers.includes(user.id) && !equipos.includes(equipmentData.id)) {
            return {
              ...user,
              equiposAsignados: [...equipos, equipmentData.id]
            };
          }
          
          return user;
        })
      );

      return true;
    } catch (error) {
      console.error("Error editando equipo:", error);
      throw error;
    }
  };

  const handleAddEquipment = async (equipmentData) => {
    try {
      const usuariosAsignados = Array.isArray(equipmentData.usuariosAsignados) 
        ? equipmentData.usuariosAsignados 
        : [];

      const docRef = await addDoc(collection(db, 'equipment'), {
        ...equipmentData,
        usuariosAsignados,
        createdAt: new Date()
      });

      // Actualizar usuarios asignados
      await Promise.all(
        usuariosAsignados.map(userId => 
          updateDoc(doc(db, 'users', userId), {
            equiposAsignados: arrayUnion(docRef.id),
            updatedAt: new Date()
          })
        )
      );

      const newEquipment = { id: docRef.id, ...equipmentData, usuariosAsignados };
      
      // Actualizar estado local
      setEquipment([...equipment, newEquipment]);
      setUsers(prevUsers => 
        prevUsers.map(user => 
          usuariosAsignados.includes(user.id)
            ? {
                ...user,
                equiposAsignados: Array.isArray(user.equiposAsignados)
                  ? [...user.equiposAsignados, docRef.id]
                  : [docRef.id]
              }
            : user
        )
      );

      return newEquipment;
    } catch (error) {
      console.error("Error añadiendo equipo:", error);
      throw error;
    }
  };

  const handleDeleteEquipment = async (equipmentId) => {
    if (window.confirm('¿Estás seguro de eliminar este equipo?')) {
      try {
        const equipo = equipment.find(e => e.id === equipmentId);
        
        // Quitar equipo de todos los usuarios asignados
        await Promise.all(
          (equipo.usuariosAsignados || []).map(userId => 
            updateDoc(doc(db, 'users', userId), {
              equiposAsignados: arrayRemove(equipmentId),
              updatedAt: new Date()
            })
          )
        );

        await deleteDoc(doc(db, 'equipment', equipmentId));
        
        // Actualizar estado local
        setEquipment(equipment.filter(e => e.id !== equipmentId));
        setUsers(prevUsers => 
          prevUsers.map(user => ({
            ...user,
            equiposAsignados: Array.isArray(user.equiposAsignados)
              ? user.equiposAsignados.filter(id => id !== equipmentId)
              : []
          }))
        );
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



 const handleOpenEquipmentModal = (equipmentId) => {
  setSelectedEquipmentId(equipmentId);
  setShowEquipmentModal(true);
};

const handleOpenUserModal = (userId) => {
  console.log("handleOpenUserModal called with userId:", userId);
  setSelectedUserId(userId);
  setShowUserModal(true);
};

  // ==================== EFECTOS Paginas ====================

  const [currentPage, setCurrentPage] = useState(0);
const pages = ['users', 'equipment'];

// Función para cambiar de página
const goToPage = (index) => {
  setCurrentPage(index);
  setActiveView(pages[index]);
  const pageElements = document.querySelectorAll('.full-page'); // Cambiado a pageElements
  if (pageElements[index]) {
    pageElements[index].scrollIntoView({ behavior: 'smooth' });
  }
};

// Efecto para detectar el scroll
useEffect(() => {
  const handleScroll = () => {
    const pages = document.querySelectorAll('.full-page');
    const scrollPosition = window.scrollY + window.innerHeight / 2;
    
    pages.forEach((page, index) => {
      const pageTop = page.offsetTop;
      const pageBottom = pageTop + page.offsetHeight;
      
      if (scrollPosition > pageTop && scrollPosition < pageBottom) {
        setCurrentPage(index);
        setActiveView(pages[index]);
      }
    });
  };

  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);

// ==================== EFECTOS ====================

const [counters, setCounters] = useState({
  totalUsers: 0,
  activeUsers: 0,
  MercurioAntofagastaUsers: 0,
  totalEquipment: 0,
  availableEquipment: 0,
  assignedEquipment: 0
});

  // ==================== EFECTOS ====================
useEffect(() => {
  const fetchData = async () => {
    try {
      const [usersSnapshot, equipmentSnapshot, departmentsSnapshot] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'equipment')),
        getDocs(collection(db, 'departments'))
      ]);

      const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const equipmentData = equipmentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setUsers(usersData);
      setEquipment(equipmentData);
      setDepartments(departmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));


// Extraer todas las IPs únicas de los equipos
      const allIps = equipmentData.reduce((acc, equip) => {
        const equipIps = Array.isArray(equip.IpEquipo) ? equip.IpEquipo : [];
        return [...acc, ...equipIps];
      }, ['192.168.1.1', '192.168.1.2', '10.0.0.1']);

      setAllAvailableIps([...new Set(allIps.filter(ip => ip))]); // Elimina duplicados y valores nulos



      // Actualizar contadores
      setCounters({
        totalUsers: usersData.length,
        activeUsers: usersData.filter(u => u.estado === 'Activo').length,
        MercurioAntofagastaUsers: usersData.filter(u => u.department === 'Mercurio Antofagasta').length,
        totalEquipment: equipmentData.length,
        availableEquipment: equipmentData.filter(e => !e.usuariosAsignados).length,
        assignedEquipment: equipmentData.filter(e => e.usuariosAsignados).length
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);





function StatsPanel({ counters, visible, position, setShowCounters }) {
  // Determinar si es móvil
  const isMobile = window.innerWidth <= 768;
  
  // Animaciones con react-spring
  const panelAnimation = useSpring({
    height: isMobile ? (visible ? 'auto' : '0px') : 'auto',
    opacity: isMobile ? (visible ? 1 : 0) : 1,
    transform: isMobile ? (visible ? 'translateY(0)' : 'translateY(-100%)') : 'translateY(0)',
    margin: isMobile ? (visible ? '0px 0' : '0') : '0px 0',
    padding: isMobile ? (visible ? '5px' : '0') : '5px',
    config: { tension: 300, friction: 30 }
  });

  return (
    <div className="stats-container">
      {isMobile && (
        <div 
          className="pull-indicator" 
          onClick={() => setShowCounters(!visible)}
        >
          {visible ? '▲ contadores' : '▼ contadores'}
        </div>
      )}
      <animated.div 
        className="stats-panel"
        style={panelAnimation}
      >
        <div className="stat-card">
          <h3>Usuarios</h3>
          <p>Total: {counters.totalUsers}</p>
          <p>Activos: {counters.activeUsers}</p>
          <p>Mercurio Antofagasta: {counters.MercurioAntofagastaUsers}</p>
        </div>
        <div className="stat-card">
          <h3>Equipos</h3>
          <p>Total: {counters.totalEquipment}</p>
          <p>Disponibles: {counters.availableEquipment}</p>
          <p>Asignados: {counters.assignedEquipment}</p>
        </div>
      </animated.div>
    </div>
  );
}



  // ==================== RENDER ====================
 if (loading) {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-spinner"></div>
        <h2>Cargando Sistema de Gestión</h2>
        <p>Por favor espere mientras cargamos todos los datos...</p>
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
            {/* Controles de navegación */}
      <div className="nav-arrows">
        <button 
          className="nav-arrow" 
          onClick={() => goToPage(0)}
          disabled={currentPage === 0}
        >
          ↑
        </button>
        <button 
          className="nav-arrow"
          onClick={() => goToPage(1)}
          disabled={currentPage === 1}
        >
          ↓
        </button>
      </div>

      <div className="page-indicator">
        {pages.map((_, index) => (
          <div 
            key={index}
            className={`page-dot ${currentPage === index ? 'active' : ''}`}
            onClick={() => goToPage(index)}
          />
        ))}
      </div>
          </div>

<div 
  className="stats-touch-container"
  onTouchStart={handleTouchStart}
  onTouchMove={handleTouchMove}
  onTouchEnd={handleTouchEnd}
>
  <StatsPanel 
    counters={counters} 
    visible={showCounters} 
    position={panelPosition}
    setShowCounters={setShowCounters} 
  />
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

 {/* Contenedor principal con scroll */}
          <div className="main-content-container">
            {/* Página de Usuarios */}
            <div 
              ref={usersPageRef} 
              className={`full-page ${activeView === 'users' ? 'active-page' : ''}`}
            >
              <div className="page-header">
                <h3>Listado de Usuarios</h3>
                <button 
                  onClick={() => {
                    setShowUserForm(!showUserForm);
                    setShowEquipmentForm(false);
                    setEditingUser(null);
                  }}
                  className="toggle-form-btn"
                >
                  {showUserForm ? 'Ocultar Formulario' : 'Añadir Usuario'}
                </button>
              </div>

              {showUserForm && (
                <div className="forms-usuarios">
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

              <div className="listsUser-container">
                <UserList 
                  users={users} 
                  equipment={equipment}
                  searchTerm={globalSearchTerm}
                  onSelectUser={handleOpenUserModal}
                  onDeleteUser={handleDeleteUser}
                  onEditUser={(user) => {
                    setEditingUser(user);
                    setShowUserForm(true);
                    setShowEquipmentForm(false);
                  }}
                />
              </div>
            </div>

   {/* Página de Equipos */}
            <div 
              ref={equipmentPageRef} 
              className={`full-page ${activeView === 'equipment' ? 'active-page' : ''}`}
            >
              <div className="page-header">
                <h3>Listado de Equipos</h3>
                <button 
                  onClick={() => {
                    setShowEquipmentForm(!showEquipmentForm);
                    setShowUserForm(false);
                    setEditingEquipment(null);
                  }}
                  className="toggle-form-btn"
                >
                  {showEquipmentForm ? 'Ocultar Formulario' : 'Añadir Equipo'}
                </button>
              </div>

       {showEquipmentForm && (
                <div className="forms-equipos">
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
              onOpenEquipmentModal={handleOpenEquipmentModal}
              onDelete={handleDeleteUser}
              onNext={handleNextUser}
              onPrev={handlePrevUser}
              departments={departments}
              onAddDepartment={handleAddDepartment}
              imageCompression={imageCompression}
              
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
              onOpenUserModal={handleOpenUserModal} 
              availableIps={allAvailableIps}
              onAddNewIp={handleAddNewIp}
            />
          )}
        
      </div> {/* Cierra div.app */}
    </div>  {/* Cierra div.app-container */}
  </div> 
  );
}

export default App;