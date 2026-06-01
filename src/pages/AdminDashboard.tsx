import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Users, ShoppingBag, Gavel, DollarSign, MessageSquare,
  Trash2, Eye, Shield, TrendingUp, CreditCard,
  Lock, LogIn, LogOut,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import "./AdminDashboard.css";

// ─── Admin credentials from env ──────────────────────
const ADMIN_EMAIL    = import.meta.env.VITE_ADMIN_EMAIL    || "admin@gmail.com";
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "admin123";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem("auctify_admin") === "true"
  );
  const [emailInput, setEmailInput]       = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError]       = useState("");
  const [showPassword, setShowPassword]   = useState(false);

  // ─── Admin login handler ─────────────────────────
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const emailOk    = emailInput.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
    const passwordOk = passwordInput === ADMIN_PASSWORD;

    if (emailOk && passwordOk) {
      sessionStorage.setItem("auctify_admin", "true");
      window.dispatchEvent(new Event("auctify_admin_change")); // notify Navbar
      setIsAuthenticated(true);
      setLoginError("");
      toast({ title: "Welcome, Admin!", description: "You now have access to the admin dashboard." });
    } else if (!emailOk) {
      setLoginError("Incorrect email address.");
    } else {
      setLoginError("Incorrect password. Please try again.");
    }
  };

  // ─── Admin logout handler ────────────────────────
  const handleAdminLogout = () => {
    sessionStorage.removeItem("auctify_admin");
    window.dispatchEvent(new Event("auctify_admin_change")); // notify Navbar
    setIsAuthenticated(false);
    toast({ title: "Logged out", description: "Admin session ended." });
  };

  // ─── Data queries ────────────────────────────────
  const { data: allProfiles = [], isLoading: loadingProfiles } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAuthenticated,
  });

  const { data: allAuctions = [], isLoading: loadingAuctions } = useQuery({
    queryKey: ["admin-auctions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("auctions")
        .select("*, profiles!auctions_seller_id_fkey(full_name, email)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAuthenticated,
  });

  const { data: allBids = [], isLoading: loadingBids } = useQuery({
    queryKey: ["admin-bids"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bids")
        .select("*, profiles!bids_bidder_id_fkey(full_name), auctions(title)")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled: isAuthenticated,
  });

  const { data: allPayments = [], isLoading: loadingPayments } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*, buyer:profiles!payments_buyer_id_fkey(full_name), seller:profiles!payments_seller_id_fkey(full_name), auctions(title)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAuthenticated,
  });

  const { data: allMessages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*, sender:profiles!sender_id(full_name), receiver:profiles!receiver_id(full_name), auctions(title)")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled: isAuthenticated,
  });

  const { data: recentRegistrations = [], isLoading: loadingRecentRegistrations } = useQuery({
    queryKey: ["admin-recent-registrations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
    enabled: isAuthenticated,
  });

  // ─── Actions ─────────────────────────────────────
  const handleDeleteAuction = async (auctionId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return;

    try {
      const { error } = await supabase.rpc("delete_auction", { p_auction_id: auctionId });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["admin-auctions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-bids"] });
      toast({ title: "Auction deleted", description: `"${title}" has been removed.` });
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    }
  };

  // ─── Computed stats ──────────────────────────────
  const activeAuctions = allAuctions.filter((a: any) => new Date(a.end_date) > new Date());
  const totalRevenue = allPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

  // ─── Admin Login Screen ──────────────────────────
  if (!isAuthenticated) {
    const inputStyle = (hasError: boolean): React.CSSProperties => ({
      width: "100%", padding: "12px 16px",
      borderRadius: "10px", border: `1.5px solid ${hasError ? "#e11d48" : "hsl(214, 32%, 85%)"}`,
      fontSize: "14px", fontFamily: "Inter, sans-serif",
      outline: "none", background: "#fff", boxSizing: "border-box",
    });

    return (
      <div className="admin-page">
        <Navbar />
        <div className="admin-denied" style={{ gap: "16px" }}>
          {/* Icon */}
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "linear-gradient(135deg, hsl(221 83% 53% / 0.1), hsl(239 84% 67% / 0.15))",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Lock size={30} style={{ color: "#4f46e5" }} />
          </div>

          <h2 style={{ fontSize: "1.75rem", margin: 0 }}>Admin Login</h2>
          <p style={{ margin: 0 }}>Enter your admin credentials to access the dashboard.</p>

          <form onSubmit={handleAdminLogin} style={{
            display: "flex", flexDirection: "column", gap: "12px",
            width: "100%", maxWidth: "340px",
          }}>
            {/* Email */}
            <input
              type="email"
              value={emailInput}
              onChange={(e) => { setEmailInput(e.target.value); setLoginError(""); }}
              placeholder="Admin email"
              autoFocus
              required
              style={inputStyle(loginError.toLowerCase().includes("email"))}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#4f46e5")}
              onBlur={(e) => (e.currentTarget.style.borderColor = loginError.toLowerCase().includes("email") ? "#e11d48" : "hsl(214, 32%, 85%)")}
            />

            {/* Password */}
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={passwordInput}
                onChange={(e) => { setPasswordInput(e.target.value); setLoginError(""); }}
                placeholder="Admin password"
                required
                style={{ ...inputStyle(loginError.toLowerCase().includes("password")), paddingRight: "56px" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#4f46e5")}
                onBlur={(e) => (e.currentTarget.style.borderColor = loginError.toLowerCase().includes("password") ? "#e11d48" : "hsl(214, 32%, 85%)")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer",
                  color: "#94a3b8", fontSize: "11px", fontFamily: "Inter, sans-serif", fontWeight: 700,
                }}
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>

            {/* Error */}
            {loginError && (
              <p style={{ color: "#e11d48", fontSize: "13px", margin: 0, fontWeight: 500 }}>
                ⚠ {loginError}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                padding: "12px 24px", borderRadius: "10px", border: "none",
                background: "linear-gradient(135deg, #2563eb, #4f46e5)",
                color: "#fff", fontSize: "14px", fontWeight: 600,
                fontFamily: "Inter, sans-serif", cursor: "pointer",
                boxShadow: "0 2px 8px rgba(37,99,235,0.3)", marginTop: "4px",
                transition: "opacity 0.15s, transform 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = ""; }}
            >
              <LogIn size={16} /> Access Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── Helpers ─────────────────────────────────────
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const getAuctionStatus = (endDate: string) =>
    new Date(endDate) > new Date() ? "active" : "ended";

  const Loading = () => (
    <div className="admin-loading"><div className="admin-loading-spinner" /> Loading data...</div>
  );

  const Empty = ({ text }: { text: string }) => (
    <div className="admin-empty">
      <ShoppingBag className="admin-empty-icon" />
      <p>{text}</p>
    </div>
  );

  // ─── Render ──────────────────────────────────────
  return (
    <div className="admin-page">
      <Navbar />

      <main className="flex-1" style={{ padding: "0 0 3rem" }}>
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="admin-header">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 }}>
              <div className="admin-header-badge">
                <Shield size={14} /> Admin Panel
              </div>
            </div>
            <h1>Admin Dashboard</h1>
            <p>Manage users, auctions, payments, and monitor platform activity.</p>
            <button
              onClick={handleAdminLogout}
              style={{
                marginTop: 16, display: "inline-flex", alignItems: "center", gap: 6,
                padding: "8px 18px", borderRadius: "8px", border: "1.5px solid hsl(0 72% 51% / 0.25)",
                background: "hsl(0 72% 51% / 0.06)", color: "#dc2626",
                fontSize: "13px", fontWeight: 600, cursor: "pointer",
                fontFamily: "Inter, sans-serif", transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "hsl(0 72% 51% / 0.12)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "hsl(0 72% 51% / 0.06)"; }}
            >
              <LogOut size={14} /> Exit Admin Session
            </button>
          </div>

          {/* Stats */}
          <div className="admin-stats">
            <div className="admin-stat-card">
              <div className="admin-stat-icon blue"><Users size={20} /></div>
              <div className="admin-stat-info">
                <div className="admin-stat-label">Total Users</div>
                <div className="admin-stat-value">{allProfiles.length}</div>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-icon green"><ShoppingBag size={20} /></div>
              <div className="admin-stat-info">
                <div className="admin-stat-label">Total Auctions</div>
                <div className="admin-stat-value">{allAuctions.length}</div>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-icon amber"><TrendingUp size={20} /></div>
              <div className="admin-stat-info">
                <div className="admin-stat-label">Active Auctions</div>
                <div className="admin-stat-value">{activeAuctions.length}</div>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-icon purple"><DollarSign size={20} /></div>
              <div className="admin-stat-info">
                <div className="admin-stat-label">Total Revenue</div>
                <div className="admin-stat-value">${totalRevenue.toLocaleString()}</div>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-icon rose"><Gavel size={20} /></div>
              <div className="admin-stat-info">
                <div className="admin-stat-label">Total Bids</div>
                <div className="admin-stat-value">{allBids.length}</div>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-icon cyan"><CreditCard size={20} /></div>
              <div className="admin-stat-info">
                <div className="admin-stat-label">Payments</div>
                <div className="admin-stat-value">{allPayments.length}</div>
              </div>
            </div>
          </div>

          {/* Recent Registrations Section */}
          <div className="admin-recent-registrations" style={{ marginBottom: "2rem" }}>
            <div className="admin-table-wrap">
              <div className="admin-table-header">
                <h3>Recent Registrations</h3>
                <span className="admin-table-count">{recentRegistrations.length} new users</span>
              </div>
              {loadingRecentRegistrations ? <Loading /> : recentRegistrations.length === 0 ? <Empty text="No recent registrations." /> : (
                <div className="admin-table-scroll">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Full Name</th>
                        <th>Email</th>
                        <th>Registered On</th>
                        <th>User ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentRegistrations.map((profile: any, i: number) => (
                        <tr key={profile.id}>
                          <td style={{ color: "#94a3b8", fontWeight: 600 }}>{i + 1}</td>
                          <td style={{ fontWeight: 600, color: "#0f172a" }}>
                            {profile.full_name || "—"}
                          </td>
                          <td>{profile.email || "—"}</td>
                          <td>{formatDate(profile.created_at)}</td>
                          <td style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>
                            {profile.id.slice(0, 8)}...
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="users" className="admin-tabs w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="users">
                <Users size={14} style={{ marginRight: 6 }} /> Users
              </TabsTrigger>
              <TabsTrigger value="auctions">
                <ShoppingBag size={14} style={{ marginRight: 6 }} /> Auctions
              </TabsTrigger>
              <TabsTrigger value="bids">
                <Gavel size={14} style={{ marginRight: 6 }} /> Bids
              </TabsTrigger>
              <TabsTrigger value="payments">
                <DollarSign size={14} style={{ marginRight: 6 }} /> Payments
              </TabsTrigger>
              <TabsTrigger value="messages">
                <MessageSquare size={14} style={{ marginRight: 6 }} /> Messages
              </TabsTrigger>
            </TabsList>

            {/* ── Users Tab ─────────────────────────── */}
            <TabsContent value="users">
              <div className="admin-table-wrap">
                <div className="admin-table-header">
                  <h3>Registered Users</h3>
                  <span className="admin-table-count">{allProfiles.length} users</span>
                </div>
                {loadingProfiles ? <Loading /> : allProfiles.length === 0 ? <Empty text="No users registered yet." /> : (
                  <div className="admin-table-scroll">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Full Name</th>
                          <th>Email</th>
                          <th>Joined</th>
                          <th>User ID</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allProfiles.map((profile: any, i: number) => (
                          <tr key={profile.id}>
                            <td style={{ color: "#94a3b8", fontWeight: 600 }}>{i + 1}</td>
                            <td style={{ fontWeight: 600, color: "#0f172a" }}>
                              {profile.full_name || "—"}
                            </td>
                            <td>{profile.email || "—"}</td>
                            <td>{formatDate(profile.created_at)}</td>
                            <td style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>
                              {profile.id.slice(0, 8)}...
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ── Auctions Tab ──────────────────────── */}
            <TabsContent value="auctions">
              <div className="admin-table-wrap">
                <div className="admin-table-header">
                  <h3>All Auctions</h3>
                  <span className="admin-table-count">{allAuctions.length} auctions</span>
                </div>
                {loadingAuctions ? <Loading /> : allAuctions.length === 0 ? <Empty text="No auctions created yet." /> : (
                  <div className="admin-table-scroll">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Title</th>
                          <th>Seller</th>
                          <th>Category</th>
                          <th>Price</th>
                          <th>Bids</th>
                          <th>Status</th>
                          <th>Ends</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allAuctions.map((auction: any, i: number) => {
                          const status = getAuctionStatus(auction.end_date);
                          return (
                            <tr key={auction.id}>
                              <td style={{ color: "#94a3b8", fontWeight: 600 }}>{i + 1}</td>
                              <td style={{ fontWeight: 600, color: "#0f172a", maxWidth: 180 }}>{auction.title}</td>
                              <td>{auction.profiles?.full_name || "Unknown"}</td>
                              <td><span style={{ textTransform: "capitalize" }}>{auction.category}</span></td>
                              <td style={{ fontWeight: 700, color: "#059669" }}>${auction.current_price?.toLocaleString()}</td>
                              <td style={{ textAlign: "center" }}>{auction.bid_count || 0}</td>
                              <td>
                                <span className={`admin-badge ${status}`}>
                                  {status === "active" ? "Active" : "Ended"}
                                </span>
                              </td>
                              <td>{formatDate(auction.end_date)}</td>
                              <td>
                                <div style={{ display: "flex", gap: 6 }}>
                                  <button
                                    className="admin-action-btn view"
                                    onClick={() => navigate(`/auction/${auction.id}`)}
                                  >
                                    <Eye size={13} /> View
                                  </button>
                                  <button
                                    className="admin-action-btn delete"
                                    onClick={() => handleDeleteAuction(auction.id, auction.title)}
                                  >
                                    <Trash2 size={13} /> Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ── Bids Tab ──────────────────────────── */}
            <TabsContent value="bids">
              <div className="admin-table-wrap">
                <div className="admin-table-header">
                  <h3>Recent Bids</h3>
                  <span className="admin-table-count">{allBids.length} bids</span>
                </div>
                {loadingBids ? <Loading /> : allBids.length === 0 ? <Empty text="No bids placed yet." /> : (
                  <div className="admin-table-scroll">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Bidder</th>
                          <th>Auction</th>
                          <th>Amount</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allBids.map((bid: any, i: number) => (
                          <tr key={bid.id}>
                            <td style={{ color: "#94a3b8", fontWeight: 600 }}>{i + 1}</td>
                            <td style={{ fontWeight: 600, color: "#0f172a" }}>{bid.profiles?.full_name || "Unknown"}</td>
                            <td style={{ maxWidth: 200 }}>{bid.auctions?.title || "—"}</td>
                            <td style={{ fontWeight: 700, color: "#059669" }}>${bid.amount?.toLocaleString()}</td>
                            <td>{formatDate(bid.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ── Payments Tab ──────────────────────── */}
            <TabsContent value="payments">
              <div className="admin-table-wrap">
                <div className="admin-table-header">
                  <h3>All Payments</h3>
                  <span className="admin-table-count">{allPayments.length} payments</span>
                </div>
                {loadingPayments ? <Loading /> : allPayments.length === 0 ? <Empty text="No payments processed yet." /> : (
                  <div className="admin-table-scroll">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Buyer</th>
                          <th>Seller</th>
                          <th>Auction</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allPayments.map((payment: any, i: number) => (
                          <tr key={payment.id}>
                            <td style={{ color: "#94a3b8", fontWeight: 600 }}>{i + 1}</td>
                            <td style={{ fontWeight: 600, color: "#0f172a" }}>{payment.buyer?.full_name || "Unknown"}</td>
                            <td>{payment.seller?.full_name || "Unknown"}</td>
                            <td style={{ maxWidth: 180 }}>{payment.auctions?.title || "—"}</td>
                            <td style={{ fontWeight: 700, color: "#059669" }}>${payment.amount?.toLocaleString()}</td>
                            <td>
                              <span className={`admin-badge ${payment.status || "pending"}`}>
                                {payment.status === "escrow" ? "Escrow" : payment.status === "completed" ? "Completed" : payment.status || "Pending"}
                              </span>
                            </td>
                            <td>{formatDate(payment.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ── Messages Tab ──────────────────────── */}
            <TabsContent value="messages">
              <div className="admin-table-wrap">
                <div className="admin-table-header">
                  <h3>Recent Messages</h3>
                  <span className="admin-table-count">{allMessages.length} messages</span>
                </div>
                {loadingMessages ? <Loading /> : allMessages.length === 0 ? <Empty text="No messages exchanged yet." /> : (
                  <div className="admin-table-scroll">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>From</th>
                          <th>To</th>
                          <th>Auction</th>
                          <th>Message</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allMessages.map((msg: any, i: number) => (
                          <tr key={msg.id}>
                            <td style={{ color: "#94a3b8", fontWeight: 600 }}>{i + 1}</td>
                            <td style={{ fontWeight: 600, color: "#0f172a" }}>{msg.sender?.full_name || "Unknown"}</td>
                            <td>{msg.receiver?.full_name || "Unknown"}</td>
                            <td style={{ maxWidth: 150 }}>{msg.auctions?.title || "—"}</td>
                            <td style={{ maxWidth: 250, fontStyle: "italic", color: "#64748b" }}>
                              "{msg.content}"
                            </td>
                            <td>{formatDate(msg.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
