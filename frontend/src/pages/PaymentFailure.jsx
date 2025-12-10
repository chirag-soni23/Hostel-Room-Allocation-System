import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle, RefreshCw, ArrowRight, HelpCircle } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';

export default function PaymentFailure() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

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
            className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-destructive/20 mb-6"
          >
            <XCircle className="h-12 w-12 text-destructive" />
          </motion.div>

          <h1 className="text-3xl font-display font-bold mb-2">
            Payment Failed
          </h1>
          <p className="text-muted-foreground mb-8">
            We couldn't process your payment. Please try again or use a different payment method.
          </p>

          {orderId && (
            <div className="glass-card p-6 text-left mb-8">
              <h3 className="font-semibold mb-4">Order Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order ID</span>
                  <span className="font-mono">{orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="text-destructive font-medium">Failed</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" className="gap-2">
              <HelpCircle className="h-4 w-4" />
              Get Help
            </Button>
            <Button variant="hero" asChild>
              <Link to="/rooms">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Link>
            </Button>
          </div>

          <div className="mt-8 space-y-2 text-sm text-muted-foreground">
            <p>Common reasons for payment failure:</p>
            <ul className="list-disc list-inside text-left max-w-xs mx-auto space-y-1">
              <li>Insufficient funds</li>
              <li>Card declined by bank</li>
              <li>Network connectivity issues</li>
              <li>Incorrect card details</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
