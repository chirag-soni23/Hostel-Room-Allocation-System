import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  Users,
  Shield,
  ArrowRight,
  Sparkles,
  Search,
  MapPin,
  BedDouble,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/axios";

function DropdownPortal({ anchorRef, open, children }) {
  const [style, setStyle] = useState({});

  useEffect(() => {
    if (!open || !anchorRef?.current) return;
    const update = () => {
      const r = anchorRef.current.getBoundingClientRect();
      setStyle({
        position: "fixed",
        left: r.left,
        top: r.bottom + 8,
        width: r.width,
        zIndex: 60,
      });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, anchorRef]);

  if (!open) return null;
  return createPortal(
    <div
      data-portal="suggestions"
      style={style}
      className="rounded-xl border bg-popover text-popover-foreground shadow-lg overflow-hidden"
    >
      {children}
    </div>,
    document.body
  );
}

export function Hero() {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [sugs, setSugs] = useState([]); 

  const inputRef = useRef(null);
  const abortRef = useRef(null);
  const debRef = useRef(null);

  const features = useMemo(
    () => [
      { icon: Building2, label: "500+ Hostels" },
      { icon: Users, label: "10K+ Students" },
      { icon: Shield, label: "Verified Listings" },
    ],
    []
  );

  useEffect(() => {
    if (debRef.current) clearTimeout(debRef.current);
    if (!query?.trim()) {
      setSugs([]);
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    debRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        if (abortRef.current) abortRef.current.abort();
        abortRef.current = new AbortController();

        const params = (extra = {}) => ({
          params: { q: query, page: 1, limit: 5, ...extra },
          signal: abortRef.current.signal,
        });

        const [hostelsRes, roomsRes] = await Promise.all([
          api.get("/hostel", params()),
          api.get("/room", params()),
        ]);

        const hostels = Array.isArray(hostelsRes?.data?.data?.items)
          ? hostelsRes.data.data.items
          : Array.isArray(hostelsRes?.data?.data)
          ? hostelsRes.data.data
          : [];

        const rooms = Array.isArray(roomsRes?.data?.data?.items)
          ? roomsRes.data.data.items
          : Array.isArray(roomsRes?.data?.data)
          ? roomsRes.data.data
          : [];

        const mapped = [
          ...hostels.map((h) => ({
            _id: h._id,
            type: "hostel",
            title: h.name,
            subtitle: h.location || h.city || "Hostel",
          })),
          ...rooms.map((r) => ({
            _id: r._id,
            type: "room",
            title: `Room ${r.number} • ${r.type}`,
            subtitle: r?.hostel?.name ? r.hostel.name : r.location || "Room",
            hostelId: r?.hostel?._id,
          })),
        ].slice(0, 8);

        setSugs(mapped);
        setOpen(mapped.length > 0);
        setActiveIndex(mapped.length ? 0 : -1);
      } catch (e) {
        if (e?.name !== "CanceledError") {
          setSugs([]);
          setOpen(false);
          setActiveIndex(-1);
        }
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(debRef.current);
  }, [query]);

  useEffect(() => {
    const onClick = (e) => {
      const withinInput = inputRef.current?.contains(e.target);
      const withinPortal = (e.target.closest?.("[data-portal='suggestions']")) != null;
      if (!withinInput && !withinPortal) setOpen(false);
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  const goTo = (item) => {
    if (!item) {
      navigate(`/rooms${query ? `?q=${encodeURIComponent(query)}` : ""}`);
      return;
    }
    if (item.type === "hostel") {
      navigate(`/rooms?hostelId=${item._id}`);
    } else if (item.type === "room") {
      navigate(`/rooms/${item._id}`);
    }
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (!open || !sugs.length) {
      if (e.key === "Enter") goTo(null);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % sugs.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + sugs.length) % sugs.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      goTo(sugs[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <section className="relative overflow-hidden bg-background">
      {/* Overlays & decorations */}
      <div className="absolute inset-0 pointer-events-none opacity-0 dark:opacity-100 transition-opacity bg-[linear-gradient(to_bottom,rgba(10,10,10,0.8),rgba(10,10,10,0.6),transparent)]" />
      <div className="absolute inset-0 pointer-events-none dark:opacity-0 opacity-100 transition-opacity bg-[radial-gradient(80%_60%_at_50%_0%,rgba(255,255,255,0.9),transparent_60%),linear-gradient(to_bottom,rgba(255,255,255,0.9),transparent)]" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAwMDAiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-20 dark:opacity-40" />
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
            Modern Hostel Living <span className="gradient-text">Made Simple</span>
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

          {/* Search + Suggestions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="max-w-xl mx-auto"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              <Input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setOpen(true);
                }}
                onKeyDown={onKeyDown}
                placeholder="Search rooms or hostels..."
                className="pl-12 h-14 text-base w-full bg-white/70 dark:bg-card/50 border border-border/60 rounded-xl"
                autoComplete="off"
              />
            </div>

            {/* Portal dropdown: z-index high + scrollable list */}
            <DropdownPortal anchorRef={inputRef} open={open}>
              {loading ? (
                <div className="px-4 py-3 text-sm text-muted-foreground">Searching…</div>
              ) : sugs.length ? (
                <ul
                  role="listbox"
                  aria-label="Suggestions"
                  className="max-h-72 overflow-y-auto overscroll-contain [scrollbar-gutter:stable]"
                >
                  {sugs.map((item, idx) => {
                    const isActive = idx === activeIndex;
                    const Icon = item.type === "hostel" ? Building2 : BedDouble;
                    return (
                      <li
                        key={`${item.type}-${item._id}`}
                        role="option"
                        aria-selected={isActive}
                        onMouseEnter={() => setActiveIndex(idx)}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => goTo(item)}
                        className={`flex cursor-pointer items-center gap-3 px-4 py-3 text-sm transition-colors ${
                          isActive ? "bg-accent/30" : "hover:bg-accent/10"
                        }`}
                      >
                        <Icon className="h-4 w-4 text-primary" />
                        <div className="flex-1 text-left">
                          <div className="font-medium leading-none">{item.title}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {item.type === "hostel" ? "Hostel" : "Room"} • {item.subtitle}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="px-4 py-3 text-sm text-muted-foreground">
                  No matches. Press Enter to search all.
                </div>
              )}

              <div className="border-t px-4 py-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  ↑/↓ to navigate • Enter to select
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => goTo(null)}
                  className="gap-2"
                >
                  Search “{query || "all"}”
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </DropdownPortal>

            {/* Quick actions */}
            <div className="mt-4 flex items-center justify-center gap-2">
              <Button asChild className="h-10 rounded-lg px-4">
                <Link to="/rooms" className="flex items-center gap-2">
                  Explore Rooms
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-10 rounded-lg px-4">
                <Link to="/hostels" className="flex items-center gap-2">
                  Browse Hostels
                  <Building2 className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-8 pt-8"
          >
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-muted-foreground">
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
