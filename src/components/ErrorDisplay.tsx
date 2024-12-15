interface ErrorDisplayProps {
  message: string;
}

export const ErrorDisplay = ({ message }: ErrorDisplayProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="max-w-md p-4 bg-white rounded-lg shadow-lg">
        <h2 className="text-lg font-bold text-red-600 mb-2">Error Loading Strings</h2>
        <p className="text-gray-700 text-sm">{message}</p>
        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">{message}</pre>
      </div>
    </div>
  );
};
