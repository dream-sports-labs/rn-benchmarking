import React from 'react';
import './Badge.css';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  icon,
}) => {
  const classes = [
    'ui-badge',
    `ui-badge--${variant}`,
    `ui-badge--${size}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <span className={classes}>
      {icon && <span className="ui-badge__icon">{icon}</span>}
      {children}
    </span>
  );
};

export default Badge;

