import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, SlidersHorizontal, X } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { RoomCard } from '@/components/cards/RoomCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { mockRooms, mockHostels } from '@/data/mockData';

const roomTypes = ['Single', 'Double', 'Triple'];
const genderOptions = ['Male', 'Female', 'Any'];

export default function Rooms() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');
  const [selectedHostel, setSelectedHostel] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 15000]);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  const filteredRooms = mockRooms.filter((room) => {
    const matchesSearch =
      room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.hostel?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || room.type === selectedType;
    const matchesGender = selectedGender === 'all' || room.gender === selectedGender;
    const matchesHostel = selectedHostel === 'all' || room.hostelId === selectedHostel;
    const matchesPrice =
      room.pricePerMonth >= priceRange[0] && room.pricePerMonth <= priceRange[1];
    const matchesAvailability =
      !showAvailableOnly || (room.isAvailable && room.capacity > room.occupied);

    return (
      matchesSearch &&
      matchesType &&
      matchesGender &&
      matchesHostel &&
      matchesPrice &&
      matchesAvailability
    );
  });

  const activeFiltersCount = [
    selectedType !== 'all',
    selectedGender !== 'all',
    selectedHostel !== 'all',
    priceRange[0] > 0 || priceRange[1] < 15000,
    showAvailableOnly,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedType('all');
    setSelectedGender('all');
    setSelectedHostel('all');
    setPriceRange([0, 15000]);
    setShowAvailableOnly(false);
  };

  const FiltersContent = () => (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium mb-2 block">Room Type</label>
        <Select value={selectedType} onValueChange={(v) => setSelectedType(v)}>
          <SelectTrigger>
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {roomTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Gender Preference</label>
        <Select value={selectedGender} onValueChange={(v) => setSelectedGender(v)}>
          <SelectTrigger>
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {genderOptions.map((gender) => (
              <SelectItem key={gender} value={gender}>
                {gender}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Hostel</label>
        <Select value={selectedHostel} onValueChange={setSelectedHostel}>
          <SelectTrigger>
            <SelectValue placeholder="All Hostels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Hostels</SelectItem>
            {mockHostels.map((hostel) => (
              <SelectItem key={hostel.id} value={hostel.id}>
                {hostel.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-4 block">
          Price Range: ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
        </label>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={15000}
          min={0}
          step={500}
          className="mt-2"
        />
      </div>

      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Available Only</label>
        <Button
          variant={showAvailableOnly ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowAvailableOnly(!showAvailableOnly)}
        >
          {showAvailableOnly ? 'On' : 'Off'}
        </Button>
      </div>

      {activeFiltersCount > 0 && (
        <Button variant="ghost" className="w-full" onClick={clearFilters}>
          <X className="h-4 w-4 mr-2" />
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-display font-bold mb-2">
            Browse <span className="gradient-text">Rooms</span>
          </h1>
          <p className="text-muted-foreground">
            Find and book your ideal room with our advanced filters
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filters */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="hidden lg:block w-72 shrink-0"
          >
            <div className="glass-card p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-semibold flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </h2>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary">{activeFiltersCount} active</Badge>
                )}
              </div>
              <FiltersContent />
            </div>
          </motion.aside>

          {/* Main Content */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-3 mb-6"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search rooms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
            </motion.div>

            <p className="text-sm text-muted-foreground mb-6">
              Showing {filteredRooms.length} room
              {filteredRooms.length !== 1 ? 's' : ''}
            </p>

            {filteredRooms.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredRooms.map((room, index) => (
                  <RoomCard key={room.id} room={room} index={index} />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 glass-card"
              >
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
                  <Search className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No rooms found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search query
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
