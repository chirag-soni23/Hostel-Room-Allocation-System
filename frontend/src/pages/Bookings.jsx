import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, IndianRupee, Clock, ExternalLink } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockBookings } from '@/data/mockData';
import { cn } from '@/lib/utils';

const statusStyles = {
  PENDING: 'status-pending',
  PAID: 'status-paid',
  CANCELLED: 'status-cancelled',
  ALLOTTED: 'status-allotted',
};

export default function Bookings() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-display font-bold mb-2">
            My <span className="gradient-text">Bookings</span>
          </h1>
          <p className="text-muted-foreground">
            View and manage your room bookings
          </p>
        </motion.div>

        <div className="space-y-4">
          {mockBookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Room Image */}
                <div className="lg:w-48 shrink-0">
                  <img
                    src={
                      booking.room?.images[0] ||
                      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=300&h=200&fit=crop'
                    }
                    alt={`Room ${booking.room?.roomNumber}`}
                    className="w-full h-32 lg:h-full object-cover rounded-lg"
                  />
                </div>

                {/* Booking Details */}
                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display text-xl font-semibold">
                        Room {booking.room?.roomNumber}
                      </h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {booking.room?.hostel?.name}
                      </p>
                    </div>
                    <Badge className={cn('status-badge', statusStyles[booking.status])}>
                      {booking.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        Check-in
                      </p>
                      <p className="font-medium mt-1">
                        {new Date(booking.checkInDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        Duration
                      </p>
                      <p className="font-medium mt-1">
                        {booking.months} month{booking.months > 1 ? 's' : ''}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground flex items-center gap-1">
                        <IndianRupee className="h-3.5 w-3.5" />
                        Total
                      </p>
                      <p className="font-medium mt-1 text-primary">
                        ₹{booking.totalAmount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Payment</p>
                      <Badge
                        variant={booking.paymentStatus === 'PAID' ? 'default' : 'secondary'}
                        className="mt-1"
                      >
                        {booking.paymentStatus}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {booking.status === 'PENDING' && (
                      <Button variant="hero" size="sm" asChild>
                        <Link to={`/checkout/${booking.id}`}>Pay Now</Link>
                      </Button>
                    )}
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/rooms/${booking.roomId}`}>
                        View Room
                        <ExternalLink className="h-3.5 w-3.5 ml-1" />
                      </Link>
                    </Button>
                    {booking.status === 'PENDING' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                      >
                        Cancel Booking
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {mockBookings.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 glass-card"
            >
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
                <Calendar className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No bookings yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by browsing available rooms
              </p>
              <Button variant="hero" asChild>
                <Link to="/rooms">Browse Rooms</Link>
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
}
