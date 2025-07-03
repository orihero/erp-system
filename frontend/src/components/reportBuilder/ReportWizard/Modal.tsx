import React, { Fragment, useRef, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const SIZE_CLASSES: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'w-full h-full',
};

export type ModalProps = {
  open?: boolean; // controlled
  defaultOpen?: boolean; // uncontrolled
  onClose?: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  size?: keyof typeof SIZE_CLASSES;
  position?: 'center' | 'top' | 'custom';
  className?: string;
  overlayClassName?: string;
  containerClassName?: string;
  showClose?: boolean;
  initialFocusRef?: React.RefObject<HTMLElement>;
  fullScreenOnMobile?: boolean;
  zIndex?: number;
  ariaLabel?: string;
  ariaDescribedby?: string;
  afterLeave?: () => void;
};

export const Modal: React.FC<ModalProps> = ({
  open,
  defaultOpen = false,
  onClose,
  title,
  children,
  size = 'md',
  position = 'center',
  className = '',
  overlayClassName = '',
  containerClassName = '',
  showClose = true,
  initialFocusRef,
  fullScreenOnMobile = true,
  zIndex = 50,
  ariaLabel,
  ariaDescribedby,
  afterLeave,
}) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const triggerRef = useRef<HTMLElement | null>(null);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  // Trap focus and return to trigger
  useEffect(() => {
    if (!isOpen && triggerRef.current) {
      triggerRef.current.focus();
    }
  }, [isOpen]);

  // Prevent background scroll
  useEffect(() => {
    if (isOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isOpen]);

  // Handle close
  const handleClose = () => {
    if (!isControlled) setInternalOpen(false);
    if (onClose) onClose();
  };

  // Responsive modal classes
  const modalSizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const modalPositionClass = position === 'top' ? 'items-start' : 'items-center';
  const fullScreenClass = fullScreenOnMobile ? 'sm:rounded-lg sm:w-auto sm:h-auto' : '';

  return (
    <Transition.Root show={isOpen} as={Fragment} afterLeave={afterLeave}>
      <Dialog
        as="div"
        static
        className={`fixed inset-0 z-[${zIndex}] overflow-y-auto ${containerClassName}`}
        open={isOpen}
        onClose={handleClose}
        initialFocus={initialFocusRef}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedby}
      >
        <div className={`flex min-h-screen ${modalPositionClass} justify-center p-4 text-center sm:block sm:p-0`}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className={`fixed inset-0 bg-black bg-opacity-30 transition-opacity ${overlayClassName}`} aria-hidden="true" />
          </Transition.Child>

          {/* Modal panel */}
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div
              className={`inline-block align-bottom bg-white rounded-lg text-left shadow-xl transform transition-all w-full ${modalSizeClass} ${fullScreenClass} ${className}`}
              role="dialog"
              aria-modal="true"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b">
                {title && <Dialog.Title as="h2" className="text-lg font-medium text-gray-900">{title}</Dialog.Title>}
                {showClose && (
                  <button
                    type="button"
                    className="rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={handleClose}
                    aria-label="Close modal"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                )}
              </div>
              <div className="px-4 py-5 sm:p-6 overflow-y-auto max-h-[80vh]">
                {children}
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}; 