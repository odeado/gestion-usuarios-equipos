import React, { useState } from 'react';
import { 
  collection, 
  query, 
  getDocs, 
  writeBatch, 
  doc 
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import './ResetDataPanel.css';

const ResetDataPanel = ({ onResetComplete }) => {
  const currentUser = {
    email: 'admin@tuempresa.com' // Cambia esto según necesites
  };
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(0); // 0: inactivo, 1: confirmación, 2: en progreso, 3: completado
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const handleResetData = async () => {
    if (step === 0) {
      setStep(1); // Mostrar confirmación
      return;
    }

    if (!currentUser || !currentUser.email.endsWith('@tuempresa.com')) {
      setError('Solo administradores pueden realizar esta acción');
      return;
    }

    setIsLoading(true);
    setStep(2);
    setError(null);

    try {
      // Obtener todos los usuarios y equipos
      const [usersSnapshot, equipmentSnapshot] = await Promise.all([
        getDocs(query(collection(db, 'users'))),
        getDocs(query(collection(db, 'equipment')))
      ]);

      const batch = writeBatch(db);
      let processed = 0;
      const totalDocs = usersSnapshot.size + equipmentSnapshot.size;

      // Resetear usuarios
      usersSnapshot.forEach(userDoc => {
        batch.update(doc(db, 'users', userDoc.id), {
          equiposAsignados: [],
          categoriasTemporales: {}
        });
        processed++;
        setProgress(Math.round((processed / totalDocs) * 100));
      });

      // Resetear equipos
      equipmentSnapshot.forEach(equipDoc => {
        batch.update(doc(db, 'equipment', equipDoc.id), {
          usuariosAsignados: [],
          categoriasAsignacion: {}
        });
        processed++;
        setProgress(Math.round((processed / totalDocs) * 100));
      });

      await batch.commit();

      if (onResetComplete) {
        onResetComplete();
      }
      
      setStep(3);
    } catch (err) {
      console.error("Error reseteando datos:", err);
      setError(`Error: ${err.message}`);
      setStep(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setStep(0);
    setError(null);
  };

  if (step === 0) {
    return (
      <div className="reset-panel">
        <button 
          onClick={handleResetData}
          className="reset-button"
          disabled={isLoading}
        >
          Resetear Asignaciones
        </button>
      </div>
    );
  }

  return (
    <div className="reset-panel active">
      {step === 1 && (
        <div className="confirmation-dialog">
          <h3>Confirmar Reseteo</h3>
          <p>¿Estás seguro que deseas resetear todas las asignaciones entre usuarios y equipos?</p>
          <p className="warning-text">Esta acción no se puede deshacer.</p>
          
          <div className="button-group">
            <button 
              onClick={handleCancel}
              className="cancel-button"
            >
              Cancelar
            </button>
            <button 
              onClick={handleResetData}
              className="confirm-button"
              disabled={isLoading}
            >
              Confirmar Reseteo
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="progress-container">
          <h3>Reseteando Datos...</h3>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p>{progress}% completado</p>
        </div>
      )}

      {step === 3 && (
        <div className="completion-message">
          <h3>¡Reseteo Completo!</h3>
          <p>Todas las asignaciones han sido eliminadas.</p>
          <button 
            onClick={handleCancel}
            className="done-button"
          >
            Aceptar
          </button>
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button 
            onClick={handleCancel}
            className="error-button"
          >
            Entendido
          </button>
        </div>
      )}
    </div>
  );
};

export default ResetDataPanel;