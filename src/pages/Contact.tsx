import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({ title: "Error", description: "Please enter a valid email address", variant: "destructive" });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      toast({ title: "Message sent!", description: "We'll get back to you within 24 hours." });
      setFormData({ name: "", email: "", subject: "", message: "" });
      setLoading(false);
    }, 600);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const contactInfo = [
    { icon: Mail, label: "Email", value: "support@auctify.com" },
    { icon: Phone, label: "Phone", value: "+1 (555) 123-4567" },
    { icon: MapPin, label: "Address", value: "123 Auction Street, New York, NY 10001" },
    { icon: Clock, label: "Hours", value: "Mon–Fri 9am–6pm EST" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* ── Page header ───────────────────────── */}
        <section className="py-14 bg-white border-b border-border">
          <div className="container mx-auto px-4">
            <p className="text-accent text-xs font-semibold uppercase tracking-widest mb-3">Get in touch</p>
            <h1 className="font-display text-4xl md:text-5xl text-foreground max-w-xl">
              We'd love to hear from you.
            </h1>
          </div>
        </section>

        {/* ── Contact body ──────────────────────── */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
              {/* Form — wider column */}
              <div className="lg:col-span-3 animate-fade-in">
                <h2 className="font-display text-2xl text-foreground mb-6">Send us a message</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
                        Name <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full h-11 px-4 rounded-md border border-input bg-white text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                        Email <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full h-11 px-4 rounded-md border border-input bg-white text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-1.5">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full h-11 px-4 rounded-md border border-input bg-white text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-foreground mb-1.5">
                      Message <span className="text-destructive">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      className="w-full px-4 py-3 rounded-md border border-input bg-white text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition resize-none"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-primary text-white hover:bg-primary/90 h-11 px-8 rounded-md font-semibold"
                  >
                    {loading ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </div>

              {/* Contact info — narrower column */}
              <div className="lg:col-span-2 animate-fade-in" style={{ animationDelay: "0.15s" }}>
                <h2 className="font-display text-2xl text-foreground mb-6">Contact details</h2>
                <p className="text-sm text-muted-foreground mb-8">
                  Have a question about the platform? Our support team is here to help.
                </p>

                <div className="space-y-5">
                  {contactInfo.map((item) => (
                    <div key={item.label} className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-lg bg-muted/70 flex items-center justify-center flex-shrink-0">
                        <item.icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
                          {item.label}
                        </p>
                        <p className="text-sm text-foreground">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Response time note */}
                <div className="mt-10 p-5 bg-muted/50 border border-border rounded-lg">
                  <p className="text-sm font-semibold text-foreground mb-1">Typical response time</p>
                  <p className="text-sm text-muted-foreground">
                    We usually reply within <strong>2–4 hours</strong> on business days.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
