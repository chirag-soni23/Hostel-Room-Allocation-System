import { motion } from 'framer-motion';
import { Building2, Users, BedDouble, IndianRupee, TrendingUp, Calendar } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { KPICard } from '@/components/cards/KPICard';
import { mockKPIData, mockBookings } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusStyles = {
  PENDING: 'status-pending',
  PAID: 'status-paid',
  CANCELLED: 'status-cancelled',
  ALLOTTED: 'status-allotted',
};

export default function AdminDashboard() {
  const kpis = [
    {
      title: 'Total Rooms',
      value: mockKPIData.totalRooms,
      icon: BedDouble,
      variant: 'default',
      trend: { value: 5, isPositive: true },
    },
    {
      title: 'Occupied Rooms',
      value: mockKPIData.occupiedRooms,
      icon: Users,
      variant: 'primary',
      subtitle: `${Math.round((mockKPIData.occupiedRooms / mockKPIData.totalRooms) * 100)}% occupancy`,
    },
    {
      title: 'Vacant Rooms',
      value: mockKPIData.vacantRooms,
      icon: Building2,
      variant: 'warning',
    },
    {
      title: 'Revenue MTD',
      value: `₹${(mockKPIData.revenueMTD / 1000).toFixed(0)}K`,
      icon: IndianRupee,
      variant: 'success',
      trend: { value: 12, isPositive: true },
    },
    {
      title: 'New Bookings',
      value: mockKPIData.newBookings,
      icon: TrendingUp,
      variant: 'primary',
      subtitle: 'This month',
    },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-display font-bold mb-2">
            Admin <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your hostel operations.
          </p>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-8">
          {kpis.map((kpi, index) => (
            <KPICard
              key={kpi.title}
              title={kpi.title}
              value={kpi.value}
              icon={kpi.icon}
              variant={kpi.variant}
              trend={kpi.trend}
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-semibold">Recent Bookings</h2>
            <Badge variant="secondary">{mockBookings.length} total</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Booking ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Room</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Check-in</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {mockBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono text-sm">#{booking.id}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
                          <BedDouble className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span>Room {booking.room?.roomNumber}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(booking.checkInDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium">
                      ₹{booking.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={cn('status-badge', statusStyles[booking.status])}>
                        {booking.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
