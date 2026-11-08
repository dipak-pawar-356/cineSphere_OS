import { type InferSelectModel, type InferInsertModel } from "drizzle-orm";
import * as schema from "./schema";

/**
 * ==============================================================================
 * CineSphere OS - Strongly Typed Drizzle Database Models
 * Inferred TypeScript types for all 36 normalized schema entities
 * ==============================================================================
 */

// Geographic Hierarchy
export type DbCountry = InferSelectModel<typeof schema.countries>;
export type NewCountry = InferInsertModel<typeof schema.countries>;

export type DbState = InferSelectModel<typeof schema.states>;
export type NewState = InferInsertModel<typeof schema.states>;

export type DbCity = InferSelectModel<typeof schema.cities>;
export type NewCity = InferInsertModel<typeof schema.cities>;

// Identity & Access Control
export type DbUser = InferSelectModel<typeof schema.users>;
export type NewUser = InferInsertModel<typeof schema.users>;

export type DbRole = InferSelectModel<typeof schema.roles>;
export type NewRole = InferInsertModel<typeof schema.roles>;

export type DbPermission = InferSelectModel<typeof schema.permissions>;
export type NewPermission = InferInsertModel<typeof schema.permissions>;

export type DbRolePermission = InferSelectModel<typeof schema.rolePermissions>;
export type NewRolePermission = InferInsertModel<typeof schema.rolePermissions>;

export type DbUserRole = InferSelectModel<typeof schema.userRoles>;
export type NewUserRole = InferInsertModel<typeof schema.userRoles>;

// Multi-Tenant Theatres & Staffing
export type DbTheatre = InferSelectModel<typeof schema.theatres>;
export type NewTheatre = InferInsertModel<typeof schema.theatres>;

export type DbAmenity = InferSelectModel<typeof schema.amenities>;
export type NewAmenity = InferInsertModel<typeof schema.amenities>;

export type DbTheatreAmenity = InferSelectModel<typeof schema.theatreAmenities>;
export type NewTheatreAmenity = InferInsertModel<typeof schema.theatreAmenities>;

export type DbTheatreAdmin = InferSelectModel<typeof schema.theatreAdmins>;
export type NewTheatreAdmin = InferInsertModel<typeof schema.theatreAdmins>;

export type DbHallManager = InferSelectModel<typeof schema.hallManagers>;
export type NewHallManager = InferInsertModel<typeof schema.hallManagers>;

export type DbStaff = InferSelectModel<typeof schema.staff>;
export type NewStaff = InferInsertModel<typeof schema.staff>;

export type DbCustomer = InferSelectModel<typeof schema.customers>;
export type NewCustomer = InferInsertModel<typeof schema.customers>;

// Payments & Rail Configuration
export type DbPaymentConfiguration = InferSelectModel<typeof schema.paymentConfigurations>;
export type NewPaymentConfiguration = InferInsertModel<typeof schema.paymentConfigurations>;

export type DbPayment = InferSelectModel<typeof schema.payments>;
export type NewPayment = InferInsertModel<typeof schema.payments>;

// Halls, Layouts & CAD Seating Templates
export type DbHall = InferSelectModel<typeof schema.halls>;
export type NewHall = InferInsertModel<typeof schema.halls>;

export type DbHallLayout = InferSelectModel<typeof schema.hallLayouts>;
export type NewHallLayout = InferInsertModel<typeof schema.hallLayouts>;

export type DbHallSection = InferSelectModel<typeof schema.hallSections>;
export type NewHallSection = InferInsertModel<typeof schema.hallSections>;

export type DbSeatTemplate = InferSelectModel<typeof schema.seatTemplates>;
export type NewSeatTemplate = InferInsertModel<typeof schema.seatTemplates>;

// Movies & Creative Assets
export type DbMovie = InferSelectModel<typeof schema.movies>;
export type NewMovie = InferInsertModel<typeof schema.movies>;

export type DbMovieLanguage = InferSelectModel<typeof schema.movieLanguages>;
export type NewMovieLanguage = InferInsertModel<typeof schema.movieLanguages>;

export type DbMovieFormat = InferSelectModel<typeof schema.movieFormats>;
export type NewMovieFormat = InferInsertModel<typeof schema.movieFormats>;

export type DbMovieGenre = InferSelectModel<typeof schema.movieGenres>;
export type NewMovieGenre = InferInsertModel<typeof schema.movieGenres>;

export type DbMovieImage = InferSelectModel<typeof schema.movieImages>;
export type NewMovieImage = InferInsertModel<typeof schema.movieImages>;

export type DbMovieTrailer = InferSelectModel<typeof schema.movieTrailers>;
export type NewMovieTrailer = InferInsertModel<typeof schema.movieTrailers>;

// Shows, Dynamic Pricing & Real-Time Inventory
export type DbShow = InferSelectModel<typeof schema.shows>;
export type NewShow = InferInsertModel<typeof schema.shows>;

export type DbShowPricing = InferSelectModel<typeof schema.showPricing>;
export type NewShowPricing = InferInsertModel<typeof schema.showPricing>;

export type DbSeatInventory = InferSelectModel<typeof schema.seatInventory>;
export type NewSeatInventory = InferInsertModel<typeof schema.seatInventory>;

// Bookings, Reservations & QR Tickets
export type DbBooking = InferSelectModel<typeof schema.bookings>;
export type NewBooking = InferInsertModel<typeof schema.bookings>;

export type DbBookingSeat = InferSelectModel<typeof schema.bookingSeats>;
export type NewBookingSeat = InferInsertModel<typeof schema.bookingSeats>;

export type DbTicket = InferSelectModel<typeof schema.tickets>;
export type NewTicket = InferInsertModel<typeof schema.tickets>;

// Operations, Audit, System & Reporting
export type DbAuditLog = InferSelectModel<typeof schema.auditLogs>;
export type NewAuditLog = InferInsertModel<typeof schema.auditLogs>;

export type DbNotification = InferSelectModel<typeof schema.notifications>;
export type NewNotification = InferInsertModel<typeof schema.notifications>;

export type DbReport = InferSelectModel<typeof schema.reports>;
export type NewReport = InferInsertModel<typeof schema.reports>;

export type DbMediaLibrary = InferSelectModel<typeof schema.mediaLibrary>;
export type NewMediaLibrary = InferInsertModel<typeof schema.mediaLibrary>;

export type DbSystemSetting = InferSelectModel<typeof schema.systemSettings>;
export type NewSystemSetting = InferInsertModel<typeof schema.systemSettings>;
