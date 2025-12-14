import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Users,
  BedDouble,
  IndianRupee,
  TrendingUp,
  Calendar,
  Plus,
  User as UserIcon,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { KPICard } from "@/components/cards/KPICard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useRoomStore } from "@/stores/roomStore";
import { usePaymentStore } from "@/stores/paymentStore";
import { useBookingStore } from "@/stores/bookingStore";

const statusStyles = {
  pending: "status-pending",
  confirmed: "status-paid",
  cancelled: "status-cancelled",
  completed: "status-allotted",
};

export default function AdminDashboard() {
  const { rooms, fetchRooms, total: roomsTotal, loading: roomsLoading } = useRoomStore();
  const { payments, adminListPayments, loading: payLoading } = usePaymentStore();
  const { adminBookings, adminListBookings, loading: bookingsLoading } = useBookingStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchRooms({ page: 1, limit: 100 });
    adminListBookings({ page: 1, limit: 50, sort: "createdAt:desc" });
    adminListPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { totalRooms, occupiedRooms, vacantRooms, revenueMTD, newBookings } = useMemo(() => {
    const totalRooms = roomsTotal || rooms.length || 0;

    const occupiedRooms = rooms.reduce((sum, r) => {
      const cap = Number(r.capacity || 0);
      const occ = Math.min(Number(r.occupied || 0), cap);
      return sum + occ;
    }, 0);

    const vacantRooms = rooms.reduce((sum, r) => {
      const cap = Number(r.capacity || 0);
      const occ = Math.min(Number(r.occupied || 0), cap);
      return sum + Math.max(cap - occ, 0);
    }, 0);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const revenueMTD = (payments || [])
      .filter(
        (p) =>
          String(p.status).toLowerCase() === "paid" &&
          new Date(p.createdAt) >= monthStart
      )
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const newBookings = (adminBookings || []).filter(
      (b) => new Date(b.createdAt) >= monthStart
    ).length;

    return { totalRooms, occupiedRooms, vacantRooms, revenueMTD, newBookings };
  }, [rooms, roomsTotal, payments, adminBookings]);

  const kpis = [
    { title: "Total Rooms", value: totalRooms, icon: BedDouble, variant: "default" },
    {
      title: "Occupied Rooms",
      value: occupiedRooms,
      icon: Users,
      variant: "primary",
      subtitle: `${totalRooms ? Math.round((occupiedRooms / totalRooms) * 100) : 0}% occupancy`,
    },
    { title: "Vacant Rooms", value: vacantRooms, icon: Building2, variant: "warning" },
    { title: "Revenue MTD", value: `₹${(revenueMTD / 1000).toFixed(0)}K`, icon: IndianRupee, variant: "success" },
    { title: "New Bookings", value: newBookings, icon: TrendingUp, variant: "primary", subtitle: "This month" },
  ];

  const filteredBookings = adminBookings.filter((b) => {
    const user = b.user || {};
    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    const roomNum = String(b.room?.number || "");
    const email = user.email || "";
    return (
      fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      roomNum.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(b._id).toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const currentBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-start justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-display font-bold mb-2">
              Admin <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-muted-foreground">
              Overview of your hostel operations and customer bookings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button asChild className="shrink-0" variant="outline">
              <Link to="/admin/rooms/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Room
              </Link>
            </Button>
            <Button asChild className="shrink-0">
              <Link to="/admin/hostels/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Hostel
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-8">
          {kpis.map((kpi, index) => (
            <KPICard
              key={kpi.title}
              title={kpi.title}
              value={kpi.value}
              icon={kpi.icon}
              variant={kpi.variant}
              subtitle={kpi.subtitle}
              index={index}
            />
          ))}
        </div>

        {/* Recent Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name, email, room, or ID..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="max-w-xs"
              />
            </div>

            <Badge variant="secondary">{filteredBookings.length} total</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border/60 bg-muted/40">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Booking ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Room</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Check-in</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>

              <tbody>
                {currentBookings.map((b) => {
                  const user = b.user || {};
                  const fullName =
                    user.firstName || user.lastName
                      ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                      : user.name || "-";
                  return (
                    <tr
                      key={b._id}
                      className="border-b border-border/50 hover:bg-muted/30 transition-all duration-200"
                    >
                      <td className="py-3 px-4 align-top">
                        <div
                          className="font-mono text-xs text-muted-foreground max-w-[160px] whitespace-pre-wrap break-all leading-5"
                          title={b._id}
                        >
                          #{b._id}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="h-9 w-9 rounded-md bg-muted flex items-center justify-center">
                            <BedDouble className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="leading-tight">
                            <p className="font-medium">
                              Room {b.room?.number || "-"}{" "}
                              <span className="text-xs text-muted-foreground">
                                {b.room?.type ? `(${b.room.type})` : ""}
                              </span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {b.hostel?.name || ""}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-0.5 text-sm leading-tight">
                          <div className="flex items-center gap-1.5 font-medium">
                            <UserIcon className="h-3.5 w-3.5 text-primary" />
                            {fullName}
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Mail className="h-3.5 w-3.5" />
                            <span className="truncate max-w-[200px]">
                              {user.email || "-"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Phone className="h-3.5 w-3.5" />
                            <span>{user.phone || "-"}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {b.checkInDate
                            ? new Date(b.checkInDate).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                              })
                            : "-"}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-medium">
                        ₹{Number(b.totalAmount || 0).toLocaleString()}
                      </td>

                      <td className="py-3 px-4">
                        <Badge
                          className={cn(
                            "status-badge px-3 py-1 text-xs font-semibold",
                            statusStyles[String(b.status).toLowerCase()] || "status-pending"
                          )}
                        >
                          {String(b.status).toUpperCase()}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}

                {(roomsLoading || payLoading || bookingsLoading) && (
                  <tr>
                    <td colSpan={6} className="py-6 px-4 text-center text-muted-foreground">
                      Loading…
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Prev
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
