import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Calendar, Clock, IndianRupee, Shield, CreditCard } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useBookingStore } from '@/stores/bookingStore';

export default function Checkout() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { draft } = useBookingStore();

  const handlePayment = async () => {
    // Mock Razorpay payment
    toast.info('Opening Razorpay checkout...');
    
    // Simulate payment process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock success
    toast.success('Payment successful!');
    navigate(`/payment/success?orderId=order_${Date.now()}&paymentId=pay_${Date.now()}`);
  };

  if (!draft.room) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">No booking found</h1>
          <Button onClick={() => navigate('/rooms')}>Browse Rooms</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-display font-bold mb-2">
            Complete Your <span className="gradient-text">Booking</span>
          </h1>
          <p className="text-muted-foreground">
            Review your booking details and proceed to payment
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Booking Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="glass-card p-6">
              <h2 className="font-display text-xl font-semibold mb-4">Room Details</h2>
              <div className="flex gap-4">
                <img
                  src={draft.room.images[0] || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=200&h=150&fit=crop'}
                  alt={`Room ${draft.room.roomNumber}`}
                  className="w-32 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Room {draft.room.roomNumber}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {draft.room.hostel?.name}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary">{draft.room.type}</Badge>
                    <Badge variant="outline">{draft.room.gender}</Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <h2 className="font-display text-xl font-semibold mb-4">Booking Details</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Check-in Date</p>
                    <p className="font-medium">
                      {draft.checkInDate ? new Date(draft.checkInDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      }) : 'Not selected'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium">{draft.months} month{draft.months > 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Payment Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="glass-card p-6 sticky top-24 space-y-6">
              <h2 className="font-display text-xl font-semibold">Payment Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Room rent ({draft.months} months)</span>
                  <span>₹{(draft.room.pricePerMonth * draft.months).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Security deposit</span>
                  <span>₹0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Processing fee</span>
                  <span>₹0</span>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="flex items-center text-primary">
                    <IndianRupee className="h-5 w-5" />
                    {draft.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              <Button 
                variant="hero" 
                size="lg" 
                className="w-full"
                onClick={handlePayment}
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Pay Now
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Secure payment powered by Razorpay</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
