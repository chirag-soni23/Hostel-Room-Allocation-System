import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RoomCard } from '@/components/cards/RoomCard';

import { useRoomStore } from '@/stores/roomStore';

export function FeaturedRooms() {
  const { rooms, fetchRooms, loading } = useRoomStore();

  // Fetch all rooms from API
  useEffect(() => {
    fetchRooms();
  }, []);

  // Featured = only available + slice 3
  const featuredRooms = rooms
    .filter((r) => r.available === true || r.isActive === true)
    .slice(0, 3);

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12"
        >
          <div>
            <h2 className="text-3xl sm:text-4xl font-display font-bold">
              Featured <span className="gradient-text">Rooms</span>
            </h2>
            <p className="text-muted-foreground mt-2">
              Hand-picked rooms with the best value and amenities
            </p>
          </div>
          <Button variant="ghost" asChild className="group">
            <Link to="/rooms">
              View All Rooms
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="h-52 bg-muted rounded-xl animate-pulse" />
            <div className="h-52 bg-muted rounded-xl animate-pulse" />
            <div className="h-52 bg-muted rounded-xl animate-pulse" />
          </div>
        )}

        {/* Featured Rooms */}
        {!loading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredRooms.map((room, index) => (
              <RoomCard key={room._id} room={room} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
