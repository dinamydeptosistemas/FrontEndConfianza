import React from 'react';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="mb-4">The page you are looking for does not exist.</p>
      <a href="/" className="text-blue-600 hover:underline">Go to Home</a>
    </div>
  );
};

export default NotFound;
