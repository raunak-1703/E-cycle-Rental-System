'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, CheckCircle, AlertCircle, Wallet } from 'lucide-react';

export default function ReturnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tripId = searchParams.get('tripId');
  
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [returning, setReturning] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tripResult, setTripResult] = useState(null);

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      const res = await fetch('/api/stations');
      const data = await res.json();
      setStations(data);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to load stations');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async () => {
    if (!selectedStation) {
      setError('Please select a return station');
      return;
    }

    setReturning(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/return', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ tripId, endStationId: selectedStation })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Return failed');
      }

      setTripResult(data);
      setSuccess(true);

      // Update local storage with new wallet balance
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.wallet = data.remainingBalance;
      localStorage.setItem('user', JSON.stringify(user));

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } catch (error) {
      setError(error.message);
    } finally {
      setReturning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-16 h-16 text-green-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading stations...</p>
        </div>
      </div>
    );
  }

  if (success && tripResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Trip Completed!</h2>
              <p className="text-gray-600 mb-6">Thank you for using CYCLOAN</p>

              <div className="bg-gray-50 rounded-lg p-6 space-y-3 text-left mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-semibold">
                    {Math.floor((new Date(tripResult.trip.endTime) - new Date(tripResult.trip.startTime)) / (1000 * 60))} minutes
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Distance</span>
                  <span className="font-semibold">{tripResult.trip.distanceKm} km</span>
                </div>
                <div className="flex justify-between text-lg border-t pt-3">
                  <span className="font-bold">Fare Paid</span>
                  <span className="font-bold text-green-600">₹{tripResult.trip.fare}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Remaining Balance</span>
                  <span className="font-semibold">₹{tripResult.remainingBalance}</span>
                </div>
              </div>

              <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Return Bike</h1>
          <p className="text-gray-600">Select a station to return your bike</p>
        </div>

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

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {stations.map((station) => (
            <Card 
              key={station._id}
              className={`cursor-pointer transition-all ${
                selectedStation === station._id
                  ? 'ring-2 ring-green-600 border-green-600'
                  : 'hover:shadow-lg'
              }`}
              onClick={() => setSelectedStation(station._id)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{station.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="w-4 h-4" />
                      {station.location.lat.toFixed(4)}, {station.location.lng.toFixed(4)}
                    </CardDescription>
                  </div>
                  {selectedStation === station._id && (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    {station.totalDocks - station.availableBikes} empty docks
                  </div>
                  <Badge variant={station.totalDocks - station.availableBikes > 0 ? 'default' : 'secondary'}>
                    {station.totalDocks - station.availableBikes > 0 ? 'Available' : 'Full'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {stations.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No stations available</p>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            disabled={returning}
            className="flex-1"
          >
            Go Back
          </Button>
          <Button 
            onClick={handleReturn}
            disabled={!selectedStation || returning}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {returning ? 'Processing...' : 'Confirm Return'}
          </Button>
        </div>

        {selectedStation && (
          <Card className="mt-6 bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Make sure to dock the bike securely at the selected station. 
                The fare will be automatically deducted from your wallet.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
