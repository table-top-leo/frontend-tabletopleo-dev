"use client";
import { useState, useRef, useEffect } from "react";
import {
  MessageCircle, Bot, Send, Search, BookOpen, FileText, Video,
  ChevronRight, ChevronDown, Star, ThumbsUp, ThumbsDown, X,
  Clock, CheckCircle2, AlertCircle, Circle, Plus, Paperclip,
  Phone, Mail, ExternalLink, Zap, ArrowLeft, LifeBuoy,
  Hash, RefreshCw, Download, Copy, Smile, Mic, Image as ImageIcon,
  TrendingUp, Users, MessageSquare, BarChart2, HelpCircle,
  Home, Ticket, ChevronUp, Filter, Eye, Loader2,
} from "lucide-react";
import "../designdashboardcomponent/helpdesk.css";

// NOTE: adjust this path to wherever your SupportModal/DeleteModal
// file actually lives in your project (it exports both components).
import { SupportModal } from "../ApplicationMainLayout/modalsettingspage";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6163";
const WHATSAPP_NUMBER = "918688349726"; // 91 + 8688349726
const CALL_NUMBER = "+918688349726";

function authHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("ttl_token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

const NAV = [
  { id: "home",     label: "Help Center",    icon: Home },
  { id: "chat",     label: "AI Assistant",   icon: Bot },
  { id: "tickets",  label: "My Requests",    icon: Ticket },
  { id: "docs",     label: "Documentation",  icon: BookOpen },
  { id: "feedback", label: "Rate the App",   icon: Star },
];

const QUICK_ACTIONS = [
  { key: "chat",  icon: MessageCircle, label: "Live Chat",     desc: "Chat with us on WhatsApp", color: "qa-green",  badge: "Online" },
  { key: "email", icon: Mail,          label: "Email Support", desc: "support@tabletopleo.com",   color: "qa-violet", badge: "24/7 Support" },
  { key: "call",  icon: Phone,         label: "Call Us",       desc: "+91 86883 49726",           color: "qa-blue",   badge: "9AM–9PM" },
  { key: "demo",  icon: Video,         label: "Schedule Demo", desc: "Book a 30-min call",         color: "qa-amber",  badge: null },
];

const FAQ = [
  { q: "How do I add a new menu category?",         a: "Go to Menu & Category → click 'Add Category' → enter the name and save. Your new category will appear instantly in the sidebar." },
  { q: "Why are my orders not showing up?",          a: "Check your internet connection first. Then go to Settings → System Status to verify the Order API is operational. Try refreshing the page." },
  { q: "How do I set up payment gateway?",           a: "Navigate to Payment Setup → select your preferred gateway (Razorpay, Stripe, PayU) → enter your API keys and go live." },
  { q: "Can I have multiple branches?",             a: "Yes! Pro and Elite plans support multiple branches. Upgrade your plan and go to Settings → Branch Management to add locations." },
  { q: "How to download my QR code?",              a: "Go to Settings → QR Code → click 'Download PNG'. You can also regenerate a new QR anytime from the same page." },
  { q: "How do I reset my password?",              a: "Go to Settings → Account & Security → Change Password. Enter your current password and set a new one. Always use 8+ characters." },
];

const DOCS = [
  { icon: Zap,         category: "Getting Started",   title: "Quick Start Guide",         time: "5 min read",  views: "12.4k" },
  { icon: Hash,        category: "Orders",            title: "Managing Live Orders",       time: "8 min read",  views: "9.1k" },
  { icon: FileText,    category: "Menu",              title: "Building Your Menu",         time: "10 min read", views: "7.8k" },
  { icon: TrendingUp,  category: "Analytics",         title: "Understanding Your Reports", time: "6 min read",  views: "5.2k" },
  { icon: BarChart2,   category: "Payments",          title: "Payment Setup & Gateways",   time: "12 min read", views: "4.6k" },
  { icon: Users,       category: "Team",              title: "Adding Team Members",        time: "4 min read",  views: "3.9k" },
];

const AI_SUGGESTIONS = [
  "How do I accept online payments?",
  "Why is my QR code not working?",
  "How to add staff accounts?",
  "How to export my order history?",
  "How do I set up the self-service kiosk?",
  "What happens if I miss an order?",
];

const BOT_RESPONSES = {
  default: "I'm here to help! 🙌 Could you give me a few more details about what you're trying to do? I can walk you through payments, menu setup, QR codes, kiosk mode, staff accounts, order handling and more — or you can browse our documentation or raise a support request any time.",
  greeting: "Hey there! 👋 Great to have you here. TableTop Leo is built to make running your restaurant faster and easier — from QR ordering to kiosk checkout to live order tracking. What can I help you set up today?",
  payment: "Setting up payments is quick: go to **Payment Setup** in the sidebar → choose your gateway (Razorpay is great for India, Stripe works well internationally) → enter your API keys → click **Go Live**. Most merchants are accepting live payments within 10 minutes. Want help finding your API keys?",
  qr: "Your QR code lives in **Settings → QR Code**. If it's not scanning well, tap **Regenerate** for a crisp new one, or download it as a high-res PNG for printing on table tents. A well-placed QR code can boost order speed by up to 30% — worth printing a few extra for busy tables!",
  menu: "Managing your menu is one of the easiest parts of TableTop Leo: head to **Menu & Category**, add categories, upload appetizing photos, set prices, and toggle item availability in real time. Customers see changes instantly, so you're always in control — even mid-shift.",
  order: "Live orders show up automatically in your **Orders** dashboard the moment a customer checks out — no refresh needed. If something looks off, double-check your connection and peek at **Settings → System Status**. Most order hiccups resolve themselves within a minute or two.",
  staff: "Adding your team is simple: **Settings → Team Management** (Pro and Elite plans) lets you invite Managers, Chefs, and Cashiers, each with their own permission level — so everyone sees exactly what they need, nothing more.",
  kiosk: "Kiosk mode turns any tablet or touchscreen into a full self-service ordering station — great for reducing queues during rush hours! Head to **Settings → Kiosk Setup** to enable it for your business, then just open the kiosk URL in full-screen browser mode on your device.",
  pricing: "TableTop Leo scales with you — start free, and upgrade only when you need more. You can see your current plan and usage any time under **Settings → Billing**. Reach out any time if you'd like a walkthrough of what each plan unlocks.",
  thanks: "You're very welcome! 😊 That's what I'm here for. Feel free to ask me anything else — or if you'd like a real human, our team is one WhatsApp message away.",
};

const STATUS_MAP = {
  OPEN:        { label: "Open",        cls: "tk-open",       icon: Circle },
  IN_PROGRESS: { label: "In Progress", cls: "tk-inprogress", icon: RefreshCw },
  RESOLVED:    { label: "Resolved",    cls: "tk-resolved",   icon: CheckCircle2 },
  CLOSED:      { label: "Closed",      cls: "tk-resolved",   icon: CheckCircle2 },
};

const PRIORITY_MAP = {
  High:   { label: "High",   cls: "pr-high" },
  Medium: { label: "Medium", cls: "pr-medium" },
  Low:    { label: "Low",    cls: "pr-low" },
};

function getBotReply(msg) {
  const m = msg.toLowerCase();
  if (m.includes("thank")) return BOT_RESPONSES.thanks;
  if (/^(hi|hey|hello|yo)\b/.test(m.trim())) return BOT_RESPONSES.greeting;
  if (m.includes("payment") || m.includes("gateway") || m.includes("razorpay") || m.includes("stripe")) return BOT_RESPONSES.payment;
  if (m.includes("qr") || m.includes("scan") || m.includes("code")) return BOT_RESPONSES.qr;
  if (m.includes("menu") || m.includes("item") || m.includes("category")) return BOT_RESPONSES.menu;
  if (m.includes("order") || m.includes("missing") || m.includes("blank")) return BOT_RESPONSES.order;
  if (m.includes("staff") || m.includes("team") || m.includes("member")) return BOT_RESPONSES.staff;
  if (m.includes("kiosk") || m.includes("self service") || m.includes("self-service")) return BOT_RESPONSES.kiosk;
  if (m.includes("price") || m.includes("plan") || m.includes("billing") || m.includes("subscription")) return BOT_RESPONSES.pricing;
  return BOT_RESPONSES.default;
}

export default function HelpDesk() {
  const [active, setActive]         = useState("home");
  const [messages, setMessages]     = useState([
    { role: "bot", text: "Hi! I'm **Leo**, your TableTop AI assistant 👋\n\nI can help you with orders, menu setup, payments, kiosk mode, QR codes and more. What do you need help with today?", time: "Just now", liked: null },
  ]);
  const [input, setInput]           = useState("");
  const [typing, setTyping]         = useState(false);
  const [search, setSearch]         = useState("");
  const [openFaq, setOpenFaq]       = useState(null);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const chatEndRef = useRef();

  // ── My Requests (real tickets) ──────────────────────────────────
  const [tickets, setTickets]           = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [ticketsError, setTicketsError]     = useState("");
  const [newTicket, setNewTicket]       = useState(false);
  const [ticketForm, setTicketForm]     = useState({ subject: "", desc: "", priority: "Medium" });
  const [submitting, setSubmitting]     = useState(false);
  const [submitError, setSubmitError]   = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const loadMyTickets = () => {
    setTicketsLoading(true);
    setTicketsError("");
    fetch(`${API_BASE}/api/admin/support-tickets/mine`, { headers: authHeaders() })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setTickets(json.data || []);
        else setTicketsError(json.message || "Failed to load your requests");
      })
      .catch(() => setTicketsError("Failed to load your requests"))
      .finally(() => setTicketsLoading(false));
  };

  useEffect(() => { loadMyTickets(); }, []);

  // ── Rate the App (real review, write-once) ──────────────────────
  const [myReview, setMyReview]         = useState(null);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [rating, setRating]             = useState(0);
  const [hoverRating, setHoverRating]   = useState(0);
  const [feedback, setFeedback]         = useState("");
  const [feedbackSending, setFeedbackSending] = useState(false);
  const [feedbackError, setFeedbackError]     = useState("");
  const [feedbackSent, setFeedbackSent]       = useState(false);

  useEffect(() => {
    setReviewLoading(true);
    fetch(`${API_BASE}/api/admin/reviews/app/mine`, { headers: authHeaders() })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) setMyReview(json.data);
      })
      .catch(() => {})
      .finally(() => setReviewLoading(false));
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setMessages(m => [...m, { role: "user", text: msg, time: "Just now" }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(m => [...m, { role: "bot", text: getBotReply(msg), time: "Just now", liked: null }]);
    }, 1200);
  };

  const likeMsg = (idx, val) => {
    setMessages(m => m.map((msg, i) => i === idx ? { ...msg, liked: val } : msg));
  };

  const submitTicket = async () => {
    if (!ticketForm.subject.trim()) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch(`${API_BASE}/api/admin/support-tickets`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          subject: ticketForm.subject.trim(),
          category: "Other",
          priority: ticketForm.priority,
          description: ticketForm.desc.trim() || ticketForm.subject.trim(),
          includeSysInfo: false,
        }),
      });
      const json = await res.json();
      if (!res.ok || json.success === false) throw new Error(json.message || "Failed to submit request");
      setTickets((prev) => [json.data, ...prev]);
      setTicketForm({ subject: "", desc: "", priority: "Medium" });
      setNewTicket(false);
    } catch (e) {
      setSubmitError(e.message || "Failed to submit request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const submitFeedback = async () => {
    if (rating === 0) return;
    setFeedbackSending(true);
    setFeedbackError("");
    try {
      const res = await fetch(`${API_BASE}/api/admin/reviews/app`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ rating, reviewText: feedback.trim() || null }),
      });
      const json = await res.json();
      if (!res.ok || json.success === false) throw new Error(json.message || "Failed to submit feedback");
      setMyReview(json.data);
      setFeedbackSent(true);
    } catch (e) {
      setFeedbackError(e.message || "Failed to submit feedback. Please try again.");
    } finally {
      setFeedbackSending(false);
    }
  };

  const handleQuickAction = (key) => {
    if (key === "chat") {
      window.open(`https://wa.me/${WHATSAPP_NUMBER}`, "_blank");
    } else if (key === "call") {
      window.location.href = `tel:${CALL_NUMBER}`;
    } else if (key === "email") {
      setShowSupportModal(true);
    } else if (key === "demo") {
      setActive("chat");
      sendMessage("I'd like to schedule a demo call");
    }
  };

  const normalizedTickets = tickets.map((t) => ({
    id: t.ticketId,
    subject: t.subject,
    status: t.status, // OPEN / IN_PROGRESS / RESOLVED / CLOSED
    priority: t.priority,
    time: new Date(t.createdAt).toLocaleDateString("en-US", { day: "2-digit", month: "short" }),
  }));

  const filteredTickets = normalizedTickets.filter(t => filterStatus === "all" || t.status === filterStatus);
  const filteredFaq     = FAQ.filter(f => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()));
  const filteredDocs    = DOCS.filter(d => d.title.toLowerCase().includes(search.toLowerCase()) || d.category.toLowerCase().includes(search.toLowerCase()));

  const renderBotText = (text) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((p, i) => i % 2 === 1 ? <strong key={i}>{p}</strong> : p);
  };

  const activeNav = NAV.find(n => n.id === active);
  const openOrProgressCount = normalizedTickets.filter(t => t.status === "OPEN" || t.status === "IN_PROGRESS").length;

  return (
    <div className="hd-root">
      <aside className="hd-sidebar">
        <div className="hd-sidebar-brand">
          <div className="hd-brand-icon">
            <LifeBuoy size={18} color="#fff" />
          </div>
          <div>
            <div className="hd-brand-name">Help Center</div>
            <div className="hd-brand-sub">TableTop Leo</div>
          </div>
        </div>

        <nav className="hd-nav">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" onClick={() => setActive(id)}
              className={`hd-nav-btn ${active === id ? "hd-nav-active" : ""}`}>
              <Icon size={16} className={active === id ? "hd-nav-icon-active" : "hd-nav-icon"} />
              <span>{label}</span>
              {id === "tickets" && openOrProgressCount > 0 && <span className="hd-nav-count">{openOrProgressCount}</span>}
            </button>
          ))}
        </nav>

        <div className="hd-sidebar-status">
          <div className="hd-status-row">
            <span className="hd-status-dot hd-status-green" />
            <span className="hd-status-label">24/7 AI Support</span>
          </div>
          <div className="hd-status-row">
            <Clock size={11} className="hd-status-clock" />
            <span className="hd-status-label">Live Team · Mon–Sun 9AM–9PM</span>
          </div>
        </div>
      </aside>

      <div className="hd-body">
        <header className="hd-topbar">
          <div className="hd-topbar-left">
            <div className="hd-topbar-icon">
              {activeNav && <activeNav.icon size={16} className="hd-topbar-ico" />}
            </div>
            <div>
              <div className="hd-topbar-title">{activeNav?.label}</div>
              <div className="hd-topbar-sub">TableTop Leo · Help & Support</div>
            </div>
          </div>
          <div className="hd-topbar-right">
            <div className="hd-search-bar">
              <Search size={14} className="hd-search-icon" />
              <input className="hd-search-input" placeholder="Search help articles..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="hd-online-badge">
              <span className="hd-status-dot hd-status-green" /> Online
            </div>
          </div>
          <div className="hd-mobile-tabs">
            {NAV.map(({ id, icon: Icon }) => (
              <button key={id} type="button" onClick={() => setActive(id)}
                className={`hd-mob-tab ${active === id ? "hd-mob-tab-active" : ""}`}>
                <Icon size={15} />
              </button>
            ))}
          </div>
        </header>

        <main className="hd-content">

          {active === "home" && (
            <div className="hd-home">
              <div className="hd-hero">
                <div className="hd-hero-icon"><LifeBuoy size={28} color="#7c3aed" /></div>
                <h1 className="hd-hero-title">How can we help you?</h1>
                <p className="hd-hero-sub">Search our knowledge base or reach out to our support team.</p>
                <div className="hd-hero-search">
                  <Search size={16} className="hd-hero-search-icon" />
                  <input className="hd-hero-search-input" placeholder="e.g. How to add a menu item..." value={search} onChange={e => setSearch(e.target.value)} />
                  <button type="button" className="hd-hero-search-btn" onClick={() => setActive("docs")}>Search</button>
                </div>
                <div className="hd-hero-tags">
                  {["Payments", "QR Code", "Orders", "Menu Setup", "Team"].map(tag => (
                    <button key={tag} type="button" onClick={() => { setSearch(tag); setActive("docs"); }} className="hd-tag">{tag}</button>
                  ))}
                </div>
              </div>

              <div className="hd-quick-grid">
                {QUICK_ACTIONS.map(({ key, icon: Icon, label, desc, color, badge }) => (
                  <button key={label} type="button" className={`hd-quick-card ${color}`} onClick={() => handleQuickAction(key)}>
                    <div className="hd-quick-top">
                      <div className="hd-quick-icon"><Icon size={18} /></div>
                      {badge && <span className="hd-quick-badge">{badge}</span>}
                    </div>
                    <div className="hd-quick-label">{label}</div>
                    <div className="hd-quick-desc">{desc}</div>
                  </button>
                ))}
              </div>

              <div className="hd-home-grid">
                <div className="hd-panel">
                  <div className="hd-panel-head">
                    <h3 className="hd-panel-title">Popular Articles</h3>
                    <button type="button" onClick={() => setActive("docs")} className="hd-panel-link">View all <ChevronRight size={13} /></button>
                  </div>
                  {DOCS.slice(0, 4).map((doc, i) => {
                    const Icon = doc.icon;
                    return (
                      <div key={i} className="hd-doc-row">
                        <div className="hd-doc-icon"><Icon size={14} /></div>
                        <div className="hd-doc-info">
                          <div className="hd-doc-title">{doc.title}</div>
                          <div className="hd-doc-meta">{doc.category} · {doc.time} · {doc.views} views</div>
                        </div>
                        <ChevronRight size={14} className="hd-doc-arrow" />
                      </div>
                    );
                  })}
                </div>

                <div className="hd-panel">
                  <div className="hd-panel-head">
                    <h3 className="hd-panel-title">Quick FAQ</h3>
                  </div>
                  {filteredFaq.slice(0, 3).map((f, i) => (
                    <div key={i} className="hd-faq-item">
                      <button type="button" onClick={() => setOpenFaq(openFaq === i ? null : i)} className="hd-faq-q">
                        <span>{f.q}</span>
                        {openFaq === i ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                      {openFaq === i && <div className="hd-faq-a">{f.a}</div>}
                    </div>
                  ))}
                  <button type="button" onClick={() => setActive("chat")} className="hd-ask-leo-btn">
                    <Bot size={14} /> Ask Leo AI instead
                  </button>
                </div>
              </div>

              <div className="hd-stats-row">
                {[
                  { icon: MessageSquare, val: "2 min",  label: "Avg Response" },
                  { icon: CheckCircle2,  val: "98.4%",  label: "Resolution Rate" },
                  { icon: Star,          val: "4.9 ★",  label: "Satisfaction" },
                  { icon: Users,         val: "24/7",   label: "AI Support" },
                ].map(({ icon: Icon, val, label }) => (
                  <div key={label} className="hd-stat-card">
                    <Icon size={16} className="hd-stat-icon" />
                    <div className="hd-stat-val">{val}</div>
                    <div className="hd-stat-label">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {active === "chat" && (
            <div className="hd-chat-wrap">
              <div className="hd-chat-header">
                <div className="hd-chat-avatar">
                  <Bot size={18} color="#fff" />
                  <span className="hd-chat-avatar-dot" />
                </div>
                <div>
                  <div className="hd-chat-name">Leo AI Assistant</div>
                  <div className="hd-chat-status">Always online · Powered by TableTop</div>
                </div>
                <div className="hd-chat-header-right">
                  <button type="button" className="hd-chat-action-btn" onClick={() => setMessages([{ role: "bot", text: "Hi! I'm **Leo**, your TableTop AI assistant 👋\n\nHow can I help you today?", time: "Just now", liked: null }])}>
                    <RefreshCw size={14} />
                  </button>
                </div>
              </div>

              <div className="hd-chat-suggestions">
                {AI_SUGGESTIONS.map(s => (
                  <button key={s} type="button" onClick={() => sendMessage(s)} className="hd-suggestion-pill">{s}</button>
                ))}
              </div>

              <div className="hd-messages">
                {messages.map((msg, i) => (
                  <div key={i} className={`hd-msg-row ${msg.role === "user" ? "hd-msg-user" : "hd-msg-bot"}`}>
                    {msg.role === "bot" && (
                      <div className="hd-msg-avatar"><Bot size={13} color="#fff" /></div>
                    )}
                    <div className={`hd-bubble ${msg.role === "user" ? "hd-bubble-user" : "hd-bubble-bot"}`}>
                      <div className="hd-bubble-text">{renderBotText(msg.text)}</div>
                      <div className="hd-bubble-footer">
                        <span className="hd-bubble-time">{msg.time}</span>
                        {msg.role === "bot" && (
                          <div className="hd-bubble-actions">
                            <button type="button" onClick={() => likeMsg(i, true)} className={`hd-react-btn ${msg.liked === true ? "hd-react-active-up" : ""}`}><ThumbsUp size={11} /></button>
                            <button type="button" onClick={() => likeMsg(i, false)} className={`hd-react-btn ${msg.liked === false ? "hd-react-active-down" : ""}`}><ThumbsDown size={11} /></button>
                            <button type="button" className="hd-react-btn"><Copy size={11} /></button>
                          </div>
                        )}
                      </div>
                    </div>
                    {msg.role === "user" && (
                      <div className="hd-msg-avatar hd-msg-avatar-user">LZ</div>
                    )}
                  </div>
                ))}
                {typing && (
                  <div className="hd-msg-row hd-msg-bot">
                    <div className="hd-msg-avatar"><Bot size={13} color="#fff" /></div>
                    <div className="hd-bubble hd-bubble-bot hd-bubble-typing">
                      <span /><span /><span />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="hd-chat-input-wrap">
                <button type="button" className="hd-input-action-btn"><Paperclip size={15} /></button>
                <input className="hd-chat-input" placeholder="Ask Leo anything about TableTop..."
                  value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendMessage()} />
                <button type="button" className="hd-input-action-btn"><Smile size={15} /></button>
                <button type="button" onClick={() => sendMessage()} className={`hd-send-btn ${input.trim() ? "hd-send-active" : ""}`} disabled={!input.trim()}>
                  <Send size={15} />
                </button>
              </div>

              <div className="hd-chat-footer-note">
                Powered by TableTop Leo AI · Responses may not always be perfect · <span className="hd-chat-link" onClick={() => setActive("tickets")}>Raise a request</span> for complex issues
              </div>
            </div>
          )}

          {active === "tickets" && (
            <div className="hd-tickets-wrap">
              <div className="hd-tickets-head">
                <div>
                  <h2 className="hd-section-title">My Requests</h2>
                  <p className="hd-section-sub">Track and manage the support requests you've raised</p>
                </div>
                <button type="button" onClick={() => setNewTicket(true)} className="hd-btn-primary">
                  <Plus size={14} /> New Request
                </button>
              </div>

              {newTicket && (
                <div className="hd-ticket-form">
                  <div className="hd-tf-head">
                    <span className="hd-tf-title">Create New Request</span>
                    <button type="button" onClick={() => setNewTicket(false)} className="hd-tf-close"><X size={16} /></button>
                  </div>
                  <div className="hd-tf-body">
                    <div className="hd-tf-field">
                      <label className="hd-tf-label">Subject *</label>
                      <input className="hd-tf-input" placeholder="Briefly describe your issue..."
                        value={ticketForm.subject} onChange={e => setTicketForm(f => ({ ...f, subject: e.target.value }))} />
                    </div>
                    <div className="hd-tf-field">
                      <label className="hd-tf-label">Description</label>
                      <textarea className="hd-tf-textarea" rows={3} placeholder="Provide more details about your issue..."
                        value={ticketForm.desc} onChange={e => setTicketForm(f => ({ ...f, desc: e.target.value }))} />
                    </div>
                    <div className="hd-tf-field">
                      <label className="hd-tf-label">Priority</label>
                      <div className="hd-priority-btns">
                        {["Low", "Medium", "High"].map(p => (
                          <button key={p} type="button" onClick={() => setTicketForm(f => ({ ...f, priority: p }))}
                            className={`hd-priority-btn ${ticketForm.priority === p ? "hd-priority-active" : ""}`}>
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                    {submitError && <div className="hd-tf-field" style={{ color: "#dc2626", fontSize: 12.5, fontWeight: 600 }}>⚠ {submitError}</div>}
                    <div className="hd-tf-actions">
                      <button type="button" onClick={() => setNewTicket(false)} className="hd-btn-ghost">Cancel</button>
                      <button type="button" onClick={submitTicket} disabled={submitting || !ticketForm.subject.trim()} className="hd-btn-primary">
                        {submitting ? <Loader2 size={13} style={{ animation: "spin .7s linear infinite" }} /> : <Send size={13} />}
                        {submitting ? "Submitting..." : "Submit Request"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="hd-filter-row">
                {["all", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map(s => (
                  <button key={s} type="button" onClick={() => setFilterStatus(s)}
                    className={`hd-filter-btn ${filterStatus === s ? "hd-filter-active" : ""}`}>
                    {s === "all" ? "All" : STATUS_MAP[s]?.label || s}
                    {s !== "all" && <span className="hd-filter-count">{normalizedTickets.filter(t => t.status === s).length}</span>}
                  </button>
                ))}
              </div>

              <div className="hd-ticket-list">
                {ticketsLoading ? (
                  <div className="hd-empty"><Loader2 size={20} style={{ animation: "spin .7s linear infinite" }} /></div>
                ) : ticketsError ? (
                  <div className="hd-empty">{ticketsError}</div>
                ) : filteredTickets.length === 0 ? (
                  <div className="hd-empty">No requests found. Raise one above if you need help!</div>
                ) : (
                  filteredTickets.map(t => {
                    const st = STATUS_MAP[t.status] || STATUS_MAP.OPEN;
                    const pr = PRIORITY_MAP[t.priority] || PRIORITY_MAP.Medium;
                    const StIcon = st.icon;
                    return (
                      <div key={t.id} className="hd-ticket-card">
                        <div className="hd-ticket-top">
                          <div className="hd-ticket-id">{t.id}</div>
                          <div className="hd-ticket-badges">
                            <span className={`hd-status-badge ${st.cls}`}>
                              <StIcon size={11} /> {st.label}
                            </span>
                            <span className={`hd-priority-badge ${pr.cls}`}>{pr.label}</span>
                          </div>
                        </div>
                        <div className="hd-ticket-subject">{t.subject}</div>
                        <div className="hd-ticket-meta">
                          <span><Clock size={11} /> {t.time}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {active === "docs" && (
            <div className="hd-docs-wrap">
              <div className="hd-docs-head">
                <h2 className="hd-section-title">Documentation</h2>
                <p className="hd-section-sub">Everything you need to know about TableTop Leo</p>
              </div>

              <div className="hd-docs-cats">
                {["All", "Getting Started", "Orders", "Menu", "Payments", "Analytics", "Team"].map(cat => (
                  <button key={cat} type="button" className={`hd-cat-pill ${cat === "All" ? "hd-cat-active" : ""}`}>{cat}</button>
                ))}
              </div>

              <div className="hd-docs-grid">
                {(search ? filteredDocs : DOCS).map((doc, i) => {
                  const Icon = doc.icon;
                  return (
                    <div key={i} className="hd-doc-card">
                      <div className="hd-doc-card-icon"><Icon size={18} className="hd-doc-card-ico" /></div>
                      <div className="hd-doc-card-cat">{doc.category}</div>
                      <div className="hd-doc-card-title">{doc.title}</div>
                      <div className="hd-doc-card-meta">
                        <span><Clock size={11} /> {doc.time}</span>
                        <span><Eye size={11} /> {doc.views}</span>
                      </div>
                      <button type="button" className="hd-doc-card-btn">
                        Read Article <ChevronRight size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="hd-faq-section">
                <h3 className="hd-faq-title">Frequently Asked Questions</h3>
                {filteredFaq.map((f, i) => (
                  <div key={i} className="hd-faq-item">
                    <button type="button" onClick={() => setOpenFaq(openFaq === i ? null : i)} className="hd-faq-q">
                      <span>{f.q}</span>
                      {openFaq === i ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    {openFaq === i && <div className="hd-faq-a">{f.a}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {active === "feedback" && (
            <div className="hd-feedback-wrap">
              {reviewLoading ? (
                <div className="hd-empty"><Loader2 size={20} style={{ animation: "spin .7s linear infinite" }} /></div>
              ) : myReview || feedbackSent ? (
                <div className="hd-feedback-success">
                  <CheckCircle2 size={40} className="hd-success-icon" />
                  <h2 className="hd-success-title">Thank you for your feedback!</h2>
                  <p className="hd-success-sub">
                    You rated TableTop Leo {(myReview?.rating || rating)} / 5. Your response helps us improve every day.
                  </p>
                </div>
              ) : (
                <>
                  <div className="hd-feedback-hero">
                    <Star size={28} className="hd-feedback-star-icon" />
                    <h2 className="hd-feedback-title">Rate the App</h2>
                    <p className="hd-feedback-sub">Help us make TableTop Leo better for everyone</p>
                  </div>

                  <div className="hd-feedback-card">
                    <div className="hd-fb-section">
                      <div className="hd-fb-label">How would you rate your overall experience?</div>
                      <div className="hd-stars">
                        {[1,2,3,4,5].map(n => (
                          <button key={n} type="button"
                            onMouseEnter={() => setHoverRating(n)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(n)}
                            className={`hd-star-btn ${(hoverRating || rating) >= n ? "hd-star-active" : ""}`}>
                            <Star size={28} />
                          </button>
                        ))}
                      </div>
                      {rating > 0 && (
                        <div className="hd-rating-label">
                          {["", "Poor", "Fair", "Good", "Very Good", "Excellent!"][rating]}
                        </div>
                      )}
                    </div>

                    <div className="hd-fb-divider" />

                    <div className="hd-fb-section">
                      <div className="hd-fb-label">Tell us more (optional)</div>
                      <textarea className="hd-fb-textarea" rows={3}
                        placeholder="Share your thoughts, suggestions or report any issues..."
                        value={feedback} onChange={e => setFeedback(e.target.value)} />
                    </div>

                    {feedbackError && (
                      <div className="hd-fb-section" style={{ color: "#dc2626", fontSize: 12.5, fontWeight: 600 }}>⚠ {feedbackError}</div>
                    )}

                    <button type="button" onClick={submitFeedback} disabled={rating === 0 || feedbackSending} className="hd-fb-submit">
                      {feedbackSending ? <Loader2 size={14} style={{ animation: "spin .7s linear infinite" }} /> : <Send size={14} />}
                      {feedbackSending ? "Submitting..." : "Submit Feedback"}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

        </main>
      </div>

      {showSupportModal && <SupportModal onClose={() => setShowSupportModal(false)} />}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}