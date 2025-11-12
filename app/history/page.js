'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bike, ArrowLeft, MapPin, Clock, Navigation, Receipt } from 'lucide-react';

export default function HistoryPage() {
  const router = useRouter();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    fetchTripHistory();
  }, []);

  const fetchTripHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch('/api/trips/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) {
        router.push('/login');
        return;
      }

      setTrips(data);
      const total = data.reduce((sum, trip) => sum + trip.fare, 0);
      setTotalSpent(total);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (startTime, endTime) => {
    const duration = Math.floor((new Date(endTime) - new Date(startTime)) / (1000 * 60));
    const hours = Math.floor(duration / 60);
    const mins = duration % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Trip History</h1>

        {/* Summary */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <Receipt className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{trips.length}</p>
              <p className="text-sm text-gray-600">Total Trips</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <Navigation className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {trips.reduce((sum, trip) => sum + trip.distanceKm, 0).toFixed(1)} km
              </p>
              <p className="text-sm text-gray-600">Total Distance</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-2xl font-bold text-green-600">₹{totalSpent}</p>
              <p className="text-sm text-gray-600">Total Spent</p>
            </CardContent>
          </Card>
        </div>

        {/* Trip List */}
        {trips.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Bike className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No trips yet</p>
              <Button 
                onClick={() => router.push('/dashboard')}
                className="bg-green-600 hover:bg-green-700"
              >
                Book Your First Ride
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {trips.map((trip, index) => (
              <Card key={trip._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Bike className="w-5 h-5" />
                        Trip #{trips.length - index}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {formatDate(trip.startTime)}
                      </CardDescription>
                    </div>
                    <Badge className="bg-green-600 text-white">
                      ₹{trip.fare}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Duration</p>
                        <p className="font-semibold">
                          {formatDuration(trip.startTime, trip.endTime)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Navigation className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Distance</p>
                        <p className="font-semibold">{trip.distanceKm} km</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Route</p>
                        <p className="font-semibold text-sm">Station to Station</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Status</span>
                      <Badge variant="secondary">Completed</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
