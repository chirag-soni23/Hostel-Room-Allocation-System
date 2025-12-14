import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Calendar,
  MapPin,
  IndianRupee,
  Clock,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useBookingStore } from "@/stores/bookingStore";

const statusStyles = {
  pending: "status-pending",
  confirmed: "status-paid",
  cancelled: "status-cancelled",
  completed: "status-allotted",
};

export default function Bookings() {
  const {
    bookings,
    total,
    loading,
    getMyBookings,
    cancelMyBooking,
  } = useBookingStore();

  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    getMyBookings({ page, limit }).catch(() => {});
  }, [page, limit, getMyBookings]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((total || 0) / limit)),
    [total, limit]
  );

  const onCancel = async (id) => {
    await cancelMyBooking(id);
    getMyBookings({ page, limit }).catch(() => {});
  };

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

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading bookings…</span>
          </div>
        )}

        {!loading && bookings.length === 0 && (
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

        <div className="space-y-4">
          {bookings.map((b, index) => {
            const roomImg =
              b.room?.photos?.[0] ||
              "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=300&h=200&fit=crop";
            const status = String(b.status || "pending").toLowerCase();
            const months = b.durationMonths || 1;
            const totalAmount = b.totalAmount ?? (b.monthlyRentSnapshot || 0) * months;
            const paymentStatus = status === "confirmed" ? "PAID" : status.toUpperCase();

            return (
              <motion.div
                key={b._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card p-6"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Room Image */}
                  <div className="lg:w-48 shrink-0">
                    <img
                      src={roomImg}
                      alt={`Room ${b.room?.number || "-"}`}
                      className="w-full h-32 lg:h-full object-cover rounded-lg"
                    />
                  </div>

                  {/* Booking Details */}
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h3 className="font-display text-xl font-semibold">
                          Room {b.room?.number || "-"}
                        </h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {b.hostel?.name || "-"}
                        </p>
                      </div>
                      <Badge
                        className={cn(
                          "status-badge",
                          statusStyles[status] || "status-pending"
                        )}
                      >
                        {status.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          Check-in
                        </p>
                        <p className="font-medium mt-1">
                          {b.checkInDate
                            ? new Date(b.checkInDate).toLocaleDateString(
                                "en-IN",
                                { day: "numeric", month: "short", year: "numeric" }
                              )
                            : "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          Duration
                        </p>
                        <p className="font-medium mt-1">
                          {months} month{months > 1 ? "s" : ""}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground flex items-center gap-1">
                          <IndianRupee className="h-3.5 w-3.5" />
                          Total
                        </p>
                        <p className="font-medium mt-1 text-primary">
                          ₹{Number(totalAmount).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Payment</p>
                        <Badge
                          variant={paymentStatus === "PAID" ? "default" : "secondary"}
                          className="mt-1"
                        >
                          {paymentStatus}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {status === "pending" && (
                        <Button variant="hero" size="sm" asChild>
                          <Link to={`/checkout/${b._id}`}>Pay Now</Link>
                        </Button>
                      )}
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/rooms/${b.room?._id || b.room}`} >
                          View Room
                          <ExternalLink className="h-3.5 w-3.5 ml-1" />
                        </Link>
                      </Button>
                      {status === "pending" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => onCancel(b._id)}
                        >
                          Cancel Booking
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {bookings.length > 0 && (
          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
