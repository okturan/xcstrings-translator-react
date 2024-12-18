interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "blue" | "white";
}

export const LoadingSpinner = ({ 
  size = "sm", 
  color = "blue"
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-8 w-8 border-3'
  };

  const colorClasses = {
    blue: 'border-blue-600/20 border-t-blue-600',
    white: 'border-white/20 border-t-white'
  };

  return (
    <div 
      className={`
        inline-block
        animate-spin
        rounded-full
        ${sizeClasses[size]}
        ${colorClasses[color]}
      `}
      role="status"
      aria-label="Loading"
    />
  );
};
