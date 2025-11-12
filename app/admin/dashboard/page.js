'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bike, MapPin, Users, DollarSign, Activity, LogOut } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuth();
    fetchStats();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    
    setUser(parsedUser);
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error);
      }

      setStats(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center">
        <Bike className="w-16 h-16 text-green-600 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Bike className="w-8 h-8 text-green-600" />
            <span className="text-xl font-bold text-gray-900">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">System Overview</h1>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Bikes</CardTitle>
              <Bike className="w-5 h-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.totalBikes || 0}</div>
              <p className="text-xs text-gray-500 mt-1">E-cycles in system</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Stations</CardTitle>
              <MapPin className="w-5 h-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.totalStations || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Active locations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Users</CardTitle>
              <Users className="w-5 h-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Registered students</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Revenue</CardTitle>
              <DollarSign className="w-5 h-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">₹{stats?.totalRevenue || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Total earnings</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Trips */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Active Trips</CardTitle>
                <CardDescription>Currently ongoing rides</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-600" />
                <span className="text-2xl font-bold text-green-600">{stats?.activeTrips || 0}</span>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Quick Actions */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Management</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button 
            onClick={() => router.push('/admin/stations')}
            variant="outline"
            className="h-24 text-lg flex-col"
          >
            <MapPin className="w-8 h-8 mb-2" />
            Manage Stations
          </Button>
          
          <Button 
            onClick={() => router.push('/admin/bikes')}
            variant="outline"
            className="h-24 text-lg flex-col"
          >
            <Bike className="w-8 h-8 mb-2" />
            Manage Bikes
          </Button>

          <Button 
            onClick={() => router.push('/admin/users')}
            variant="outline"
            className="h-24 text-lg flex-col"
          >
            <Users className="w-8 h-8 mb-2" />
            View Users
          </Button>

          <Button 
            onClick={() => router.push('/admin/trips')}
            variant="outline"
            className="h-24 text-lg flex-col"
          >
            <Activity className="w-8 h-8 mb-2" />
            View Trips
          </Button>
        </div>
      </div>
    </div>
  );
}
