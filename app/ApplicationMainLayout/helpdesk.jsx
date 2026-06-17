"use client";
import { useState, useRef, useEffect } from "react";
import {
  MessageCircle, Bot, Send, Search, BookOpen, FileText, Video,
  ChevronRight, ChevronDown, Star, ThumbsUp, ThumbsDown, X,
  Clock, CheckCircle2, AlertCircle, Circle, Plus, Paperclip,
  Phone, Mail, ExternalLink, Zap, ArrowLeft, LifeBuoy,
  Hash, RefreshCw, Download, Copy, Smile, Mic, Image as ImageIcon,
  TrendingUp, Users, MessageSquare, BarChart2, HelpCircle,
  Home, Ticket, ChevronUp, Filter, Eye,
} from "lucide-react";
import "../designdashboardcomponent/helpdesk.css";

const NAV = [
  { id: "home",     label: "Help Center",   icon: Home },
  { id: "chat",     label: "AI Assistant",  icon: Bot },
  { id: "tickets",  label: "My Tickets",    icon: Ticket },
  { id: "docs",     label: "Documentation", icon: BookOpen },
  { id: "feedback", label: "Feedback",      icon: Star },
];

const QUICK_ACTIONS = [
  { icon: MessageCircle, label: "Live Chat",      desc: "Avg 2 min response",   color: "qa-green",  badge: "Online" },
  { icon: Mail,          label: "Email Support",  desc: "support@tabletop.in",  color: "qa-violet", badge: null },
  { icon: Phone,         label: "Call Us",        desc: "+91 1800-123-4567",    color: "qa-blue",   badge: "9AM–9PM" },
  { icon: Video,         label: "Schedule Demo",  desc: "Book a 30-min call",   color: "qa-amber",  badge: null },
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

const TICKETS_DATA = [
  { id: "TKT-1042", subject: "Payment gateway not working",  status: "open",       priority: "high",   time: "2h ago",   replies: 3 },
  { id: "TKT-1038", subject: "Menu images not uploading",    status: "inprogress", priority: "medium", time: "1d ago",   replies: 5 },
  { id: "TKT-1031", subject: "QR code scan not redirecting", status: "resolved",   priority: "low",    time: "3d ago",   replies: 8 },
  { id: "TKT-1029", subject: "Orders dashboard blank screen",status: "resolved",   priority: "high",   time: "5d ago",   replies: 12 },
];

const AI_SUGGESTIONS = [
  "How do I accept online payments?",
  "Why is my QR code not working?",
  "How to add staff accounts?",
  "How to export my order history?",
];

const BOT_RESPONSES = {
  default: "I'm here to help! Could you give me more details about your issue so I can assist you better? You can also browse our documentation or raise a support ticket.",
  payment: "To set up payments, go to **Payment Setup** in the sidebar → select your gateway (Razorpay is recommended for India) → enter your API keys and click **Go Live**. Need help finding your API keys?",
  qr: "Your QR code can be found in **Settings → QR Code**. If it's not scanning correctly, try clicking **Regenerate** to get a fresh one. Make sure your restaurant URL is correctly configured.",
  menu: "To manage your menu, go to **Menu & Category**. You can add categories, upload item images, set prices and toggle item availability. All changes reflect instantly for customers.",
  order: "Live orders appear in the **Orders** section. If orders are missing, check your internet connection and verify the Order API status in **Settings → Support & Help → System Status**.",
  staff: "To add team members, go to **Settings → Team Management** (available on Pro and Elite plans). You can assign roles like Manager, Chef, or Cashier with different permission levels.",
};

const STATUS_MAP = {
  open:       { label: "Open",        cls: "tk-open",       icon: Circle },
  inprogress: { label: "In Progress", cls: "tk-inprogress", icon: RefreshCw },
  resolved:   { label: "Resolved",    cls: "tk-resolved",   icon: CheckCircle2 },
};

const PRIORITY_MAP = {
  high:   { label: "High",   cls: "pr-high" },
  medium: { label: "Medium", cls: "pr-medium" },
  low:    { label: "Low",    cls: "pr-low" },
};

function getBotReply(msg) {
  const m = msg.toLowerCase();
  if (m.includes("payment") || m.includes("gateway") || m.includes("razorpay")) return BOT_RESPONSES.payment;
  if (m.includes("qr") || m.includes("scan") || m.includes("code")) return BOT_RESPONSES.qr;
  if (m.includes("menu") || m.includes("item") || m.includes("category")) return BOT_RESPONSES.menu;
  if (m.includes("order") || m.includes("missing") || m.includes("blank")) return BOT_RESPONSES.order;
  if (m.includes("staff") || m.includes("team") || m.includes("member")) return BOT_RESPONSES.staff;
  return BOT_RESPONSES.default;
}

export default function HelpDesk() {
  const [active, setActive]         = useState("home");
  const [messages, setMessages]     = useState([
    { role: "bot", text: "Hi! I'm **Leo**, your TableTop AI assistant 👋\n\nI can help you with orders, menu setup, payments, QR codes and more. What do you need help with today?", time: "Just now", liked: null },
  ]);
  const [input, setInput]           = useState("");
  const [typing, setTyping]         = useState(false);
  const [search, setSearch]         = useState("");
  const [openFaq, setOpenFaq]       = useState(null);
  const [rating, setRating]         = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback]     = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [newTicket, setNewTicket]   = useState(false);
  const [ticketForm, setTicketForm] = useState({ subject: "", desc: "", priority: "medium" });
  const [tickets, setTickets]       = useState(TICKETS_DATA);
  const [filterStatus, setFilterStatus] = useState("all");
  const chatEndRef = useRef();

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

  const submitTicket = () => {
    if (!ticketForm.subject.trim()) return;
    const t = {
      id: `TKT-${1043 + tickets.length}`,
      subject: ticketForm.subject,
      status: "open",
      priority: ticketForm.priority,
      time: "Just now",
      replies: 0,
    };
    setTickets(prev => [t, ...prev]);
    setTicketForm({ subject: "", desc: "", priority: "medium" });
    setNewTicket(false);
  };

  const filteredTickets = tickets.filter(t => filterStatus === "all" || t.status === filterStatus);
  const filteredFaq     = FAQ.filter(f => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()));
  const filteredDocs    = DOCS.filter(d => d.title.toLowerCase().includes(search.toLowerCase()) || d.category.toLowerCase().includes(search.toLowerCase()));

  const renderBotText = (text) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((p, i) => i % 2 === 1 ? <strong key={i}>{p}</strong> : p);
  };

  const activeNav = NAV.find(n => n.id === active);

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
              {id === "tickets" && <span className="hd-nav-count">{tickets.filter(t => t.status === "open" || t.status === "inprogress").length}</span>}
            </button>
          ))}
        </nav>

        <div className="hd-sidebar-status">
          <div className="hd-status-row">
            <span className="hd-status-dot hd-status-green" />
            <span className="hd-status-label">Support Online</span>
          </div>
          <div className="hd-status-row">
            <Clock size={11} className="hd-status-clock" />
            <span className="hd-status-label">Mon–Sun · 9AM–9PM</span>
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
                {QUICK_ACTIONS.map(({ icon: Icon, label, desc, color, badge }) => (
                  <button key={label} type="button" className={`hd-quick-card ${color}`}>
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
                  { icon: Users,         val: "24/7",   label: "AI Available" },
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
                Powered by TableTop Leo AI · Responses may not always be perfect · <span className="hd-chat-link" onClick={() => setActive("tickets")}>Raise a ticket</span> for complex issues
              </div>
            </div>
          )}

          {active === "tickets" && (
            <div className="hd-tickets-wrap">
              <div className="hd-tickets-head">
                <div>
                  <h2 className="hd-section-title">Support Tickets</h2>
                  <p className="hd-section-sub">Track and manage your support requests</p>
                </div>
                <button type="button" onClick={() => setNewTicket(true)} className="hd-btn-primary">
                  <Plus size={14} /> New Ticket
                </button>
              </div>

              {newTicket && (
                <div className="hd-ticket-form">
                  <div className="hd-tf-head">
                    <span className="hd-tf-title">Create New Ticket</span>
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
                        {["low", "medium", "high"].map(p => (
                          <button key={p} type="button" onClick={() => setTicketForm(f => ({ ...f, priority: p }))}
                            className={`hd-priority-btn ${ticketForm.priority === p ? "hd-priority-active" : ""}`}>
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="hd-tf-actions">
                      <button type="button" onClick={() => setNewTicket(false)} className="hd-btn-ghost">Cancel</button>
                      <button type="button" onClick={submitTicket} className="hd-btn-primary">
                        <Send size={13} /> Submit Ticket
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="hd-filter-row">
                {["all", "open", "inprogress", "resolved"].map(s => (
                  <button key={s} type="button" onClick={() => setFilterStatus(s)}
                    className={`hd-filter-btn ${filterStatus === s ? "hd-filter-active" : ""}`}>
                    {s === "all" ? "All" : s === "inprogress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
                    {s !== "all" && <span className="hd-filter-count">{tickets.filter(t => t.status === s).length}</span>}
                  </button>
                ))}
              </div>

              <div className="hd-ticket-list">
                {filteredTickets.length === 0 && (
                  <div className="hd-empty">No tickets found.</div>
                )}
                {filteredTickets.map(t => {
                  const st = STATUS_MAP[t.status];
                  const pr = PRIORITY_MAP[t.priority];
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
                        <span><MessageCircle size={11} /> {t.replies} replies</span>
                        <button type="button" className="hd-ticket-view"><Eye size={11} /> View</button>
                      </div>
                    </div>
                  );
                })}
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
              {feedbackSent ? (
                <div className="hd-feedback-success">
                  <CheckCircle2 size={40} className="hd-success-icon" />
                  <h2 className="hd-success-title">Thank you for your feedback!</h2>
                  <p className="hd-success-sub">Your response helps us improve TableTop Leo every day.</p>
                  <button type="button" onClick={() => { setFeedbackSent(false); setRating(0); setFeedback(""); }} className="hd-btn-primary">
                    Submit Another
                  </button>
                </div>
              ) : (
                <>
                  <div className="hd-feedback-hero">
                    <Star size={28} className="hd-feedback-star-icon" />
                    <h2 className="hd-feedback-title">Share Your Experience</h2>
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
                      <div className="hd-fb-label">What went well?</div>
                      <div className="hd-chip-group">
                        {["Fast responses", "Easy to use", "Helpful AI", "Good documentation", "Quick resolution", "Friendly support"].map(c => (
                          <button key={c} type="button" className="hd-chip">{c}</button>
                        ))}
                      </div>
                    </div>

                    <div className="hd-fb-divider" />

                    <div className="hd-fb-section">
                      <div className="hd-fb-label">Tell us more (optional)</div>
                      <textarea className="hd-fb-textarea" rows={3}
                        placeholder="Share your thoughts, suggestions or report any issues..."
                        value={feedback} onChange={e => setFeedback(e.target.value)} />
                    </div>

                    <div className="hd-fb-divider" />

                    <div className="hd-fb-section">
                      <div className="hd-fb-label">Would you recommend TableTop Leo?</div>
                      <div className="hd-nps-row">
                        {Array.from({ length: 11 }, (_, i) => (
                          <button key={i} type="button" className={`hd-nps-btn ${i >= 9 ? "hd-nps-green" : i >= 7 ? "hd-nps-yellow" : "hd-nps-red"}`}>{i}</button>
                        ))}
                      </div>
                      <div className="hd-nps-labels">
                        <span>Not likely</span><span>Very likely</span>
                      </div>
                    </div>

                    <button type="button" onClick={() => setFeedbackSent(true)} className="hd-fb-submit">
                      <Send size={14} /> Submit Feedback
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}