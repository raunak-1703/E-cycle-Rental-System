'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cycle, Battery, ArrowLeft } from 'lucide-react';

export default function Admincycles() {
  const router = useRouter();
  const [cycles, setcycles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchcycles();
  }, []);

  const fetchcycles = async () => {
    try {
      const res = await fetch('/api/bikes');
      const data = await res.json();
      setcycles(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-600';
      case 'rented': return 'bg-blue-600';
      case 'reserved': return 'bg-orange-600';
      case 'maintenance': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center">
        <cycle className="w-16 h-16 text-green-600 animate-pulse" />
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
          <h1 className="text-3xl font-bold text-gray-900">Manage cycles</h1>
          <Badge variant="secondary">{cycles.length} cycles</Badge>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cycles.map((cycle) => (
            <Card key={cycle._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="flex items-center gap-2">
                    <cycle className="w-5 h-5" />
                    {cycle.cycleNumber}
                  </CardTitle>
                  <Badge className={getStatusColor(cycle.status)}>
                    {cycle.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Battery className="w-4 h-4" />
                        Battery Level
                      </div>
                      <span className="font-semibold">{cycle.batteryLevel}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          cycle.batteryLevel > 50 ? 'bg-green-600' : 'bg-orange-600'
                        }`}
                        style={{ width: `${cycle.batteryLevel}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <div className="text-sm text-gray-600">Current Location</div>
                    <div className="font-semibold text-sm">
                      {cycle.currentStation ? 'At Station' : 'Unknown'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
