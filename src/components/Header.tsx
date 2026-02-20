import { Link } from 'react-router-dom';

interface HeaderProps {
  isAuthenticated: boolean;
  onLogout: () => void;
}

export default function Header({ isAuthenticated, onLogout }: HeaderProps) {
  return (
    <header className="bg-gray-900 text-white py-4 px-8 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold">MERA13 CONVERTER</Link>
      <nav>
        <Link to="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Home</Link>
        <Link to="/api-docs" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">API Docs</Link>
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Dashboard</Link>
            <button onClick={onLogout} className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Logout</button>
          </>
        ) : (
          <Link to="/login" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Login</Link>
        )}
      </nav>
    </header>
  );
}

