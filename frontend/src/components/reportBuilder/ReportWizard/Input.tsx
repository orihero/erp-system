import React, { useState, useRef, useEffect, useCallback } from 'react';
import { EyeIcon, EyeSlashIcon, XMarkIcon, ExclamationCircleIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import debounce from 'lodash/debounce';

const VARIANT_CLASSES: Record<string, string> = {
  primary: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
  secondary: 'border-gray-200 focus:border-gray-400 focus:ring-gray-400',
  danger: 'border-red-500 focus:border-red-700 focus:ring-red-500',
  success: 'border-green-500 focus:border-green-700 focus:ring-green-500',
  warning: 'border-yellow-500 focus:border-yellow-700 focus:ring-yellow-500',
};

const SIZE_CLASSES: Record<string, string> = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-5 py-2.5 text-lg',
  xl: 'px-6 py-3 text-xl',
};

export type InputProps = {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onValidate?: (value: string) => Promise<string[] | undefined> | (string[] | undefined);
  placeholder?: string;
  autoComplete?: string;
  mask?: (value: string) => string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  clearable?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  error?: string | string[];
  warning?: string | string[];
  success?: string | string[];
  showValidationIcon?: boolean;
  size?: keyof typeof SIZE_CLASSES;
  variant?: keyof typeof VARIANT_CLASSES;
  className?: string;
  inputClassName?: string;
  id?: string;
  name?: string;
  label?: string;
  required?: boolean;
  debounceMs?: number;
  'aria-label'?: string;
  'aria-describedby'?: string;
};

export const Input: React.FC<InputProps> = ({
  type = 'text',
  value: controlledValue,
  onChange,
  onBlur,
  onFocus,
  onValidate,
  placeholder,
  autoComplete,
  mask,
  prefix,
  suffix,
  clearable = false,
  disabled = false,
  readOnly = false,
  error,
  warning,
  success,
  showValidationIcon = true,
  size = 'md',
  variant = 'primary',
  className = '',
  inputClassName = '',
  id,
  name,
  label,
  required = false,
  debounceMs = 300,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
  ...rest
}) => {
  const [internalValue, setInternalValue] = useState(controlledValue || '');
  const [showPassword, setShowPassword] = useState(false);
  const [validationState, setValidationState] = useState<'error' | 'warning' | 'success' | undefined>();
  const [validationMessages, setValidationMessages] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync controlled value
  useEffect(() => {
    if (controlledValue !== undefined && controlledValue !== internalValue) {
      setInternalValue(controlledValue);
    }
  }, [controlledValue]);

  // Debounced validation
  const debouncedValidate = useCallback(
    debounce(async (val: string) => {
      if (onValidate) {
        const result = await onValidate(val);
        if (result && result.length > 0) {
          setValidationState('error');
          setValidationMessages(result);
        } else {
          setValidationState('success');
          setValidationMessages([]);
        }
      }
    }, debounceMs),
    [onValidate, debounceMs]
  );

  useEffect(() => {
    if (onValidate && internalValue !== undefined) {
      debouncedValidate(internalValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [internalValue]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (mask) val = mask(val);
    setInternalValue(val);
    if (onChange) onChange({ ...e, target: { ...e.target, value: val } });
  };

  // Clear input
  const handleClear = () => {
    setInternalValue('');
    if (onChange) onChange({
      target: { value: '' }
    } as React.ChangeEvent<HTMLInputElement>);
    inputRef.current?.focus();
  };

  // Password toggle
  const handleTogglePassword = () => setShowPassword((v) => !v);

  // Determine state
  const hasError = !!error || validationState === 'error';
  const hasWarning = !!warning || validationState === 'warning';
  const hasSuccess = !!success || validationState === 'success';

  // Compose messages
  const errorMessages = Array.isArray(error) ? error : error ? [error] : [];
  const warningMessages = Array.isArray(warning) ? warning : warning ? [warning] : [];
  const successMessages = Array.isArray(success) ? success : success ? [success] : [];
  const allMessages = [
    ...errorMessages,
    ...validationMessages,
    ...warningMessages,
    ...successMessages,
  ];

  // Compose classes
  const baseClasses = [
    'block w-full rounded border outline-none transition-colors',
    VARIANT_CLASSES[hasError ? 'danger' : hasWarning ? 'warning' : hasSuccess ? 'success' : variant],
    SIZE_CLASSES[size],
    disabled ? 'bg-gray-100 cursor-not-allowed' : '',
    readOnly ? 'bg-gray-50' : '',
    inputClassName,
  ].join(' ');

  return (
    <div className={`flex flex-col gap-1 ${className}`}> 
      {label && (
        <label htmlFor={id} className="font-medium text-sm mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && <span className="absolute left-3 flex items-center pointer-events-none">{prefix}</span>}
        <input
          ref={inputRef}
          id={id}
          name={name}
          type={type === 'password' && showPassword ? 'text' : type}
          value={internalValue}
          onChange={handleChange}
          onBlur={onBlur}
          onFocus={onFocus}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          readOnly={readOnly}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedby}
          aria-invalid={hasError}
          aria-required={required}
          className={baseClasses + (prefix ? ' pl-10' : '') + (suffix || clearable || (type === 'password') ? ' pr-10' : '')}
          {...rest}
        />
        {/* Suffix, clear, password toggle */}
        {(type === 'password') && (
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
            onClick={handleTogglePassword}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            disabled={disabled}
          >
            {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
          </button>
        )}
        {clearable && internalValue && !disabled && (
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
            onClick={handleClear}
            aria-label="Clear input"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
        {suffix && <span className="absolute right-3 flex items-center pointer-events-none">{suffix}</span>}
        {/* Validation icon */}
        {showValidationIcon && (hasError || hasWarning || hasSuccess) && (
          <span className="absolute right-10 flex items-center">
            {hasError && <ExclamationCircleIcon className="h-5 w-5 text-red-500" />}
            {hasWarning && <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />}
            {hasSuccess && <CheckCircleIcon className="h-5 w-5 text-green-500" />}
          </span>
        )}
      </div>
      {/* Messages */}
      {allMessages.length > 0 && (
        <div className="mt-1 space-y-0.5">
          {allMessages.map((msg, i) => (
            <div
              key={i}
              className={
                hasError
                  ? 'text-xs text-red-600'
                  : hasWarning
                  ? 'text-xs text-yellow-600'
                  : hasSuccess
                  ? 'text-xs text-green-600'
                  : 'text-xs text-gray-500'
              }
              role={hasError ? 'alert' : undefined}
            >
              {msg}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 