import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Station from '@/lib/models/Station';
import Bike from '@/lib/models/Bike';
import Trip from '@/lib/models/Trip';
import Reservation from '@/lib/models/Reservation';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || 'ecycle-secret-key-2025';

// Helper to verify JWT token
function verifyToken(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request) {
  try {
    await connectDB();
    const { pathname } = new URL(request.url);
    const path = pathname.replace('/api', '');

    // GET /api/seed - Initialize database with mock data
    if (path === '/seed') {
      // Clear existing data
      await User.deleteMany({});
      await Station.deleteMany({});
      await Bike.deleteMany({});
      await Trip.deleteMany({});
      await Reservation.deleteMany({});

      // Create admin user
      const adminId = uuidv4();
      await User.create({
        _id: adminId,
        name: 'Admin User',
        email: 'admin@campus.com',
        passwordHash: await bcrypt.hash('admin123', 10),
        role: 'admin',
        wallet: 1000
      });

      // Create sample users
      const user1Id = uuidv4();
      const user2Id = uuidv4();
      await User.create([
        {
          _id: user1Id,
          name: 'John Doe',
          email: 'john@student.com',
          passwordHash: await bcrypt.hash('password123', 10),
          role: 'user',
          wallet: 100,
          idCardNumber: 'STU001'
        },
        {
          _id: user2Id,
          name: 'Jane Smith',
          email: 'jane@student.com',
          passwordHash: await bcrypt.hash('password123', 10),
          role: 'user',
          wallet: 150,
          idCardNumber: 'STU002'
        }
      ]);

      // Create stations
      const stations = [
        { name: 'Main Library', lat: 28.5449, lng: 77.1926, totalDocks: 10 },
        { name: 'Engineering Block', lat: 28.5460, lng: 77.1936, totalDocks: 8 },
        { name: 'Student Center', lat: 28.5440, lng: 77.1916, totalDocks: 12 },
        { name: 'Sports Complex', lat: 28.5470, lng: 77.1946, totalDocks: 6 }
      ];

      const createdStations = [];
      for (const station of stations) {
        const stationId = uuidv4();
        const docks = [];
        for (let i = 1; i <= station.totalDocks; i++) {
          docks.push({ dockId: `${station.name.replace(/\\s+/g, '-')}-D${i}`, bikeId: null });
        }
        
        const newStation = await Station.create({
          _id: stationId,
          name: station.name,
          location: { lat: station.lat, lng: station.lng },
          totalDocks: station.totalDocks,
          availableBikes: 0,
          docks
        });
        createdStations.push(newStation);
      }

      // Create bikes and assign to stations
      const bikeNumbers = ['EC001', 'EC002', 'EC003', 'EC004', 'EC005', 'EC006', 'EC007', 'EC008', 'EC009', 'EC010'];
      let bikeIndex = 0;
      
      for (const station of createdStations) {
        const numBikes = Math.min(Math.floor(station.totalDocks * 0.6), bikeNumbers.length - bikeIndex);
        
        for (let i = 0; i < numBikes && bikeIndex < bikeNumbers.length; i++) {
          const bikeId = uuidv4();
          await Bike.create({
            _id: bikeId,
            bikeNumber: bikeNumbers[bikeIndex],
            batteryLevel: Math.floor(Math.random() * 30) + 70,
            status: 'available',
            currentStation: station._id
          });

          // Assign bike to dock
          station.docks[i].bikeId = bikeId;
          station.availableBikes++;
          bikeIndex++;
        }
        
        await station.save();
      }

      return NextResponse.json({ 
        message: 'Database seeded successfully',
        credentials: {
          admin: { email: 'admin@campus.com', password: 'admin123' },
          user: { email: 'john@student.com', password: 'password123' }
        }
      }, { headers: corsHeaders });
    }

    // GET /api/auth/me - Get current user
    if (path === '/auth/me') {
      const user = verifyToken(request);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
      }
      const userData = await User.findOne({ _id: user.userId }).select('-passwordHash');
      return NextResponse.json(userData, { headers: corsHeaders });
    }

    // GET /api/stations - Get all stations
    if (path === '/stations') {
      const stations = await Station.find({});
      return NextResponse.json(stations, { headers: corsHeaders });
    }

    // GET /api/stations/:id - Get station by ID
    if (path.startsWith('/stations/') && path.split('/').length === 3) {
      const stationId = path.split('/')[2];
      const station = await Station.findOne({ _id: stationId });
      if (!station) {
        return NextResponse.json({ error: 'Station not found' }, { status: 404, headers: corsHeaders });
      }
      
      // Get bikes at this station
      const bikes = await Bike.find({ currentStation: stationId, status: { $in: ['available', 'reserved'] } });
      return NextResponse.json({ station, bikes }, { headers: corsHeaders });
    }

    // GET /api/bikes - Get all bikes
    if (path === '/bikes') {
      const bikes = await Bike.find({});
      return NextResponse.json(bikes, { headers: corsHeaders });
    }

    // GET /api/reservations/active - Get user's active reservation
    if (path === '/reservations/active') {
      const user = verifyToken(request);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
      }
      
      const reservation = await Reservation.findOne({ 
        userId: user.userId,
        expiresAt: { $gt: new Date() }
      });
      
      if (reservation) {
        const bike = await Bike.findOne({ _id: reservation.bikeId });
        const station = await Station.findOne({ _id: reservation.stationId });
        return NextResponse.json({ reservation, bike, station }, { headers: corsHeaders });
      }
      
      return NextResponse.json({ reservation: null }, { headers: corsHeaders });
    }

    // GET /api/trips/active - Get user's active trip
    if (path === '/trips/active') {
      const user = verifyToken(request);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
      }
      
      const trip = await Trip.findOne({ userId: user.userId, status: 'ongoing' });
      if (trip) {
        const bike = await Bike.findOne({ _id: trip.bikeId });
        const startStation = await Station.findOne({ _id: trip.startStation });
        return NextResponse.json({ trip, bike, startStation }, { headers: corsHeaders });
      }
      
      return NextResponse.json({ trip: null }, { headers: corsHeaders });
    }

    // GET /api/trips/history - Get user's trip history
    if (path === '/trips/history') {
      const user = verifyToken(request);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
      }
      
      const trips = await Trip.find({ userId: user.userId, status: 'completed' }).sort({ endTime: -1 });
      return NextResponse.json(trips, { headers: corsHeaders });
    }

    // GET /api/trips - Get all trips (admin)
    if (path === '/trips') {
      const user = verifyToken(request);
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
      }
      
      const trips = await Trip.find({}).sort({ startTime: -1 });
      return NextResponse.json(trips, { headers: corsHeaders });
    }

    // GET /api/users - Get all users (admin)
    if (path === '/users') {
      const user = verifyToken(request);
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
      }
      
      const users = await User.find({}).select('-passwordHash');
      return NextResponse.json(users, { headers: corsHeaders });
    }

    // GET /api/admin/stats - Get admin dashboard stats
    if (path === '/admin/stats') {
      const user = verifyToken(request);
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
      }
      
      const totalBikes = await Bike.countDocuments({});
      const totalStations = await Station.countDocuments({});
      const totalUsers = await User.countDocuments({ role: 'user' });
      const activeTrips = await Trip.countDocuments({ status: 'ongoing' });
      const completedTrips = await Trip.find({ status: 'completed' });
      const totalRevenue = completedTrips.reduce((sum, trip) => sum + trip.fare, 0);
      
      return NextResponse.json({
        totalBikes,
        totalStations,
        totalUsers,
        activeTrips,
        totalRevenue
      }, { headers: corsHeaders });
    }

    return NextResponse.json({ message: 'E-Cycle API is running' }, { headers: corsHeaders });

  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const { pathname } = new URL(request.url);
    const path = pathname.replace('/api', '');
    const body = await request.json();

    // POST /api/auth/register - Register new user
    if (path === '/auth/register') {
      const { name, email, password, idCardNumber } = body;
      
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 400, headers: corsHeaders });
      }

      const userId = uuidv4();
      const passwordHash = await bcrypt.hash(password, 10);
      
      const user = await User.create({
        _id: userId,
        name,
        email,
        passwordHash,
        role: 'user',
        wallet: 100,
        idCardNumber
      });

      const token = jwt.sign({ userId: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      
      return NextResponse.json({ 
        token, 
        user: { _id: user._id, name: user.name, email: user.email, role: user.role, wallet: user.wallet } 
      }, { headers: corsHeaders });
    }

    // POST /api/auth/login - Login user
    if (path === '/auth/login') {
      const { email, password } = body;
      
      const user = await User.findOne({ email });
      if (!user) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401, headers: corsHeaders });
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401, headers: corsHeaders });
      }

      const token = jwt.sign({ userId: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      
      return NextResponse.json({ 
        token, 
        user: { _id: user._id, name: user.name, email: user.email, role: user.role, wallet: user.wallet } 
      }, { headers: corsHeaders });
    }

    // POST /api/reservations - Create a reservation
    if (path === '/reservations') {
      const user = verifyToken(request);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
      }

      const { bikeId, stationId } = body;

      // Check if user already has active reservation
      const existingReservation = await Reservation.findOne({
        userId: user.userId,
        expiresAt: { $gt: new Date() }
      });
      
      if (existingReservation) {
        return NextResponse.json({ error: 'You already have an active reservation' }, { status: 400, headers: corsHeaders });
      }

      // Check if user has active trip
      const activeTrip = await Trip.findOne({ userId: user.userId, status: 'ongoing' });
      if (activeTrip) {
        return NextResponse.json({ error: 'You already have an active trip' }, { status: 400, headers: corsHeaders });
      }

      // Check bike availability
      const bike = await Bike.findOne({ _id: bikeId });
      if (!bike || bike.status !== 'available') {
        return NextResponse.json({ error: 'Bike not available' }, { status: 400, headers: corsHeaders });
      }

      // Create reservation (expires in 10 minutes)
      const reservationId = uuidv4();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      
      const reservation = await Reservation.create({
        _id: reservationId,
        userId: user.userId,
        bikeId,
        stationId,
        expiresAt
      });

      // Update bike status
      bike.status = 'reserved';
      await bike.save();

      return NextResponse.json(reservation, { headers: corsHeaders });
    }

    // POST /api/unlock - Unlock bike and start trip
    if (path === '/unlock') {
      const user = verifyToken(request);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
      }

      const { reservationId, qrCode } = body;

      // Find reservation
      const reservation = await Reservation.findOne({ _id: reservationId, userId: user.userId });
      if (!reservation) {
        return NextResponse.json({ error: 'Reservation not found' }, { status: 404, headers: corsHeaders });
      }

      // Check if reservation expired
      if (new Date() > reservation.expiresAt) {
        return NextResponse.json({ error: 'Reservation expired' }, { status: 400, headers: corsHeaders });
      }

      // Validate QR code (in real app, this would verify against bike's QR)
      // For MVP, we just check if something was entered
      if (!qrCode || qrCode.trim() === '') {
        return NextResponse.json({ error: 'Invalid QR code' }, { status: 400, headers: corsHeaders });
      }

      // Start trip
      const tripId = uuidv4();
      const trip = await Trip.create({
        _id: tripId,
        userId: user.userId,
        bikeId: reservation.bikeId,
        startStation: reservation.stationId,
        startTime: new Date(),
        status: 'ongoing'
      });

      // Update bike status
      await Bike.updateOne({ _id: reservation.bikeId }, { status: 'rented' });

      // Update user's active trip
      await User.updateOne({ _id: user.userId }, { activeTripId: tripId });

      // Delete reservation
      await Reservation.deleteOne({ _id: reservationId });

      return NextResponse.json(trip, { headers: corsHeaders });
    }

    // POST /api/return - Return bike and end trip
    if (path === '/return') {
      const user = verifyToken(request);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
      }

      const { tripId, endStationId } = body;

      // Find trip
      const trip = await Trip.findOne({ _id: tripId, userId: user.userId, status: 'ongoing' });
      if (!trip) {
        return NextResponse.json({ error: 'Trip not found' }, { status: 404, headers: corsHeaders });
      }

      // Calculate trip duration and fare
      const endTime = new Date();
      const durationMs = endTime - new Date(trip.startTime);
      const durationMinutes = Math.ceil(durationMs / (1000 * 60));
      
      // Simulate distance (1 km per 5 minutes)
      const distanceKm = Math.round((durationMinutes / 5) * 10) / 10;
      
      // Calculate fare: ₹5 base + ₹1 per minute
      const fare = 5 + durationMinutes;

      // Check user wallet
      const userData = await User.findOne({ _id: user.userId });
      if (userData.wallet < fare) {
        return NextResponse.json({ error: 'Insufficient wallet balance' }, { status: 400, headers: corsHeaders });
      }

      // Update trip
      trip.endStation = endStationId;
      trip.endTime = endTime;
      trip.distanceKm = distanceKm;
      trip.fare = fare;
      trip.status = 'completed';
      await trip.save();

      // Deduct fare from wallet
      userData.wallet -= fare;
      userData.activeTripId = null;
      await userData.save();

      // Update bike status and location
      const bike = await Bike.findOne({ _id: trip.bikeId });
      bike.status = 'available';
      bike.currentStation = endStationId;
      bike.batteryLevel = Math.max(20, bike.batteryLevel - Math.floor(durationMinutes / 2));
      await bike.save();

      // Update station - remove bike from old station's dock and add to new station's dock
      const startStation = await Station.findOne({ _id: trip.startStation });
      if (startStation) {
        const dockIndex = startStation.docks.findIndex(d => d.bikeId === trip.bikeId);
        if (dockIndex !== -1) {
          startStation.docks[dockIndex].bikeId = null;
          startStation.availableBikes = Math.max(0, startStation.availableBikes - 1);
          await startStation.save();
        }
      }

      const endStation = await Station.findOne({ _id: endStationId });
      if (endStation) {
        const emptyDockIndex = endStation.docks.findIndex(d => d.bikeId === null);
        if (emptyDockIndex !== -1) {
          endStation.docks[emptyDockIndex].bikeId = trip.bikeId;
          endStation.availableBikes += 1;
          await endStation.save();
        }
      }

      return NextResponse.json({ trip, remainingBalance: userData.wallet }, { headers: corsHeaders });
    }

    // POST /api/wallet/recharge - Recharge wallet
    if (path === '/wallet/recharge') {
      const user = verifyToken(request);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
      }

      const { amount } = body;
      
      if (!amount || amount <= 0) {
        return NextResponse.json({ error: 'Invalid amount' }, { status: 400, headers: corsHeaders });
      }

      const userData = await User.findOne({ _id: user.userId });
      userData.wallet += amount;
      await userData.save();

      return NextResponse.json({ wallet: userData.wallet }, { headers: corsHeaders });
    }

    // POST /api/stations - Create station (admin)
    if (path === '/stations') {
      const user = verifyToken(request);
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
      }

      const { name, location, totalDocks } = body;
      
      const stationId = uuidv4();
      const docks = [];
      for (let i = 1; i <= totalDocks; i++) {
        docks.push({ dockId: `${name.replace(/\\s+/g, '-')}-D${i}`, bikeId: null });
      }

      const station = await Station.create({
        _id: stationId,
        name,
        location,
        totalDocks,
        availableBikes: 0,
        docks
      });

      return NextResponse.json(station, { headers: corsHeaders });
    }

    // POST /api/bikes - Create bike (admin)
    if (path === '/bikes') {
      const user = verifyToken(request);
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
      }

      const { bikeNumber, batteryLevel, currentStation } = body;
      
      const bikeId = uuidv4();
      const bike = await Bike.create({
        _id: bikeId,
        bikeNumber,
        batteryLevel: batteryLevel || 100,
        status: 'available',
        currentStation
      });

      return NextResponse.json(bike, { headers: corsHeaders });
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404, headers: corsHeaders });

  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function PATCH(request) {
  try {
    await connectDB();
    const { pathname } = new URL(request.url);
    const path = pathname.replace('/api', '');
    const body = await request.json();

    // PATCH /api/bikes/:id - Update bike (admin)
    if (path.startsWith('/bikes/')) {
      const user = verifyToken(request);
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
      }

      const bikeId = path.split('/')[2];
      const bike = await Bike.findOne({ _id: bikeId });
      
      if (!bike) {
        return NextResponse.json({ error: 'Bike not found' }, { status: 404, headers: corsHeaders });
      }

      Object.assign(bike, body);
      await bike.save();

      return NextResponse.json(bike, { headers: corsHeaders });
    }

    // PATCH /api/stations/:id - Update station (admin)
    if (path.startsWith('/stations/')) {
      const user = verifyToken(request);
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
      }

      const stationId = path.split('/')[2];
      const station = await Station.findOne({ _id: stationId });
      
      if (!station) {
        return NextResponse.json({ error: 'Station not found' }, { status: 404, headers: corsHeaders });
      }

      Object.assign(station, body);
      await station.save();

      return NextResponse.json(station, { headers: corsHeaders });
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404, headers: corsHeaders });

  } catch (error) {
    console.error('PATCH Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function DELETE(request) {
  try {
    await connectDB();
    const { pathname } = new URL(request.url);
    const path = pathname.replace('/api', '');

    // DELETE /api/stations/:id - Delete station (admin)
    if (path.startsWith('/stations/')) {
      const user = verifyToken(request);
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
      }

      const stationId = path.split('/')[2];
      await Station.deleteOne({ _id: stationId });

      return NextResponse.json({ message: 'Station deleted' }, { headers: corsHeaders });
    }

    // DELETE /api/bikes/:id - Delete bike (admin)
    if (path.startsWith('/bikes/')) {
      const user = verifyToken(request);
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
      }

      const bikeId = path.split('/')[2];
      await Bike.deleteOne({ _id: bikeId });

      return NextResponse.json({ message: 'Bike deleted' }, { headers: corsHeaders });
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404, headers: corsHeaders });

  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}