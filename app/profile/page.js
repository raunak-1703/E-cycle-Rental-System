'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bike, Wallet, ArrowLeft, User, Mail, CreditCard, CheckCircle } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recharging, setRecharging] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) {
        router.push('/login');
        return;
      }

      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
    } catch (error) {
      console.error('Error:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleRecharge = async (amount) => {
    setRecharging(true);
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/wallet/recharge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Recharge failed');
      }

      // Update user data
      setUser({ ...user, wallet: data.wallet });
      localStorage.setItem('user', JSON.stringify({ ...user, wallet: data.wallet }));
      setSuccess(true);

      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setRecharging(false);
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
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile & Wallet</h1>

        {/* Profile Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-gray-600">
                  <User className="w-4 h-4" />
                  Full Name
                </Label>
                <Input value={user?.name || ''} disabled className="bg-gray-50" />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input value={user?.email || ''} disabled className="bg-gray-50" />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-gray-600">
                  <CreditCard className="w-4 h-4" />
                  ID Card Number
                </Label>
                <Input value={user?.idCardNumber || 'N/A'} disabled className="bg-gray-50" />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-gray-600">
                  <User className="w-4 h-4" />
                  Account Type
                </Label>
                <Input value={user?.role || ''} disabled className="bg-gray-50 capitalize" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wallet Section */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Wallet Balance</CardTitle>
                <CardDescription>Add money to your wallet</CardDescription>
              </div>
              <div className="bg-green-100 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Wallet className="w-6 h-6 text-green-600" />
                  <span className="text-3xl font-bold text-green-900">₹{user?.wallet || 0}</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5" />
                <span>Wallet recharged successfully!</span>
              </div>
            )}

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Quick recharge options (for demo purposes - simulated payment)
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  onClick={() => handleRecharge(50)}
                  disabled={recharging}
                  variant="outline"
                  className="h-20 flex-col"
                >
                  <span className="text-2xl font-bold">₹50</span>
                  <span className="text-xs text-gray-500">Add Money</span>
                </Button>
                <Button
                  onClick={() => handleRecharge(100)}
                  disabled={recharging}
                  variant="outline"
                  className="h-20 flex-col"
                >
                  <span className="text-2xl font-bold">₹100</span>
                  <span className="text-xs text-gray-500">Add Money</span>
                </Button>
                <Button
                  onClick={() => handleRecharge(200)}
                  disabled={recharging}
                  variant="outline"
                  className="h-20 flex-col"
                >
                  <span className="text-2xl font-bold">₹200</span>
                  <span className="text-xs text-gray-500">Add Money</span>
                </Button>
                <Button
                  onClick={() => handleRecharge(500)}
                  disabled={recharging}
                  variant="outline"
                  className="h-20 flex-col"
                >
                  <span className="text-2xl font-bold">₹500</span>
                  <span className="text-xs text-gray-500">Add Money</span>
                </Button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Minimum balance of ₹5 is required to book a bike. 
                  Fare is calculated as ₹5 base + ₹1 per minute.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Account Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Member Since</p>
                <p className="text-lg font-semibold">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <p className="text-lg font-semibold text-green-600">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
