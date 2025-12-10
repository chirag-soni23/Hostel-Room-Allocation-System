import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Search,
  Building2,
  Users,
  Shield,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function Hero() {
  const [searchQuery, setSearchQuery] = useState("");

  const features = [
    { icon: Building2, label: "500+ Hostels" },
    { icon: Users, label: "10K+ Students" },
    { icon: Shield, label: "Verified Listings" },
  ];

  return (
    <section className="relative overflow-hidden bg-background">
      {/* Dark overlay (dark mode only) */}
      <div className="absolute inset-0 pointer-events-none opacity-0 dark:opacity-100 transition-opacity bg-[linear-gradient(to_bottom,rgba(10,10,10,0.8),rgba(10,10,10,0.6),transparent)]" />

      {/* Light gradient (light mode only) */}
      <div className="absolute inset-0 pointer-events-none dark:opacity-0 opacity-100 transition-opacity bg-[radial-gradient(80%_60%_at_50%_0%,rgba(255,255,255,0.9),transparent_60%),linear-gradient(to_bottom,rgba(255,255,255,0.9),transparent)]" />

      {/* Subtle pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAwMDAiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-20 dark:opacity-40" />

      {/* Gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-3xl bg-primary/10 dark:bg-primary/20" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full blur-3xl bg-accent/10 dark:bg-accent/20" />

      <div className="relative container mx-auto px-4 py-24 lg:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary"
          >
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Find Your Perfect Stay</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight text-foreground"
          >
            Modern Hostel Living{" "}
            <span className="gradient-text">Made Simple</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Discover comfortable, affordable hostel rooms near your college.
            Book instantly with secure payments and 24/7 support.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-3 max-w-xl mx-auto"
          >
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by city or hostel name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-base w-full bg-white/70 dark:bg-card/50 border border-border/60 rounded-xl"
              />
            </div>

            {/* Search Button */}
            <Button
              variant="default"
              asChild
              className="h-14 px-6 text-base flex items-center gap-2 rounded-xl shadow-sm hover:shadow-md transition-all"
            >
              <Link to={`/rooms${searchQuery ? `?q=${searchQuery}` : ""}`}>
                Search Rooms
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-8 pt-8"
          >
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-muted-foreground"
              >
                <feature.icon className="h-5 w-5 text-primary" />
                <span className="font-medium">{feature.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
