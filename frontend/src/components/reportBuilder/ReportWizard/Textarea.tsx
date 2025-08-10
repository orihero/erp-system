import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ExclamationCircleIcon, CheckCircleIcon, ExclamationTriangleIcon, ArrowUturnLeftIcon, ArrowUturnRightIcon, BoldIcon, ItalicIcon } from '@heroicons/react/24/outline';
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

export type TextareaProps = {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onValidate?: (value: string) => Promise<string[] | undefined> | (string[] | undefined);
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  error?: string | string[];
  warning?: string | string[];
  success?: string | string[];
  showValidationIcon?: boolean;
  size?: keyof typeof SIZE_CLASSES;
  variant?: keyof typeof VARIANT_CLASSES;
  className?: string;
  textareaClassName?: string;
  id?: string;
  name?: string;
  label?: string;
  required?: boolean;
  minRows?: number;
  maxRows?: number;
  minLength?: number;
  maxLength?: number;
  debounceMs?: number;
  autoSave?: boolean;
  autoSaveInterval?: number;
  spellCheck?: boolean;
  showToolbar?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
};

const formatText = (text: string, command: 'bold' | 'italic') => {
  if (command === 'bold') return `**${text}**`;
  if (command === 'italic') return `*${text}*`;
  return text;
};

export const Textarea: React.FC<TextareaProps> = ({
  value: controlledValue,
  onChange,
  onBlur,
  onFocus,
  onValidate,
  placeholder,
  disabled = false,
  readOnly = false,
  error,
  warning,
  success,
  showValidationIcon = true,
  size = 'md',
  variant = 'primary',
  className = '',
  textareaClassName = '',
  id,
  name,
  label,
  required = false,
  minRows = 3,
  maxRows = 12,
  minLength,
  maxLength = 5000,
  debounceMs = 300,
  autoSave = false,
  autoSaveInterval = 2000,
  spellCheck = true,
  showToolbar = true,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
  ...rest
}) => {
  const [internalValue, setInternalValue] = useState(controlledValue || '');
  const [validationState, setValidationState] = useState<'error' | 'warning' | 'success' | undefined>();
  const [validationMessages, setValidationMessages] = useState<string[]>([]);
  const [charCount, setCharCount] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    setCharCount(internalValue.length);
    if (onValidate) debouncedValidate(internalValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [internalValue]);

  // Auto-resize
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      const scrollHeight = el.scrollHeight;
      const lineHeight = parseInt(window.getComputedStyle(el).lineHeight || '20', 10);
      const minHeight = minRows * lineHeight;
      const maxHeight = maxRows * lineHeight;
      el.style.height = Math.max(minHeight, Math.min(scrollHeight, maxHeight)) + 'px';
    }
  }, [internalValue, minRows, maxRows]);

  // Undo/redo
  useEffect(() => {
    setHistory([internalValue]);
    setHistoryIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInternalValue(val);
    setCharCount(val.length);
    if (onChange) onChange(e);
    // Push to history for undo/redo
    setHistory(prev => {
      const newHist = prev.slice(0, historyIndex + 1).concat(val);
      setHistoryIndex(newHist.length - 1);
      return newHist;
    });
  };

  const handleUndo = () => {
    setHistoryIndex(idx => {
      if (idx > 0) {
        setInternalValue(history[idx - 1]);
        return idx - 1;
      }
      return idx;
    });
  };
  const handleRedo = () => {
    setHistoryIndex(idx => {
      if (idx < history.length - 1) {
        setInternalValue(history[idx + 1]);
        return idx + 1;
      }
      return idx;
    });
  };

  // Auto-save
  useEffect(() => {
    if (!autoSave) return;
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    setAutoSaveTimer(setTimeout(() => {
      // Simulate auto-save (could call a prop or API)
      // console.log('Auto-saved:', internalValue);
    }, autoSaveInterval));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [internalValue, autoSave, autoSaveInterval]);

  // Keyboard shortcuts for undo/redo and formatting
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      handleUndo();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
      e.preventDefault();
      handleRedo();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      formatSelection('bold');
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault();
      formatSelection('italic');
    }
  };

  // Format selection
  const formatSelection = (command: 'bold' | 'italic') => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = el.value.substring(start, end);
    const formatted = formatText(selected, command);
    const newValue = el.value.substring(0, start) + formatted + el.value.substring(end);
    setInternalValue(newValue);
    setTimeout(() => {
      el.focus();
      el.selectionStart = start;
      el.selectionEnd = start + formatted.length;
    }, 0);
  };

  // Paste handling (preserve formatting)
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    // Optionally sanitize or preserve formatting
    // For now, allow plain text only
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

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
    'block w-full rounded border outline-none transition-colors resize-none',
    VARIANT_CLASSES[hasError ? 'danger' : hasWarning ? 'warning' : hasSuccess ? 'success' : variant],
    SIZE_CLASSES[size],
    disabled ? 'bg-gray-100 cursor-not-allowed' : '',
    readOnly ? 'bg-gray-50' : '',
    textareaClassName,
  ].join(' ');

  // Character count color
  const charCountColor = charCount >= (maxLength || 0) ? 'text-red-600' : charCount > (maxLength || 0) * 0.8 ? 'text-yellow-600' : 'text-gray-500';

  return (
    <div className={`flex flex-col gap-1 ${className}`}> 
      {label && (
        <label htmlFor={id} className="font-medium text-sm mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      {showToolbar && (
        <div className="flex gap-2 mb-1">
          <button type="button" className="p-1 rounded hover:bg-gray-100" onClick={() => formatSelection('bold')} aria-label="Bold"><BoldIcon className="h-5 w-5" /></button>
          <button type="button" className="p-1 rounded hover:bg-gray-100" onClick={() => formatSelection('italic')} aria-label="Italic"><ItalicIcon className="h-5 w-5" /></button>
          <button type="button" className="p-1 rounded hover:bg-gray-100" onClick={handleUndo} aria-label="Undo"><ArrowUturnLeftIcon className="h-5 w-5" /></button>
          <button type="button" className="p-1 rounded hover:bg-gray-100" onClick={handleRedo} aria-label="Redo"><ArrowUturnRightIcon className="h-5 w-5" /></button>
        </div>
      )}
      <div className="relative">
        <textarea
          ref={textareaRef}
          id={id}
          name={name}
          value={internalValue}
          onChange={handleChange}
          onBlur={onBlur}
          onFocus={onFocus}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedby}
          aria-invalid={hasError}
          aria-required={required}
          minLength={minLength}
          maxLength={maxLength}
          spellCheck={spellCheck}
          className={baseClasses}
          rows={minRows}
          {...rest}
        />
        {showValidationIcon && (hasError || hasWarning || hasSuccess) && (
          <span className="absolute right-3 top-3 flex items-center">
            {hasError && <ExclamationCircleIcon className="h-5 w-5 text-red-500" />}
            {hasWarning && <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />}
            {hasSuccess && <CheckCircleIcon className="h-5 w-5 text-green-500" />}
          </span>
        )}
      </div>
      <div className="flex justify-between items-center mt-1">
        <span className={`text-xs ${charCountColor}`}>{charCount}{maxLength ? ` / ${maxLength}` : ''}</span>
      </div>
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