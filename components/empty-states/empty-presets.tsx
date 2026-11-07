import React from "react";
import { EmptyState } from "./empty-state";
import { Film, Building2, Ticket, FileText, Search, AlertCircle, Wrench, Sparkles } from "lucide-react";

export function EmptySearchState({ query, onClear }: { query?: string; onClear?: () => void }) {
  return (
    <EmptyState
      icon={Search}
      title="No Results Located"
      description={
        query
          ? `We couldn't find any matching records for "${query}". Try adjusting keywords or clearing active filters.`
          : "We couldn't find any results matching your search criteria."
      }
      actionLabel={onClear ? "Clear Filters" : undefined}
      onAction={onClear}
    />
  );
}

export function NoMoviesState({ onReset }: { onReset?: () => void }) {
  return (
    <EmptyState
      icon={Film}
      title="No Films Available"
      description="There are currently no active films scheduled in this release window or category."
      actionLabel={onReset ? "Browse All Movies" : undefined}
      onAction={onReset}
    />
  );
}

export function NoTheatresState({ onReset }: { onReset?: () => void }) {
  return (
    <EmptyState
      icon={Building2}
      title="No Theatres Located"
      description="No cinema auditoriums or chains found in this selected metropolitan region."
      actionLabel={onReset ? "View All Circuits" : undefined}
      onAction={onReset}
    />
  );
}

export function NoBookingsState({ onExplore }: { onExplore?: () => void }) {
  return (
    <EmptyState
      icon={Ticket}
      title="Zero Booking Transactions"
      description="No customer ticket reservations or showtime orders located in this timeframe."
      actionLabel={onExplore ? "Explore Showtimes" : undefined}
      onAction={onExplore}
    />
  );
}

export function NoReportsState({ onGenerate }: { onGenerate?: () => void }) {
  return (
    <EmptyState
      icon={FileText}
      title="No Audit Reports Generated"
      description="There are no historical settlement ledgers or EDI archives matching these filters."
      actionLabel={onGenerate ? "Generate Report" : undefined}
      onAction={onGenerate}
    />
  );
}

export function UnderDevelopmentState({ moduleName = "This module" }: { moduleName?: string }) {
  return (
    <EmptyState
      icon={Wrench}
      title="Module Under Active Construction"
      description={`${moduleName} is currently scheduled for deployment in the subsequent platform phase.`}
    />
  );
}

