import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Listbox } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon, PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import debounce from 'lodash/debounce';

const VARIANT_CLASSES: Record<string, string> = {
  primary: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
  secondary: 'border-gray-200 focus:border-gray-400 focus:ring-gray-400',
  danger: 'border-red-500 focus:border-red-700 focus:ring-red-500',
};

const SIZE_CLASSES: Record<string, string> = {
  xs: 'text-xs py-1 px-2',
  sm: 'text-sm py-1.5 px-3',
  md: 'text-base py-2 px-4',
  lg: 'text-lg py-2.5 px-5',
  xl: 'text-xl py-3 px-6',
};

export type SelectOption = {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
  group?: string;
  [key: string]: unknown;
};

export type SelectGroup = {
  label: string;
  options: SelectOption[];
};

export type SelectProps = {
  options: SelectOption[] | SelectGroup[];
  value?: string | string[];
  onChange?: (value: string | string[], option: SelectOption | SelectOption[] | null) => void;
  multiple?: boolean;
  loading?: boolean;
  error?: string;
  warning?: string;
  success?: string;
  placeholder?: string;
  searchable?: boolean;
  creatable?: boolean;
  onCreateOption?: (input: string) => void;
  asyncLoadOptions?: (input: string) => Promise<SelectOption[] | SelectGroup[]>;
  debounceMs?: number;
  optionTemplate?: (option: SelectOption, selected: boolean) => React.ReactNode;
  size?: keyof typeof SIZE_CLASSES;
  variant?: keyof typeof VARIANT_CLASSES;
  className?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
  label?: string;
  required?: boolean;
  maxVisibleOptions?: number;
  errorMessage?: string;
};

function flattenOptions(options: SelectOption[] | SelectGroup[]): SelectOption[] {
  if (!options.length) return [];
  if ('options' in options[0]) {
    // Grouped
    return (options as SelectGroup[]).flatMap(g => g.options);
  }
  return options as SelectOption[];
}

export const Select: React.FC<SelectProps> = ({
  options: rawOptions,
  value,
  onChange,
  multiple = false,
  loading = false,
  error,
  warning,
  success,
  placeholder = 'Select...',
  searchable = true,
  creatable = false,
  onCreateOption,
  asyncLoadOptions,
  debounceMs = 300,
  optionTemplate,
  size = 'md',
  variant = 'primary',
  className = '',
  disabled = false,
  id,
  name,
  label,
  required = false,
  maxVisibleOptions = 8,
  errorMessage = 'Failed to load options',
}) => {
  const [inputValue, setInputValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<SelectOption[] | SelectGroup[]>(rawOptions);
  const [asyncError, setAsyncError] = useState<string | null>(null);
  const [asyncLoading, setAsyncLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search/filter
  const debouncedFilter = useCallback(
    debounce(async (val: string) => {
      if (asyncLoadOptions) {
        setAsyncLoading(true);
        setAsyncError(null);
        try {
          const loaded = await asyncLoadOptions(val);
          setFilteredOptions(loaded);
        } catch (e) {
          setAsyncError(errorMessage);
        } finally {
          setAsyncLoading(false);
        }
      } else {
        let opts = flattenOptions(rawOptions);
        if (val) {
          opts = opts.filter(opt =>
            String(opt.label).toLowerCase().includes(val.toLowerCase())
          );
        }
        setFilteredOptions(opts);
      }
    }, debounceMs),
    [rawOptions, asyncLoadOptions, debounceMs, errorMessage]
  );

  useEffect(() => {
    if (searchable) {
      debouncedFilter(inputValue);
    } else {
      setFilteredOptions(rawOptions);
    }
  }, [inputValue, rawOptions, debouncedFilter, searchable]);

  // Handle option select
  const handleSelect = (option: SelectOption) => {
    if (option.disabled) return;
    if (multiple) {
      const current = Array.isArray(value) ? value : [];
      const exists = current.includes(option.value);
      const newValue = exists
        ? current.filter(v => v !== option.value)
        : [...current, option.value];
      onChange?.(newValue, flattenOptions(rawOptions).filter(o => newValue.includes(o.value)));
    } else {
      onChange?.(option.value, option);
      setShowDropdown(false);
    }
  };

  // Handle create option
  const handleCreate = () => {
    if (onCreateOption && inputValue) {
      onCreateOption(inputValue);
      setInputValue('');
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;
    const flat = flattenOptions(filteredOptions);
    if (e.key === 'ArrowDown') {
      setHighlightedIndex(i => Math.min(i + 1, flat.length - 1));
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      setHighlightedIndex(i => Math.max(i - 1, 0));
      e.preventDefault();
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < flat.length) {
        handleSelect(flat[highlightedIndex]);
      } else if (creatable && inputValue) {
        handleCreate();
      }
      e.preventDefault();
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      e.preventDefault();
    }
  };

  // Virtual scroll (simple)
  const visibleOptions = (() => {
    const flat = flattenOptions(filteredOptions);
    if (flat.length <= maxVisibleOptions) return flat;
    if (highlightedIndex < 0) return flat.slice(0, maxVisibleOptions);
    const start = Math.max(0, highlightedIndex - Math.floor(maxVisibleOptions / 2));
    return flat.slice(start, start + maxVisibleOptions);
  })();

  // Value display
  const selectedOptions = flattenOptions(rawOptions).filter(opt =>
    multiple
      ? Array.isArray(value) && value.includes(opt.value)
      : value === opt.value
  );

  // Accessibility: ARIA live region for state changes
  const [ariaMessage, setAriaMessage] = useState('');
  useEffect(() => {
    if (loading || asyncLoading) setAriaMessage('Loading options');
    else if (asyncError) setAriaMessage('Failed to load options');
    else if (!filteredOptions.length) setAriaMessage('No options');
    else setAriaMessage('Options available');
  }, [loading, asyncLoading, asyncError, filteredOptions]);

  return (
    <div className={`flex flex-col gap-1 ${className}`}> 
      {label && (
        <label htmlFor={id} className="font-medium text-sm mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <Listbox
        value={multiple ? selectedOptions : selectedOptions[0] || null}
        onChange={opt => {
          if (multiple) {
            const arr = Array.isArray(opt) ? opt : [opt];
            onChange?.(arr.map(o => o.value), arr);
          } else {
            onChange?.(opt && !Array.isArray(opt) ? opt.value : '', opt && !Array.isArray(opt) ? opt : null);
          }
        }}
        multiple={multiple}
        disabled={disabled}
        by="value"
      >
        {() => (
          <div
            className={`flex items-center border rounded cursor-pointer bg-white ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => setShowDropdown(!showDropdown)}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            aria-haspopup="listbox"
            aria-expanded={showDropdown}
            aria-disabled={disabled}
            id={id}
          >
            <div className="flex-1 truncate">
              {selectedOptions.length === 0 ? (
                <span className="text-gray-400">{placeholder}</span>
              ) : multiple ? (
                selectedOptions.map(opt => (
                  <span key={opt.value} className="inline-block bg-blue-100 text-blue-800 rounded px-2 py-0.5 mr-1 text-xs">{opt.label}</span>
                ))
              ) : (
                <span>{selectedOptions[0]?.label}</span>
              )}
            </div>
            {searchable && (
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                className="border-none outline-none bg-transparent flex-1 min-w-0 px-1"
                placeholder={selectedOptions.length === 0 ? placeholder : ''}
                disabled={disabled}
                aria-label="Search options"
                onFocus={() => setShowDropdown(true)}
                name={name}
              />
            )}
            {creatable && inputValue && !flattenOptions(filteredOptions).some(opt => String(opt.label).toLowerCase() === inputValue.toLowerCase()) && (
              <button type="button" className="ml-2 text-blue-600 hover:underline flex items-center" onClick={handleCreate} tabIndex={-1}>
                <PlusIcon className="h-4 w-4 mr-1" /> Create "{inputValue}"
              </button>
            )}
            {loading || asyncLoading ? (
              <ArrowPathIcon className="h-5 w-5 animate-spin ml-2 text-gray-400" />
            ) : (
              <ChevronUpDownIcon className="h-5 w-5 ml-2 text-gray-400" />
            )}
          </div>
        )}
        <Listbox.Options static className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
          {/* Render grouped or flat options inline */}
          {Array.isArray(filteredOptions) && filteredOptions.length > 0 && 'options' in filteredOptions[0] ? (
            (filteredOptions as SelectGroup[]).map((group, gi) => (
              <div key={gi} className="py-1">
                <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase">{group.label}</div>
                {group.options.map(option => (
                  <Listbox.Option
                    key={option.value}
                    value={option}
                    disabled={option.disabled}
                    className={({ active }) =>
                      `cursor-pointer select-none relative px-4 py-2 ${active ? 'bg-blue-100' : ''} ${option.disabled ? 'opacity-50' : ''}`
                    }
                  >
                    {({ selected }) => (
                      <div className={`flex items-center gap-2 ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        {optionTemplate ? optionTemplate(option, selected) : <span>{option.label}</span>}
                        {selected && <CheckIcon className="h-4 w-4 text-blue-600 ml-auto" />}
                      </div>
                    )}
                  </Listbox.Option>
                ))}
              </div>
            ))
          ) : (
            flattenOptions(filteredOptions).map(option => (
              <Listbox.Option
                key={option.value}
                value={option}
                disabled={option.disabled}
                className={({ active }) =>
                  `cursor-pointer select-none relative px-4 py-2 ${active ? 'bg-blue-100' : ''} ${option.disabled ? 'opacity-50' : ''}`
                }
              >
                {({ selected }) => (
                  <div className={`flex items-center gap-2 ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {optionTemplate ? optionTemplate(option, selected) : <span>{option.label}</span>}
                    {selected && <CheckIcon className="h-4 w-4 text-blue-600 ml-auto" />}
                  </div>
                )}
              </Listbox.Option>
            ))
          )}
        </Listbox.Options>
      </Listbox>
      {/* ARIA live region for screen readers */}
      <div className="sr-only" aria-live="polite">{ariaMessage}</div>
      {/* Error/warning/success messages */}
      {(error || warning || success) && (
        <div className="mt-1">
          {error && <div className="text-xs text-red-600">{error}</div>}
          {warning && <div className="text-xs text-yellow-600">{warning}</div>}
          {success && <div className="text-xs text-green-600">{success}</div>}
        </div>
      )}
    </div>
  );
}; 