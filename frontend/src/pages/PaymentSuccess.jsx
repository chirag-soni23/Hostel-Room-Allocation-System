import { useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Download, ArrowRight, Mail } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useBookingStore } from '@/stores/bookingStore';
import { usePaymentStore } from '@/stores/paymentStore';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const { clearDraft } = useBookingStore();
  const { getMyPayments, myPayments, btnLoading } = usePaymentStore();

  const orderId = searchParams.get('orderId') || '';
  const paymentId = searchParams.get('paymentId') || '';

  useEffect(() => {
    clearDraft();
    getMyPayments().catch(() => {});
  }, []);

  const paymentEntry = useMemo(() => {
    return (myPayments || []).find(
      (p) => (orderId && p.orderId === orderId) || (paymentId && p.paymentId === paymentId)
    );
  }, [myPayments, orderId, paymentId]);

  const formatINR = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(
      Number(n || 0)
    );

  const drawRow = (doc, y, label, value) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 80, 80);
    doc.text(label, 16, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(20, 20, 20);
    doc.text(String(value || '-'), 75, y);
  };

  const handleDownloadReceipt = async () => {
    try {
      await getMyPayments();
      const pay =
        paymentEntry ||
        (myPayments || []).find(
          (p) => (orderId && p.orderId === orderId) || (paymentId && p.paymentId === paymentId)
        );

      if (!pay) {
        toast.error('Receipt details not found yet. Please try again in a moment.');
        return;
      }

      const doc = new jsPDF('p', 'mm', 'a4');
      const pageW = doc.internal.pageSize.getWidth();

      doc.setFillColor(32, 63, 224);
      doc.roundedRect(0, 0, pageW, 38, 0, 0, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.text('Payment Receipt', 16, 22);

      doc.setFontSize(10);
      doc.setTextColor(220, 226, 255);
      doc.text('Hostel Booking System', 16, 30);

      doc.setFillColor(34, 197, 94);
      doc.setDrawColor(34, 197, 94);
      doc.setTextColor(255, 255, 255);
      const badgeW = 30;
      doc.roundedRect(pageW - badgeW - 16, 12, badgeW, 14, 3, 3, 'FD');
      doc.setFontSize(11);
      doc.text('PAID', pageW - badgeW - 16 + badgeW / 2, 21, { align: 'center', baseline: 'middle' });

      const metaTop = 48;
      doc.setDrawColor(230);
      doc.setFillColor(248, 249, 251);
      doc.roundedRect(12, metaTop, pageW - 24, 28, 3, 3, 'F');

      doc.setFontSize(10);
      doc.setTextColor(120, 120, 120);
      doc.text('Order ID', 18, metaTop + 8);
      doc.text('Payment ID', 18, metaTop + 18);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text(String(pay.orderId || orderId || '-'), 55, metaTop + 8);
      doc.text(String(pay.paymentId || paymentId || '-'), 55, metaTop + 18);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(120, 120, 120);
      doc.text('Paid At', pageW - 16, metaTop + 8, { align: 'right' });
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text(
        new Date(pay?.createdAt || Date.now()).toLocaleString('en-IN'),
        pageW - 16,
        metaTop + 18,
        { align: 'right' }
      );

      let y = metaTop + 42;
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text('Booking Details', 16, y);

      y += 6;
      doc.setDrawColor(238);
      doc.line(16, y, pageW - 16, y);

      y += 10;

      drawRow(doc, y, 'Hostel', pay?.hostel?.name || '-');
      y += 8;
      drawRow(doc, y, 'Location', pay?.hostel?.location || '-');
      y += 8;
      drawRow(doc, y, 'Room', pay?.room ? `${pay.room.number || ''} ${pay.room.type ? `(${pay.room.type})` : ''}`.trim() : '-');
      y += 8;

      let y2 = metaTop + 58;
      const col2X = 120;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(80, 80, 80);
      doc.text('Status', col2X, y2);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(20, 20, 20);
      doc.text(String((pay.status || 'paid')).toUpperCase(), col2X + 40, y2);
      y2 += 8;

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(80, 80, 80);
      doc.text('Amount', col2X, y2);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(20, 20, 20);
      doc.text(formatINR(pay.amount), col2X + 40, y2);
      y2 += 8;

      const sumTop = Math.max(y + 10, y2 + 10);
      doc.setDrawColor(230);
      doc.setFillColor(250, 250, 250);
      doc.roundedRect(12, sumTop, pageW - 24, 30, 3, 3, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(11);
      doc.text('Summary', 16, sumTop + 9);

      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text('Total Paid', 16, sumTop + 22);
      doc.setFont('helvetica', 'bold');
      doc.text(formatINR(pay.amount), pageW - 16, sumTop + 22, { align: 'right' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text('This is a system-generated receipt for your records.', 16, 286);
      doc.text('© ' + new Date().getFullYear() + ' Hostel Booking System', pageW - 16, 286, { align: 'right' });

      const filename = `receipt_${pay.orderId || orderId || 'booking'}.pdf`;
      doc.save(filename);
      toast.success('Receipt downloaded');
    } catch {
      toast.error('Could not generate receipt');
    }
  };

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

          <h1 className="text-3xl font-display font-bold mb-2">Payment Successful!</h1>
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
            <Button variant="outline" className="gap-2" onClick={handleDownloadReceipt} disabled={btnLoading}>
              <Download className="h-4 w-4" />
              Download Receipt
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/bookings">
                View My Bookings
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>

          <div className="mt-8 p-4 rounded-lg bg-muted/50 flex items-center gap-3 text-sm text-muted-foreground">
            <Mail className="h-5 w-5 shrink-0" />
            <span>A confirmation email has been sent to your registered email address with all the booking details.</span>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
