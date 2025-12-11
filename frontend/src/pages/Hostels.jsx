import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { HostelCard } from "@/components/cards/HostelCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useHostelStore } from "@/stores/hostelStore";
import api from "@/lib/axios";

export default function Hostels() {
  const { fetchHostels, hostels, loading, total } = useHostelStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [cities, setCities] = useState(["All Cities"]);

  const [page, setPage] = useState(1);
  const limit = 12;

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/hostel/cities/list");
        const list = Array.isArray(data?.data) ? data.data : [];
        setCities(["All Cities", ...list]);
      } catch {
        setCities(["All Cities"]);
      }
    })();
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchHostels({ page, limit });
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchHostels({
        q: searchQuery || undefined,
        city: selectedCity !== "All Cities" ? selectedCity : undefined,
        page,
        limit,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery, selectedCity, page]);

  const items = useMemo(
    () => (Array.isArray(hostels) ? hostels : hostels?.items || []),
    [hostels]
  );

  const totalPages = Math.max(1, Math.ceil((total || items.length) / limit));

  const goto = (p) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-display font-bold mb-2">
            Explore <span className="gradient-text">Hostels</span>
          </h1>
          <p className="text-muted-foreground">
            Find verified hostels with top amenities across major cities
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-card p-4 mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search hostels..."
                value={searchQuery}
                onChange={(e) => {
                  setPage(1);
                  setSearchQuery(e.target.value);
                }}
                className="pl-10"
              />
            </div>
            <div className="flex gap-3">
              <Select
                value={selectedCity}
                onValueChange={(v) => {
                  setPage(1);
                  setSelectedCity(v);
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <MapPin className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" title="More filters soon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Grid */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: limit }).map((_, i) => (
              <div
                key={i}
                className="h-64 rounded-xl border bg-muted/40 animate-pulse"
              />
            ))}
          </div>
        ) : items.length > 0 ? (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {items.map((hostel, index) => (
                <HostelCard
                  key={hostel._id || hostel.id || index}
                  hostel={hostel}
                  index={index}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goto(page - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Prev
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const p = i + 1;
                    // compact: show first, last, current ±1
                    const show =
                      p === 1 ||
                      p === totalPages ||
                      Math.abs(p - page) <= 1;
                    if (!show) return i === 1 || i === totalPages - 2 ? (
                      <span key={p} className="px-2 text-muted-foreground">…</span>
                    ) : null;
                    return (
                      <Button
                        key={p}
                        variant={p === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => goto(p)}
                      >
                        {p}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goto(page + 1)}
                  disabled={page === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
              <MapPin className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No hostels found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or city
            </p>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
