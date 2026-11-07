/**
 * CineSphere OS — Super Admin Dummy Data & System Mock Data
 * Enterprise headquarters constants, operational metrics, telemetry, and table rows.
 * Static local data only — no backend or API dependencies.
 */

export interface QuickActionItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
  badge?: string;
  category: "theatres" | "catalog" | "operations" | "financials";
}

export interface MetricStatItem {
  id: string;
  label: string;
  value: string;
  subtext?: string;
  delta?: string;
  isPositive?: boolean;
  iconName: string;
  category: "scale" | "financial" | "operations" | "health";
}

export interface ServiceStatusItem {
  name: string;
  status: "Operational" | "Degraded" | "Maintenance";
  uptime: string;
  latency: string;
  description: string;
}

export interface SystemHealthItem {
  metric: string;
  value: string;
  percentage: number;
  status: "normal" | "warning" | "optimal";
  detail: string;
}

export interface PendingApprovalItem {
  id: string;
  type: "Theatre" | "Admin" | "Movie" | "Event" | "Offer";
  title: string;
  submittedBy: string;
  submittedAt: string;
  details: string;
  priority: "High" | "Medium" | "Urgent";
}

export interface ActivityTimelineItem {
  id: string;
  title: string;
  actor: string;
  role: string;
  module: string;
  timeAgo: string;
  type: "theatre" | "movie" | "hall" | "offer" | "admin" | "customer";
}

export interface UpcomingTaskItem {
  id: string;
  title: string;
  category: "Maintenance" | "Release" | "Review" | "Contract" | "Security";
  dueDate: string;
  assignee: string;
  status: "Scheduled" | "Pending" | "In Review";
}

export interface AuditLogItem {
  id: string;
  who: string;
  email: string;
  action: string;
  module: string;
  time: string;
  status: "Success" | "Flagged" | "Rejected";
  ipAddress: string;
}

export interface SupportTicketItem {
  id: string;
  ticketRef: string;
  subject: string;
  submitter: string;
  theatre: string;
  category: "KDM Key" | "Projection" | "Refund" | "Turnstile" | "Billing";
  priority: "Urgent" | "High" | "Medium";
  status: "Open" | "Investigating" | "Resolved";
  time: string;
}

export interface MediaAssetItem {
  id: string;
  title: string;
  category: "Poster" | "Banner" | "Logo" | "Video" | "Acoustic Map";
  fileSize: string;
  resolution: string;
  movieOrTheatre: string;
  uploadedAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: "warning" | "success" | "info" | "error";
  time: string;
  isRead: boolean;
  linkText?: string;
}

// 1. GLOBAL PLATFORM SUMMARY & METRICS
export const PLATFORM_SUMMARY = {
  theatresCount: 25,
  citiesCount: 12,
  moviesCount: 48,
  screensCount: 110,
  monthlyBookings: "124,850",
  todayBookings: "4,820",
  totalRevenue: "₹8.6 Cr",
  registeredCustomers: "385,000",
  activeAdmins: 24,
  hallManagers: 48,
  pendingApprovals: 7,
  growthMoM: "+24.5%",
  platformHealth: "99.98%",
  systemUptime: "99.99%",
};

// 2. SUPER ADMIN QUICK ACTIONS
export const SUPER_ADMIN_QUICK_ACTIONS: QuickActionItem[] = [
  {
    id: "qa-1",
    title: "Create Theatre",
    description: "Onboard a new multiplex chain or standalone venue with auto-configured acoustic profiles.",
    iconName: "Building2",
    badge: "Provision",
    category: "theatres",
  },
  {
    id: "qa-2",
    title: "Approve Theatre",
    description: "Review pending lease contracts, Christie/Barco laser serials, and safety compliance.",
    iconName: "ShieldCheck",
    badge: "3 Pending",
    category: "theatres",
  },
  {
    id: "qa-3",
    title: "Manage Movies",
    description: "Assign global distributor prints, DCP decryption KDM keys, and language audio tracks.",
    iconName: "Film",
    category: "catalog",
  },
  {
    id: "qa-4",
    title: "Create Event",
    description: "Program stadium live broadcasts, anime film festivals, or esports championship simulcasts.",
    iconName: "CalendarDays",
    category: "catalog",
  },
  {
    id: "qa-5",
    title: "Manage Offers",
    description: "Roll out concession combos, corporate vouchers, student discounts, and credit card cashbacks.",
    iconName: "Tag",
    category: "operations",
  },
  {
    id: "qa-6",
    title: "Platform Settings",
    description: "Tune multi-tenant boundaries, rate limits, global currency rules, and encryption secrets.",
    iconName: "Settings",
    category: "operations",
  },
  {
    id: "qa-7",
    title: "Generate Reports",
    description: "Produce box office distributor settlements, royalty audit logs, and GST/tax ledgers.",
    iconName: "FileText",
    category: "financials",
  },
  {
    id: "qa-8",
    title: "View Analytics",
    description: "Inspect seat occupancy heatmaps, concession attachment yield, and peak booking time bands.",
    iconName: "BarChart3",
    category: "financials",
  },
];

// 3. COMPLETE STATS SECTION METRICS
export const SUPER_ADMIN_STATS: MetricStatItem[] = [
  {
    id: "stat-1",
    label: "Total Theatres",
    value: "25",
    subtext: "Across 12 metro hubs",
    delta: "+3 this quarter",
    isPositive: true,
    iconName: "Building2",
    category: "scale",
  },
  {
    id: "stat-2",
    label: "Total Screens",
    value: "110",
    subtext: "IMAX, 4DX, Dolby & Standard",
    delta: "+8 commissioned",
    isPositive: true,
    iconName: "Layers",
    category: "scale",
  },
  {
    id: "stat-3",
    label: "Total Halls",
    value: "110",
    subtext: "100% telemetry online",
    delta: "Active",
    isPositive: true,
    iconName: "Building",
    category: "scale",
  },
  {
    id: "stat-4",
    label: "Active Movies",
    value: "48",
    subtext: "In active theatrical run",
    delta: "+6 new releases",
    isPositive: true,
    iconName: "Film",
    category: "scale",
  },
  {
    id: "stat-5",
    label: "Daily Shows",
    value: "320+",
    subtext: "Scheduled timetables",
    delta: "Peak weekend load",
    isPositive: true,
    iconName: "Clock",
    category: "operations",
  },
  {
    id: "stat-6",
    label: "Today's Bookings",
    value: "4,820",
    subtext: "Real-time transactions",
    delta: "+14.2% vs yesterday",
    isPositive: true,
    iconName: "Ticket",
    category: "operations",
  },
  {
    id: "stat-7",
    label: "Monthly Bookings",
    value: "124,850",
    subtext: "30-day ticket volume",
    delta: "+18.6% MoM",
    isPositive: true,
    iconName: "TrendingUp",
    category: "operations",
  },
  {
    id: "stat-8",
    label: "Customers",
    value: "385,000",
    subtext: "Verified user accounts",
    delta: "+12.4K new patrons",
    isPositive: true,
    iconName: "Users",
    category: "scale",
  },
  {
    id: "stat-9",
    label: "Theatre Admins",
    value: "24",
    subtext: "Active chain operators",
    delta: "100% 2FA enforced",
    isPositive: true,
    iconName: "ShieldCheck",
    category: "operations",
  },
  {
    id: "stat-10",
    label: "Hall Managers",
    value: "48",
    subtext: "Floor operations chiefs",
    delta: "Assigned",
    isPositive: true,
    iconName: "UserCheck",
    category: "operations",
  },
  {
    id: "stat-11",
    label: "Gross Revenue",
    value: "₹8.6 Cr",
    subtext: "Box office + F&B gross",
    delta: "+24.5% vs last month",
    isPositive: true,
    iconName: "CreditCard",
    category: "financial",
  },
  {
    id: "stat-12",
    label: "Pending Approvals",
    value: "7",
    subtext: "Theatres, prints & offers",
    delta: "Needs review",
    isPositive: false,
    iconName: "AlertTriangle",
    category: "health",
  },
  {
    id: "stat-13",
    label: "Circuit Growth",
    value: "+24.5%",
    subtext: "Year-on-year expansion",
    delta: "+4.2% acceleration",
    isPositive: true,
    iconName: "Sparkles",
    category: "health",
  },
  {
    id: "stat-14",
    label: "Platform Health",
    value: "99.98%",
    subtext: "Zero critical incidents",
    delta: "Optimal",
    isPositive: true,
    iconName: "Zap",
    category: "health",
  },
  {
    id: "stat-15",
    label: "System Uptime",
    value: "99.99%",
    subtext: "Last 365 rolling days",
    delta: "SLA Compliant",
    isPositive: true,
    iconName: "Activity",
    category: "health",
  },
];

// 4. PLATFORM STATUS SERVICES
export const PLATFORM_SERVICES: ServiceStatusItem[] = [
  {
    name: "Core GraphQL & REST API",
    status: "Operational",
    uptime: "99.99%",
    latency: "18ms",
    description: "Multi-tenant routing layer & high-concurrency ticket lock engine",
  },
  {
    name: "Distributed PostgreSQL Database",
    status: "Operational",
    uptime: "100.00%",
    latency: "12ms",
    description: "Postgres 16 cluster with 3 read replicas and automatic multi-AZ failover",
  },
  {
    name: "Media & DCP NVMe Storage",
    status: "Operational",
    uptime: "99.95%",
    latency: "24ms",
    description: "4.2 TB / 10 TB utilized across S3 compatible object stores",
  },
  {
    name: "Payment Gateways & Webhooks",
    status: "Operational",
    uptime: "99.98%",
    latency: "120ms",
    description: "Stripe, Razorpay, UPI & Apple Pay webhooks operating with 0 dropped events",
  },
  {
    name: "Email & Transactional Dispatch",
    status: "Operational",
    uptime: "99.88%",
    latency: "250ms",
    description: "Amazon SES & Resend deliverability holding at 99.8% inbox placement",
  },
  {
    name: "Push & Realtime Telemetry Queue",
    status: "Operational",
    uptime: "99.99%",
    latency: "14ms",
    description: "Apple APNS, Google FCM and Redis Pub/Sub cluster running with 0 backlog",
  },
  {
    name: "Edge CDN & DDoS Shield",
    status: "Operational",
    uptime: "100.00%",
    latency: "6ms",
    description: "Cloudflare Enterprise 32 Edge PoPs caching movie banners and seat SVGs",
  },
];

// 5. SYSTEM HEALTH BENCHMARKS
export const SYSTEM_HEALTH_DATA: SystemHealthItem[] = [
  {
    metric: "CPU Utilization",
    value: "24%",
    percentage: 24,
    status: "optimal",
    detail: "64 vCPU AMD EPYC Core Cluster",
  },
  {
    metric: "Memory (RAM)",
    value: "38%",
    percentage: 38,
    status: "optimal",
    detail: "97.2 GB of 256 GB ECC RAM allocated",
  },
  {
    metric: "NVMe SSD Storage",
    value: "42%",
    percentage: 42,
    status: "normal",
    detail: "4.2 TB utilized of 10.0 TB total capacity",
  },
  {
    metric: "Network Throughput",
    value: "1.8 Gbps",
    percentage: 36,
    status: "optimal",
    detail: "Peak capacity rated for 10 Gbps burst",
  },
  {
    metric: "API Response Time",
    value: "42ms",
    percentage: 21,
    status: "optimal",
    detail: "P99 latency across all global endpoints",
  },
  {
    metric: "Platform Health Score",
    value: "98 / 100",
    percentage: 98,
    status: "optimal",
    detail: "Automated chaos engineering audit index",
  },
  {
    metric: "Security Compliance",
    value: "A+ (99.4%)",
    percentage: 99,
    status: "optimal",
    detail: "SOC-2 Type II, ISO 27001 & PCI-DSS Level 1",
  },
];

// 6. PENDING APPROVALS
export const PENDING_APPROVALS_LIST: PendingApprovalItem[] = [
  {
    id: "appr-1",
    type: "Theatre",
    title: "CineWave IMAX Megaplex",
    submittedBy: "Rajesh Kulkarni (CineWave Group)",
    submittedAt: "2 hours ago",
    details: "6 Screens (1 IMAX Laser, 2 Dolby Atmos, 3 Standard). Mumbai Metro.",
    priority: "Urgent",
  },
  {
    id: "appr-2",
    type: "Admin",
    title: "Vikram Malhotra",
    submittedBy: "PVR INOX Regional HQ",
    submittedAt: "5 hours ago",
    details: "Assigned role: Theatre Admin for PVR Heritage Grand (Bengaluru).",
    priority: "High",
  },
  {
    id: "appr-3",
    type: "Movie",
    title: "Interstellar: 10th Anniversary IMAX 70mm",
    submittedBy: "Warner Bros Pictures Distribution",
    submittedAt: "Yesterday",
    details: "DCP KDM keys attached. 70mm 15-perf print certification pending.",
    priority: "High",
  },
  {
    id: "appr-4",
    type: "Event",
    title: "Hans Zimmer Live: Stadium Cinema Simulcast",
    submittedBy: "LiveNation Global Media",
    submittedAt: "Yesterday",
    details: "Single-night worldwide 4K broadcast across 18 IMAX halls.",
    priority: "Medium",
  },
  {
    id: "appr-5",
    type: "Offer",
    title: "Diwali Fest 2026: 25% Cashback",
    submittedBy: "Central Marketing Team",
    submittedAt: "2 days ago",
    details: "Card discount promo code DIWALI25 for ICICI and HDFC cards.",
    priority: "Medium",
  },
];

// 7. RECENT AUDIT ACTIVITIES
export const RECENT_ACTIVITY_TIMELINE: ActivityTimelineItem[] = [
  {
    id: "act-1",
    title: "New Theatre Registered",
    actor: "CineWave Group",
    role: "Exhibitor Partner",
    module: "Theatres Circuit",
    timeAgo: "15 min ago",
    type: "theatre",
  },
  {
    id: "act-2",
    title: "Movie Print Added",
    actor: "Sony Pictures India",
    role: "Content Distributor",
    module: "Movie Catalog",
    timeAgo: "42 min ago",
    type: "movie",
  },
  {
    id: "act-3",
    title: "Hall 3 Acoustic Profile Updated",
    actor: "Dolby Field Tech",
    role: "Acoustic Engineer",
    module: "Auditoriums",
    timeAgo: "1 hr ago",
    type: "hall",
  },
  {
    id: "act-4",
    title: "Offer Published: Gourmet Duo Combo",
    actor: "Sarah Jenkins",
    role: "F&B Operations Admin",
    module: "Offers & Concessions",
    timeAgo: "2 hrs ago",
    type: "offer",
  },
  {
    id: "act-5",
    title: "Admin Created for Delhi NCR Region",
    actor: "Marcus Vance",
    role: "Super Admin HQ",
    module: "Access Control",
    timeAgo: "3 hrs ago",
    type: "admin",
  },
  {
    id: "act-6",
    title: "Customer Milestone #385,000 Onboarded",
    actor: "System Event",
    role: "Auth Engine",
    module: "Customers",
    timeAgo: "4 hrs ago",
    type: "customer",
  },
];

// 8. UPCOMING TASKS TIMELINE
export const UPCOMING_TASKS_TIMELINE: UpcomingTaskItem[] = [
  {
    id: "tsk-1",
    title: "Christie 4K Laser Projector Calibration",
    category: "Maintenance",
    dueDate: "Tomorrow at 02:00 AM",
    assignee: "Hardware Ops Team",
    status: "Scheduled",
  },
  {
    id: "tsk-2",
    title: "Warner Bros & Universal Box Office Settlement",
    category: "Review",
    dueDate: "Nov 10, 2026",
    assignee: "Finance Desk",
    status: "In Review",
  },
  {
    id: "tsk-3",
    title: "PCI-DSS Level 1 Gateway Tokenization Renewal",
    category: "Security",
    dueDate: "Nov 15, 2026",
    assignee: "Security Officer",
    status: "Pending",
  },
  {
    id: "tsk-4",
    title: "CineSphere OS v2.4 Multi-Tenant Rollout",
    category: "Release",
    dueDate: "Nov 20, 2026",
    assignee: "DevOps Core",
    status: "Scheduled",
  },
  {
    id: "tsk-5",
    title: "IMAX Commercial Licensing Contract Audit",
    category: "Contract",
    dueDate: "Nov 30, 2026",
    assignee: "Legal Counsel",
    status: "In Review",
  },
];

// 9. LATEST THEATRES TABLE
export const LATEST_THEATRES_DATA = [
  {
    id: "th-101",
    name: "Apex Grand IMAX",
    chain: "Apex Luxury Theatres",
    city: "Mumbai",
    screens: 8,
    tier: "Luxury",
    status: "Active",
    occupancy: "88%",
  },
  {
    id: "th-102",
    name: "CineWave Megaplex",
    chain: "CineWave Group",
    city: "Delhi NCR",
    screens: 6,
    tier: "Premium",
    status: "Active",
    occupancy: "74%",
  },
  {
    id: "th-103",
    name: "Starlight Dolby Cinema",
    chain: "Starlight Multiplexes",
    city: "Bengaluru",
    screens: 5,
    tier: "Luxury",
    status: "Active",
    occupancy: "82%",
  },
  {
    id: "th-104",
    name: "Miraj Crown Multiplex",
    chain: "Miraj Entertainment",
    city: "Hyderabad",
    screens: 4,
    tier: "Standard",
    status: "Active",
    occupancy: "68%",
  },
  {
    id: "th-105",
    name: "PVR Heritage Grand",
    chain: "PVR INOX Limited",
    city: "Pune",
    screens: 7,
    tier: "Premium",
    status: "Active",
    occupancy: "79%",
  },
];

// 10. LATEST MOVIES TABLE
export const LATEST_MOVIES_DATA = [
  {
    id: "mv-101",
    title: "Chrono Nexus: Origins",
    formats: ["IMAX", "Dolby Atmos"],
    release: "Oct 24, 2026",
    boxOffice: "₹14.2 Cr",
    rating: "8.9/10",
    status: "Active",
  },
  {
    id: "mv-102",
    title: "CyberPulse: 2099",
    formats: ["4DX", "ScreenX"],
    release: "Oct 30, 2026",
    boxOffice: "₹9.8 Cr",
    rating: "8.5/10",
    status: "Active",
  },
  {
    id: "mv-103",
    title: "Shadows of Elysium",
    formats: ["2D", "Dolby Atmos"],
    release: "Nov 02, 2026",
    boxOffice: "₹6.4 Cr",
    rating: "8.2/10",
    status: "Active",
  },
  {
    id: "mv-104",
    title: "Interstellar: 10th Anniv",
    formats: ["70mm Film", "IMAX"],
    release: "Nov 12, 2026",
    boxOffice: "₹3.1 Cr",
    rating: "9.6/10",
    status: "Upcoming",
  },
  {
    id: "mv-105",
    title: "The Silent Orbit",
    formats: ["IMAX Laser"],
    release: "Nov 15, 2026",
    boxOffice: "₹1.8 Cr",
    rating: "8.7/10",
    status: "Upcoming",
  },
];

// 11. LATEST BOOKINGS TABLE
export const LATEST_BOOKINGS_DATA = [
  {
    id: "bk-801",
    ref: "CS-892401",
    customer: "Arjun Mehta",
    theatre: "Apex Grand IMAX",
    movie: "Chrono Nexus",
    seats: "VIP F12, F13",
    amount: "₹1,450",
    status: "Confirmed",
    time: "4 min ago",
  },
  {
    id: "bk-802",
    ref: "CS-892402",
    customer: "Priya Sharma",
    theatre: "Starlight Dolby",
    movie: "CyberPulse: 2099",
    seats: "Recliner E4",
    amount: "₹820",
    status: "Confirmed",
    time: "9 min ago",
  },
  {
    id: "bk-803",
    ref: "CS-892403",
    customer: "Rohan Varma",
    theatre: "PVR Heritage Grand",
    movie: "Shadows of Elysium",
    seats: "Prime G8, G9, G10",
    amount: "₹1,890",
    status: "Confirmed",
    time: "14 min ago",
  },
  {
    id: "bk-804",
    ref: "CS-892404",
    customer: "Sneha Nair",
    theatre: "CineWave Megaplex",
    movie: "Chrono Nexus",
    seats: "IMAX Box 2",
    amount: "₹2,200",
    status: "Processing",
    time: "20 min ago",
  },
  {
    id: "bk-805",
    ref: "CS-892405",
    customer: "Vikram Das",
    theatre: "Miraj Crown",
    movie: "The Silent Orbit",
    seats: "Standard C1, C2",
    amount: "₹640",
    status: "Refunded",
    time: "35 min ago",
  },
];

// 12. LATEST LIVE EVENTS TABLE
export const LATEST_EVENTS_DATA = [
  {
    id: "ev-201",
    title: "Coldplay: Music of the Spheres Live",
    category: "Concerts",
    venue: "Apex Grand IMAX",
    city: "Mumbai",
    date: "Nov 18, 2026",
    ticketsSold: "98% (Sold Out)",
  },
  {
    id: "ev-202",
    title: "UEFA Champions League Final",
    category: "Sports",
    venue: "Starlight Dolby Cinema",
    city: "Bengaluru",
    date: "Nov 22, 2026",
    ticketsSold: "84%",
  },
  {
    id: "ev-203",
    title: "Zakir Khan Live Theatrical Special",
    category: "Stand-up",
    venue: "PVR Heritage Grand",
    city: "Pune",
    date: "Nov 28, 2026",
    ticketsSold: "91%",
  },
  {
    id: "ev-204",
    title: "Phantom of the Opera Broadway Live",
    category: "Theatre",
    venue: "CineWave Megaplex",
    city: "Delhi NCR",
    date: "Dec 05, 2026",
    ticketsSold: "65%",
  },
];

// 13. LATEST ADMINS TABLE
export const LATEST_ADMINS_DATA = [
  {
    id: "adm-301",
    name: "Marcus Vance",
    role: "Super Admin",
    circuit: "CineSphere HQ Global",
    email: "marcus.vance@cinesphere.io",
    status: "Active",
    lastLogin: "Active Now",
  },
  {
    id: "adm-302",
    name: "Rajesh Kulkarni",
    role: "Theatre Admin",
    circuit: "CineWave Group",
    email: "rajesh.k@cinewave.in",
    status: "Active",
    lastLogin: "42 min ago",
  },
  {
    id: "adm-303",
    name: "Ananya Deshmukh",
    role: "Theatre Admin",
    circuit: "Apex Luxury Theatres",
    email: "ananya.d@apexcine.com",
    status: "Active",
    lastLogin: "2 hours ago",
  },
  {
    id: "adm-304",
    name: "Vikram Malhotra",
    role: "Hall Manager",
    circuit: "PVR INOX West",
    email: "vikram.m@pvrinox.com",
    status: "Pending Approval",
    lastLogin: "Never",
  },
  {
    id: "adm-305",
    name: "Karan Johar Patel",
    role: "Hall Manager",
    circuit: "Starlight Multiplexes",
    email: "karan.patel@starlight.com",
    status: "Active",
    lastLogin: "Yesterday",
  },
];

// 14. LATEST SUPPORT TICKETS TABLE
export const LATEST_TICKETS_DATA: SupportTicketItem[] = [
  {
    id: "tkt-401",
    ticketRef: "TKT-8910",
    subject: "Christie 4K Laser KDM Decryption Failure",
    submitter: "Devendra S (Apex Mumbai)",
    theatre: "Apex Grand IMAX",
    category: "KDM Key",
    priority: "Urgent",
    status: "Investigating",
    time: "18 min ago",
  },
  {
    id: "tkt-402",
    ticketRef: "TKT-8909",
    subject: "UPI Double Debit on Concession Order",
    submitter: "Snehal Roy (Patron)",
    theatre: "Starlight Bengaluru",
    category: "Refund",
    priority: "High",
    status: "Open",
    time: "45 min ago",
  },
  {
    id: "tkt-403",
    ticketRef: "TKT-8908",
    subject: "Turnstile Optical Scanner Firmware Sync",
    submitter: "Ravi Kumar (CineWave Delhi)",
    theatre: "CineWave Megaplex",
    category: "Turnstile",
    priority: "Medium",
    status: "Resolved",
    time: "2 hours ago",
  },
  {
    id: "tkt-404",
    ticketRef: "TKT-8907",
    subject: "Dolby Atmos Channel 9 Crackling Noise",
    submitter: "Acoustic Engineer (PVR Pune)",
    theatre: "PVR Heritage Grand",
    category: "Projection",
    priority: "High",
    status: "Investigating",
    time: "3 hours ago",
  },
];

// 15. AUDIT LOGS DATA
export const AUDIT_LOGS_DATA: AuditLogItem[] = [
  {
    id: "log-501",
    who: "Marcus Vance",
    email: "marcus.vance@cinesphere.io",
    action: "Updated Global Tenant Rate Limit to 2,500 req/min",
    module: "HQ Settings",
    time: "10 min ago",
    status: "Success",
    ipAddress: "157.240.21.35",
  },
  {
    id: "log-502",
    who: "Rajesh Kulkarni",
    email: "rajesh.k@cinewave.in",
    action: "Requested License Key for Interstellar 70mm",
    module: "Movie Catalog",
    time: "25 min ago",
    status: "Success",
    ipAddress: "49.36.12.180",
  },
  {
    id: "log-503",
    who: "System Automated Cron",
    email: "daemon@cinesphere.internal",
    action: "Nightly Box Office Reconciliation Batch Completed",
    module: "Financials",
    time: "1 hr ago",
    status: "Success",
    ipAddress: "10.0.4.12",
  },
  {
    id: "log-504",
    who: "Ananya Deshmukh",
    email: "ananya.d@apexcine.com",
    action: "Modified Hall 1 VIP Seating Layout Configuration",
    module: "Auditoriums",
    time: "2 hrs ago",
    status: "Success",
    ipAddress: "103.21.58.4",
  },
  {
    id: "log-505",
    who: "Unknown Session",
    email: "security-guard@cinesphere.internal",
    action: "Failed Root API Secret Key Authentication Attempt",
    module: "Security Vault",
    time: "3 hrs ago",
    status: "Flagged",
    ipAddress: "185.220.101.5",
  },
  {
    id: "log-506",
    who: "Karan Johar Patel",
    email: "karan.patel@starlight.com",
    action: "Generated GST Form 7B Distributor Settlement",
    module: "Reports",
    time: "4 hrs ago",
    status: "Success",
    ipAddress: "115.112.4.98",
  },
];

// 16. MEDIA LIBRARY ASSETS & USAGE
export const MEDIA_LIBRARY_DATA = {
  totalStorageUsed: "2.4 GB",
  storageQuota: "100 GB",
  percentageUsed: 2.4,
  assetsCount: 1420,
  breakdown: [
    { label: "Posters & Key Art", count: 480, size: "1.1 GB" },
    { label: "Banners & Hero Backdrops", count: 320, size: "840 MB" },
    { label: "Theatre & Chain Logos", count: 180, size: "120 MB" },
    { label: "4K Teaser Video Loops", count: 65, size: "280 MB" },
    { label: "Interactive Hall SVGs", count: 375, size: "60 MB" },
  ],
  recentAssets: [
    {
      id: "med-1",
      title: "Chrono Nexus Official 4K IMAX Key Art",
      category: "Poster",
      fileSize: "4.8 MB",
      resolution: "3840 x 5760",
      movieOrTheatre: "Chrono Nexus: Origins",
      uploadedAt: "Oct 24, 2026",
    },
    {
      id: "med-2",
      title: "Apex Grand IMAX Exterior Nightscape",
      category: "Banner",
      fileSize: "8.2 MB",
      resolution: "4096 x 2304",
      movieOrTheatre: "Apex Luxury Theatres",
      uploadedAt: "Oct 20, 2026",
    },
    {
      id: "med-3",
      title: "CyberPulse 2099 Motion Video Backdrop",
      category: "Video",
      fileSize: "18.4 MB",
      resolution: "1920 x 1080 (60fps)",
      movieOrTheatre: "CyberPulse: 2099",
      uploadedAt: "Oct 18, 2026",
    },
    {
      id: "med-4",
      title: "Dolby Atmos 128-ch Speaker Schematic SVG",
      category: "Acoustic Map",
      fileSize: "420 KB",
      resolution: "Vector SVG",
      movieOrTheatre: "Starlight Dolby Cinema",
      uploadedAt: "Oct 15, 2026",
    },
  ],
};

// 17. NOTIFICATIONS CENTER DATA
export const NOTIFICATIONS_CENTER_DATA: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Urgent: KDM Decryption Key Expiry",
    message: "12 Christie 4K projectors at Apex Grand IMAX require renewed KDM prints by midnight.",
    category: "warning",
    time: "15 min ago",
    isRead: false,
    linkText: "View KDM Keys",
  },
  {
    id: "notif-2",
    title: "New Multiplex Chain Lease Approved",
    message: "CineWave Megaplex (Mumbai) contract signed by regional exhibitor director.",
    category: "success",
    time: "1 hour ago",
    isRead: false,
    linkText: "Inspect Lease",
  },
  {
    id: "notif-3",
    title: "Automated Daily Reconciliation Done",
    message: "₹8.6 Cr Gross revenue settled with 100% zero variance across all gateway channels.",
    category: "info",
    time: "3 hours ago",
    isRead: true,
    linkText: "Download Settlement",
  },
  {
    id: "notif-4",
    title: "Security Alert: Blocked IP Range",
    message: "Firewall blocked 24 brute-force requests targeting the Admin API secret endpoint.",
    category: "error",
    time: "5 hours ago",
    isRead: false,
    linkText: "Open Security Logs",
  },
  {
    id: "notif-5",
    title: "Firmware Update v4.2 Available",
    message: "Barco & Christie laser firmware patch ready for remote staging on 65 screens.",
    category: "info",
    time: "Yesterday",
    isRead: true,
  },
  {
    id: "notif-6",
    title: "Festival Offer Code Published",
    message: "DIWALI25 coupon code is now live across web, iOS, and Android customer apps.",
    category: "success",
    time: "2 days ago",
    isRead: true,
  },
];
