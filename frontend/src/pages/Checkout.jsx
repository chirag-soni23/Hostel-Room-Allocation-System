import { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  IndianRupee,
  Shield,
  CreditCard,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useBookingStore } from "@/stores/bookingStore";
import { usePaymentStore } from "@/stores/paymentStore";
function loadRazorpay() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Failed to load Razorpay"));
    document.body.appendChild(script);
  });
}

export default function Checkout() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { draft, getBookingById, booking } = useBookingStore();
  const { createOrder, verifyPayment, btnLoading } = usePaymentStore();

  useEffect(() => {
    if (bookingId) getBookingById(bookingId).catch(() => {});
  }, [bookingId, getBookingById]);

  const room = useMemo(
    () => draft?.room || booking?.room || null,
    [draft?.room, booking?.room]
  );

  const imgSrc =
    room?.photos?.[0] ||
    room?.images?.[0] ||
    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=200&h=150&fit=crop";

  const roomNumber = room?.number ?? room?.roomNumber ?? "-";
  const roomType = room?.type ?? "-";
  const roomGender = room?.genderPreference ?? room?.gender ?? "any";
  const hostelName =
    draft?.room?.hostel?.name ||
    booking?.hostel?.name ||
    room?.hostel?.name ||
    "-";

  const months = draft?.months || booking?.durationMonths || 1;
  const monthlyRent = Number(
    draft?.room?.monthlyRent ??
      booking?.monthlyRentSnapshot ??
      draft?.room?.pricePerMonth ??
      0
  );
  const totalAmount =
    draft?.totalAmount ?? Math.max(0, Number(monthlyRent) * Number(months));

  const handlePayment = async () => {
    try {
      if (!bookingId) {
        toast.error("Missing booking reference.");
        return;
      }

      await loadRazorpay();

      const order = await createOrder(bookingId);

      const options = {
        key: order.key,
        amount: order.amount,
        currency: order.currency || "INR",
        name: hostelName || "Hostel Booking",
        description: `Room ${roomNumber} • ${months} month(s)`,
        order_id: order.orderId,
        handler: async function (response) {
          try {
            const {
              razorpay_payment_id,
              razorpay_order_id,
              razorpay_signature,
            } = response;

            await verifyPayment({
              razorpay_order_id,
              razorpay_payment_id,
              razorpay_signature,
            });

            navigate(
              `/payment/success?orderId=${encodeURIComponent(
                razorpay_order_id
              )}&paymentId=${encodeURIComponent(razorpay_payment_id)}`
            );
          } catch (e) {
            navigate(
              `/payment/failure?orderId=${encodeURIComponent(order.orderId)}`
            );
          }
        },
        modal: {
          ondismiss: function () {
            toast.message("Payment cancelled");
          },
        },
        notes: { bookingId: order.bookingId },
        theme: { color: "#4f46e5" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        navigate(
          `/payment/failure?orderId=${encodeURIComponent(order.orderId)}`
        );
      });
      rzp.open();
    } catch (err) {
      toast.error(err?.message || "Unable to start payment");
    }
  };

  if (!room) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">No booking found</h1>
          <Button onClick={() => navigate("/rooms")}>Browse Rooms</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
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
              <h2 className="font-display text-xl font-semibold mb-4">
                Room Details
              </h2>
              <div className="flex gap-4">
                <img
                  src={imgSrc}
                  alt={`Room ${roomNumber}`}
                  className="w-32 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Room {roomNumber}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {hostelName}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary">{roomType}</Badge>
                    <Badge variant="outline">{roomGender}</Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <h2 className="font-display text-xl font-semibold mb-4">
                Booking Details
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Check-in Date
                    </p>
                    <p className="font-medium">
                      {draft?.checkInDate
                        ? new Date(draft.checkInDate).toLocaleDateString(
                            "en-IN",
                            { day: "numeric", month: "long", year: "numeric" }
                          )
                        : booking?.checkInDate
                        ? new Date(booking.checkInDate).toLocaleDateString(
                            "en-IN",
                            { day: "numeric", month: "long", year: "numeric" }
                          )
                        : "Not selected"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium">
                      {months} month{Number(months) > 1 ? "s" : ""}
                    </p>
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
              <h2 className="font-display text-xl font-semibold">
                Payment Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Room rent ({months} months)
                  </span>
                  <span>
                    ₹{(Number(monthlyRent) * Number(months)).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Security deposit
                  </span>
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
                    {Number(totalAmount).toLocaleString()}
                  </span>
                </div>
              </div>

              <Button
                variant="default"
                size="lg"
                className="w-full"
                onClick={handlePayment}
                disabled={btnLoading}
              >
                <CreditCard className="h-5 w-5 mr-2" />
                {btnLoading ? "Processing..." : "Pay Now"}
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
