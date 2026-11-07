import { ID } from "./common.types";

export type NotificationType =
  | "booking"
  | "payment"
  | "theatre"
  | "movie"
  | "show"
  | "staff"
  | "alert"
  | "approval"
  | "system";

export type NotificationSeverity = "info" | "success" | "warning" | "danger";

export interface SystemNotification {
  id: ID;
  title: string;
  message: string;
  type: NotificationType;
  state: "unread" | "read";
  time: string;
  severity: NotificationSeverity;
  theatreId?: ID;
}
