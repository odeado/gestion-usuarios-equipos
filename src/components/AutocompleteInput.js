// AutocompleteInput.js
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';

const AutocompleteInput = ({
  value,
  onChange,
  options,
  onAddNewOption,
  placeholder,
  label,
  error,
  isMulti = false
}) => {
  const [inputValue, setInputValue] = useState('');
  const [localOptions, setLocalOptions] = useState(options);

  useEffect(() => {
    setLocalOptions(options);
  }, [options]);

  const handleChange = (selectedOption) => {
    if (isMulti) {
      onChange(selectedOption ? selectedOption.map(o => o.value) : []);
    } else {
      onChange(selectedOption?.value || '');
    }
  };

  const handleCreate = (inputValue) => {
    const newOption = { value: inputValue, label: inputValue };
    setLocalOptions(prev => [...prev, newOption]);
    onAddNewOption(inputValue);
    if (isMulti) {
      onChange([...value, inputValue]);
    } else {
      onChange(inputValue);
    }
  };

  const getValue = () => {
    if (isMulti) {
      return localOptions.filter(option => value.includes(option.value));
    }
    return localOptions.find(option => option.value === value);
  };

  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <CreatableSelect
        isClearable
        isMulti={isMulti}
        options={localOptions}
        value={getValue()}
        onChange={handleChange}
        onCreateOption={handleCreate}
        onInputChange={setInputValue}
        inputValue={inputValue}
        placeholder={placeholder}
        noOptionsMessage={() => "No hay opciones. Escribe para crear una nueva."}
      />
      {error && <div className="error-text">{error}</div>}
    </div>
  );
};

export default AutocompleteInput;