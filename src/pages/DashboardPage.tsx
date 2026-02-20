import { useEffect, useState } from 'react';
import { apiClient } from '../services/apiClient';

interface User {
  email: string;
  apiKey: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await apiClient.get('/users/me');
        setUser(response.data);
      } catch (error) {
        console.error('Failed to fetch user data', error);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  if (loading) {
    return <div className="text-center p-10">Loading...</div>;
  }

  if (!user) {
    return <div className="text-center p-10 text-red-500">Could not load user data.</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-10">
        <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">Your Dashboard</h2>
            <div className="space-y-4">
                <p><strong>Email:</strong> {user.email}</p>
                <div>
                    <p className="font-semibold">Your API Key:</p>
                    <pre className="bg-gray-100 p-2 rounded text-sm break-all">{user.apiKey}</pre>
                </div>
            </div>
        </div>
    </div>
  );
}
