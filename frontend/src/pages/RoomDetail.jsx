import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
  Car,
  Loader2,
} from "lucide-react";

import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

import { useAuthStore } from "@/stores/authStore";
import { useBookingStore } from "@/stores/bookingStore";
import { useRoomStore } from "@/stores/roomStore";

export default function RoomDetail() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const { isAuth } = useAuthStore();
  const {
    setRoom,
    setDraft,
    createBooking,
    getMyBookings,
    bookings,
    btnLoading,
  } = useBookingStore();
  const { room, fetchRoomById, loading } = useRoomStore();

  const [checkInDate, setCheckInDate] = useState("");
  const [months, setMonths] = useState("1");

  useEffect(() => {
    if (roomId) fetchRoomById(roomId);
  }, [roomId, fetchRoomById]);

  // fetch user's confirmed bookings (to detect already-paid room)
  useEffect(() => {
    if (isAuth) {
      getMyBookings({ status: "confirmed", page: 1, limit: 50, sort: "createdAt:desc" }).catch(() => {});
    }
  }, [isAuth, getMyBookings]);

  const availableSpots = useMemo(() => {
    const cap = Number(room?.capacity ?? 0);
    const occ = Number(room?.occupied ?? 0);
    return Math.max(cap - occ, 0);
  }, [room?.capacity, room?.occupied]);

  const isAvailable = Boolean(availableSpots > 0 && room?.isActive);

  // is this room already paid (confirmed) by current user?
  const isPaid = useMemo(() => {
    if (!room?._id || !Array.isArray(bookings)) return false;
    return bookings.some(
      (b) =>
        (b.room?._id || b.room)?.toString() === room._id.toString() &&
        b.status === "confirmed"
    );
  }, [bookings, room?._id]);

  const totalAmount = useMemo(
    () => Number(room?.monthlyRent ?? 0) * Number(months || 1),
    [room?.monthlyRent, months]
  );

  const handleBookNow = async () => {
    try {
      if (isPaid) {
        toast.info("You already paid for this room.");
        return;
      }
      if (!isAuth) {
        toast.error("Please login to book a room");
        navigate("/login");
        return;
      }
      if (!checkInDate) {
        toast.error("Please select a check-in date");
        return;
      }
      if (!isAvailable) {
        toast.error("Room is not available");
        return;
      }

      setRoom(room);
      setDraft({
        checkInDate,
        months: Number(months),
        totalAmount,
      });

      const created = await createBooking({
        roomId: room._id,
        hostelId: room.hostelId || room.hostel?._id,
        checkInDate,
        durationMonths: Number(months),
      });

      navigate(`/checkout/${created._id}`);
    } catch {
      // errors toasted in store
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-xl">Loading room...</h1>
        </div>
      </Layout>
    );
  }

  if (!room?._id) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Room not found</h1>
          <Button onClick={() => navigate("/rooms")}>Back to Rooms</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden">
              <div className="relative aspect-[16/9]">
                <img
                  src={room?.photos?.[0] || "https://images.unsplash.com/photo-1631049307264-da0ec9d70304"}
                  alt={`Room ${room.number}`}
                  className="w-full h-full object-cover"
                />

                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge variant={isAvailable ? "default" : "secondary"} className={isAvailable ? "bg-success" : "bg-destructive"}>
                    {isAvailable ? "Available" : "Full"}
                  </Badge>
                  <Badge variant="secondary">{room.type}</Badge>
                  {isPaid && (
                    <Badge variant="secondary" className="bg-primary text-primary-foreground">
                      PAID
                    </Badge>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Room Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6 space-y-6"
            >
              <div>
                <h1 className="text-2xl sm:text-3xl font-display font-bold">Room {room.number}</h1>
                <p className="text-muted-foreground flex items-center gap-2 mt-2">
                  <MapPin className="h-4 w-4" />
                  {room.location}
                </p>
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
                  <p className="font-semibold">{room.capacity}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <Shield className="h-5 w-5 mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="font-semibold">{room.genderPreference}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <Check className="h-5 w-5 mx-auto mb-2 text-success" />
                  <p className="text-sm text-muted-foreground">Available</p>
                  <p className="font-semibold">{availableSpots} spots</p>
                </div>
              </div>

              {room.amenities?.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {room.amenities.map((a) => (
                      <Badge key={a} variant="outline" className="flex items-center gap-1.5">
                        {a.toLowerCase().includes("wifi") && <Wifi className="h-3 w-3" />}
                        {a.toLowerCase().includes("security") && <Shield className="h-3 w-3" />}
                        {a.toLowerCase().includes("parking") && <Car className="h-3 w-3" />}
                        {a}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Booking Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:sticky lg:top-24 h-fit">
            <div className="glass-card p-6 space-y-6">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Rent</p>
                  <div className="flex items-center text-3xl font-bold text-primary">
                    <IndianRupee className="h-6 w-6" />
                    {(room.monthlyRent ?? 0).toLocaleString()}
                  </div>
                </div>
                <span className="text-muted-foreground">/month</span>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Check-in Date</Label>
                  <Input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Duration</Label>
                  <Select value={months} onValueChange={setMonths}>
                    <SelectTrigger className="mt-1.5">
                      <Calendar className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Select months" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 3, 6, 9, 12].map((m) => (
                        <SelectItem value={m.toString()} key={m}>
                          {m} month{m > 1 ? "s" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">
                    ₹{room.monthlyRent} × {months} months
                  </span>
                  <span>₹{totalAmount}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-primary">₹{totalAmount}</span>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full"
                disabled={!isAvailable || btnLoading || isPaid}
                onClick={handleBookNow}
                aria-busy={btnLoading}
              >
                {btnLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Booking…
                  </>
                ) : isPaid ? (
                  <>PAID</>
                ) : (
                  <> {isAvailable ? "Book Now" : "Room Full"} </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">Secure payment powered by Razorpay</p>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
