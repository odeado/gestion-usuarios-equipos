import React, { useState, useEffect, useRef, useCallback } from 'react';
import { collection, getDocs, addDoc, doc, deleteDoc, updateDoc, getDoc, arrayUnion, writeBatch, deleteField, arrayRemove } from 'firebase/firestore';
import { db } from './firebase';
import UserList from './components/UserList';
import EquipmentList from './components/EquipmentList';
import AddUserForm from './components/AddUserForm';
import AddEquipmentForm from './components/AddEquipmentForm';
import UserDetailsModal from './components/UserDetailsModal';
import EquipDetailsModal from './components/EquipDetailsModal';
import EquipmentAssignment from './components/EquipmentAssignment';
import './App.css';
import './components/UserList.css';
import { useSpring, animated } from 'react-spring';
import imageCompression from 'browser-image-compression';
import ResetDataPanel from './components/ResetDataPanel';

function App() {
  // Referencias y estados
   const usersPageRef = useRef(null);
   const equipmentPageRef = useRef(null);

  const formRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [userIsAdmin, setUserIsAdmin] = useState(false); // Cambia esto según tu lógica de autenticación
  const [availableProcessors, setAvailableProcessors] = useState([]);
  const [availableCorreos, setAvailableCorreos] = useState([]);
  

// Función para añadir procesador
const handleAddProcessor = (newProcessor) => {
  setAvailableProcessors(prev => {
    const newProcessors = [...new Set([...prev, newProcessor])]; // Elimina duplicados
    console.log("Después de añadir procesador:", newProcessors);
    return newProcessors;
  });
};

// Función para eliminar procesador
const handleRemoveProcessor = (processorToRemove) => {
  setAvailableProcessors(prev => {
    const newProcessors = prev.filter(p => p !== processorToRemove);
    console.log("Después de eliminar procesador:", newProcessors);
    return newProcessors;
  });
};

// Función para añadir correos
const handleAddCorreos = (newCorreo) => {
  // Validar formato de correo
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newCorreo)) {
    console.error("Formato de correo inválido");
    return;
  }

  setAvailableCorreos(prev => {
    // Verificar si el correo ya existe (case insensitive)
    const exists = prev.some(
      c => c.toLowerCase() === newCorreo.toLowerCase()
    );
    if (exists) return prev;
    
    const newCorreos = [...prev, newCorreo].sort();
    console.log("Después de añadir correo:", newCorreos);
    return newCorreos;
  });
};

// Función para eliminar correos
const handleRemoveCorreo = (correoToRemove) => {
  setAvailableCorreos(prev => {
    const newCorreos = prev.filter(p => p !== correoToRemove);
    console.log("Después de eliminar correo:", newCorreos);
    return newCorreos;
  });
};


  // Si usas Firebase Auth, podrías hacer algo como esto:
useEffect(() => {
  // Esta es una implementación básica - ajústala a tu sistema
  const checkAdminStatus = async () => {
    // Aquí verificarías si el usuario actual es admin
    // Por ejemplo, podrías tener una colección de admins en Firestore
    setUserIsAdmin(true); // Temporalmente siempre true para desarrollo
  };
  
  checkAdminStatus();
}, []);


 // En el componente padre que maneja el estado global
const handleEquipmentCategoryChange = (equipoId, userId, category) => {
  setEquipment(prev => prev.map(eq => {
    if (eq.id === equipoId) {
      const newCategories = {...eq.categoriasAsignacion};
      if (category) {
        newCategories[userId] = category;
      } else {
        delete newCategories[userId];
      }
      return {...eq, categoriasAsignacion: newCategories};
    }
    return eq;
  }));
}; 


const handleUserEquipmentChange = (userId, equipmentId, category) => {
  // Actualizar el equipo correspondiente
  setEquipment(prev => prev.map(eq => {
    if (eq.id === equipmentId) {
      const newUsers = eq.usuariosAsignados.includes(userId) 
        ? eq.usuariosAsignados 
        : [...eq.usuariosAsignados, userId];
      
      return {
        ...eq,
        usuariosAsignados: newUsers,
        categoriasAsignacion: {
          ...eq.categoriasAsignacion,
          [userId]: category
        }
      };
    }
    return eq;
  }));

  // Actualizar el usuario correspondiente
  setUsers(prev => prev.map(user => {
    if (user.id === userId) {
      const newEquipment = user.equiposAsignados.includes(equipmentId)
        ? user.equiposAsignados
        : [...user.equiposAsignados, equipmentId];
      
      return {
        ...user,
        equiposAsignados: newEquipment,
        categoriasTemporales: {
          ...user.categoriasTemporales,
          [equipmentId]: category
        }
      };
    }
    return user;
  }));
};


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
const [allAvailableSerials, setAllAvailableSerials] = useState([]);
const [allAvailableNombres, setAllAvailableNombres] = useState([]);
const [allAvailableMarcas, setAllAvailableMarcas] = useState([]);
const [allAvailableLugares, setAllAvailableLugares] = useState([]);
const [allAvailableTypes, setAllAvailableTypes] = useState([]);
const [allAvailableCiudades, setAllAvailableCiudades] = useState([]);
const [allAvailableModels, setAllAvailableModels] = useState([]);
const [allAvailableRams, setAllAvailableRams] = useState([]);
const [allAvailableDiscoDuros, setAllAvailableDiscoDuros] = useState([]);
const [allAvailableTarjetasGraficas, setAllAvailableTarjetasGraficas] = useState([]);
const [allAvailableWindows, setAllAvailableWindows] = useState([]);
const [allAvailableOffices, setAllAvailableOffices] = useState([]);
const [allAvailableAntivirus, setAllAvailableAntivirus] = useState([]);
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



// En el componente padre (App.js)
const handleAssignmentChange = async (userId, equipmentId, category) => {
  try {
    // 1. Verificar que el usuario existe
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.warn(`Usuario ${userId} no existe, limpiando asignación...`);
      
      // Limpiar referencia en el equipo
      await updateDoc(doc(db, 'equipment', equipmentId), {
        usuariosAsignados: arrayRemove(userId),
        [`categoriasAsignacion.${userId}`]: deleteField()
      });
      
      return;
    }

    // 2. Verificar que el equipo existe
    const equipmentRef = doc(db, 'equipment', equipmentId);
    const equipmentDoc = await getDoc(equipmentRef);
    
    if (!equipmentDoc.exists()) {
      console.warn(`Equipo ${equipmentId} no existe`);
      return;
    }

    // 3. Actualizar con batch
    const batch = writeBatch(db);

    if (category) {
      // Asignar/actualizar
      batch.update(equipmentRef, {
        usuariosAsignados: arrayUnion(userId),
        [`categoriasAsignacion.${userId}`]: category
      });

      batch.update(userRef, {
        equiposAsignados: arrayUnion(equipmentId),
        [`categoriasTemporales.${equipmentId}`]: category
      });
    } else {
      // Desasignar
      batch.update(equipmentRef, {
        usuariosAsignados: arrayRemove(userId),
        [`categoriasAsignacion.${userId}`]: deleteField()
      });

      batch.update(userRef, {
        equiposAsignados: arrayRemove(equipmentId),
        [`categoriasTemporales.${equipmentId}`]: deleteField()
      });
    }

    await batch.commit();

    // Actualizar estado local de manera optimista
    setEquipment(prev => prev.map(eq => {
      if (eq.id !== equipmentId) return eq;
      
      if (category) {
        return {
          ...eq,
          usuariosAsignados: [...new Set([...(eq.usuariosAsignados || []), userId])],
          categoriasAsignacion: {
            ...(eq.categoriasAsignacion || {}),
            [userId]: category
          }
        };
      } else {
        const { [userId]: _, ...restCategories } = eq.categoriasAsignacion || {};
        return {
          ...eq,
          usuariosAsignados: (eq.usuariosAsignados || []).filter(id => id !== userId),
          categoriasAsignacion: restCategories
        };
      }
    }));

    setUsers(prev => prev.map(u => {
      if (u.id !== userId) return u;
      
      if (category) {
        return {
          ...u,
          equiposAsignados: [...new Set([...(u.equiposAsignados || []), equipmentId])],
          categoriasTemporales: {
            ...(u.categoriasTemporales || {}),
            [equipmentId]: category
          }
        };
      } else {
        const { [equipmentId]: _, ...restCategories } = u.categoriasTemporales || {};
        return {
          ...u,
          equiposAsignados: (u.equiposAsignados || []).filter(id => id !== equipmentId),
          categoriasTemporales: restCategories
        };
      }
    }));

  } catch (error) {
    console.error("Error en cambio de asignación:", error);
    // Aquí podrías revertir los cambios en el estado local si falla
    throw error;
  }
};




// Handlers para el gesto táctil
const handleTouchStart = (e) => {
  // Solo activar si estamos cerca del borde superior
  if (window.scrollY <= 50) {
    setTouchStartY(e.touches[0].clientY);
    setTouchEndY(e.touches[0].clientY);
    setIsDragging(true);
    e.preventDefault(); // Prevenir comportamiento por defecto
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

// Función para agregar Series nuevas
const handleAddNewSerial = (newSerial) => {
  if (!allAvailableSerials.includes(newSerial)) {
    setAllAvailableSerials([...allAvailableSerials, newSerial]);
  }
};

// Función para agregar Marcas nuevas
const handleAddNewMarca = (newMarca) => {
  if (!allAvailableMarcas.includes(newMarca)) {
    setAllAvailableMarcas([...allAvailableMarcas, newMarca]);
  }
};

// Función para agregar Modelos nuevas
const handleAddNewModel = (newModel) => {
  if (!allAvailableModels.includes(newModel)) {
    setAllAvailableModels([...allAvailableModels, newModel]);
  }
};

// Función para agregar Lugares nuevos
const handleAddNewLugar = (newLugar) => {
  if (!allAvailableLugares.includes(newLugar)) {
    setAllAvailableLugares([...allAvailableLugares, newLugar]);
  }
};

// Función para agregar Tipos nuevos
const handleAddNewType = (newType) => {
  if (!allAvailableTypes.includes(newType)) {
    setAllAvailableTypes([...allAvailableTypes, newType]);
  }
};

// Función para agregar Nombres nuevos
const handleAddNewNombre = (newNombre) => {
  if (!allAvailableNombres.includes(newNombre)) {
    setAllAvailableNombres([...allAvailableNombres, newNombre]);
  }
};

// Función para agregar Ciudades nuevas
const handleAddNewCiudad = (newCiudad) => {
  if (!allAvailableCiudades.includes(newCiudad)) {
    setAllAvailableCiudades([...allAvailableCiudades, newCiudad]);
  }
};



// Función para agregar Ram nuevas
const handleAddNewRam = (newRam) => {
  if (!allAvailableRams.includes(newRam)) {
    setAllAvailableRams([...allAvailableRams, newRam]);
  }
};

// Función para agregar Disco Duro nuevas
const handleAddNewDiscoDuro = (newDiscoDuro) => {
  if (!allAvailableDiscoDuros.includes(newDiscoDuro)) {
    setAllAvailableDiscoDuros([...allAvailableDiscoDuros, newDiscoDuro]);
  }
};

// Función para agregar Tarjeta Gráfica nuevas
const handleAddNewTarjetaGrafica = (newTarjetaGrafica) => {
  if (!allAvailableTarjetasGraficas.includes(newTarjetaGrafica)) {
    setAllAvailableTarjetasGraficas([...allAvailableTarjetasGraficas, newTarjetaGrafica]);
  }
};

// Función para agregar Windows nuevas
const handleAddNewWindows = (newWindows) => {
  if (!allAvailableWindows.includes(newWindows)) {
    setAllAvailableWindows([...allAvailableWindows, newWindows]);
  }
};

// Función para agregar Office nuevas
const handleAddNewOffice = (newOffice) => {
  if (!allAvailableOffices.includes(newOffice)) {
    setAllAvailableOffices([...allAvailableOffices, newOffice]);
  }
};

// Función para agregar Antivirus nuevas
const handleAddNewAntivirus = (newAntivirus) => {
  if (!allAvailableAntivirus.includes(newAntivirus)) {
    setAllAvailableAntivirus([...allAvailableAntivirus, newAntivirus]);
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


// ==================== FUNCIONES DE MODALES ====================

// Función que cierra el modal de usuario
const closeUserModal = useCallback(() => {
  setShowUserModal(false);
  setSelectedUserId(null);
  setSelectedUser(null);
  document.body.style.overflow = ''; // Restaura el scroll
}, []);

// Función que cierra el modal de equipo
const closeModal = useCallback(() => {
  setShowEquipmentModal(false);
  setSelectedEquipmentId(null);
  setCurrentEquipmentIndex(0);
  document.body.style.overflow = ''; // Restaura el scroll
}, []);

// Función que abre el modal de usuario
const handleOpenUserModal = (userId) => {
  const user = users.find(u => u.id === userId);
  if (user) {
    setSelectedUser(user);
    setSelectedUserId(userId);
    setShowUserModal(true);
    document.body.style.overflow = 'hidden'; // Deshabilita scroll
  }
};

// Función que abre el modal de equipo
const handleOpenEquipmentModal = (equipmentId) => {
  setSelectedEquipmentId(equipmentId);
  setShowEquipmentModal(true);
  document.body.style.overflow = 'hidden'; // Deshabilita scroll
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


  const handleEditFromModal = (user) => {
  if (!user?.id) {
    console.error("Intento de editar usuario inválido:", user);
    return;
  }
  setShowUserModal(false);
  setEditingUser(user);
  setShowUserForm(true);
  scrollToView('users');
};
 

// Función para asignar equipo a usuario con categoría
const assignEquipmentToUser = async (userId, equipmentId, category = 'casa') => {
  try {
    // Actualizar el equipo
    await updateDoc(doc(db, 'equipment', equipmentId), {
      usuariosAsignados: arrayUnion(userId),
      [`categoriasAsignacion.${userId}`]: category,
      updatedAt: new Date()
    });

    // Actualizar el usuario
    await updateDoc(doc(db, 'users', userId), {
      equiposAsignados: arrayUnion(equipmentId),
      updatedAt: new Date()
    });

    // Actualizar estado local
    setEquipment(prev => prev.map(eq => 
      eq.id === equipmentId
        ? {
            ...eq,
            usuariosAsignados: [...(eq.usuariosAsignados || []), userId],
            categoriasAsignacion: {
              ...(eq.categoriasAsignacion || {}),
              [userId]: category
            }
          }
        : eq
    ));

    setUsers(prev => prev.map(u => 
      u.id === userId
        ? {
            ...u,
            equiposAsignados: [...(u.equiposAsignados || []), equipmentId]
          }
        : u
    ));
  } catch (error) {
    console.error("Error asignando equipo:", error);
    throw error;
  }
};

// Función para actualizar categoría de asignación
const updateAssignmentCategory = async (userId, equipmentId, newCategory) => {
  try {
    // Actualizar el equipo
    await updateDoc(doc(db, 'equipment', equipmentId), {
      [`categoriasAsignacion.${userId}`]: newCategory,
      updatedAt: new Date()
    });

    // Actualizar estado local
    setEquipment(prev => prev.map(eq => 
      eq.id === equipmentId
        ? {
            ...eq,
            categoriasAsignacion: {
              ...(eq.categoriasAsignacion || {}),
              [userId]: newCategory
            }
          }
        : eq
    ));
  } catch (error) {
    console.error("Error actualizando categoría:", error);
    throw error;
  }
};

// Función para desasignar equipo de usuario
const unassignEquipmentFromUser = async (userId, equipmentId) => {
  try {
    const batch = writeBatch(db);
    
    // 1. Actualizar equipo
    const equipoRef = doc(db, 'equipment', equipmentId);
    batch.update(equipoRef, {
      usuariosAsignados: arrayRemove(userId),
      [`categoriasAsignacion.${userId}`]: deleteField(),
      updatedAt: new Date()
    });

    // 2. Actualizar usuario
    const userRef = doc(db, 'users', userId);
    batch.update(userRef, {
      equiposAsignados: arrayRemove(equipmentId),
      [`categoriasTemporales.${equipmentId}`]: deleteField(),
      updatedAt: new Date()
    });

    await batch.commit();

    // 3. Actualizar estado local
    setUsers(prev => prev.map(u => 
      u.id === userId
        ? {
            ...u,
            equiposAsignados: (u.equiposAsignados || []).filter(id => id !== equipmentId),
            categoriasTemporales: Object.fromEntries(
              Object.entries(u.categoriasTemporales || {}).filter(([id]) => id !== equipmentId)
            )
          }
        : u
    ));

    setEquipment(prev => prev.map(eq => 
      eq.id === equipmentId
        ? {
            ...eq,
            usuariosAsignados: (eq.usuariosAsignados || []).filter(id => id !== userId),
            categoriasAsignacion: Object.fromEntries(
              Object.entries(eq.categoriasAsignacion || {}).filter(([id]) => id !== userId)
            )
          }
        : eq
    ));
  } catch (error) {
    console.error("Error desasignando equipo:", error);
    throw error;
  }
};


// Función modificada handleEditUser
const handleEditUser = async (userData) => {
  try {
    const userRef = doc(db, 'users', userData.id);
    
    // 1. Limpiar categorías temporales de equipos no asignados
    const cleanedCategories = Object.entries(userData.categoriasTemporales || {})
      .reduce((acc, [equipoId, categoria]) => {
        if (userData.equiposAsignados?.includes(equipoId)) {
          acc[equipoId] = categoria;
        }
        return acc;
      }, {});

    // 2. Preparar datos para actualización
    const updateData = {
      ...userData,
      equiposAsignados: userData.equiposAsignados || [],
      categoriasTemporales: cleanedCategories,
      updatedAt: new Date()
    };

    // 3. Actualizar en Firestore usando batch para atomicidad
    const batch = writeBatch(db);
    
    // Actualizar usuario
    batch.update(userRef, updateData);

    // Actualizar relaciones con equipos
    const currentUser = users.find(u => u.id === userData.id);
    const currentEquipos = currentUser?.equiposAsignados || [];
    const newEquipos = userData.equiposAsignados || [];

    // Equipos a remover
    currentEquipos.forEach(equipoId => {
      if (!newEquipos.includes(equipoId)) {
        const equipoRef = doc(db, 'equipment', equipoId);
        batch.update(equipoRef, {
          usuariosAsignados: arrayRemove(userData.id),
          [`categoriasAsignacion.${userData.id}`]: deleteField(),
          updatedAt: new Date()
        });
      }
    });

    // Equipos a añadir/actualizar
    newEquipos.forEach(equipoId => {
      const equipoRef = doc(db, 'equipment', equipoId);
      const categoria = cleanedCategories[equipoId] || 'casa';
      
      batch.update(equipoRef, {
        usuariosAsignados: arrayUnion(userData.id),
        [`categoriasAsignacion.${userData.id}`]: categoria,
        updatedAt: new Date()
      });
    });

    await batch.commit();

    // 4. Actualizar estado local
    setUsers(prev => prev.map(u => 
      u.id === userData.id ? { ...u, ...updateData } : u
    ));

    setEquipment(prev => prev.map(eq => {
      const shouldAssign = newEquipos.includes(eq.id);
      const wasAssigned = currentEquipos.includes(eq.id);
      
      if (shouldAssign && !wasAssigned) {
        return {
          ...eq,
          usuariosAsignados: [...(eq.usuariosAsignados || []), userData.id],
          categoriasAsignacion: {
            ...(eq.categoriasAsignacion || {}),
            [userData.id]: cleanedCategories[eq.id] || 'casa'
          }
        };
      } else if (!shouldAssign && wasAssigned) {
        const { [userData.id]: _, ...restCategorias } = eq.categoriasAsignacion || {};
        return {
          ...eq,
          usuariosAsignados: (eq.usuariosAsignados || []).filter(id => id !== userData.id),
          categoriasAsignacion: restCategorias
        };
      }
      return eq;
    }));

    return true;
  } catch (error) {
    console.error("Error editando usuario:", error);
    throw error;
  }
};

 // Función modificada handleAddUser
const handleAddUser = async (userData) => {
  try {
    // Crear usuario
    const docRef = await addDoc(collection(db, 'users'), {
      ...userData,
      equiposAsignados: [],
      createdAt: new Date()
    });

    // Asignar equipos si los hay
    await Promise.all(
      (userData.equiposAsignados || []).map(equipoId => 
        assignEquipmentToUser(
          docRef.id, 
          equipoId, 
          userData.categoriasTemporales?.[equipoId] || 'casa'
        )
      )
    );

  
      
  // Actualizar estado local
    const newUser = { 
      id: docRef.id, 
      ...userData,
      equiposAsignados: userData.equiposAsignados || []
    };

    setUsers([...users, newUser]);
    
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

const handleBulkAssignmentChanges = async (updates) => {
  try {
    const batch = writeBatch(db);
    
    updates.forEach(({ userId, equipmentId, category }) => {
      // Actualizar equipo
      const equipmentRef = doc(db, 'equipment', equipmentId);
      batch.update(equipmentRef, {
        usuariosAsignados: arrayUnion(userId),
        [`categoriasAsignacion.${userId}`]: category,
        updatedAt: new Date()
      });

      // Actualizar usuario
      const userRef = doc(db, 'users', userId);
      batch.update(userRef, {
        equiposAsignados: arrayUnion(equipmentId),
        [`categoriasTemporales.${equipmentId}`]: category,
        updatedAt: new Date()
      });
    });

    await batch.commit();

    // Actualizar estado local
    setEquipment(prev => prev.map(eq => {
      const update = updates.find(u => u.equipmentId === eq.id);
      if (update) {
        return {
          ...eq,
          usuariosAsignados: [...new Set([...(eq.usuariosAsignados || []), update.userId])],
          categoriasAsignacion: {
            ...eq.categoriasAsignacion,
            [update.userId]: update.category
          }
        };
      }
      return eq;
    }));

    setUsers(prev => prev.map(user => {
      const update = updates.find(u => u.userId === user.id);
      if (update) {
        return {
          ...user,
          equiposAsignados: [...new Set([...(user.equiposAsignados || []), update.equipmentId])],
          categoriasTemporales: {
            ...user.categoriasTemporales,
            [update.equipmentId]: update.category
          }
        };
      }
      return user;
    }));

  } catch (error) {
    console.error("Error en actualizaciones masivas:", error);
  }
};




const handleAssignEquipment = async (userId, equipmentIds) => {
  try {
    await Promise.all(
      equipmentIds.map(equipmentId => 
        assignEquipmentToUser(userId, equipmentId, 'casa') // Asignar con categoría por defecto
      )
    );
    
    // Actualizar estado local
    setUsers(prevUsers => prevUsers.map(u => 
      u.id === userId
        ? {
            ...u,
            equiposAsignados: [...u.equiposAsignados, ...equipmentIds],
            categoriasTemporales: {
              ...u.categoriasTemporales,
              ...equipmentIds.reduce((acc, id) => ({ ...acc, [id]: 'casa' }), {})
            }
          }
        : u
    ));
  } catch (error) {
    console.error("Error asignando equipos:", error);
  }
};

const handleUnassignEquipment = async (userId, equipmentId) => {
  try {
    await unassignEquipmentFromUser(userId, equipmentId);
    
    // Actualizar estado local
    setUsers(prevUsers => prevUsers.map(u => 
      u.id === userId
        ? {
            ...u,
            equiposAsignados: u.equiposAsignados.filter(id => id !== equipmentId),
            categoriasTemporales: Object.fromEntries(
              Object.entries(u.categoriasTemporales).filter(([id]) => id !== equipmentId)
            )
          }
        : u
    ));
  } catch (error) {
    console.error("Error desasignando equipo:", error);
  }
};




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
  setAvailableProcessors([
    "QuadCore Intel Core i5-2400, 3200 MHz",
    "DualCore AMD Athlon X2 3250e 1500 Mhz"
  ]);
  const fetchData = async () => {
    try {
      const [usersSnapshot, equipmentSnapshot, departmentsSnapshot] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'equipment')),
        getDocs(collection(db, 'departments'))
      ]);

      console.log("Datos recibidos de Firebase:", {
        users: usersSnapshot.docs.length,
        equipment: equipmentSnapshot.docs.length,
        departments: departmentsSnapshot.docs.length
      });


      // Procesar usuarios
      const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Procesar equipos con limpieza de referencias
      const equipmentData = equipmentSnapshot.docs.map(doc => {
        const data = doc.data();

        
        
        // Limpiar usuarios asignados que no existen
        const usuariosAsignados = Array.isArray(data.usuariosAsignados) 
          ? data.usuariosAsignados.filter(userId => 
              usersData.some(u => u.id === userId))
          : [];
          
        // Limpiar categoriasAsignacion
        const categoriasAsignacion = data.categoriasAsignacion 
          ? Object.fromEntries(
              Object.entries(data.categoriasAsignacion).filter(
                ([userId]) => usersData.some(u => u.id === userId)
              )
            )
          : {};

         
          
        // Si hubo cambios, actualizar en Firestore (opcional)
        const needsUpdate = 
          JSON.stringify(usuariosAsignados) !== JSON.stringify(data.usuariosAsignados) ||
          JSON.stringify(categoriasAsignacion) !== JSON.stringify(data.categoriasAsignacion || {});
          
        if (needsUpdate) {
          console.log(`Limpiando referencias inválidas en equipo ${doc.id}`);
          // Actualizar en Firestore solo si es necesario
          updateDoc(doc.ref, {
            usuariosAsignados,
            categoriasAsignacion
          });
        }
        
        return { 
          id: doc.id, 
          ...data,
          usuariosAsignados,
          categoriasAsignacion
        };
      });



        const allProcessors = equipmentData
        .map(equip => equip.procesador)
        .filter(procesador => procesador && typeof procesador === 'string' && procesador.trim() !== '');

        // Eliminar duplicados y ordenar
      const uniqueProcessors = [...new Set(allProcessors)].sort();
      console.log("Procesadores cargados desde Firebase:", uniqueProcessors);
      setAvailableProcessors(uniqueProcessors);

       const allCorreos = [
  ...usersData.map(user => user.correo),
  ...equipmentData.map(equip => equip.correo)
].filter(correo => correo && typeof correo === 'string' && correo.trim() !== '');

const uniqueCorreos = [...new Set(allCorreos)].sort();
console.log("Correos cargados desde Firebase:", uniqueCorreos);
setAvailableCorreos(uniqueCorreos);
        


      // Procesar departamentos
      const departmentsData = departmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Actualizar estados
      setUsers(usersData);
      setEquipment(equipmentData);
      setDepartments(departmentsData);

      // Extraer todas las IPs únicas de los equipos (usando datos ya limpiados)
        const allIps = equipmentData.reduce((acc, equip) => {
        const equipIps = Array.isArray(equip.IpEquipo) ? equip.IpEquipo : [];
        return [...acc, ...equipIps];
      }, ['192.168.1.1', '192.168.1.2', '10.0.0.1']);

      setAllAvailableIps([...new Set(allIps.filter(ip => ip))]);

      // Extraer todos los números de serie únicos de los equipos
      const allSerials = equipmentData
        .map(equip => equip.serialNumber)
        .filter(serial => serial);

      setAllAvailableSerials([...new Set(allSerials)]);

      // Extraer todas las Nombres únicas de los equipos
      const allNombres = equipmentData
        .map(equip => equip.nombre)
        .filter(nombre => nombre);

      setAllAvailableNombres([...new Set(allNombres)]);

       // Extraer todos los números de serie únicos de los equipos
      const allMarcas = equipmentData
        .map(equip => equip.marca)
        .filter(marca => marca);

      setAllAvailableMarcas([...new Set(allMarcas)]);

        // Extraer todos los modelos únicos de los equipos
      const allModels = equipmentData
        .map(equip => equip.model)
        .filter(model => model);

      setAllAvailableModels([...new Set(allModels)]);

      // Extraer todos los lugares únicos de los equipos
      const allLugares = equipmentData
        .map(equip => equip.lugar)
        .filter(lugar => lugar);

      setAllAvailableLugares([...new Set(allLugares)]);

      // Extraer todos los tipos únicos de los equipos
      const allTypes = equipmentData
        .map(equip => equip.type)
        .filter(type => type);

      setAllAvailableTypes([...new Set(allTypes)]);

      // Extraer todas las ciudades únicas de los equipos
      const allCiudades = equipmentData
        .map(equip => equip.ciudad)
        .filter(ciudad => ciudad);

      setAllAvailableCiudades([...new Set(allCiudades)]);

     

       // Extraer todos los números de serie únicos de los equipos
      const allRams = equipmentData
        .map(equip => equip.ram)
        .filter(ram => ram);

      setAllAvailableRams([...new Set(allRams)]);

      // Extraer todos los números de serie únicos de los equipos
      const allDiscoDuros = equipmentData
        .map(equip => equip.discoDuro)
        .filter(discoDuro => discoDuro);

      setAllAvailableDiscoDuros([...new Set(allDiscoDuros)]);

      // Extraer todas las tarjetas gráficas únicas de los equipos
      const allTarjetasGraficas = equipmentData
        .map(equip => equip.tarjetaGrafica)
        .filter(tarjetaGrafica => tarjetaGrafica);

      setAllAvailableTarjetasGraficas([...new Set(allTarjetasGraficas)]);

      // Extraer todos los sistemas operativos únicos de los equipos
      const allWindows = equipmentData
        .map(equip => equip.windows)
        .filter(windows => windows);

      setAllAvailableWindows([...new Set(allWindows)]);

      // Extraer todos los antivirus únicos de los equipos
      const allAntivirus = equipmentData
        .map(equip => equip.antivirus)
        .filter(antivirus => antivirus);

      setAllAvailableAntivirus([...new Set(allAntivirus)]);

      // Extraer todas las versiones de Office únicas de los equipos
      const allOffices = equipmentData
        .map(equip => equip.office)
        .filter(office => office);

      setAllAvailableOffices([...new Set(allOffices)]);


      // Actualizar contadores con datos limpios
      setCounters({
        totalUsers: usersData.length,
        activeUsers: usersData.filter(u => u.estado === 'Activo').length,
        MercurioAntofagastaUsers: usersData.filter(u => u.department === 'Mercurio Antofagasta').length,
        totalEquipment: equipmentData.length,
        availableEquipment: equipmentData.filter(e => 
          !e.usuariosAsignados || e.usuariosAsignados.length === 0).length,
        assignedEquipment: equipmentData.filter(e => 
          e.usuariosAsignados && e.usuariosAsignados.length > 0).length
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      console.log("Después de añadir:", availableProcessors);
    } finally {
      setLoading(false);
    }
  };
  
console.log("Procesadores actuales:", availableProcessors);
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
          {/* Solo mostrar en desarrollo o para usuarios admin */}
      <div className="admin-tools">
          {(process.env.NODE_ENV === 'development' || userIsAdmin) && (
            <ResetDataPanel 
            onResetComplete={() => {
    // Actualizar el estado local
    setUsers(prev => prev.map(u => ({
      ...u,
      equiposAsignados: [],
      categoriasTemporales: {}
    })));
    
    setEquipment(prev => prev.map(e => ({
      ...e,
      usuariosAsignados: [],
      categoriasAsignacion: {}
    })));
  }}/>
          )}
        </div>
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
  onSave={async (userData) => {
    try {
      const newUser = await handleAddUser(userData);
      setShowUserForm(false);
      return newUser;
    } catch (error) {
      console.error("Error al agregar usuario:", error);
      throw error;
    }
  }}
  onCancel={() => setShowUserForm(false)}
  equipment={equipment}
  availableCorreos={availableCorreos}
  
  onRemoveCorreo={handleRemoveCorreo}           
  setAvailableCorreos={setAvailableCorreos}
  
  availableDepartments={departments}
  onAddDepartment={handleAddDepartment}
  onAssignmentChange={(equipmentId, category) => {
    // Implementar lógica para asignación individual
    // Puedes usar handleAssignmentChange adaptado
  }}
  onBulkAssignmentChange={(updates) => {
    // Implementar lógica para asignación masiva
    // Puedes usar handleBulkAssignmentChanges adaptado
  }}
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
  parentAvailableIps={allAvailableIps || []} // Asegurar que siempre es array
  onAddNewIp={handleAddNewIp}
  parentAvailableSerials={allAvailableSerials || []} // Asegurar que siempre es array
  onAddNewSerial={handleAddNewSerial}
  parentAvailableMarcas={allAvailableMarcas || []} // Asegurar que siempre es array
  onAddNewMarca={handleAddNewMarca}
  parentAvailableLugares={allAvailableLugares || []} // Asegurar que siempre es array
  onAddNewLugar={handleAddNewLugar}
  parentAvailableTypes={allAvailableTypes || []} // Asegurar que siempre es array
  onAddNewType={handleAddNewType}
  parentAvailableNombres={allAvailableNombres || []} // Asegurar que siempre es array
  onAddNewNombre={handleAddNewNombre}
  parentAvailableCiudades={allAvailableCiudades || []} // Asegurar que siempre es array
  onAddNewCiudad={handleAddNewCiudad}
  parentAvailableModels={allAvailableModels || []} // Asegurar que siempre es array
  onAddNewModel={handleAddNewModel}
  parentAvailableRams={allAvailableRams || []} // Asegurar que siempre es array
  onAddNewRam={handleAddNewRam}
  parentAvailableDiscoDuros={allAvailableDiscoDuros || []} // Asegurar que siempre es array
  onAddNewDiscoDuro={handleAddNewDiscoDuro}
  parentAvailableTarjetasGraficas={allAvailableTarjetasGraficas || []} // Asegurar que siempre es array
  onAddNewTarjetaGrafica={handleAddNewTarjetaGrafica}
  parentAvailableWindows={allAvailableWindows || []} // Asegurar que siempre es array
  onAddNewWindows={handleAddNewWindows}
  parentAvailableAntivirus={allAvailableAntivirus || []} // Asegurar que siempre es array
  onAddNewAntivirus={handleAddNewAntivirus}
  parentAvailableOffices={allAvailableOffices || []} // Asegurar que siempre es array
  onAddNewOffice={handleAddNewOffice}
  
  availableProcessors={availableProcessors}
  onAddProcessor={handleAddProcessor}
  onRemoveProcessor={handleRemoveProcessor}           
  setAvailableProcessors={setAvailableProcessors}
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
              onOpenUserModal={handleOpenUserModal}
            />
          </div>
        </div>
      </div>

          {showUserModal && selectedUserId && (
           
           <div className="user-management-container">
    <UserDetailsModal 
      user={users.find(u => u.id === selectedUserId) || {}}
      users={users}
      equipment={equipment}
      availableDepartments={departments}
      onClose={closeUserModal}
      onEdit={handleEditUser} // Usamos handleEditUser directamente
      onNext={handleNextUser}
      onPrev={handlePrevUser}
      onOpenEquipmentModal={handleOpenEquipmentModal}
      availableCorreos={availableCorreos}
      setAvailableCorreos={setAvailableCorreos}
    />
  </div>
    
    
   
  
          )}

          {showEquipmentModal && selectedEquipmentId && (
            <EquipDetailsModal 
              onAssignmentChange={handleAssignmentChange}
              onBulkAssignmentChange={handleBulkAssignmentChanges}
              equipment={equipment.find(e => e.id === selectedEquipmentId)}
              onEdit={handleEditEquipment}
              onClose={closeModal}
              users={users}
              currentIndex={currentEquipmentIndex}
              totalEquipment={equipment.length}
              onNext={handleNextEquipment}  
              onPrev={handlePrevEquipment} 
              onOpenUserModal={handleOpenUserModal} 
              availableIps={allAvailableIps}
              onAddNewIp={handleAddNewIp}
              availableSerials={allAvailableSerials}
              onAddNewSerial={handleAddNewSerial}
              availableMarcas={allAvailableMarcas}
              onAddNewMarca={handleAddNewMarca}
              availableLugares={allAvailableLugares}
              onAddNewLugar={handleAddNewLugar}
              availableTypes={allAvailableTypes}
              onAddNewType={handleAddNewType}
              availableNombres={allAvailableNombres}
              onAddNewNombre={handleAddNewNombre}
              availableCiudades={allAvailableCiudades}
              onAddNewCiudad={handleAddNewCiudad}
              availableModels={allAvailableModels}
              onAddNewModel={handleAddNewModel}
              onAddProcessor={handleAddProcessor}
              onRemoveProcessor={handleRemoveProcessor}
              availableProcessors={availableProcessors}
              setAvailableProcessors={setAvailableProcessors}
              availableRams={allAvailableRams}
              onAddNewRam={handleAddNewRam}
              availableDiscoDuros={allAvailableDiscoDuros}
              onAddNewDiscoDuro={handleAddNewDiscoDuro}
              availableTarjetasGraficas={allAvailableTarjetasGraficas}
              onAddNewTarjetaGrafica={handleAddNewTarjetaGrafica}
              availableWindows={allAvailableWindows}
              onAddNewWindows={handleAddNewWindows}
              availableAntivirus={allAvailableAntivirus}
              onAddNewAntivirus={handleAddNewAntivirus}
              availableOffices={allAvailableOffices}
              onAddNewOffice={handleAddNewOffice}
            />
          )}
        
      </div> {/* Cierra div.app */}
    </div>  {/* Cierra div.app-container */}
  </div> 
  );
}

export default App;