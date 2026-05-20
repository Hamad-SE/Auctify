import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  PackageCheck, CreditCard, Package, Truck, CheckCircle2,
  MapPin, Clock, ShoppingBag, ExternalLink,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./TrackOrders.css";

// ─── Order status steps ──────────────────────────────────────
const ORDER_STEPS = [
  { key: "placed",    label: "Order\nPlaced",      icon: ShoppingBag  },
  { key: "confirmed", label: "Payment\nConfirmed",  icon: CreditCard   },
  { key: "packaged",  label: "Item\nPackaged",      icon: Package      },
  { key: "shipped",   label: "Shipped",             icon: Truck        },
  { key: "delivered", label: "Delivered",           icon: CheckCircle2 },
];

// Simulate order progress based on days since payment
const getOrderStepIndex = (createdAt: string, status: string): number => {
  if (status === "completed") return 4; // Delivered
  const days = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
  if (days < 1)  return 1; // Payment Confirmed
  if (days < 3)  return 2; // Packaged
  if (days < 6)  return 3; // Shipped
  return 3;                 // Still shipped (demo — not completed yet)
};

const getEstimatedDelivery = (createdAt: string): string => {
  const est = new Date(createdAt);
  est.setDate(est.getDate() + 7);
  return est.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

// ─── Component ──────────────────────────────────────────────
const TrackOrders = () => {
  const navigate = useNavigate();

  // Auth check
  const { data: user, isLoading: loadingUser } = useQuery({
    queryKey: ["track-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  useEffect(() => {
    if (!loadingUser && !user) navigate("/login");
  }, [user, loadingUser, navigate]);

  // Fetch payments (won auctions the user paid for — as buyer)
  const { data: orders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ["my-orders", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select(`
          id, amount, status, created_at,
          auctions (id, title, image_url, category, end_date),
          seller:profiles!payments_seller_id_fkey (full_name)
        `)
        .eq("buyer_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // ─── Render ─────────────────────────────────────────────
  return (
    <div className="track-page">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <div className="track-header">
          <div className="track-header-badge">
            <PackageCheck size={14} /> Order Tracking
          </div>
          <h1>Track My Orders</h1>
          <p>Monitor the status of your won auctions from payment to delivery.</p>
        </div>

        {/* Content */}
        {loadingUser || loadingOrders ? (
          <div className="track-loading">
            <div className="track-loading-spinner" /> Loading your orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="track-empty">
            <div className="track-empty-icon">
              <ShoppingBag size={36} />
            </div>
            <h3>No Orders Yet</h3>
            <p>You haven't won and paid for any auctions yet. Start bidding to place your first order!</p>
            <button
              onClick={() => navigate("/auction")}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "11px 24px", borderRadius: "10px", border: "none",
                background: "linear-gradient(135deg, #2563eb, #4f46e5)",
                color: "#fff", fontSize: "14px", fontWeight: 600,
                fontFamily: "Inter, sans-serif", cursor: "pointer",
                boxShadow: "0 2px 10px rgba(37,99,235,0.3)",
              }}
            >
              Browse Auctions
            </button>
          </div>
        ) : (
          <div className="track-orders-list">
            {orders.map((order: any) => {
              const stepIndex    = getOrderStepIndex(order.created_at, order.status);
              const progressPct  = Math.round((stepIndex / (ORDER_STEPS.length - 1)) * 100);
              const currentStep  = ORDER_STEPS[stepIndex];
              const auction      = order.auctions;

              return (
                <div className="track-order-card" key={order.id}>
                  {/* ── Top: Item Info ── */}
                  <div className="track-card-top">
                    {auction?.image_url ? (
                      <img
                        src={auction.image_url}
                        alt={auction.title}
                        className="track-card-img"
                      />
                    ) : (
                      <div className="track-card-img-placeholder">
                        <Package size={28} />
                      </div>
                    )}

                    <div className="track-card-info">
                      <div className="track-card-title">
                        {auction?.title || "Auction Item"}
                      </div>
                      <div className="track-card-meta">
                        <span>
                          <MapPin size={11} />
                          {auction?.category
                            ? auction.category.charAt(0).toUpperCase() + auction.category.slice(1)
                            : "Item"}
                        </span>
                        <span>
                          <Clock size={11} />
                          Ordered {formatDate(order.created_at)}
                        </span>
                        {order.seller?.full_name && (
                          <span>Seller: <strong>{order.seller.full_name}</strong></span>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div className="track-card-amount">${order.amount?.toLocaleString()}</div>
                        <div className="track-card-orderId">#{order.id.slice(0, 8).toUpperCase()}</div>
                      </div>
                    </div>

                    {/* View auction link */}
                    {auction?.id && (
                      <button
                        onClick={() => navigate(`/auction/${auction.id}`)}
                        style={{
                          display: "flex", alignItems: "center", gap: 4,
                          padding: "7px 14px", borderRadius: "8px",
                          border: "1.5px solid hsl(221 83% 53% / 0.2)",
                          background: "hsl(221 83% 53% / 0.05)",
                          color: "#2563eb", fontSize: "12px", fontWeight: 600,
                          cursor: "pointer", fontFamily: "Inter, sans-serif",
                          whiteSpace: "nowrap", flexShrink: 0,
                        }}
                      >
                        <ExternalLink size={12} /> View
                      </button>
                    )}
                  </div>

                  {/* ── Progress Bar ── */}
                  <div className="track-progress-wrap">
                    <div className="track-progress-bar">
                      <div
                        className="track-progress-fill"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <div className="track-progress-text">
                      <span>
                        Status: <strong style={{ color: stepIndex === 4 ? "#059669" : "#2563eb" }}>
                          {currentStep.label.replace("\n", " ")}
                        </strong>
                      </span>
                      <span>Est. Delivery: {getEstimatedDelivery(order.created_at)}</span>
                    </div>
                  </div>

                  {/* ── Step Timeline ── */}
                  <div className="track-timeline">
                    <div className="track-timeline-label">Tracking Progress</div>
                    <div className="track-steps">
                      {ORDER_STEPS.map((step, i) => {
                        const StepIcon = step.icon;
                        const state =
                          i < stepIndex  ? "done"
                          : i === stepIndex ? "active"
                          : "pending";

                        // connector state (line after this step)
                        const connectorState =
                          i < stepIndex - 1 ? "filled"
                          : i === stepIndex - 1 ? "active"
                          : "empty";

                        return (
                          <div className={`track-step ${state}`} key={step.key}>
                            {/* Connector line between steps */}
                            {i < ORDER_STEPS.length - 1 && (
                              <div className={`track-step-connector ${connectorState}`} />
                            )}

                            <div className="track-step-icon">
                              <StepIcon size={i === 0 ? 16 : 17} />
                            </div>

                            <div className="track-step-label">
                              {step.label.split("\n").map((line, li) => (
                                <div key={li}>{line}</div>
                              ))}
                            </div>

                            <div className="track-step-date">
                              {i <= stepIndex
                                ? i === 0
                                  ? formatDate(order.created_at)
                                  : i === stepIndex
                                    ? "Today"
                                    : "✓"
                                : "—"}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default TrackOrders;
