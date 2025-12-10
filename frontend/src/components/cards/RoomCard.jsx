import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, Bed, IndianRupee, MapPin, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function RoomCard({ room, index = 0 }) {
  const availableSpots = room.capacity - room.occupied;
  const isAvailable = availableSpots > 0 && room.isAvailable;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="room-card group"
    >
      <div className="relative overflow-hidden">
        <img
          src={
            room.images[0] ||
            'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&h=400&fit=crop'
          }
          alt={`Room ${room.roomNumber}`}
          className="room-card-image transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge
            variant={isAvailable ? 'default' : 'secondary'}
            className={cn(
              isAvailable ? 'bg-success/90 hover:bg-success' : 'bg-destructive/90'
            )}
          >
            {isAvailable ? (
              <Check className="h-3 w-3 mr-1" />
            ) : (
              <X className="h-3 w-3 mr-1" />
            )}
            {isAvailable ? 'Available' : 'Full'}
          </Badge>
          <Badge
            variant="secondary"
            className="bg-background/90 backdrop-blur-sm"
          >
            {room.type}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Badge
            variant="outline"
            className="bg-background/90 backdrop-blur-sm border-0"
          >
            {room.gender}
          </Badge>
        </div>
      </div>

      <div className="room-card-content">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display font-semibold text-lg">
              Room {room.roomNumber}
            </h3>
            {room.hostel && (
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-3.5 w-3.5" />
                {room.hostel.name}
              </p>
            )}
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end text-lg font-bold text-primary">
              <IndianRupee className="h-4 w-4" />
              {room.pricePerMonth.toLocaleString()}
            </div>
            <span className="text-xs text-muted-foreground">/month</span>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Bed className="h-4 w-4" />
            <span>{room.type}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            <span>
              {availableSpots} of {room.capacity} spots
            </span>
          </div>
        </div>

        <div className="flex gap-2 pt-3">
          <Button variant="outline" className="flex-1" asChild>
            <Link to={`/rooms/${room.id}`}>View Details</Link>
          </Button>
          {isAvailable && (
            <Button variant="default" className="flex-1" asChild>
              <Link to={`/rooms/${room.id}`}>Book Now</Link>
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
