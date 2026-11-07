import { SystemNotification } from "@/types";

export const THEATRE_NOTIFICATIONS: SystemNotification[] = [
  {
    id: "notif-001",
    title: "IMAX Hall 1 Housefull Alert",
    message: "Dune: Part Two 02:30 PM show reached 100% capacity. Standby waitlist active.",
    type: "booking",
    state: "unread",
    time: "15 minutes ago",
    severity: "success",
    theatreId: "th-pun-001",
  },
  {
    id: "notif-002",
    title: "DCP KDM Ingestion Key Received",
    message: "Secured key delivery completed for Gladiator II (Hindi & English ATMOS prints).",
    type: "movie",
    state: "unread",
    time: "1 hour ago",
    severity: "info",
    theatreId: "th-pun-001",
  },
  {
    id: "notif-003",
    title: "Concession Restock Dispatched",
    message: "Artisanal salted caramel syrup and popping corn order dispatched from hub.",
    type: "system",
    state: "read",
    time: "3 hours ago",
    severity: "info",
    theatreId: "th-pun-001",
  },
  {
    id: "notif-004",
    title: "Projector Lamp Maintenance Due",
    message: "Hall 3 Barco Laser engine reached 8,000 operational hours. Routine check recommended.",
    type: "alert",
    state: "read",
    time: "1 day ago",
    severity: "warning",
    theatreId: "th-pun-001",
  },
];
