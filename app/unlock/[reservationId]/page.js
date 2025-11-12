'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bike, Clock, AlertCircle, Scan } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function UnlockPage() {
  const router = useRouter();
  const params = useParams();
  const reservationId = params.reservationId;
  
  const [reservation, setReservation] = useState(null);
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const [error, setError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    fetchReservation();
  }, [reservationId]);

  useEffect(() => {
    if (reservation) {
      const interval = setInterval(() => {
        const now = new Date();
        const expires = new Date(reservation.reservation.expiresAt);
        const remaining = Math.max(0, Math.floor((expires - now) / 1000));
        setTimeRemaining(remaining);

        if (remaining === 0) {
          router.push('/dashboard');
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [reservation, router]);

  const fetchReservation = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/reservations/active', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();

      if (!res.ok || !data.reservation) {
        router.push('/dashboard');
        return;
      }

      setReservation(data);
    } catch (error) {
      console.error('Error:', error);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async () => {
    if (!qrCode.trim()) {
      setError('Please enter or scan a QR code');
      return;
    }

    setUnlocking(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/unlock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reservationId, qrCode })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Unlock failed');
      }

      // Redirect to trip page
      router.push(`/trip/${data._id}`);
    } catch (error) {
      setError(error.message);
    } finally {
      setUnlocking(false);
    }
  };

  const handleSimulateUnlock = () => {
    setQrCode(`BIKE-${reservation?.bike?.bikeNumber}-QR`);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
        {/* Timer */}
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-orange-600" />
                <div>
                  <p className="text-sm text-orange-800">Reservation expires in</p>
                  <p className="text-2xl font-bold text-orange-900">{formatTime(timeRemaining)}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => router.push('/dashboard')}
                className="border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bike Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">Reserved Bike</CardTitle>
            <CardDescription>You have successfully reserved this bike</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-gray-600">Bike Number</span>
                <span className="font-semibold text-lg">{reservation?.bike?.bikeNumber}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-gray-600">Station</span>
                <span className="font-semibold">{reservation?.station?.name}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-gray-600">Battery Level</span>
                <span className="font-semibold">{reservation?.bike?.batteryLevel}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QR Code Display */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Bike QR Code</CardTitle>
            <CardDescription>Scan this code on the bike dock to unlock</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <QRCodeSVG 
                value={`BIKE-${reservation?.bike?.bikeNumber}-UNLOCK-${reservationId}`} 
                size={200}
              />
            </div>
          </CardContent>
        </Card>

        {/* Unlock Section */}
        <Card>
          <CardHeader>
            <CardTitle>Unlock Bike</CardTitle>
            <CardDescription>Enter or scan the QR code to start your trip</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="qrCode">QR Code</Label>
              <Input
                id="qrCode"
                type="text"
                placeholder="Enter QR code or scan"
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={handleSimulateUnlock}
                variant="outline"
                className="flex-1"
              >
                <Scan className="w-4 h-4 mr-2" />
                Simulate Scan
              </Button>
              <Button 
                onClick={handleUnlock}
                disabled={unlocking || !qrCode.trim()}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {unlocking ? 'Unlocking...' : 'Unlock & Start Trip'}
              </Button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-blue-800">
                <strong>How to unlock:</strong> Locate the bike at the station, find the QR code on the dock, 
                and either scan it or click "Simulate Scan" to start your trip.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
