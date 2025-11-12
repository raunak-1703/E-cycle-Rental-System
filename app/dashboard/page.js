'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bike, MapPin, Battery, Wallet, LogOut, User, History, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stations, setStations] = useState([]);
  const [activeReservation, setActiveReservation] = useState(null);
  const [activeTrip, setActiveTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }
    
    setUser(JSON.parse(userData));
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch stations
      const stationsRes = await fetch('/api/stations');
      const stationsData = await stationsRes.json();
      setStations(stationsData);

      // Check for active reservation
      const reservationRes = await fetch('/api/reservations/active', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const reservationData = await reservationRes.json();
      if (reservationData.reservation) {
        setActiveReservation(reservationData);
      }

      // Check for active trip
      const tripRes = await fetch('/api/trips/active', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const tripData = await tripRes.json();
      if (tripData.trip) {
        setActiveTrip(tripData);
      }

      // Refresh user data
      const userRes = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const userData = await userRes.json();
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

    } catch (error) {
      console.error('Error fetching data:', error);
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
        <div className="text-center">
          <Bike className="w-16 h-16 text-green-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
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
            <span className="text-xl font-bold text-gray-900">CYCLOAN</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-green-100 px-4 py-2 rounded-lg">
              <Wallet className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-900">₹{user?.wallet || 0}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push('/profile')}>
              <User className="w-4 h-4 mr-2" />
              {user?.name}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600">Find a station and start your eco-friendly journey</p>
        </div>

        {/* Active Reservation Alert */}
        {activeReservation && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-orange-600 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-900 mb-2">Active Reservation</h3>
                  <p className="text-sm text-orange-800 mb-3">
                    Bike {activeReservation.bike?.bikeNumber} at {activeReservation.station?.name}
                  </p>
                  <Button 
                    onClick={() => router.push(`/unlock/${activeReservation.reservation._id}`)}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Unlock Bike
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Trip Alert */}
        {activeTrip && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Bike className="w-6 h-6 text-blue-600 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 mb-2">Trip in Progress</h3>
                  <p className="text-sm text-blue-800 mb-3">
                    Riding {activeTrip.bike?.bikeNumber} from {activeTrip.startStation?.name}
                  </p>
                  <Button 
                    onClick={() => router.push(`/trip/${activeTrip.trip._id}`)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    View Trip
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Button 
            onClick={() => router.push('/history')} 
            variant="outline"
            className="h-20 text-lg"
          >
            <History className="w-6 h-6 mr-3" />
            Trip History
          </Button>
          <Button 
            onClick={() => router.push('/profile')} 
            variant="outline"
            className="h-20 text-lg"
          >
            <Wallet className="w-6 h-6 mr-3" />
            Recharge Wallet
          </Button>
        </div>

        {/* Stations */}
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Available Stations</h2>
          <Badge variant="secondary">{stations.length} stations</Badge>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
          {stations.map((station) => (
            <Card key={station._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{station.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="w-4 h-4" />
                      {station.location.lat.toFixed(4)}, {station.location.lng.toFixed(4)}
                    </CardDescription>
                  </div>
                  <Badge className="bg-green-600">
                    {station.availableBikes} bikes
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    {station.totalDocks} docks total
                  </div>
                  <Button 
                    onClick={() => router.push(`/reserve/${station._id}`)}
                    disabled={station.availableBikes === 0 || activeReservation || activeTrip}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {station.availableBikes === 0 ? 'No Bikes' : 'Reserve'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {stations.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No stations available at the moment</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
