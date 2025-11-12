'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Bike, MapPin, Battery, Wallet, Shield } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Bike className="w-16 h-16 text-green-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            CYCLOAN
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Sustainable, convenient, and affordable transportation for your campus journey
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={() => router.push('/login')} 
              size="lg" 
              className="bg-green-600 hover:bg-green-700 text-white px-8"
            >
              Sign In
            </Button>
            <Button 
              onClick={() => router.push('/register')} 
              size="lg" 
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50 px-8"
            >
              Register
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Multiple Stations</h3>
            <p className="text-gray-600">
              Pick up and drop off bikes at any campus station. Convenient locations everywhere.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Battery className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Electric Bikes</h3>
            <p className="text-gray-600">
              Eco-friendly e-bikes with long battery life for your daily commute.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Wallet className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Affordable Pricing</h3>
            <p className="text-gray-600">
              Pay-as-you-go pricing starting at ₹5 + ₹1 per minute. No hidden fees.
            </p>
          </Card>
        </div>

        {/* How It Works */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h4 className="font-semibold mb-2">Find a Station</h4>
              <p className="text-sm text-gray-600">Locate nearby stations on the map</p>
            </div>
            <div className="text-center">
              <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h4 className="font-semibold mb-2">Reserve a Bike</h4>
              <p className="text-sm text-gray-600">Book available bike instantly</p>
            </div>
            <div className="text-center">
              <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h4 className="font-semibold mb-2">Unlock & Ride</h4>
              <p className="text-sm text-gray-600">Scan QR code to start your trip</p>
            </div>
            <div className="text-center">
              <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h4 className="font-semibold mb-2">Return Anywhere</h4>
              <p className="text-sm text-gray-600">Drop off at any station</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 bg-green-600 text-white rounded-2xl p-12">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10+</div>
              <div className="text-green-100">E-Bikes Available</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">4</div>
              <div className="text-green-100">Campus Stations</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-green-100">Service Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-8 mt-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <Bike className="w-8 h-8 mr-2" />
            <span className="text-xl font-semibold">CYCLOAN</span>
          </div>
          <p className="text-gray-400 text-sm">© 2025 CYCLOAN. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
