import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { getCustomerTickets } from "@/lib/engine/ticket-engine";
import { CustomerTicketsClient } from "./customer-tickets-client";

export const metadata = {
  title: "My Digital Tickets & Passes | CineSphere OS Patron Portal",
  description:
    "View and manage your verified admission passes with fast turnstile QR codes.",
};

export const dynamic = "force-dynamic";

export default async function CustomerTicketsPage() {
  // Retrieve tickets for the authenticated customer (defaulted to primary seed patron 'cust-001')
  const customerId = "cust-001";
  const { tickets } = getCustomerTickets(customerId, {
    timeFilter: "ALL",
    sortBy: "showTime_desc",
  });

  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        title="My Digital Tickets & Admission Passes"
        subtitle="Fast-Pass Gate Admission Codes • Proof of Confirmed Booking"
        description="Access verified admission passes, dynamic fast-pass QR entry codes, and complete booking manifests for zero-delay usher verification at the door."
        badge="Live Passes Active"
        badgeVariant="primary"
      />

      <CustomerTicketsClient initialTickets={tickets} customerId={customerId} />
    </div>
  );
}
