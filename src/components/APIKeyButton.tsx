import React from 'react';

interface APIKeyButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit';
}

export const APIKeyButton = ({ 
  onClick, 
  variant = 'primary', 
  children, 
  className = '', 
  type = 'button' 
}: APIKeyButtonProps) => {
  const baseStyles = 'px-3 py-1.5 text-xs rounded-md transition-colors shadow-sm';
  const variantStyles = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'text-gray-700 bg-gray-50 hover:bg-gray-100'
  };

  return (
    <button
      onClick={onClick}
      type={type}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </button>
  );
};
