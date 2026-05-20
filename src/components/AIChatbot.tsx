import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import "./AIChatbot.css";

// ─── Types ───────────────────────────────────────────
interface ChatMessage {
  id: string;
  role: "user" | "bot";
  text: string;
  time: string;
}

interface AuctionItem {
  id: string;
  title: string;
  category: string;
  current_price: number;
  end_date: string;
  bid_count: number;
}

// ─── Quick action chips ──────────────────────────────
const QUICK_ACTIONS = [
  "How does bidding work?",
  "How do I sell an item?",
  "Show active auctions",
  "Payment & security",
  "Help with my account",
];

// ─── Smart Response Engine ───────────────────────────
interface ResponseRule {
  keywords: string[];
  response: string | ((auctions: AuctionItem[]) => string);
  priority: number;
}

const RESPONSE_RULES: ResponseRule[] = [
  // Greetings
  {
    keywords: ["hello", "hi", "hey", "greetings", "good morning", "good evening", "good afternoon", "sup", "yo", "howdy"],
    response: "Hey there! 👋 Welcome to Auctify! I'm **AuctBot**, your auction assistant.\n\nI can help you with:\n• How bidding works\n• How to sell items\n• Browsing active auctions\n• Payment & security info\n• Account help\n\nWhat would you like to know?",
    priority: 1,
  },
  // Bidding
  {
    keywords: ["bid", "bidding", "how to bid", "place bid", "make bid", "bid work"],
    response: "Here's how **bidding** works on Auctify 🎯\n\n1. **Log in** to your account first\n2. Make sure you have a **payment method** saved at /payment-methods\n3. Browse auctions at /auction and find something you like\n4. Each bid must be at least **$5 more** than the current highest bid\n5. When the auction ends, the **highest bidder wins!**\n6. The winner gets a **Pay Now** button to complete the purchase\n7. After payment, you can **chat with the seller** directly\n\nReady to start bidding? Head to /auction to browse!",
    priority: 10,
  },
  // Selling
  {
    keywords: ["sell", "selling", "list item", "create auction", "how to sell", "start selling", "list my", "put up for"],
    response: "Want to **sell on Auctify**? Here's how! 🏷️\n\n1. **Log in** or create an account\n2. Go to /create-auction (or click \"Start Selling\" on the home page)\n3. Fill in your item details:\n   • Title & description\n   • Category (Jewelry, Cars, Phones, etc.)\n   • Starting price\n   • Start & end dates\n   • Upload images\n4. Your auction goes **live** at the start date!\n5. Track your listings at /dashboard\n\nOnce sold, you'll be able to **chat with the buyer** to arrange delivery. Head to /create-auction to get started!",
    priority: 10,
  },
  // Active auctions
  {
    keywords: ["active auction", "show auction", "current auction", "browse auction", "what auction", "available auction", "live auction", "ongoing"],
    response: (auctions: AuctionItem[]) => {
      if (!auctions || auctions.length === 0) {
        return "There are no active auctions right now. Check back soon or head to /create-auction to list the first one! 🚀";
      }
      const list = auctions
        .slice(0, 5)
        .map(
          (a) =>
            `• **${a.title}** (${a.category}) — $${a.current_price?.toLocaleString() || "0"} | ${a.bid_count || 0} bids | Ends ${new Date(a.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
        )
        .join("\n");
      return `Here are the latest auctions on Auctify! 🔥\n\n${list}\n\nBrowse all auctions at /auction`;
    },
    priority: 10,
  },
  // Payment & Security
  {
    keywords: ["payment", "pay", "secure", "security", "escrow", "credit card", "debit card", "money", "transaction", "safe"],
    response: "Your **payments are secure** on Auctify 🔒\n\n• All transactions use **secure payment processing**\n• Funds are held in **escrow** until delivery is confirmed\n• You need to add a payment method at /payment-methods before bidding\n• Winners see a **\"Pay Now\"** button on the auction page\n• After payment, buyer and seller can communicate via our **built-in chat**\n\nNeed to add a payment method? Go to /payment-methods",
    priority: 10,
  },
  // Account help
  {
    keywords: ["account", "sign up", "signup", "register", "login", "log in", "sign in", "password", "profile", "my account"],
    response: "Here's help with your **account** 👤\n\n• **Sign up**: Click the Sign Up button on the top right\n• **Log in**: Use your email and password\n• **Forgot password?**: Use the reset link on the login page\n• **My listings**: View and manage at /dashboard\n• **Payment methods**: Manage at /payment-methods\n\nIf you're having trouble, visit /contact to reach our support team!",
    priority: 10,
  },
  // Categories
  {
    keywords: ["category", "categories", "jewelry", "cars", "phones", "electronics", "watches", "real estate", "fashion", "what can i buy", "what can i sell"],
    response: "Auctify supports these **categories** 📦\n\n• 💎 **Jewelry** — Rings, necklaces, bracelets & more\n• 🚗 **Cars** — Vehicles & automobiles\n• 📱 **Phones** — Smartphones & accessories\n• 💻 **Electronics** — Gadgets & tech\n• ⌚ **Watches** — Luxury & casual timepieces\n• 🏠 **Real Estate** — Properties & land\n• 👗 **Fashion** — Clothing & accessories\n\nBrowse by category at /auction!",
    priority: 8,
  },
  // Navigation help
  {
    keywords: ["where", "find", "navigate", "page", "go to", "how do i get to", "link"],
    response: "Here's a quick **site map** for Auctify 🗺️\n\n• **Home**: / — Featured auctions & search\n• **All Auctions**: /auction — Browse & filter\n• **Create Auction**: /create-auction — List an item\n• **My Listings**: /dashboard — Manage your auctions\n• **Payment Methods**: /payment-methods — Add/manage cards\n• **About Us**: /about — Learn about Auctify\n• **Contact**: /contact — Get support\n\nJust click any link above to navigate!",
    priority: 7,
  },
  // Winning
  {
    keywords: ["win", "won", "winner", "i won", "after winning", "what happens when"],
    response: "Congratulations on winning! 🎉 Here's what happens next:\n\n1. A **\"Pay Now\"** button appears on the auction detail page\n2. Click it to complete your **secure payment**\n3. Funds are held in **escrow** for safety\n4. You can **chat with the seller** to arrange delivery\n5. Once you receive the item, the payment is released\n\nHead to /auction to check your won auctions!",
    priority: 9,
  },
  // Chat system
  {
    keywords: ["chat", "message", "contact seller", "contact buyer", "talk to", "communicate"],
    response: "Auctify has a **built-in chat system** 💬\n\n• After an auction ends and payment is made, both buyer and seller can chat\n• Access your chats from the auction detail page\n• Discuss delivery details, ask questions, etc.\n• All messages are **private** between buyer and seller\n\nNeed general support instead? Visit /contact!",
    priority: 8,
  },
  // Thanks
  {
    keywords: ["thank", "thanks", "thank you", "thx", "appreciate", "helpful"],
    response: "You're welcome! 😊 Happy to help!\n\nIf you need anything else, just ask. Happy bidding on Auctify! 🎯",
    priority: 5,
  },
  // Goodbye
  {
    keywords: ["bye", "goodbye", "see you", "later", "cya", "gtg"],
    response: "Goodbye! 👋 Have a great time on Auctify!\n\nCome back anytime you need help. Happy bidding! 🎯",
    priority: 5,
  },
  // About Auctify
  {
    keywords: ["what is auctify", "about auctify", "tell me about", "what does this", "what is this site", "what is this website", "about this"],
    response: "**Auctify** is a real-time online auction platform! 🏆\n\n• Buy & sell items through **live auctions**\n• Browse categories like Jewelry, Cars, Phones, Electronics & more\n• Place bids in **real time** and compete with other bidders\n• Secure **payment & escrow** system\n• Built-in **chat** between buyers and sellers\n\nLearn more at /about or start browsing at /auction!",
    priority: 9,
  },
  // Price / cost
  {
    keywords: ["price", "cost", "how much", "expensive", "cheap", "affordable", "starting price", "minimum bid"],
    response: "About **pricing** on Auctify 💰\n\n• Sellers set a **starting price** when creating an auction\n• Each new bid must be at least **$5 higher** than the current bid\n• The **final price** is whatever the highest bidder offers\n• There are **no listing fees** for sellers\n• Check current prices by browsing auctions at /auction\n\nLooking for deals? Sort by \"Price: Low to High\" on the auctions page!",
    priority: 8,
  },
  // Time / duration
  {
    keywords: ["time", "when", "how long", "duration", "end date", "start date", "deadline", "expire", "countdown"],
    response: "About **auction timing** ⏰\n\n• Sellers choose **start and end dates** when listing\n• Each auction page shows a **live countdown** timer\n• When the timer hits zero, the **highest bidder wins**\n• You can browse auctions sorted by ending soonest at /auction\n\nDon't miss out — place your bid before time runs out!",
    priority: 7,
  },
  // Help / support
  {
    keywords: ["help", "support", "issue", "problem", "bug", "error", "not working", "trouble", "assist"],
    response: "Need **help**? I'm here for you! 🤝\n\nHere's what I can assist with:\n• **Bidding questions** — How to place bids\n• **Selling** — How to list items\n• **Payments** — Security & methods\n• **Navigation** — Finding pages\n• **Account** — Login & profile help\n\nFor technical issues, please visit /contact to reach our support team!",
    priority: 6,
  },
];

// Default fallback response
const FALLBACK_RESPONSES = [
  "I'm not quite sure about that, but I can help with **bidding**, **selling**, **payments**, or **navigating** Auctify! What would you like to know? 😊",
  "Hmm, I don't have info on that specifically. Try asking me about **how to bid**, **how to sell**, **active auctions**, or **account help**! 🤔",
  "I'd love to help! I'm best with questions about **auctions, bidding, selling, and payments** on Auctify. What can I help you with? 🎯",
];

function findBestResponse(
  userText: string,
  auctions: AuctionItem[]
): string {
  const lower = userText.toLowerCase();
  let bestMatch: ResponseRule | null = null;
  let bestScore = 0;

  for (const rule of RESPONSE_RULES) {
    let matchCount = 0;
    for (const kw of rule.keywords) {
      if (lower.includes(kw)) {
        matchCount++;
      }
    }
    if (matchCount > 0) {
      const score = matchCount * rule.priority;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = rule;
      }
    }
  }

  if (bestMatch) {
    if (typeof bestMatch.response === "function") {
      return bestMatch.response(auctions);
    }
    return bestMatch.response;
  }

  // Return a random fallback
  return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
}

// ─── Fetch auction context ──────────────────────────
async function fetchAuctions(): Promise<AuctionItem[]> {
  try {
    const { data, error } = await supabase
      .from("auctions")
      .select("id, title, category, current_price, end_date, bid_count")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error || !data) return [];
    return data as AuctionItem[];
  } catch {
    return [];
  }
}

// ─── Component ───────────────────────────────────────
const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 350);
      setHasUnread(false);
    }
  }, [isOpen]);

  const getNow = () =>
    new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

  const genId = () => Math.random().toString(36).slice(2, 9);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isTyping) return;

      const userMsg: ChatMessage = {
        id: genId(),
        role: "user",
        text: text.trim(),
        time: getNow(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsTyping(true);

      try {
        // Simulate AI thinking delay (300-800ms)
        await new Promise((r) => setTimeout(r, 300 + Math.random() * 500));

        // Fetch live auction data for context-aware responses
        const auctions = await fetchAuctions();

        // Get smart response
        const response = findBestResponse(text.trim(), auctions);

        const botMsg: ChatMessage = {
          id: genId(),
          role: "bot",
          text: response,
          time: getNow(),
        };

        setMessages((prev) => [...prev, botMsg]);
      } catch (err) {
        console.error("Chatbot error:", err);
        const errMsg: ChatMessage = {
          id: genId(),
          role: "bot",
          text: "Sorry, something went wrong. Please try again or visit /contact for support! 🙏",
          time: getNow(),
        };
        setMessages((prev) => [...prev, errMsg]);
      } finally {
        setIsTyping(false);
      }
    },
    [messages, isTyping]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  // Parse bot text for basic formatting: **bold** and navigation links
  const formatBotText = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*|\/[a-z-]+(?:\/[a-z0-9-]*)*)/g);

    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} style={{ color: "#93c5fd", fontWeight: 600 }}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (/^\/[a-z-]+(\/[a-z0-9-]*)*$/.test(part)) {
        return (
          <button
            key={i}
            onClick={() => {
              navigate(part);
              setIsOpen(false);
            }}
            style={{
              color: "#60a5fa",
              textDecoration: "underline",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: "inherit",
              padding: 0,
            }}
          >
            {part}
          </button>
        );
      }
      return part;
    });
  };

  return (
    <>
      {/* ── Chat Panel ──────────────────────────── */}
      {isOpen && (
        <div className="auctbot-panel" role="dialog" aria-label="AI Chat Assistant">
          {/* Header */}
          <div className="auctbot-header">
            <div className="auctbot-avatar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 8V4H8" />
                <rect width="16" height="12" x="4" y="8" rx="2" />
                <path d="M2 14h2" />
                <path d="M20 14h2" />
                <path d="M15 13v2" />
                <path d="M9 13v2" />
              </svg>
            </div>
            <div className="auctbot-header-info">
              <p className="auctbot-header-title">AuctBot</p>
              <p className="auctbot-header-subtitle">
                <span className="auctbot-online-dot" />
                Auction Assistant — AI Powered
              </p>
            </div>
            <button
              className="auctbot-clear-btn"
              onClick={clearChat}
              title="Clear chat"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="M5 6l1 14h12l1-14" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="auctbot-messages">
            {messages.length === 0 && (
              <div className="auctbot-welcome">
                <div className="auctbot-welcome-emoji">🤖</div>
                <p className="auctbot-welcome-title">
                  Hey! I'm AuctBot
                </p>
                <p className="auctbot-welcome-desc">
                  Your AI auction assistant. Ask me anything about bidding, selling, or navigating Auctify!
                </p>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`auctbot-msg ${msg.role}`}>
                <div className="auctbot-msg-bubble">
                  {msg.role === "bot" ? formatBotText(msg.text) : msg.text}
                </div>
                <div className="auctbot-msg-time">{msg.time}</div>
              </div>
            ))}

            {isTyping && (
              <div className="auctbot-typing">
                <div className="auctbot-typing-dot" />
                <div className="auctbot-typing-dot" />
                <div className="auctbot-typing-dot" />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length === 0 && (
            <div className="auctbot-chips">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action}
                  className="auctbot-chip"
                  onClick={() => sendMessage(action)}
                >
                  {action}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="auctbot-input-area">
            <input
              ref={inputRef}
              type="text"
              className="auctbot-input"
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isTyping}
            />
            <button
              className="auctbot-send"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isTyping}
              title="Send message"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
            </button>
          </div>

          {/* Footer */}
          <div className="auctbot-powered">
            Powered by AuctBot AI ✨
          </div>
        </div>
      )}

      {/* ── Toggle Button ───────────────────────── */}
      <button
        className={`auctbot-toggle ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close chat" : "Open AI assistant"}
      >
        {isOpen ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18" />
            <path d="M6 6l12 12" />
          </svg>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <path d="M8 10h.01" />
              <path d="M12 10h.01" />
              <path d="M16 10h.01" />
            </svg>
            {hasUnread && <span className="auctbot-badge">1</span>}
          </>
        )}
      </button>
    </>
  );
};

export default AIChatbot;
