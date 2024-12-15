interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "blue" | string;
}

export const LoadingSpinner = ({ size = "md", color = "blue" }: LoadingSpinnerProps) => {
  return (
    <div className="spinner-container">
      <div className={`spinner spinner-${size} spinner-${color}`} />
    </div>
  );
};
