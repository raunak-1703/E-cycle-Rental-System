'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bike, MapPin, Battery, ArrowLeft, AlertCircle } from 'lucide-react';

export default function ReservePage() {
  const router = useRouter();
  const params = useParams();
  const stationId = params.stationId;
  
  const [station, setStation] = useState(null);
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStationData();
  }, [stationId]);

  const fetchStationData = async () => {
    try {
      const res = await fetch(`/api/stations/${stationId}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch station data');
      }
      
      setStation(data.station);
      setBikes(data.bikes.filter(b => b.status === 'available'));
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async (bikeId) => {
    setReserving(true);
    setError('');
  

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bikeId, stationId })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Reservation failed');
      }

      // Redirect to unlock page
      router.push(`/unlock/${data._id}`);
    } catch (error) {
      setError(error.message);
    } finally {
      setReserving(false);
    }
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
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">{station?.name}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {station?.location.lat.toFixed(4)}, {station?.location.lng.toFixed(4)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Badge className="bg-green-600">{bikes.length} available bikes</Badge>
              <Badge variant="secondary">{station?.totalDocks} total docks</Badge>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-xl font-bold mb-4">Select a Bike</h2>

        {bikes.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Bike className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No bikes available at this station</p>
              <Button 
                onClick={() => router.push('/dashboard')}
                className="mt-4"
                variant="outline"
              >
                Try Another Station
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bikes.map((bike) => (
              <Card key={bike._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{bike.bikeNumber}</CardTitle>
                      <CardDescription>E-Cycle</CardDescription>
                    </div>
                    <Badge 
                      className={bike.batteryLevel > 50 ? 'bg-green-600' : 'bg-orange-600'}
                    >
                      {bike.batteryLevel}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Battery className="w-4 h-4" />
                        Battery Level
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            bike.batteryLevel > 50 ? 'bg-green-600' : 'bg-orange-600'
                          }`}
                          style={{ width: `${bike.batteryLevel}%` }}
                        />
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() =>{ console.log('RESERVE CLICK -> bike:', bike._id, 'bike.status:', bike.status, 'stationId:', stationId);
 handleReserve(bike._id)}}
                      disabled={reserving}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {reserving ? 'Reserving...' : 'Reserve This Bike'}
                    </Button>

                    <p className="text-xs text-gray-500 text-center">
                      Reservation valid for 10 minutes
                    </p>
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
