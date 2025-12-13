import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  Instagram,
  Facebook,
  Linkedin,
  Github,
  Twitter,
} from "lucide-react";
import api from "@/lib/axios";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      return toast.error("Please fill in all required fields.");
    }
    try {
      setLoading(true);

      const { data } = await api.post("/contact", form);

      if (data.success) {
        toast.success(data.message || "Message sent successfully!");
        setForm({ name: "", email: "", phone: "", subject: "", message: "" });
      } else {
        toast.error(data.message || "Failed to send message.");
      }
    } catch (err) {
      console.error("Contact form error:", err);
      toast.error(
        err?.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-display font-bold">
            Get in <span className="gradient-text">Touch</span>
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Have questions, feedback, or collaboration ideas? Send us a message
            — we’d love to hear from you!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Contact Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-card p-6">
              <h2 className="font-display text-lg font-semibold mb-4">
                Contact Details
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 mt-0.5 text-primary" />
                  <div>
                    <div className="font-medium">Office Address</div>
                    <div className="text-sm text-muted-foreground">
                      2nd Floor, Vaishnav Complex, Indore, MP 452001
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 mt-0.5 text-primary" />
                  <div>
                    <div className="font-medium">Email</div>
                    <a
                      href="mailto:hello@example.com"
                      className="text-sm text-muted-foreground hover:underline"
                    >
                      hello@example.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 mt-0.5 text-primary" />
                  <div>
                    <div className="font-medium">Phone</div>
                    <a
                      href="tel:+919999999999"
                      className="text-sm text-muted-foreground hover:underline"
                    >
                      +91 99999 99999
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 mt-0.5 text-primary" />
                  <div>
                    <div className="font-medium">Business Hours</div>
                    <div className="text-sm text-muted-foreground">
                      Mon–Sat: 10:00 AM – 7:00 PM
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="mt-6">
                <div className="text-sm text-muted-foreground mb-2">
                  Follow Us
                </div>
                <div className="flex items-center gap-3">
                  <a
                    target="_blank"
                    href="https://www.instagram.com/0x_chirag_0x/"
                    className="icon-btn"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-4 w-4" />
                  </a>
                  <a
                    target="_blank"
                    href="https://x.com/ChiragSoni23/"
                    className="icon-btn"
                    aria-label="Facebook"
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                  <a
                    target="_blank"
                    href="https://www.linkedin.com/in/chiragsoni023/"
                    className="icon-btn"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                  <a
                    target="_blank"
                    href="https://github.com/chirag-soni23/"
                    className="icon-btn"
                    aria-label="GitHub"
                  >
                    <Github className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="glass-card overflow-hidden">
              <div className="h-64 w-full">
                <iframe
                  title="Map"
                  className="w-full h-full"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src="https://www.google.com/maps?q=Indore&output=embed"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="glass-card p-6">
              <h2 className="font-display text-lg font-semibold mb-2">
                Send us a message
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Fill in the form below and we’ll get back to you soon.
              </p>

              <form onSubmit={onSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      name="name"
                      value={form.name}
                      onChange={onChange}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={onChange}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Phone (optional)</Label>
                    <Input
                      name="phone"
                      value={form.phone}
                      onChange={onChange}
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                  <div>
                    <Label>Subject</Label>
                    <Input
                      name="subject"
                      value={form.subject}
                      onChange={onChange}
                      placeholder="Subject"
                    />
                  </div>
                </div>

                <div>
                  <Label>Message</Label>
                  <Textarea
                    name="message"
                    value={form.message}
                    onChange={onChange}
                    rows={6}
                    placeholder="Write your message..."
                    required
                  />
                </div>

                <div className="flex items-center justify-end">
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" /> Send Message
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>

            {/* FAQs */}
            <div className="glass-card p-6 mt-6">
              <h3 className="font-display text-lg font-semibold mb-4">
                Frequently Asked Questions
              </h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <div className="font-medium">
                    When can I expect a response?
                  </div>
                  <div className="text-muted-foreground">
                    Usually within 24–48 hours.
                  </div>
                </li>
                <li>
                  <div className="font-medium">Do you offer phone support?</div>
                  <div className="text-muted-foreground">
                    Yes, during business hours (Mon–Sat).
                  </div>
                </li>
                <li>
                  <div className="font-medium">Can I visit your office?</div>
                  <div className="text-muted-foreground">
                    Yes, with a prior appointment.
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Small utility styles */}
      <style>{`
        .icon-btn {
          display:inline-flex;
          align-items:center;
          justify-content:center;
          height:2.25rem;
          width:2.25rem;
          border-radius:0.75rem;
          border:1px solid hsl(var(--border));
          background: hsl(var(--muted) / 0.4);
          transition: transform .15s ease, background .15s ease;
        }
        .icon-btn:hover {
          transform: translateY(-1px);
        }
      `}</style>
    </Layout>
  );
}
