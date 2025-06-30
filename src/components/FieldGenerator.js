import React from 'react';
import AutocompleteInput from './AutocompleteInput';

const FieldGenerator = ({
  fieldName,
  value,
  onChange,
  options,
  onAddOption,
  onRemoveOption,
  placeholder,
  label,
  error,
  enableDelete = true,
  uniqueId
}) => {
  return (
    <AutocompleteInput
      key={`${fieldName}-${uniqueId}-${options.length}`}
      value={value || ''}
      onChange={onChange}
      options={options.map(opt => ({ value: opt, label: opt }))}
      onAddNewOption={(newOption) => {
        if (!options.includes(newOption)) {
          onAddOption(newOption);
        }
        onChange(newOption);
      }}
      onRemoveOption={(optionToRemove) => {
        onRemoveOption(optionToRemove);
        if (value === optionToRemove) {
          onChange('');
        }
      }}
      placeholder={placeholder}
      label={label}
      error={error}
      enableDelete={enableDelete}
    />
  );
};

export default FieldGenerator;