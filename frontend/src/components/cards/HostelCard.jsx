import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MapPin, Wifi, Car, Utensils, Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const amenityIcons = {
  wifi: Wifi,
  parking: Car,
  mess: Utensils,
  security: Shield,
  laundry: Shield,   
  laundary: Shield,  
};

const toArray = (v) => {
  if (Array.isArray(v)) return v;
  if (typeof v === "string") return v.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
};

const titleCase = (s = "") =>
  s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export function HostelCard({ hostel, index = 0 }) {
  const photo =
    hostel?.photo ||
    hostel?.images?.[0] ||
    "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=450&fit=crop";

  const amenities = toArray(hostel?.amenities);
  const shown = amenities.slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="glass-card overflow-hidden group hover-lift"
    >
      <div className="relative overflow-hidden aspect-[16/9]">
        <img
          src={photo}
          alt={hostel?.name || "Hostel"}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="font-display text-xl font-bold text-foreground">
            {hostel?.name}
          </h3>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
            <MapPin className="h-3.5 w-3.5" />
            {hostel?.location || hostel?.city || hostel?.address || "—"}
          </p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex flex-wrap gap-2">
          {shown.map((amenity) => {
            const key = String(amenity).toLowerCase();
            const Icon = amenityIcons[key] || Shield;
            return (
              <Badge
                key={amenity}
                variant="secondary"
                className="flex items-center gap-1.5"
              >
                <Icon className="h-3 w-3" />
                {titleCase(key)}
              </Badge>
            );
          })}
          {amenities.length > 4 && (
            <Badge variant="outline">+{amenities.length - 4} more</Badge>
          )}
        </div>

        <Button variant="ghost" className="w-full group/btn" asChild>
          <Link to={`/rooms?hostelId=${hostel?._id || hostel?.id}`}>
            View Rooms
            <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
