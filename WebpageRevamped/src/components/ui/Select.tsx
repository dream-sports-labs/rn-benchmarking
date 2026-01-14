import React, { useState, useRef, useEffect } from 'react';
import './Select.css';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  label?: string;
  multiple?: boolean;
  maxSelections?: number;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  label,
  multiple = false,
  maxSelections,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (optionValue: string) => {
    if (multiple) {
      if (value.includes(optionValue)) {
        onChange(value.filter(v => v !== optionValue));
      } else {
        if (maxSelections && value.length >= maxSelections) {
          return;
        }
        onChange([...value, optionValue]);
      }
    } else {
      onChange([optionValue]);
      setIsOpen(false);
    }
  };

  const displayValue = value.length > 0 
    ? value.map(v => options.find(o => o.value === v)?.label).join(', ')
    : placeholder;

  return (
    <div className={`ui-select ${className}`} ref={containerRef}>
      {label && <label className="ui-select__label">{label}</label>}
      <button
        type="button"
        className={`ui-select__trigger ${isOpen ? 'ui-select__trigger--open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`ui-select__value ${value.length === 0 ? 'ui-select__value--placeholder' : ''}`}>
          {displayValue}
        </span>
        <span className="ui-select__icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>
      
      {isOpen && (
        <div className="ui-select__dropdown">
          <div className="ui-select__options">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`ui-select__option ${value.includes(option.value) ? 'ui-select__option--selected' : ''}`}
                onClick={() => handleToggle(option.value)}
              >
                {multiple && (
                  <span className="ui-select__checkbox">
                    {value.includes(option.value) && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </span>
                )}
                <span className="ui-select__option-label">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Select;

