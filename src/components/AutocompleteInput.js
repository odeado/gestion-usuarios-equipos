import React, { useState, useEffect } from 'react';
import './AutocompleteInput.css';

const AutocompleteInput = ({
  value,
  onChange,
  options = [],
  onAddNewOption,
  placeholder = '',
  label = '',
  error = null
}) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState([]);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(e); // Propagar el cambio al formulario
    
    // Filtrar opciones
    if (newValue.length > 0) {
      const filtered = options.filter(option =>
        option.toLowerCase().includes(newValue.toLowerCase())
      );
      setFilteredOptions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    setInputValue(suggestion);
    onChange({ target: { value: suggestion } });
    setShowSuggestions(false);
  };

  const handleAddNew = () => {
    if (inputValue && !options.includes(inputValue)) {
      onAddNewOption(inputValue);
    }
    setShowSuggestions(false);
  };

  const handleBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div className="autocomplete-container">
      {label && <label className="form-label">{label}</label>}
      <div className="autocomplete-input-container">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`form-input ${error ? 'input-error' : ''}`}
        />
        {showSuggestions && (filteredOptions.length > 0 || inputValue) && (
          <div className="suggestions-dropdown">
            {filteredOptions.map((option, index) => (
              <div
                key={index}
                className="suggestion-item"
                onClick={() => handleSelectSuggestion(option)}
              >
                {option}
              </div>
            ))}
            {inputValue && !options.includes(inputValue) && (
              <div className="suggestion-item new-item" onClick={handleAddNew}>
                <span>Crear nuevo: "{inputValue}"</span>
              </div>
            )}
          </div>
        )}
      </div>
      {error && <div className="error-text">{error}</div>}
    </div>
  );
};

export default AutocompleteInput;