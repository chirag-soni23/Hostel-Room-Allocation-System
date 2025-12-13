import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Layout } from "@/components/layout/Layout";
import { RoomCard } from "@/components/cards/RoomCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { useHostelStore } from "@/stores/hostelStore";
import { useRoomStore } from "@/stores/roomStore";

const roomTypes = ["single", "double", "triple"];
const genderOptions = ["male", "female", "any"];

export default function Rooms() {
  const { hostels, fetchHostels } = useHostelStore();
  const { rooms, fetchRooms, loading, total } = useRoomStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedGender, setSelectedGender] = useState("all");
  const [selectedHostel, setSelectedHostel] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 15000]);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  const [page, setPage] = useState(1);
  const limit = 6;

  const totalPages = Math.max(1, Math.ceil((total || rooms.length) / limit));

  // initial load
  useEffect(() => {
    fetchHostels();
  }, []);

  // build params object (memoized)
  const params = useMemo(() => {
    return {
      q: searchQuery || undefined,
      type: selectedType !== "all" ? selectedType : undefined,
      gender: selectedGender !== "all" ? selectedGender : undefined,
      hostelId: selectedHostel !== "all" ? selectedHostel : undefined,
      minRent: priceRange[0] > 0 ? priceRange[0] : undefined,
      maxRent: priceRange[1] < 15000 ? priceRange[1] : undefined,
      available: showAvailableOnly || undefined,
      page,
      limit,
    };
  }, [
    searchQuery,
    selectedType,
    selectedGender,
    selectedHostel,
    priceRange,
    showAvailableOnly,
    page,
  ]);

  // fetch with debounce for search + slider
  useEffect(() => {
    const delay =
      searchQuery.length > 0 || priceRange[0] !== 0 || priceRange[1] !== 15000
        ? 300
        : 0;

    const t = setTimeout(() => {
      fetchRooms(params);
    }, delay);

    return () => clearTimeout(t);
  }, [params, fetchRooms, searchQuery, priceRange]);

  const activeFiltersCount = [
    selectedType !== "all",
    selectedGender !== "all",
    selectedHostel !== "all",
    priceRange[0] > 0 || priceRange[1] < 15000,
    showAvailableOnly,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedType("all");
    setSelectedGender("all");
    setSelectedHostel("all");
    setPriceRange([0, 15000]);
    setShowAvailableOnly(false);
    setSearchQuery("");
    setPage(1);
  };

  const gotoPage = (p) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  const FiltersContent = () => (
    <div className="space-y-6">
      {/* Room Type */}
      <div>
        <label className="text-sm font-medium mb-2 block">Room Type</label>
        <Select
          value={selectedType}
          onValueChange={(v) => {
            setPage(1);
            setSelectedType(v);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {roomTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Gender */}
      <div>
        <label className="text-sm font-medium mb-2 block">Gender</label>
        <Select
          value={selectedGender}
          onValueChange={(v) => {
            setPage(1);
            setSelectedGender(v);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {genderOptions.map((gender) => (
              <SelectItem key={gender} value={gender}>
                {gender.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Hostel */}
      <div>
        <label className="text-sm font-medium mb-2 block">Hostel</label>
        <Select
          value={selectedHostel}
          onValueChange={(v) => {
            setPage(1);
            setSelectedHostel(v);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Hostels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Hostels</SelectItem>
            {hostels?.map((hostel) => (
              <SelectItem key={hostel._id} value={hostel._id}>
                {hostel.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div>
        <label className="text-sm font-medium mb-4 block">
          Price Range: ₹{priceRange[0].toLocaleString()} – ₹
          {priceRange[1].toLocaleString()}
        </label>
        <Slider
          min={0}
          max={15000}
          step={500}
          value={priceRange}
          onValueChange={(val) => {
            if (Array.isArray(val) && val.length === 2) {
              setPage(1);
              setPriceRange(val);
            }
          }}
          className="mt-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>₹0</span>
          <span>₹15,000</span>
        </div>
      </div>

      {/* Available Only */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Available Only</label>
        <Button
          variant={showAvailableOnly ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setPage(1);
            setShowAvailableOnly((p) => !p);
          }}
        >
          {showAvailableOnly ? "On" : "Off"}
        </Button>
      </div>

      {activeFiltersCount > 0 && (
        <Button variant="ghost" className="w-full" onClick={clearFilters}>
          <X className="h-4 w-4 mr-2" /> Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Browse Rooms</h1>

        {/* Search */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search rooms or hostels..."
              value={searchQuery}
              onChange={(e) => {
                setPage(1);
                setSearchQuery(e.target.value);
              }}
              className="pl-10"
            />
          </div>

          {/* Mobile Filters */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden">
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FiltersContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex gap-8">
          {/* Desktop Filters */}
          <aside className="hidden lg:block w-72">
            <div className="glass-card p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" /> Filters
                </h2>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary">{activeFiltersCount} active</Badge>
                )}
              </div>
              <FiltersContent />
            </div>
          </aside>

          {/* Room List */}
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-4">
              Showing {rooms.length} of {total} rooms
            </p>

            {loading ? (
              <p>Loading rooms...</p>
            ) : rooms.length > 0 ? (
              <>
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {rooms.map((room, idx) => (
                    <RoomCard key={room._id || idx} room={room} index={idx} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => gotoPage(page - 1)}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Prev
                    </Button>

                    {Array.from({ length: totalPages }).map((_, i) => {
                      const p = i + 1;
                      return (
                        <Button
                          key={p}
                          variant={p === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => gotoPage(p)}
                        >
                          {p}
                        </Button>
                      );
                    })}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => gotoPage(page + 1)}
                      disabled={page === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <p>No rooms found</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
