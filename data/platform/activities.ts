import { ID } from "@/types";

export interface AuditActivity {
  id: ID;
  timestamp: string;
  actor: string;
  actorRole: string;
  theatreName: string;
  theatreId: ID;
  action: string;
  details: string;
  ipAddress: string;
  status: "Success" | "Flagged" | "Failed";
}

export const PLATFORM_AUDIT_ACTIVITIES: AuditActivity[] = [
  {
    id: "act-001",
    timestamp: "10 minutes ago",
    actor: "Rajesh Kulkarni",
    actorRole: "Theatre Admin",
    theatreName: "CineSphere Grand Cinemas",
    theatreId: "th-pun-001",
    action: "Schedule Modified",
    details: "Added 2 additional night shows for Dune: Part Two in Hall 1 (IMAX)",
    ipAddress: "14.139.122.4",
    status: "Success",
  },
  {
    id: "act-002",
    timestamp: "24 minutes ago",
    actor: "System Automation",
    actorRole: "Cron Worker",
    theatreName: "All Theatres (25)",
    theatreId: "platform",
    action: "Daily Settlement Executed",
    details: "Reconciled ₹28,45,200 box office ticket sales across Razorpay & Pine Labs",
    ipAddress: "10.0.4.18",
    status: "Success",
  },
  {
    id: "act-003",
    timestamp: "45 minutes ago",
    actor: "Kavita Rao",
    actorRole: "Hall Manager",
    theatreName: "CineSphere Royale Palladium",
    theatreId: "th-mum-001",
    action: "Hardware Diagnostic",
    details: "Christie 4K Laser Lamp hours certified; calibrated Barco lumen output",
    ipAddress: "115.112.44.88",
    status: "Success",
  },
  {
    id: "act-004",
    timestamp: "1 hour ago",
    actor: "Vikram Mehta",
    actorRole: "Super Admin",
    theatreName: "CineSphere Elante Chandigarh",
    theatreId: "th-chd-001",
    action: "License Approved",
    details: "Granted DCI exhibition certification for upcoming international film festival",
    ipAddress: "49.36.18.204",
    status: "Success",
  },
  {
    id: "act-005",
    timestamp: "2 hours ago",
    actor: "Priya Sharma",
    actorRole: "Concession Lead",
    theatreName: "CineSphere Grand Cinemas",
    theatreId: "th-pun-001",
    action: "Inventory Restock",
    details: "Received 500kg organic butterfly popping corn and 240 cases sparkling water",
    ipAddress: "14.139.122.4",
    status: "Success",
  },
  {
    id: "act-006",
    timestamp: "3 hours ago",
    actor: "Fraud Shield AI",
    actorRole: "Security Engine",
    theatreName: "CineSphere Signature Ambience",
    theatreId: "th-del-001",
    action: "Bot Defense Block",
    details: "Throttled 1,240 automated scrape requests on Oppenheimer seat layout",
    ipAddress: "185.220.101.5",
    status: "Flagged",
  },
];

