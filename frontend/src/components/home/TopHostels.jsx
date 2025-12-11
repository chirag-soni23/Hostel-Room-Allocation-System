import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HostelCard } from "@/components/cards/HostelCard";
import { useHostelStore } from "@/stores/hostelStore";

export function TopHostels() {
  const { fetchHostels, hostels = [], loading } = useHostelStore();

  useEffect(() => {
    fetchHostels();
  }, []);

  const items = Array.isArray(hostels) ? hostels.slice(0, 3) : [];

  return (
    <section className="py-20">
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
              Top <span className="gradient-text">Hostels</span>
            </h2>
            <p className="text-muted-foreground mt-2">
              Most popular hostels loved by students
            </p>
          </div>
          <Button variant="ghost" asChild className="group">
            <Link to="/hostels">
              View All Hostels
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-64 rounded-xl border bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((hostel, index) => (
              <HostelCard key={hostel._id || index} hostel={hostel} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
