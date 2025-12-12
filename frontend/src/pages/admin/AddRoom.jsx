import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Trash2,
  Pencil,
  RefreshCcw,
  Search,
  MapPin,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useRoomStore } from "@/stores/roomStore";
import { useHostelStore } from "@/stores/hostelStore";
import { toast } from "sonner";

export default function AddRoom() {
  const {
    fetchRooms,
    fetchRoomById,
    createRoom,
    updateRoom,
    deleteRoom,
    rooms,
    room,
    loading,
    btnLoading,
    total,
  } = useRoomStore();

  const { fetchHostels, hostels } = useHostelStore();

  const [selectedId, setSelectedId] = useState(null);
  const isEdit = Boolean(selectedId);

  const initialForm = {
    number: "",
    type: "",
    genderPreference: "any",
    monthlyRent: "",
    capacity: "",
    location: "",
    amenities: "",
    photoFile: null,
    hostelId: "",
  };

  const [form, setForm] = useState(initialForm);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef(null);

  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [page, setPage] = useState(1);
  const limit = 6;

  // Fetch hostels on mount
  useEffect(() => {
    fetchHostels();
  }, []);

  // Fetch rooms on mount
  useEffect(() => {
    fetchRooms({ page, limit });
  }, []);

  // Fetch rooms when filters or page change
  useEffect(() => {
    const t = setTimeout(() => {
      fetchRooms({
        q: q || undefined,
        city: city || undefined,
        page,
        limit,
      });
    }, 300);
    return () => clearTimeout(t);
  }, [q, city, page]);

  // Fetch selected room for editing
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (selectedId) {
        await fetchRoomById(selectedId);
      } else if (mounted) {
        resetForm();
      }
    })();
    return () => (mounted = false);
  }, [selectedId]);

  // Populate form when editing a room
  useEffect(() => {
    if (isEdit && room?._id === selectedId && hostels.length > 0) {
      setForm({
        number: room.number || "",
        type: room.type || "",
        genderPreference: room.genderPreference || "any",
        monthlyRent: room.monthlyRent || "",
        capacity: room.capacity || "",
        location: room.location || "",
        amenities: Array.isArray(room.amenities)
          ? room.amenities.join(", ")
          : room.amenities || "",
        photoFile: null,
        hostelId: room.hostel?._id || "",
      });
      setPreview(room.photos?.[0] || null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }, [room, isEdit, selectedId, hostels]);

  const onChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photoFile") {
      const file = files?.[0] || null;
      setForm((f) => ({ ...f, photoFile: file }));
      setPreview(file ? URL.createObjectURL(file) : room?.photos?.[0] ?? null);
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const resetForm = () => {
    setForm(initialForm);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.hostelId) return toast.error("Please select a hostel");

    const formData = new FormData();
    formData.append("number", form.number.trim());
    formData.append("type", form.type.trim());
    formData.append("genderPreference", form.genderPreference.trim());
    formData.append("monthlyRent", form.monthlyRent);
    formData.append("capacity", form.capacity);
    formData.append("location", form.location.trim());
    formData.append(
      "amenities",
      form.amenities
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean)
    );
    formData.append("hostelId", form.hostelId);
    if (form.photoFile) formData.append("photoFile", form.photoFile);

    try {
      if (isEdit) {
        await updateRoom(selectedId, formData);
        setSelectedId(null);
      } else {
        await createRoom(formData);
      }
      resetForm();
      fetchRooms({ q, city, page, limit });
    } catch (err) {
      console.error(err);
    }
  };

  const onDelete = async (id) => {
    if (window.confirm("Delete this room permanently?")) {
      await deleteRoom(id);
      fetchRooms({ q, city, page, limit });
      if (selectedId === id) {
        setSelectedId(null);
        resetForm();
      }
    }
  };

  const items = Array.isArray(rooms) ? rooms : [];
  const totalPages = Math.ceil(total / limit) || 1;

  const changePage = (p) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold">
              Manage <span className="gradient-text">Rooms</span>
            </h1>
            <p className="text-muted-foreground">Add, edit, or delete rooms.</p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/admin">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form */}
          <div className="lg:col-span-5">
            <div className="glass-card p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold">
                  {isEdit ? "Update Room" : "Add New Room"}
                </h2>
                {isEdit ? (
                  <Badge variant="secondary">Editing</Badge>
                ) : (
                  <Badge variant="outline">Create</Badge>
                )}
              </div>

              <form onSubmit={onSubmit} className="space-y-5">
                {/* Hostel */}
                <div>
                  <Label>Select Hostel</Label>
                  <select
                    name="hostelId"
                    value={form.hostelId}
                    onChange={onChange}
                    required
                    className="w-full border rounded p-2 bg-muted text-muted-foreground dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">Select Hostel</option>
                    {hostels.map((h) => (
                      <option key={h._id} value={h._id}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Number & Rent */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Room Number</Label>
                    <Input
                      name="number"
                      value={form.number}
                      onChange={onChange}
                      placeholder="Room 101"
                      required
                    />
                  </div>
                  <div>
                    <Label>Monthly Rent</Label>
                    <Input
                      name="monthlyRent"
                      value={form.monthlyRent}
                      onChange={onChange}
                      placeholder="8000"
                      type="number"
                      required
                    />
                  </div>
                </div>

                {/* Type & Gender */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Room Type</Label>
                    <select
                      name="type"
                      value={form.type}
                      onChange={onChange}
                      required
                      className="w-full border rounded p-2 bg-muted text-muted-foreground dark:bg-gray-800 dark:text-white"
                    >
                      <option value="">Select Type</option>
                      <option value="single">Single</option>
                      <option value="double">Double</option>
                      <option value="triple">Triple</option>
                    </select>
                  </div>
                  <div>
                    <Label>Gender Preference</Label>
                    <select
                      name="genderPreference"
                      value={form.genderPreference}
                      onChange={onChange}
                      required
                      className="w-full border rounded p-2 bg-muted text-muted-foreground dark:bg-gray-800 dark:text-white"
                    >
                      <option value="any">Any</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>

                {/* Capacity & Location */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Capacity</Label>
                    <Input
                      name="capacity"
                      value={form.capacity}
                      onChange={onChange}
                      type="number"
                      placeholder="1"
                    />
                  </div>
                  <div>
                    <Label>Location</Label>
                    <Input
                      name="location"
                      value={form.location}
                      onChange={onChange}
                      placeholder="Delhi, Mumbai"
                    />
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <Label>Amenities (comma separated)</Label>
                  <Input
                    name="amenities"
                    value={form.amenities}
                    onChange={onChange}
                    placeholder="wifi, mess, security"
                  />
                </div>

                {/* Photo */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Photo</Label>
                    <Input
                      name="photoFile"
                      type="file"
                      accept="image/*"
                      onChange={onChange}
                      ref={fileRef}
                    />
                  </div>
                  <div className="rounded-lg overflow-hidden border bg-muted/40 flex items-center justify-center h-40">
                    {preview ? (
                      <img
                        src={preview}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-muted-foreground text-sm flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" /> No image
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center">
                  {isEdit ? (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => onDelete(selectedId)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </Button>
                  ) : (
                    <div />
                  )}

                  <div className="flex gap-2">
                    {isEdit && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setSelectedId(null);
                          resetForm();
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                    <Button disabled={btnLoading} type="submit">
                      {btnLoading
                        ? isEdit
                          ? "Updating..."
                          : "Creating..."
                        : isEdit
                        ? "Update Room"
                        : "Create Room"}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Room List */}
          <div className="lg:col-span-7">
            {/* Filters */}
            <div className="glass-card p-4 mb-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search rooms..."
                    className="pl-10"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                </div>
                <Input
                  placeholder="Filter by city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
                <Button
                  variant="outline"
                  onClick={() => fetchRooms({ q, city, page, limit })}
                >
                  <RefreshCcw className="h-4 w-4 mr-2" /> Refresh
                </Button>
              </div>
            </div>

            {/* Room Items */}
            <div className="grid gap-3">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-20 rounded-xl border bg-muted/40 animate-pulse"
                    />
                  ))
                : items.length
                ? items.map((r) => (
                    <div
                      key={r._id}
                      className="glass-card p-4 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-14 w-20 rounded-md overflow-hidden bg-muted/40">
                          <img
                            src={
                              r.photos?.[0] ||
                              "https://images.unsplash.com/photo-1560185127-6ed59b505f83?w=400&h=240&fit=crop"
                            }
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium">
                            Room {r.number} • {r.type}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" /> {r.location}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedId(r._id)}
                        >
                          <Pencil className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => onDelete(r._id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </div>
                    </div>
                  ))
                : (
                    <div className="glass-card p-8 text-center text-muted-foreground">
                      No rooms found. Add one using the form on the left.
                    </div>
                  )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changePage(page - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" /> Prev
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changePage(page + 1)}
                  disabled={page === totalPages}
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
