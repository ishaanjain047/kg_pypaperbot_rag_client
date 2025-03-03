export const Card = ({ children, className = '' }) => (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {children}
    </div>
  );
  
  export const CardHeader = ({ children, className = '' }) => (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
  
  export const CardTitle = ({ children, className = '' }) => (
    <h2 className={`text-2xl font-semibold text-gray-700 ${className}`}>
      {children}
    </h2>
  );
  
  export const CardContent = ({ children, className = '' }) => (
    <div className={className}>
      {children}
    </div>
  ); 