import React from 'react';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  icon,
  iconPosition = 'left',
  className = '',
  disabled,
  ...props
}) => {
  const classes = [
    'ui-button',
    `ui-button--${variant}`,
    `ui-button--${size}`,
    fullWidth && 'ui-button--full-width',
    loading && 'ui-button--loading',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading && (
        <span className="ui-button__spinner">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="42" strokeLinecap="round">
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 12 12"
                to="360 12 12"
                dur="0.8s"
                repeatCount="indefinite"
              />
            </circle>
          </svg>
        </span>
      )}
      {!loading && icon && iconPosition === 'left' && (
        <span className="ui-button__icon ui-button__icon--left">{icon}</span>
      )}
      <span className="ui-button__text">{children}</span>
      {!loading && icon && iconPosition === 'right' && (
        <span className="ui-button__icon ui-button__icon--right">{icon}</span>
      )}
    </button>
  );
};

export default Button;

