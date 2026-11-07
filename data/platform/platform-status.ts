import { SystemServiceStatus } from "@/types";

export const SYSTEM_SERVICES_STATUS: SystemServiceStatus[] = [
  {
    name: "Edge API Gateway (Envoy / Cloudflare)",
    status: "Operational",
    latencyMs: 14,
    uptime: "99.99%",
    region: "ap-south-1 (Mumbai / Pune)",
  },
  {
    name: "Distributed PostgreSQL Relational Cluster",
    status: "Operational",
    latencyMs: 4,
    uptime: "99.98%",
    region: "ap-south-1a (Multi-AZ Primary)",
  },
  {
    name: "Redis Real-Time Seat Reservation Matrix",
    status: "Operational",
    latencyMs: 1,
    uptime: "100.0%",
    region: "ap-south-1 In-Memory Fabric",
  },
  {
    name: "Razorpay / NPCI UPI Payment Orchestrator",
    status: "Operational",
    latencyMs: 185,
    uptime: "99.95%",
    region: "India Banking Hub Rails",
  },
  {
    name: "Transactional WhatsApp & SMS Gateway",
    status: "Operational",
    latencyMs: 340,
    uptime: "99.92%",
    region: "Telecom Carrier Aggregator",
  },
  {
    name: "Media Asset S3 & CloudFront CDN",
    status: "Operational",
    latencyMs: 22,
    uptime: "100.0%",
    region: "Global Edge PoPs (285+ locations)",
  },
  {
    name: "DCI KDM Key Encryption & Ingestion Hub",
    status: "Operational",
    latencyMs: 58,
    uptime: "99.99%",
    region: "Secured Hardware Security Module (HSM)",
  },
];
