// AutocompleteInput.js
import React, { useState, useEffect } from 'react';
import CreatableSelect from 'react-select/creatable';
import './AutocompleteInput.css';

const AutocompleteInput = ({
  value,
  onChange,
  options,
  onAddNewOption,
  onRemoveOption,
  placeholder,
  label,
  error,
  isMulti = false,
  enableDelete = false
}) => {
  const [localOptions, setLocalOptions] = useState(options);

  useEffect(() => {
     if (JSON.stringify(options) !== JSON.stringify(localOptions)) {
    setLocalOptions(options);
     console.log("Opciones locales:", localOptions);
  console.log("Valor actual:", value);
     }
     
  }, [options]);

  const handleChange = (selectedOption) => {
    if (isMulti) {
      onChange(selectedOption ? selectedOption.map(o => o.value) : []);
    } else {
      onChange(selectedOption?.value || '');
    }
  };

  const handleCreate = (inputValue) => {
   const newOption = inputValue.trim();
    console.log("Creando:", newOption); // 🕵️‍♂️


 // Optimistic UI update
  const newOptions = [...localOptions, { value: newOption, label: newOption }];
  setLocalOptions(newOptions);

       // Notificar al padre
  onAddNewOption?.(newOption);
  onChange(newOption); // Esto debería mantener el valor seleccionado
  
  // Forzar re-render si es necesario
  if (!options.some(opt => opt.value === newOption)) {
    setLocalOptions(newOptions);
  }
  };

  const handleRemove = (optionValue) => {
    console.log("Eliminando:", optionValue); // 🕵️‍♂️
    // Actualizar opciones locales
  setLocalOptions(prev => prev.filter(opt => opt.value !== optionValue));
  // El padre recibe el string directamente
  onRemoveOption?.(optionValue);
  
  // Limpiamos el valor si coincide
  if (!isMulti && value === optionValue) {
    onChange('');
  }
};

  const getValue = () => {
    if (!value) return null;
    
    if (isMulti) {
      return Array.isArray(value) 
        ? localOptions.filter(option => value.includes(option.value))
        : [];
    }
   return localOptions.find(option => 
    String(option.value) === String(value) // Comparación segura
  ) || null;
  };

  // Componente para valores múltiples con botón de eliminar
  const CustomMultiValue = ({ data, removeProps }) => {
    return (
      <div className="multi-value-container">
        <span>{data.label}</span>
        {enableDelete && (
          <button 
            className="delete-option-btn" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleRemove(data.value);
            }}
          >
            ×
          </button>
        )}
      </div>
    );
  };

  // Componente para valor único con botón de eliminar
  const CustomSingleValue = ({ data }) => {
    return (
      <div className="single-value-container">
        <span>{data.label}</span>
        {enableDelete && value && (
          <button 
            className="delete-option-btn" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleRemove(data.value);
            }}
          >
            ×
          </button>
        )}
      </div>
    );
  };

  return (
    <div className={`autocomplete-container ${error ? 'has-error' : ''}`}>
      {label && <label className="autocomplete-label">{label}</label>}
      <CreatableSelect
        isClearable
        isMulti={isMulti}
        options={localOptions}
        value={getValue()}
        onChange={handleChange}
        onCreateOption={handleCreate}
        placeholder={placeholder}
        className="autocomplete-select"
        classNamePrefix="autocomplete"
        noOptionsMessage={() => "No hay opciones. Escribe para crear una nueva."}
        formatCreateLabel={(inputValue) => `Crear "${inputValue}"`}
        components={{
          ...(isMulti ? { MultiValue: CustomMultiValue } : { SingleValue: CustomSingleValue })
        }}
      />
      {error && <div className="autocomplete-error">{error}</div>}
    </div>
  );
};

export default AutocompleteInput;