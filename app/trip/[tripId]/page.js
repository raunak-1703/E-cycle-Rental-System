'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Bike, Clock, MapPin, Battery, Navigation } from 'lucide-react';

export default function TripPage() {
  const router = useRouter();
  const params = useParams();
  const tripId = params.tripId;
  
  const [trip, setTrip] = useState(null);
  const [bike, setBike] = useState(null);
  const [startStation, setStartStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [duration, setDuration] = useState(0);
  const [distance, setDistance] = useState(0);
  const [estimatedFare, setEstimatedFare] = useState(5);

  useEffect(() => {
    fetchTripData();
  }, [tripId]);

  useEffect(() => {
    if (trip) {
      const interval = setInterval(() => {
        const now = new Date();
        const start = new Date(trip.startTime);
        const durationMinutes = Math.floor((now - start) / (1000 * 60));
        setDuration(durationMinutes);

        // Simulate distance (1 km per 5 minutes)
        const distanceKm = Math.round((durationMinutes / 5) * 10) / 10;
        setDistance(distanceKm);

        // Calculate fare: ₹5 base + ₹1 per minute
        const fare = 5 + durationMinutes;
        setEstimatedFare(fare);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [trip]);

  const fetchTripData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/trips/active', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();

      if (!res.ok || !data.trip) {
        router.push('/dashboard');
        return;
      }

      setTrip(data.trip);
      setBike(data.bike);
      setStartStation(data.startStation);
    } catch (error) {
      console.error('Error:', error);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleEndTrip = () => {
    router.push(`/return?tripId=${tripId}`);
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
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
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Trip Status */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <Bike className="w-12 h-12 text-blue-600 mx-auto mb-3 animate-bounce" />
              <h2 className="text-2xl font-bold text-blue-900 mb-2">Trip in Progress</h2>
              <p className="text-blue-700">Riding {bike?.bikeNumber}</p>
            </div>
          </CardContent>
        </Card>

        {/* Trip Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <Clock className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{formatDuration(duration)}</p>
              <p className="text-sm text-gray-600">Duration</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <Navigation className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{distance} km</p>
              <p className="text-sm text-gray-600">Distance</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-2xl font-bold text-green-600">₹{estimatedFare}</p>
              <p className="text-sm text-gray-600">Est. Fare</p>
            </CardContent>
          </Card>
        </div>

        {/* Bike Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Bike Details</CardTitle>
            <CardDescription>Current bike information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Bike Number</span>
              <span className="font-semibold">{bike?.bikeNumber}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Start Station</span>
              <span className="font-semibold">{startStation?.name}</span>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <Battery className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-600">Battery Level</span>
                </div>
                <span className="font-semibold">{bike?.batteryLevel}%</span>
              </div>
              <Progress value={bike?.batteryLevel || 0} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Fare Breakdown */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Fare Calculation</CardTitle>
            <CardDescription>Current estimated fare</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Base Fare</span>
              <span className="font-semibold">₹5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Duration ({duration} min @ ₹1/min)</span>
              <span className="font-semibold">₹{duration}</span>
            </div>
            <div className="border-t pt-3 flex justify-between items-center">
              <span className="font-bold text-lg">Total Estimated</span>
              <span className="font-bold text-2xl text-green-600">₹{estimatedFare}</span>
            </div>
          </CardContent>
        </Card>

        {/* End Trip Button */}
        <Card>
          <CardContent className="pt-6">
            <Button 
              onClick={handleEndTrip}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg"
            >
              End Trip & Return Bike
            </Button>
            <p className="text-center text-sm text-gray-500 mt-3">
              You'll be able to select a station to return the bike
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
