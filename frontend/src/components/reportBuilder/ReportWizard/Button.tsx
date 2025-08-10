import React from 'react';
import { Link, LinkProps } from 'react-router-dom';

// Spinner for loading state
const Spinner = () => (
  <svg className="animate-spin h-5 w-5 text-current" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
);

const VARIANT_CLASSES: Record<string, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-400',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  ghost: 'bg-transparent text-gray-900 hover:bg-gray-100 focus:ring-gray-400',
  link: 'bg-transparent text-blue-600 underline hover:text-blue-800 focus:ring-blue-500',
};

const SIZE_CLASSES: Record<string, string> = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-5 py-2.5 text-lg',
  xl: 'px-6 py-3 text-xl',
};

export type ButtonProps = {
  children: React.ReactNode;
  variant?: keyof typeof VARIANT_CLASSES;
  size?: keyof typeof SIZE_CLASSES;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  as?: 'button' | 'a' | 'link';
  to?: string; // for Link
  href?: string; // for anchor
  type?: 'button' | 'submit' | 'reset';
  onClick?: React.MouseEventHandler<HTMLElement>;
  className?: string;
  tabIndex?: number;
  'aria-label'?: string;
  'aria-describedby'?: string;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'type'> &
  Partial<Pick<LinkProps, 'replace' | 'state'>>;

export const Button = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      disabled = false,
      loading = false,
      leftIcon,
      rightIcon,
      as = 'button',
      to,
      href,
      type = 'button',
      onClick,
      className = '',
      tabIndex,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedby,
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
    const baseClasses = [
      'inline-flex items-center justify-center font-medium rounded focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors',
      VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary,
      SIZE_CLASSES[size] || SIZE_CLASSES.md,
      isDisabled ? 'opacity-50 cursor-not-allowed' : '',
      loading ? 'relative' : '',
      className,
    ].join(' ');

    const content = (
      <>
        {loading && <span className="mr-2"><Spinner /></span>}
        {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        <span>{children}</span>
        {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </>
    );

    // Polymorphic rendering
    if (as === 'link' && to) {
      return (
        <Link
          to={to}
          className={baseClasses}
          tabIndex={tabIndex}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedby}
          aria-disabled={isDisabled}
          onClick={isDisabled ? (e) => e.preventDefault() : onClick}
          ref={ref as React.Ref<HTMLAnchorElement>}
          {...rest}
        >
          {content}
        </Link>
      );
    }
    if (as === 'a' && href) {
      return (
        <a
          href={isDisabled ? undefined : href}
          className={baseClasses}
          tabIndex={tabIndex}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedby}
          aria-disabled={isDisabled}
          onClick={isDisabled ? (e) => e.preventDefault() : onClick}
          ref={ref as React.Ref<HTMLAnchorElement>}
          {...rest}
        >
          {content}
        </a>
      );
    }
    // Default: button
    return (
      <button
        type={type}
        className={baseClasses}
        disabled={isDisabled}
        tabIndex={tabIndex}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedby}
        aria-disabled={isDisabled}
        onClick={onClick}
        ref={ref as React.Ref<HTMLButtonElement>}
        {...rest}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button'; 