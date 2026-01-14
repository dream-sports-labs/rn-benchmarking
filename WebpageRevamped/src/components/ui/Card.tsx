import React from 'react';
import './Card.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  onClick,
  hoverable = false,
}) => {
  const classes = [
    'ui-card',
    `ui-card--${variant}`,
    `ui-card--padding-${padding}`,
    hoverable && 'ui-card--hoverable',
    onClick && 'ui-card--clickable',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} onClick={onClick} role={onClick ? 'button' : undefined}>
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '', action }) => (
  <div className={`ui-card__header ${className}`}>
    <div className="ui-card__header-content">{children}</div>
    {action && <div className="ui-card__header-action">{action}</div>}
  </div>
);

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className = '', as: Tag = 'h3' }) => (
  <Tag className={`ui-card__title ${className}`}>{children}</Tag>
);

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const CardDescription: React.FC<CardDescriptionProps> = ({ children, className = '' }) => (
  <p className={`ui-card__description ${className}`}>{children}</p>
);

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => (
  <div className={`ui-card__content ${className}`}>{children}</div>
);

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => (
  <div className={`ui-card__footer ${className}`}>{children}</div>
);

export default Card;

