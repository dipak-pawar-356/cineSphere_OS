import { relations } from "drizzle-orm";
import { countries, states, cities } from "./geo";
import { users, roles, permissions, rolePermissions, userRoles } from "./users";
import {
  theatres,
  amenities,
  theatreAmenities,
  theatreAdmins,
  hallManagers,
  staff,
  customers,
  theatreLifecycle,
  theatreStatusHistory,
  theatreApprovals,
  theatreSlugHistory,
} from "./theatres";
import {
  theatreMediaCollections,
  theatreMedia,
  theatreMediaMetadata,
  theatreMediaVersions,
  theatreMediaReferences,
} from "./theatre-media";
import {
  theatreProfiles,
  theatreLanguages,
  theatreSocialLinks,
  theatreProfileVersions,
} from "./theatre-profile";
import { paymentConfigurations, payments } from "./payments";
import { halls, hallLayouts, hallSections, seatTemplates } from "./halls";
import {
  movies,
  movieLanguages,
  movieFormats,
  movieGenres,
  movieImages,
  movieTrailers,
} from "./movies";
import { shows, showPricing, seatInventory } from "./shows";
import { bookingSessions, bookings, bookingSeats, tickets } from "./bookings";
import {
  auditLogs,
  notifications,
  reports,
  notificationPreferences,
  analyticsSummaries,
  reportSnapshots,
  securityEvents,
  structuredLogs,
  versionControl,
} from "./operations";
import { mediaLibrary, systemSettings } from "./system";

/**
 * ==============================================================================
 * CineSphere OS - Drizzle ORM Relational Mapping
 * Strongly typed entity graph powering complex joins and deep nested queries
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// Geographic Relations
// ------------------------------------------------------------------------------
export const countriesRelations = relations(countries, ({ many }) => ({
  states: many(states),
  theatres: many(theatres),
}));

export const statesRelations = relations(states, ({ one, many }) => ({
  country: one(countries, {
    fields: [states.countryId],
    references: [countries.id],
  }),
  cities: many(cities),
  theatres: many(theatres),
}));

export const citiesRelations = relations(cities, ({ one, many }) => ({
  state: one(states, {
    fields: [cities.stateId],
    references: [states.id],
  }),
  theatres: many(theatres),
}));

// ------------------------------------------------------------------------------
// Identity & RBAC Relations
// ------------------------------------------------------------------------------
export const usersRelations = relations(users, ({ one, many }) => ({
  theatre: one(theatres, {
    fields: [users.theatreId],
    references: [theatres.id],
  }),
  userRoles: many(userRoles),
  customerProfile: one(customers, {
    fields: [users.id],
    references: [customers.userId],
  }),
  staffProfile: one(staff, {
    fields: [users.id],
    references: [staff.userId],
  }),
  theatreAdminProfile: one(theatreAdmins, {
    fields: [users.id],
    references: [theatreAdmins.userId],
  }),
  hallManagerProfile: one(hallManagers, {
    fields: [users.id],
    references: [hallManagers.userId],
  }),
  bookings: many(bookings),
  notifications: many(notifications),
  auditLogs: many(auditLogs),
  uploadedMedia: many(mediaLibrary),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  userRoles: many(userRoles),
  rolePermissions: many(rolePermissions),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, {
    fields: [rolePermissions.roleId],
    references: [roles.id],
  }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id],
  }),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
  theatre: one(theatres, {
    fields: [userRoles.theatreId],
    references: [theatres.id],
  }),
}));

// ------------------------------------------------------------------------------
// Theatre & Operational Stakeholder Relations
// ------------------------------------------------------------------------------
export const theatresRelations = relations(theatres, ({ one, many }) => ({
  creator: one(users, {
    fields: [theatres.createdBy],
    references: [users.id],
  }),
  cityRel: one(cities, {
    fields: [theatres.cityId],
    references: [cities.id],
  }),
  stateRel: one(states, {
    fields: [theatres.stateId],
    references: [states.id],
  }),
  countryRel: one(countries, {
    fields: [theatres.countryId],
    references: [countries.id],
  }),
  paymentConfiguration: one(paymentConfigurations, {
    fields: [theatres.id],
    references: [paymentConfigurations.theatreId],
  }),
  halls: many(halls),
  theatreAdmins: many(theatreAdmins),
  hallManagers: many(hallManagers),
  staff: many(staff),
  shows: many(shows),
  bookings: many(bookings),
  payments: many(payments),
  notifications: many(notifications),
  reports: many(reports),
  auditLogs: many(auditLogs),
  theatreAmenities: many(theatreAmenities),
  mediaAssets: many(mediaLibrary),
  settings: many(systemSettings),
  lifecycle: one(theatreLifecycle, {
    fields: [theatres.id],
    references: [theatreLifecycle.theatreId],
  }),
  statusHistory: many(theatreStatusHistory),
  approvals: many(theatreApprovals),
  slugHistory: many(theatreSlugHistory),
  mediaCollection: one(theatreMediaCollections, {
    fields: [theatres.id],
    references: [theatreMediaCollections.theatreId],
  }),
  theatreMediaItems: many(theatreMedia),
  theatreMediaReferences: many(theatreMediaReferences),
  profile: one(theatreProfiles, {
    fields: [theatres.id],
    references: [theatreProfiles.theatreId],
  }),
  profileLanguages: many(theatreLanguages),
  profileSocialLinks: many(theatreSocialLinks),
  profileVersions: many(theatreProfileVersions),
}));

export const theatreLifecycleRelations = relations(theatreLifecycle, ({ one }) => ({
  theatre: one(theatres, {
    fields: [theatreLifecycle.theatreId],
    references: [theatres.id],
  }),
  lastTransitionUser: one(users, {
    fields: [theatreLifecycle.lastTransitionBy],
    references: [users.id],
  }),
}));

export const theatreStatusHistoryRelations = relations(theatreStatusHistory, ({ one }) => ({
  theatre: one(theatres, {
    fields: [theatreStatusHistory.theatreId],
    references: [theatres.id],
  }),
  changer: one(users, {
    fields: [theatreStatusHistory.changedBy],
    references: [users.id],
  }),
}));

export const theatreApprovalsRelations = relations(theatreApprovals, ({ one }) => ({
  theatre: one(theatres, {
    fields: [theatreApprovals.theatreId],
    references: [theatres.id],
  }),
  approver: one(users, {
    fields: [theatreApprovals.approverId],
    references: [users.id],
  }),
}));

export const theatreSlugHistoryRelations = relations(theatreSlugHistory, ({ one }) => ({
  theatre: one(theatres, {
    fields: [theatreSlugHistory.theatreId],
    references: [theatres.id],
  }),
  changer: one(users, {
    fields: [theatreSlugHistory.changedBy],
    references: [users.id],
  }),
}));

export const amenitiesRelations = relations(amenities, ({ many }) => ({
  theatreAmenities: many(theatreAmenities),
}));

export const theatreAmenitiesRelations = relations(theatreAmenities, ({ one }) => ({
  theatre: one(theatres, {
    fields: [theatreAmenities.theatreId],
    references: [theatres.id],
  }),
  amenity: one(amenities, {
    fields: [theatreAmenities.amenityId],
    references: [amenities.id],
  }),
}));

export const theatreAdminsRelations = relations(theatreAdmins, ({ one }) => ({
  theatre: one(theatres, {
    fields: [theatreAdmins.theatreId],
    references: [theatres.id],
  }),
  user: one(users, {
    fields: [theatreAdmins.userId],
    references: [users.id],
  }),
}));

export const hallManagersRelations = relations(hallManagers, ({ one }) => ({
  theatre: one(theatres, {
    fields: [hallManagers.theatreId],
    references: [theatres.id],
  }),
  user: one(users, {
    fields: [hallManagers.userId],
    references: [users.id],
  }),
}));

export const staffRelations = relations(staff, ({ one }) => ({
  theatre: one(theatres, {
    fields: [staff.theatreId],
    references: [theatres.id],
  }),
  user: one(users, {
    fields: [staff.userId],
    references: [users.id],
  }),
}));

export const customersRelations = relations(customers, ({ one }) => ({
  user: one(users, {
    fields: [customers.userId],
    references: [users.id],
  }),
}));

// ------------------------------------------------------------------------------
// Payment Relations
// ------------------------------------------------------------------------------
export const paymentConfigurationsRelations = relations(paymentConfigurations, ({ one, many }) => ({
  theatre: one(theatres, {
    fields: [paymentConfigurations.theatreId],
    references: [theatres.id],
  }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  theatre: one(theatres, {
    fields: [payments.theatreId],
    references: [theatres.id],
  }),
  paymentConfiguration: one(paymentConfigurations, {
    fields: [payments.paymentConfigId],
    references: [paymentConfigurations.id],
  }),
  booking: one(bookings, {
    fields: [payments.bookingId],
    references: [bookings.id],
  }),
}));

// ------------------------------------------------------------------------------
// Hall & Seating Architecture Relations
// ------------------------------------------------------------------------------
export const hallsRelations = relations(halls, ({ one, many }) => ({
  theatre: one(theatres, {
    fields: [halls.theatreId],
    references: [theatres.id],
  }),
  layout: one(hallLayouts, {
    fields: [halls.id],
    references: [hallLayouts.hallId],
  }),
  shows: many(shows),
  bookings: many(bookings),
}));

export const hallLayoutsRelations = relations(hallLayouts, ({ one, many }) => ({
  hall: one(halls, {
    fields: [hallLayouts.hallId],
    references: [halls.id],
  }),
  theatre: one(theatres, {
    fields: [hallLayouts.theatreId],
    references: [theatres.id],
  }),
  sections: many(hallSections),
  seatTemplates: many(seatTemplates),
}));

export const hallSectionsRelations = relations(hallSections, ({ one, many }) => ({
  layout: one(hallLayouts, {
    fields: [hallSections.layoutId],
    references: [hallLayouts.id],
  }),
  theatre: one(theatres, {
    fields: [hallSections.theatreId],
    references: [theatres.id],
  }),
  seatTemplates: many(seatTemplates),
  showPricing: many(showPricing),
  seatInventory: many(seatInventory),
}));

export const seatTemplatesRelations = relations(seatTemplates, ({ one, many }) => ({
  layout: one(hallLayouts, {
    fields: [seatTemplates.layoutId],
    references: [hallLayouts.id],
  }),
  section: one(hallSections, {
    fields: [seatTemplates.sectionId],
    references: [hallSections.id],
  }),
  theatre: one(theatres, {
    fields: [seatTemplates.theatreId],
    references: [theatres.id],
  }),
  seatInventory: many(seatInventory),
}));

// ------------------------------------------------------------------------------
// Movie & Catalog Relations
// ------------------------------------------------------------------------------
export const moviesRelations = relations(movies, ({ many }) => ({
  languages: many(movieLanguages),
  formats: many(movieFormats),
  genres: many(movieGenres),
  images: many(movieImages),
  trailers: many(movieTrailers),
  shows: many(shows),
}));

export const movieLanguagesRelations = relations(movieLanguages, ({ one }) => ({
  movie: one(movies, {
    fields: [movieLanguages.movieId],
    references: [movies.id],
  }),
}));

export const movieFormatsRelations = relations(movieFormats, ({ one }) => ({
  movie: one(movies, {
    fields: [movieFormats.movieId],
    references: [movies.id],
  }),
}));

export const movieGenresRelations = relations(movieGenres, ({ one }) => ({
  movie: one(movies, {
    fields: [movieGenres.movieId],
    references: [movies.id],
  }),
}));

export const movieImagesRelations = relations(movieImages, ({ one }) => ({
  movie: one(movies, {
    fields: [movieImages.movieId],
    references: [movies.id],
  }),
}));

export const movieTrailersRelations = relations(movieTrailers, ({ one }) => ({
  movie: one(movies, {
    fields: [movieTrailers.movieId],
    references: [movies.id],
  }),
}));

// ------------------------------------------------------------------------------
// Show Scheduling & Inventory Relations
// ------------------------------------------------------------------------------
export const showsRelations = relations(shows, ({ one, many }) => ({
  movie: one(movies, {
    fields: [shows.movieId],
    references: [movies.id],
  }),
  theatre: one(theatres, {
    fields: [shows.theatreId],
    references: [theatres.id],
  }),
  hall: one(halls, {
    fields: [shows.hallId],
    references: [halls.id],
  }),
  pricing: many(showPricing),
  seatInventory: many(seatInventory),
  bookings: many(bookings),
}));

export const showPricingRelations = relations(showPricing, ({ one }) => ({
  show: one(shows, {
    fields: [showPricing.showId],
    references: [shows.id],
  }),
  section: one(hallSections, {
    fields: [showPricing.sectionId],
    references: [hallSections.id],
  }),
  theatre: one(theatres, {
    fields: [showPricing.theatreId],
    references: [theatres.id],
  }),
}));

export const seatInventoryRelations = relations(seatInventory, ({ one, many }) => ({
  show: one(shows, {
    fields: [seatInventory.showId],
    references: [shows.id],
  }),
  theatre: one(theatres, {
    fields: [seatInventory.theatreId],
    references: [theatres.id],
  }),
  seatTemplate: one(seatTemplates, {
    fields: [seatInventory.seatTemplateId],
    references: [seatTemplates.id],
  }),
  section: one(hallSections, {
    fields: [seatInventory.sectionId],
    references: [hallSections.id],
  }),
  bookingSeats: many(bookingSeats),
}));

// ------------------------------------------------------------------------------
// Booking & Ticket Relations
// ------------------------------------------------------------------------------
export const bookingSessionsRelations = relations(bookingSessions, ({ one }) => ({
  customer: one(users, {
    fields: [bookingSessions.customerId],
    references: [users.id],
  }),
  show: one(shows, {
    fields: [bookingSessions.showId],
    references: [shows.id],
  }),
  theatre: one(theatres, {
    fields: [bookingSessions.theatreId],
    references: [theatres.id],
  }),
  hall: one(halls, {
    fields: [bookingSessions.hallId],
    references: [halls.id],
  }),
  booking: one(bookings, {
    fields: [bookingSessions.bookingId],
    references: [bookings.id],
  }),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  customer: one(users, {
    fields: [bookings.customerId],
    references: [users.id],
  }),
  show: one(shows, {
    fields: [bookings.showId],
    references: [shows.id],
  }),
  theatre: one(theatres, {
    fields: [bookings.theatreId],
    references: [theatres.id],
  }),
  hall: one(halls, {
    fields: [bookings.hallId],
    references: [halls.id],
  }),
  bookingSeats: many(bookingSeats),
  tickets: many(tickets),
  payment: one(payments, {
    fields: [bookings.id],
    references: [payments.bookingId],
  }),
}));

export const bookingSeatsRelations = relations(bookingSeats, ({ one }) => ({
  booking: one(bookings, {
    fields: [bookingSeats.bookingId],
    references: [bookings.id],
  }),
  seatInventory: one(seatInventory, {
    fields: [bookingSeats.seatInventoryId],
    references: [seatInventory.id],
  }),
  ticket: one(tickets, {
    fields: [bookingSeats.id],
    references: [tickets.bookingSeatId],
  }),
}));

export const ticketsRelations = relations(tickets, ({ one }) => ({
  booking: one(bookings, {
    fields: [tickets.bookingId],
    references: [bookings.id],
  }),
  bookingSeat: one(bookingSeats, {
    fields: [tickets.bookingSeatId],
    references: [bookingSeats.id],
  }),
  theatre: one(theatres, {
    fields: [tickets.theatreId],
    references: [theatres.id],
  }),
  show: one(shows, {
    fields: [tickets.showId],
    references: [shows.id],
  }),
  customer: one(users, {
    fields: [tickets.customerId],
    references: [users.id],
  }),
}));

// ------------------------------------------------------------------------------
// Operations, Audit & System Relations
// ------------------------------------------------------------------------------
export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
  theatre: one(theatres, {
    fields: [auditLogs.theatreId],
    references: [theatres.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  theatre: one(theatres, {
    fields: [notifications.theatreId],
    references: [theatres.id],
  }),
}));

export const notificationPreferencesRelations = relations(notificationPreferences, ({ one }) => ({
  user: one(users, {
    fields: [notificationPreferences.userId],
    references: [users.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  theatre: one(theatres, {
    fields: [reports.theatreId],
    references: [theatres.id],
  }),
  generator: one(users, {
    fields: [reports.generatedBy],
    references: [users.id],
  }),
}));

export const analyticsSummariesRelations = relations(analyticsSummaries, ({ one }) => ({
  theatre: one(theatres, {
    fields: [analyticsSummaries.theatreId],
    references: [theatres.id],
  }),
}));

export const reportSnapshotsRelations = relations(reportSnapshots, ({ one }) => ({
  theatre: one(theatres, {
    fields: [reportSnapshots.theatreId],
    references: [theatres.id],
  }),
  generator: one(users, {
    fields: [reportSnapshots.generatedBy],
    references: [users.id],
  }),
}));

export const mediaLibraryRelations = relations(mediaLibrary, ({ one }) => ({
  theatre: one(theatres, {
    fields: [mediaLibrary.theatreId],
    references: [theatres.id],
  }),
  uploader: one(users, {
    fields: [mediaLibrary.uploadedBy],
    references: [users.id],
  }),
}));

export const systemSettingsRelations = relations(systemSettings, ({ one }) => ({
  theatre: one(theatres, {
    fields: [systemSettings.theatreId],
    references: [theatres.id],
  }),
  updater: one(users, {
    fields: [systemSettings.updatedBy],
    references: [users.id],
  }),
}));

export const securityEventsRelations = relations(securityEvents, ({ one }) => ({
  theatre: one(theatres, {
    fields: [securityEvents.theatreId],
    references: [theatres.id],
  }),
  actor: one(users, {
    fields: [securityEvents.actorId],
    references: [users.id],
  }),
}));

export const structuredLogsRelations = relations(structuredLogs, ({ one }) => ({
  theatre: one(theatres, {
    fields: [structuredLogs.theatreId],
    references: [theatres.id],
  }),
  user: one(users, {
    fields: [structuredLogs.userId],
    references: [users.id],
  }),
}));

export const versionControlRelations = relations(versionControl, ({ one }) => ({
  theatre: one(theatres, {
    fields: [versionControl.theatreId],
    references: [theatres.id],
  }),
  updater: one(users, {
    fields: [versionControl.updatedBy],
    references: [users.id],
  }),
}));

// ------------------------------------------------------------------------------
// Theatre Branding & Media Management Relations (Phase 3 - Part 2)
// ------------------------------------------------------------------------------
export const theatreMediaCollectionsRelations = relations(
  theatreMediaCollections,
  ({ one, many }) => ({
    theatre: one(theatres, {
      fields: [theatreMediaCollections.theatreId],
      references: [theatres.id],
    }),
    mediaAssets: many(theatreMedia),
  })
);

export const theatreMediaRelations = relations(theatreMedia, ({ one, many }) => ({
  collection: one(theatreMediaCollections, {
    fields: [theatreMedia.collectionId],
    references: [theatreMediaCollections.id],
  }),
  theatre: one(theatres, {
    fields: [theatreMedia.theatreId],
    references: [theatres.id],
  }),
  uploader: one(users, {
    fields: [theatreMedia.uploadedBy],
    references: [users.id],
  }),
  metadata: one(theatreMediaMetadata, {
    fields: [theatreMedia.id],
    references: [theatreMediaMetadata.mediaId],
  }),
  versions: many(theatreMediaVersions),
  references: many(theatreMediaReferences),
}));

export const theatreMediaMetadataRelations = relations(theatreMediaMetadata, ({ one }) => ({
  media: one(theatreMedia, {
    fields: [theatreMediaMetadata.mediaId],
    references: [theatreMedia.id],
  }),
}));

export const theatreMediaVersionsRelations = relations(theatreMediaVersions, ({ one }) => ({
  media: one(theatreMedia, {
    fields: [theatreMediaVersions.mediaId],
    references: [theatreMedia.id],
  }),
  replacer: one(users, {
    fields: [theatreMediaVersions.replacedBy],
    references: [users.id],
  }),
}));

export const theatreMediaReferencesRelations = relations(theatreMediaReferences, ({ one }) => ({
  theatre: one(theatres, {
    fields: [theatreMediaReferences.theatreId],
    references: [theatres.id],
  }),
  media: one(theatreMedia, {
    fields: [theatreMediaReferences.mediaId],
    references: [theatreMedia.id],
  }),
}));

// ------------------------------------------------------------------------------
// Theatre Profile Management Relations (Phase 3 - Part 3)
// ------------------------------------------------------------------------------
export const theatreProfilesRelations = relations(theatreProfiles, ({ one, many }) => ({
  theatre: one(theatres, {
    fields: [theatreProfiles.theatreId],
    references: [theatres.id],
  }),
  languages: many(theatreLanguages),
  socialLinks: many(theatreSocialLinks),
  versions: many(theatreProfileVersions),
}));

export const theatreLanguagesRelations = relations(theatreLanguages, ({ one }) => ({
  profile: one(theatreProfiles, {
    fields: [theatreLanguages.profileId],
    references: [theatreProfiles.id],
  }),
  theatre: one(theatres, {
    fields: [theatreLanguages.theatreId],
    references: [theatres.id],
  }),
}));

export const theatreSocialLinksRelations = relations(theatreSocialLinks, ({ one }) => ({
  profile: one(theatreProfiles, {
    fields: [theatreSocialLinks.profileId],
    references: [theatreProfiles.id],
  }),
  theatre: one(theatres, {
    fields: [theatreSocialLinks.theatreId],
    references: [theatres.id],
  }),
}));

export const theatreProfileVersionsRelations = relations(theatreProfileVersions, ({ one }) => ({
  profile: one(theatreProfiles, {
    fields: [theatreProfileVersions.profileId],
    references: [theatreProfiles.id],
  }),
  theatre: one(theatres, {
    fields: [theatreProfileVersions.theatreId],
    references: [theatres.id],
  }),
  updater: one(users, {
    fields: [theatreProfileVersions.updatedBy],
    references: [users.id],
  }),
}));




