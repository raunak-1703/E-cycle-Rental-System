'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Clock, Navigation, ArrowLeft } from 'lucide-react';

export default function AdminTrips() {
  const router = useRouter();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/trips', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setTrips(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (startTime, endTime) => {
    if (!endTime) return 'Ongoing';
    const duration = Math.floor((new Date(endTime) - new Date(startTime)) / (1000 * 60));
    return `${duration}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center">
        <Activity className="w-16 h-16 text-green-600 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/admin/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">All Trips</h1>
          <Badge variant="secondary">{trips.length} trips</Badge>
        </div>

        <div className="space-y-4">
          {trips.map((trip) => (
            <Card key={trip._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      Trip - {formatDate(trip.startTime)}
                    </CardTitle>
                  </div>
                  <Badge className={trip.status === 'ongoing' ? 'bg-blue-600' : 'bg-green-600'}>
                    {trip.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="font-semibold text-sm">
                        {formatDuration(trip.startTime, trip.endTime)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Navigation className="w-4 h-4 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Distance</p>
                      <p className="font-semibold text-sm">{trip.distanceKm} km</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Bike ID</p>
                    <p className="font-semibold text-sm truncate">{trip.bikeId}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Fare</p>
                    <p className="font-semibold text-lg text-green-600">₹{trip.fare}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {trips.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No trips recorded yet</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
