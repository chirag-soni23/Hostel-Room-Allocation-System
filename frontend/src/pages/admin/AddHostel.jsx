// src/pages/admin/AddHostel.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Trash2,
  Pencil,
  Plus,
  RefreshCcw,
  Search,
  MapPin,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useHostelStore } from "@/stores/hostelStore";

export default function AddHostel() {
  const {
    fetchHostels,
    fetchHostelById,
    createHostel,
    updateHostel,
    deleteHostel,
    hostels,
    hostel,
    loading,
    btnLoading,
    clearHostel,
    total,
  } = useHostelStore();

  // form + list states
  const [selectedId, setSelectedId] = useState(null);
  const isEdit = Boolean(selectedId);

  const [form, setForm] = useState({
    name: "",
    location: "",
    amenities: "",
    rules: "",
    photoFile: null,
  });
  const [preview, setPreview] = useState(null);

  // filters + pagination
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [page, setPage] = useState(1);
  const limit = 5; // 👈 limit set to 5

  // load initial list
  useEffect(() => {
    fetchHostels({ page, limit });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // filters / search triggers
  useEffect(() => {
    const t = setTimeout(() => {
      fetchHostels({
        q: q || undefined,
        city: city || undefined,
        page,
        limit,
      });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, city, page]);

  // when editing specific id
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (selectedId) {
        await fetchHostelById(selectedId);
      } else {
        clearHostel();
        if (mounted) {
          setForm({
            name: "",
            location: "",
            amenities: "",
            rules: "",
            photoFile: null,
          });
          setPreview(null);
        }
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // prefill when hostel fetched
  useEffect(() => {
    if (isEdit && hostel?._id === selectedId) {
      setForm({
        name: hostel.name || "",
        location: hostel.location || "",
        amenities: Array.isArray(hostel.amenities)
          ? hostel.amenities.join(", ")
          : hostel.amenities || "",
        rules: Array.isArray(hostel.rules)
          ? hostel.rules.join(", ")
          : hostel.rules || "",
        photoFile: null,
      });
      setPreview(hostel.photo || null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hostel, isEdit, selectedId]);

  const onChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photoFile") {
      const file = files?.[0] || null;
      setForm((f) => ({ ...f, photoFile: file }));
      setPreview(file ? URL.createObjectURL(file) : hostel?.photo ?? null);
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const payload = useMemo(
    () => ({
      name: form.name.trim(),
      location: form.location.trim(),
      amenities: form.amenities.split(",").map((s) => s.trim()).filter(Boolean),
      rules: form.rules.split(",").map((s) => s.trim()).filter(Boolean),
      photoFile: form.photoFile || undefined,
    }),
    [form]
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    if (isEdit) await updateHostel(selectedId, payload);
    else await createHostel(payload);
    await fetchHostels({ q, city, page, limit });
    setSelectedId(null);
  };

  const onDelete = async (id) => {
    if (window.confirm("Delete this hostel permanently?")) {
      await deleteHostel(id);
      await fetchHostels({ q, city, page, limit });
      if (selectedId === id) setSelectedId(null);
    }
  };

  const items = Array.isArray(hostels) ? hostels : hostels?.items || [];
  const totalPages = Math.ceil(total / limit) || 1;

  const changePage = (p) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Top bar */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold">
              Manage <span className="gradient-text">Hostels</span>
            </h1>
            <p className="text-muted-foreground">
              Add new, edit existing, or delete hostels.
            </p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/admin/dashboard">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Link>
          </Button>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form column */}
          <div className="lg:col-span-5">
            <div className="glass-card p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold">
                  {isEdit ? "Update Hostel" : "Add New Hostel"}
                </h2>
                {isEdit ? (
                  <Badge variant="secondary">Editing</Badge>
                ) : (
                  <Badge variant="outline">Create</Badge>
                )}
              </div>

              <form onSubmit={onSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={onChange}
                      placeholder="Sunshine Hostel"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location / City</Label>
                    <Input
                      id="location"
                      name="location"
                      value={form.location}
                      onChange={onChange}
                      placeholder="Delhi"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="amenities">Amenities (comma separated)</Label>
                  <Input
                    id="amenities"
                    name="amenities"
                    value={form.amenities}
                    onChange={onChange}
                    placeholder="wifi,mess,laundary,security"
                  />
                </div>

                <div>
                  <Label htmlFor="rules">Rules (comma separated)</Label>
                  <Textarea
                    id="rules"
                    name="rules"
                    rows={3}
                    value={form.rules}
                    onChange={onChange}
                    placeholder="No Smoking, No Alcohol"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="photoFile">Photo</Label>
                    <Input
                      id="photoFile"
                      name="photoFile"
                      type="file"
                      accept="image/*"
                      onChange={onChange}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Recommended 1280×720 or higher.
                    </p>
                  </div>
                  <div className="rounded-lg overflow-hidden border bg-muted/40 flex items-center justify-center h-40">
                    {preview ? (
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-muted-foreground text-sm flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" /> No image selected
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  {isEdit ? (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => onDelete(selectedId)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  ) : (
                    <div />
                  )}
                  <div className="flex gap-2">
                    {isEdit && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setSelectedId(null)}
                      >
                        Cancel
                      </Button>
                    )}
                    <Button type="submit" disabled={btnLoading}>
                      {btnLoading
                        ? isEdit
                          ? "Updating..."
                          : "Creating..."
                        : isEdit
                        ? "Update Hostel"
                        : "Create Hostel"}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* List column */}
          <div className="lg:col-span-7">
            <div className="glass-card p-4 mb-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or city..."
                    className="pl-10"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                </div>
                <Input
                  placeholder="Filter by city (e.g. Delhi)"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
                <Button
                  variant="outline"
                  onClick={() =>
                    fetchHostels({ q, city, page, limit })
                  }
                >
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>

            <div className="grid gap-3">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-20 rounded-xl border bg-muted/40 animate-pulse" />
                ))
              ) : items.length ? (
                items.map((h) => (
                  <div
                    key={h._id}
                    className="glass-card p-4 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-14 w-20 rounded-md overflow-hidden bg-muted/40">
                        <img
                          src={
                            h.photo ||
                            "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=240&fit=crop"
                          }
                          alt={h.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium">{h.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {h.location || "—"}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {Array.isArray(h.amenities)
                            ? h.amenities.slice(0, 4).join(", ")
                            : ""}
                          {Array.isArray(h.amenities) &&
                            h.amenities.length > 4 &&
                            ` +${h.amenities.length - 4}`}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedId(h._id)}
                      >
                        <Pencil className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(h._id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="glass-card p-8 text-center text-muted-foreground">
                  No hostels found. Add one using the form on the left.
                </div>
              )}
            </div>

            {/* Pagination Controls */}
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
