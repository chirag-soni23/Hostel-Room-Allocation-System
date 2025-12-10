import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Users, 
  Bed, 
  IndianRupee, 
  Check, 
  Calendar,
  ArrowLeft,
  Wifi,
  Shield,
  Car
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { mockRooms } from '@/data/mockData';
import { useAuthStore } from '@/stores/authStore';
import { useBookingStore } from '@/stores/bookingStore';

export default function RoomDetail() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { isAuth } = useAuthStore();
  const { setRoom, setDraft } = useBookingStore();
  
  const [checkInDate, setCheckInDate] = useState('');
  const [months, setMonths] = useState('1');
  
  const room = mockRooms.find(r => r.id === roomId);
  
  if (!room) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Room not found</h1>
          <Button onClick={() => navigate('/rooms')}>Back to Rooms</Button>
        </div>
      </Layout>
    );
  }

  const availableSpots = room.capacity - room.occupied;
  const isAvailable = availableSpots > 0 && room.isAvailable;
  const totalAmount = room.pricePerMonth * parseInt(months);

  const handleBookNow = () => {
    if (!isAuth) {
      toast.error('Please login to book a room');
      navigate('/login');
      return;
    }

    if (!checkInDate) {
      toast.error('Please select a check-in date');
      return;
    }

    setRoom(room);
    setDraft({ checkInDate, months: parseInt(months) });
    
    // Navigate to checkout (mock booking ID)
    const mockBookingId = `booking_${Date.now()}`;
    navigate(`/checkout/${mockBookingId}`);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card overflow-hidden"
            >
              <div className="relative aspect-[16/9]">
                <img
                  src={room.images[0] || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&h=675&fit=crop'}
                  alt={`Room ${room.roomNumber}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge variant={isAvailable ? 'default' : 'secondary'} className={
                    isAvailable ? 'bg-success' : 'bg-destructive'
                  }>
                    {isAvailable ? 'Available' : 'Full'}
                  </Badge>
                  <Badge variant="secondary">{room.type}</Badge>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6 space-y-6"
            >
              <div>
                <h1 className="text-2xl sm:text-3xl font-display font-bold">
                  Room {room.roomNumber}
                </h1>
                {room.hostel && (
                  <p className="text-muted-foreground flex items-center gap-2 mt-2">
                    <MapPin className="h-4 w-4" />
                    {room.hostel.name}, {room.hostel.address}, {room.hostel.city}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <Bed className="h-5 w-5 mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-semibold">{room.type}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <Users className="h-5 w-5 mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">Capacity</p>
                  <p className="font-semibold">{room.capacity} person{room.capacity > 1 ? 's' : ''}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <Shield className="h-5 w-5 mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="font-semibold">{room.gender}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <Check className="h-5 w-5 mx-auto mb-2 text-success" />
                  <p className="text-sm text-muted-foreground">Available</p>
                  <p className="font-semibold">{availableSpots} spot{availableSpots !== 1 ? 's' : ''}</p>
                </div>
              </div>

              {room.hostel && (
                <div>
                  <h3 className="font-semibold mb-3">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {room.hostel.amenities.map((amenity) => (
                      <Badge key={amenity} variant="outline" className="flex items-center gap-1.5">
                        {amenity === 'WiFi' && <Wifi className="h-3 w-3" />}
                        {amenity === 'Security' && <Shield className="h-3 w-3" />}
                        {amenity === 'Parking' && <Car className="h-3 w-3" />}
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {room.hostel && room.hostel.rules.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Hostel Rules</h3>
                  <ul className="space-y-2">
                    {room.hostel.rules.map((rule, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          </div>

          {/* Booking Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:sticky lg:top-24 h-fit"
          >
            <div className="glass-card p-6 space-y-6">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Rent</p>
                  <div className="flex items-center text-3xl font-bold text-primary">
                    <IndianRupee className="h-6 w-6" />
                    {room.pricePerMonth.toLocaleString()}
                  </div>
                </div>
                <span className="text-muted-foreground">/month</span>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="checkIn">Check-in Date</Label>
                  <Input
                    id="checkIn"
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="months">Duration</Label>
                  <Select value={months} onValueChange={setMonths}>
                    <SelectTrigger className="mt-1.5">
                      <Calendar className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 6, 12].map((m) => (
                        <SelectItem key={m} value={m.toString()}>
                          {m} month{m > 1 ? 's' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">
                    ₹{room.pricePerMonth.toLocaleString()} × {months} month{parseInt(months) > 1 ? 's' : ''}
                  </span>
                  <span>₹{totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-primary">₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <Button 
                variant="outline" 
                size="lg" 
                className="w-full"
                disabled={!isAvailable}
                onClick={handleBookNow}
              >
                {isAvailable ? 'Book Now' : 'Room Full'}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Secure payment powered by Razorpay
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
