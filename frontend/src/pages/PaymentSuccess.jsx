import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Download, ArrowRight, Mail } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useBookingStore } from '@/stores/bookingStore';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const { clearDraft, draft } = useBookingStore();

  const orderId = searchParams.get('orderId');
  const paymentId = searchParams.get('paymentId');

  useEffect(() => {
    // Clear the booking draft after successful payment
    clearDraft();
  }, [clearDraft]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg mx-auto text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-success/20 mb-6"
          >
            <CheckCircle className="h-12 w-12 text-success" />
          </motion.div>

          <h1 className="text-3xl font-display font-bold mb-2">
            Payment Successful!
          </h1>
          <p className="text-muted-foreground mb-8">
            Your booking has been confirmed. You will receive a confirmation email shortly.
          </p>

          <div className="glass-card p-6 text-left mb-8">
            <h3 className="font-semibold mb-4">Booking Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-mono">{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment ID</span>
                <span className="font-mono">{paymentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="text-success font-medium">Confirmed</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Download Receipt
            </Button>
            <Button variant="hero" asChild>
              <Link to="/bookings">
                View My Bookings
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>

          <div className="mt-8 p-4 rounded-lg bg-muted/50 flex items-center gap-3 text-sm text-muted-foreground">
            <Mail className="h-5 w-5 shrink-0" />
            <span>
              A confirmation email has been sent to your registered email address with all the booking details.
            </span>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
