CREATE TYPE "public"."audit_action" AS ENUM('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'LOCK', 'UNLOCK', 'OVERRIDE', 'EXPORT');--> statement-breakpoint
CREATE TYPE "public"."booking_status" AS ENUM('CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."city_tier" AS ENUM('TIER_1', 'TIER_2', 'TIER_3');--> statement-breakpoint
CREATE TYPE "public"."hall_status" AS ENUM('ACTIVE', 'MAINTENANCE', 'CLEANING', 'SHOW_RUNNING', 'INACTIVE');--> statement-breakpoint
CREATE TYPE "public"."loyalty_tier" AS ENUM('STANDARD', 'SILVER', 'GOLD', 'PLATINUM', 'CINESPHERE_VIP');--> statement-breakpoint
CREATE TYPE "public"."movie_certificate" AS ENUM('U', 'UA', 'UA_13_PLUS', 'UA_16_PLUS', 'A', 'S', 'PG_13', 'R', 'PG');--> statement-breakpoint
CREATE TYPE "public"."movie_format" AS ENUM('FORMAT_2D', 'FORMAT_3D', 'IMAX', 'IMAX_3D', 'FOUR_DX', 'DOLBY_ATMOS', 'DOLBY_CINEMA', 'SCREEN_X', 'STANDARD');--> statement-breakpoint
CREATE TYPE "public"."movie_status" AS ENUM('NOW_SHOWING', 'UPCOMING', 'SPECIAL_SCREENING', 'ARCHIVED', 'COMING_SOON');--> statement-breakpoint
CREATE TYPE "public"."notification_audience" AS ENUM('CUSTOMER', 'ADMIN', 'SYSTEM', 'ALL');--> statement-breakpoint
CREATE TYPE "public"."notification_severity" AS ENUM('INFO', 'SUCCESS', 'WARNING', 'DANGER');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('BOOKING', 'PAYMENT', 'THEATRE', 'MOVIE', 'SHOW', 'STAFF', 'ALERT', 'APPROVAL', 'SYSTEM');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('UPI', 'CREDIT_CARD', 'DEBIT_CARD', 'NET_BANKING', 'CASH', 'WALLET');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('PAID', 'PENDING', 'REFUNDED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."pricing_tier" AS ENUM('LUXURY', 'PREMIUM', 'STANDARD', 'BUDGET');--> statement-breakpoint
CREATE TYPE "public"."report_category" AS ENUM('DAILY_BOX_OFFICE', 'OCCUPANCY', 'CONCESSIONS', 'DISTRIBUTOR_SPLIT', 'TAX_COMPLIANCE', 'AUDITORIUM_PERFORMANCE', 'TURNSTILE_SECURITY');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('READY', 'PROCESSING', 'ARCHIVED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."seat_status" AS ENUM('AVAILABLE', 'SELECTED', 'BOOKED', 'RESERVED', 'BLOCKED', 'MAINTENANCE');--> statement-breakpoint
CREATE TYPE "public"."seat_type" AS ENUM('STANDARD', 'RECLINER', 'VIP', 'COUPLE', 'WHEELCHAIR', 'SOFA');--> statement-breakpoint
CREATE TYPE "public"."settlement_period" AS ENUM('T_PLUS_0_INSTANT', 'T_PLUS_1_DAILY', 'WEEKLY');--> statement-breakpoint
CREATE TYPE "public"."show_status" AS ENUM('UPCOMING', 'RUNNING', 'HOUSEFULL', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."staff_shift" AS ENUM('MORNING', 'EVENING', 'NIGHT', 'ROTATIONAL');--> statement-breakpoint
CREATE TYPE "public"."staff_status" AS ENUM('ON_DUTY', 'OFF_DUTY', 'ON_LEAVE', 'TERMINATED');--> statement-breakpoint
CREATE TYPE "public"."theatre_status" AS ENUM('ACTIVE', 'MAINTENANCE', 'RENOVATING', 'PENDING_APPROVAL', 'SUSPENDED');--> statement-breakpoint
CREATE TYPE "public"."ticket_status" AS ENUM('VALID', 'USED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('SUPER_ADMIN', 'THEATRE_ADMIN', 'HALL_MANAGER', 'STAFF', 'CUSTOMER');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('ACTIVE', 'PENDING_VERIFICATION', 'SUSPENDED', 'INVITED');--> statement-breakpoint
CREATE TABLE "cities" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"state_id" varchar(36) NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(120) NOT NULL,
	"tier" "city_tier" DEFAULT 'TIER_1' NOT NULL,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "countries" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"code" varchar(3) NOT NULL,
	"name" varchar(100) NOT NULL,
	"phone_code" varchar(10) DEFAULT '+91' NOT NULL,
	"currency_code" varchar(10) DEFAULT 'INR' NOT NULL,
	"currency_symbol" varchar(10) DEFAULT '₹' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "countries_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "states" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"country_id" varchar(36) NOT NULL,
	"name" varchar(100) NOT NULL,
	"code" varchar(10) NOT NULL,
	"gst_state_code" varchar(4),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"code" varchar(100) NOT NULL,
	"name" varchar(150) NOT NULL,
	"module" varchar(50) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "permissions_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"role_id" varchar(36) NOT NULL,
	"permission_id" varchar(36) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"hierarchy_level" integer DEFAULT 10 NOT NULL,
	"is_system" boolean DEFAULT false NOT NULL,
	"theatre_id" varchar(36),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "roles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"role_id" varchar(36) NOT NULL,
	"theatre_id" varchar(36),
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"assigned_by" varchar(36)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"clerk_id" varchar(128) NOT NULL,
	"email" varchar(255) NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"phone" varchar(20),
	"phone_verified" boolean DEFAULT false NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"display_name" varchar(200),
	"avatar_url" text,
	"role" "user_role" DEFAULT 'CUSTOMER' NOT NULL,
	"theatre_id" varchar(36),
	"status" "user_status" DEFAULT 'ACTIVE' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"last_sign_in_at" timestamp with time zone,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "amenities" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"slug" varchar(100) NOT NULL,
	"name" varchar(150) NOT NULL,
	"category" varchar(50) NOT NULL,
	"icon" varchar(50),
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "amenities_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"loyalty_tier" "loyalty_tier" DEFAULT 'STANDARD' NOT NULL,
	"total_bookings" integer DEFAULT 0 NOT NULL,
	"total_spent" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"last_booking_date" timestamp with time zone,
	"preferred_genre" varchar(50),
	"preferred_language" varchar(50),
	"preferred_city" varchar(100),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hall_managers" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"theatre_id" varchar(36) NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"shift" "staff_shift" DEFAULT 'MORNING' NOT NULL,
	"assigned_halls" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staff" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"theatre_id" varchar(36) NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"employee_code" varchar(50) NOT NULL,
	"designation" varchar(100) NOT NULL,
	"role" varchar(50) DEFAULT 'Ticket Counter Staff' NOT NULL,
	"assigned_hall" varchar(100),
	"shift" "staff_shift" DEFAULT 'MORNING' NOT NULL,
	"status" "staff_status" DEFAULT 'ON_DUTY' NOT NULL,
	"joining_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "theatre_admins" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"theatre_id" varchar(36) NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"designation" varchar(100) DEFAULT 'General Manager',
	"permissions_override" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "theatre_amenities" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"theatre_id" varchar(36) NOT NULL,
	"amenity_id" varchar(36) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "theatres" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"slug" varchar(150) NOT NULL,
	"name" varchar(150) NOT NULL,
	"chain" varchar(100),
	"code" varchar(30),
	"tagline" varchar(255),
	"description" text,
	"logo" text NOT NULL,
	"banner" text NOT NULL,
	"address" text NOT NULL,
	"city" varchar(100) NOT NULL,
	"city_id" varchar(36),
	"state" varchar(100) NOT NULL,
	"state_id" varchar(36),
	"pin_code" varchar(20),
	"country" varchar(100) DEFAULT 'India' NOT NULL,
	"country_id" varchar(36),
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"contact_number" varchar(30) NOT NULL,
	"email" varchar(255) NOT NULL,
	"gst_number" varchar(30),
	"amenities" jsonb DEFAULT '[]'::jsonb,
	"facilities" jsonb DEFAULT '[]'::jsonb,
	"pricing_tier" "pricing_tier" DEFAULT 'STANDARD' NOT NULL,
	"status" "theatre_status" DEFAULT 'ACTIVE' NOT NULL,
	"timezone" varchar(50) DEFAULT 'Asia/Kolkata' NOT NULL,
	"currency" varchar(10) DEFAULT 'INR' NOT NULL,
	"opening_time" varchar(20) DEFAULT '08:00 AM',
	"closing_time" varchar(20) DEFAULT '01:30 AM',
	"is_featured" boolean DEFAULT false NOT NULL,
	"rating" numeric(3, 2) DEFAULT '4.50',
	"reviews_count" integer DEFAULT 0,
	"hall_count" integer DEFAULT 0 NOT NULL,
	"brand_colors" jsonb,
	"booking_terms" jsonb DEFAULT '[]'::jsonb,
	"cancellation_rules" jsonb DEFAULT '[]'::jsonb,
	"refund_rules" jsonb DEFAULT '[]'::jsonb,
	"created_by" varchar(36),
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "theatres_slug_unique" UNIQUE("slug"),
	CONSTRAINT "theatres_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "payment_configurations" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"theatre_id" varchar(36) NOT NULL,
	"upi_id" varchar(100) NOT NULL,
	"business_name" varchar(150) NOT NULL,
	"merchant_name" varchar(150) NOT NULL,
	"qr_placeholder" text NOT NULL,
	"bank_name" varchar(100) DEFAULT 'HDFC Bank' NOT NULL,
	"account_number_masked" varchar(50),
	"ifsc_code" varchar(20),
	"settlement_period" "settlement_period" DEFAULT 'T_PLUS_1_DAILY' NOT NULL,
	"razorpay_key_id" varchar(120),
	"razorpay_secret_encrypted" text,
	"phonepe_merchant_id" varchar(120),
	"phonepe_salt_key_encrypted" text,
	"paytm_mid" varchar(120),
	"paytm_key_encrypted" text,
	"stripe_publishable_key" varchar(150),
	"stripe_secret_key_encrypted" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payment_configurations_theatre_id_unique" UNIQUE("theatre_id")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"booking_id" varchar(36) NOT NULL,
	"theatre_id" varchar(36) NOT NULL,
	"payment_config_id" varchar(36),
	"amount" numeric(10, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'INR' NOT NULL,
	"payment_method" "payment_method" DEFAULT 'UPI' NOT NULL,
	"status" "payment_status" DEFAULT 'PENDING' NOT NULL,
	"transaction_reference" varchar(120) NOT NULL,
	"gateway_ref" varchar(120),
	"gateway_data" jsonb DEFAULT '{}'::jsonb,
	"theatre_share" numeric(10, 2),
	"platform_fee_share" numeric(10, 2),
	"tax_breakup" jsonb,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payments_transaction_reference_unique" UNIQUE("transaction_reference")
);
--> statement-breakpoint
CREATE TABLE "hall_layouts" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"hall_id" varchar(36) NOT NULL,
	"theatre_id" varchar(36) NOT NULL,
	"name" varchar(100) DEFAULT 'Default Reusable Layout' NOT NULL,
	"rows" integer NOT NULL,
	"columns" integer NOT NULL,
	"walkways" jsonb DEFAULT '[]'::jsonb,
	"vip_zones" jsonb DEFAULT '[]'::jsonb,
	"wheelchair_areas" jsonb DEFAULT '[]'::jsonb,
	"emergency_exits" jsonb DEFAULT '[]'::jsonb,
	"future_3d_config" jsonb DEFAULT '{"cameraFov":60,"screenCurvature":0.15,"screenTiltDegrees":5,"eyeLevelOffsetMeters":1.2}'::jsonb,
	"is_default" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "hall_layouts_hall_id_unique" UNIQUE("hall_id")
);
--> statement-breakpoint
CREATE TABLE "hall_sections" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"layout_id" varchar(36) NOT NULL,
	"theatre_id" varchar(36) NOT NULL,
	"name" varchar(100) NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"seat_count" integer NOT NULL,
	"seat_type" "seat_type" DEFAULT 'STANDARD' NOT NULL,
	"display_color" varchar(30) DEFAULT '#3B82F6' NOT NULL,
	"category_icon" varchar(50) DEFAULT 'Sparkles',
	"row_labels" jsonb DEFAULT '[]'::jsonb,
	"seats_per_row" integer DEFAULT 10 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "halls" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"theatre_id" varchar(36) NOT NULL,
	"name" varchar(100) NOT NULL,
	"screen_number" integer NOT NULL,
	"capacity" integer DEFAULT 0 NOT NULL,
	"projection" varchar(100) DEFAULT 'Barco 4K Laser' NOT NULL,
	"sound" varchar(100) DEFAULT 'Dolby Atmos 64-Channel' NOT NULL,
	"screen_type" varchar(50) DEFAULT 'IMAX Laser' NOT NULL,
	"aspect_ratio" varchar(20) DEFAULT '1.90:1',
	"status" "hall_status" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seat_templates" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"layout_id" varchar(36) NOT NULL,
	"section_id" varchar(36) NOT NULL,
	"theatre_id" varchar(36) NOT NULL,
	"seat_number" varchar(20) NOT NULL,
	"row" varchar(10) NOT NULL,
	"column" integer NOT NULL,
	"seat_type" "seat_type" DEFAULT 'STANDARD' NOT NULL,
	"coordinates" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "movie_formats" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"movie_id" varchar(36) NOT NULL,
	"format" "movie_format" DEFAULT 'STANDARD' NOT NULL,
	"is_available" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "movie_genres" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"movie_id" varchar(36) NOT NULL,
	"genre" varchar(50) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "movie_images" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"movie_id" varchar(36) NOT NULL,
	"url" text NOT NULL,
	"image_type" varchar(50) DEFAULT 'gallery' NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"alt_text" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "movie_languages" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"movie_id" varchar(36) NOT NULL,
	"language" varchar(50) NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"audio_track_type" varchar(50) DEFAULT 'Original',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "movie_trailers" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"movie_id" varchar(36) NOT NULL,
	"title" varchar(150) NOT NULL,
	"video_url" text NOT NULL,
	"thumbnail_url" text NOT NULL,
	"duration" varchar(20) DEFAULT '2:45',
	"is_main" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "movies" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"slug" varchar(150) NOT NULL,
	"title" varchar(255) NOT NULL,
	"tagline" varchar(255),
	"synopsis" text,
	"description" text,
	"poster" text NOT NULL,
	"banner" text NOT NULL,
	"duration_minutes" integer NOT NULL,
	"rating" numeric(3, 1) DEFAULT '8.5',
	"certificate" "movie_certificate" DEFAULT 'UA' NOT NULL,
	"release_date" varchar(20) NOT NULL,
	"status" "movie_status" DEFAULT 'NOW_SHOWING' NOT NULL,
	"director" varchar(150),
	"cast" jsonb DEFAULT '[]'::jsonb,
	"cast_detailed" jsonb DEFAULT '[]'::jsonb,
	"crew_detailed" jsonb DEFAULT '[]'::jsonb,
	"is_featured" boolean DEFAULT false NOT NULL,
	"is_trending" boolean DEFAULT false NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "movies_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "seat_inventory" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"show_id" varchar(36) NOT NULL,
	"theatre_id" varchar(36) NOT NULL,
	"seat_template_id" varchar(36) NOT NULL,
	"section_id" varchar(36) NOT NULL,
	"seat_number" varchar(20) NOT NULL,
	"row" varchar(10) NOT NULL,
	"column" integer NOT NULL,
	"seat_type" "seat_type" DEFAULT 'STANDARD' NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"status" "seat_status" DEFAULT 'AVAILABLE' NOT NULL,
	"is_wheelchair" boolean DEFAULT false NOT NULL,
	"is_recliner" boolean DEFAULT false NOT NULL,
	"is_couple_seat" boolean DEFAULT false NOT NULL,
	"dynamic_pricing_multiplier" numeric(4, 2) DEFAULT '1.00' NOT NULL,
	"locked_by" varchar(128),
	"locked_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "show_pricing" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"show_id" varchar(36) NOT NULL,
	"section_id" varchar(36) NOT NULL,
	"theatre_id" varchar(36) NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"convenience_fee" numeric(10, 2) DEFAULT '35.00' NOT NULL,
	"gst_percent" numeric(5, 2) DEFAULT '18.00' NOT NULL,
	"currency" varchar(10) DEFAULT 'INR' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shows" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"movie_id" varchar(36) NOT NULL,
	"theatre_id" varchar(36) NOT NULL,
	"hall_id" varchar(36) NOT NULL,
	"show_date" varchar(20) NOT NULL,
	"start_time" varchar(20) NOT NULL,
	"end_time" varchar(20) NOT NULL,
	"language" varchar(50) DEFAULT 'Hindi' NOT NULL,
	"format" "movie_format" DEFAULT 'STANDARD' NOT NULL,
	"status" "show_status" DEFAULT 'UPCOMING' NOT NULL,
	"base_price" numeric(10, 2) DEFAULT '200.00' NOT NULL,
	"total_seats" integer DEFAULT 0 NOT NULL,
	"seats_booked" integer DEFAULT 0 NOT NULL,
	"convenience_fee_per_seat" numeric(10, 2) DEFAULT '35.00' NOT NULL,
	"gst_percent" numeric(5, 2) DEFAULT '18.00' NOT NULL,
	"slot_type" varchar(50) DEFAULT 'Morning',
	"day_type" varchar(50) DEFAULT 'Weekday',
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "booking_seats" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"booking_id" varchar(36) NOT NULL,
	"seat_inventory_id" varchar(36) NOT NULL,
	"seat_number" varchar(20) NOT NULL,
	"section_name" varchar(100) NOT NULL,
	"seat_type" "seat_type" DEFAULT 'STANDARD' NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"reference_code" varchar(50) NOT NULL,
	"customer_id" varchar(36) NOT NULL,
	"customer_name" varchar(150) NOT NULL,
	"customer_email" varchar(255) NOT NULL,
	"customer_phone" varchar(20) NOT NULL,
	"show_id" varchar(36) NOT NULL,
	"theatre_id" varchar(36) NOT NULL,
	"hall_id" varchar(36) NOT NULL,
	"booking_status" "booking_status" DEFAULT 'CONFIRMED' NOT NULL,
	"payment_status" "payment_status" DEFAULT 'PENDING' NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"convenience_fee" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"taxes" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"booking_time" timestamp with time zone DEFAULT now() NOT NULL,
	"qr_code_url" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bookings_reference_code_unique" UNIQUE("reference_code")
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"ticket_number" varchar(60) NOT NULL,
	"booking_id" varchar(36) NOT NULL,
	"booking_seat_id" varchar(36),
	"seat_number" varchar(20) NOT NULL,
	"qr_placeholder" text NOT NULL,
	"status" "ticket_status" DEFAULT 'VALID' NOT NULL,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tickets_ticket_number_unique" UNIQUE("ticket_number")
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36),
	"theatre_id" varchar(36),
	"action" "audit_action" DEFAULT 'UPDATE' NOT NULL,
	"module" varchar(50) NOT NULL,
	"description" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"ip_address" varchar(50),
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36),
	"theatre_id" varchar(36),
	"type" "notification_type" DEFAULT 'SYSTEM' NOT NULL,
	"severity" "notification_severity" DEFAULT 'INFO' NOT NULL,
	"audience" "notification_audience" DEFAULT 'CUSTOMER' NOT NULL,
	"title" varchar(200) NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"theatre_id" varchar(36),
	"category" "report_category" DEFAULT 'DAILY_BOX_OFFICE' NOT NULL,
	"title" varchar(200) NOT NULL,
	"period" varchar(50) NOT NULL,
	"status" "report_status" DEFAULT 'READY' NOT NULL,
	"file_size" varchar(30) DEFAULT '1.2 MB',
	"metrics" jsonb DEFAULT '{}'::jsonb,
	"download_url" text,
	"generated_by" varchar(36),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_library" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"theatre_id" varchar(36),
	"uploaded_by" varchar(36),
	"file_name" varchar(255) NOT NULL,
	"file_url" text NOT NULL,
	"file_type" varchar(50) DEFAULT 'image' NOT NULL,
	"mime_type" varchar(100) DEFAULT 'image/webp' NOT NULL,
	"size_bytes" integer DEFAULT 0 NOT NULL,
	"dimensions" jsonb,
	"alt_text" varchar(255),
	"folder" varchar(100) DEFAULT 'uploads',
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"theatre_id" varchar(36),
	"key" varchar(100) NOT NULL,
	"value" jsonb NOT NULL,
	"category" varchar(50) DEFAULT 'general' NOT NULL,
	"description" text,
	"is_public" boolean DEFAULT false NOT NULL,
	"updated_by" varchar(36),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cities" ADD CONSTRAINT "cities_state_id_states_id_fk" FOREIGN KEY ("state_id") REFERENCES "public"."states"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "states" ADD CONSTRAINT "states_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hall_managers" ADD CONSTRAINT "hall_managers_theatre_id_theatres_id_fk" FOREIGN KEY ("theatre_id") REFERENCES "public"."theatres"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hall_managers" ADD CONSTRAINT "hall_managers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff" ADD CONSTRAINT "staff_theatre_id_theatres_id_fk" FOREIGN KEY ("theatre_id") REFERENCES "public"."theatres"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff" ADD CONSTRAINT "staff_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "theatre_admins" ADD CONSTRAINT "theatre_admins_theatre_id_theatres_id_fk" FOREIGN KEY ("theatre_id") REFERENCES "public"."theatres"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "theatre_admins" ADD CONSTRAINT "theatre_admins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "theatre_amenities" ADD CONSTRAINT "theatre_amenities_theatre_id_theatres_id_fk" FOREIGN KEY ("theatre_id") REFERENCES "public"."theatres"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "theatre_amenities" ADD CONSTRAINT "theatre_amenities_amenity_id_amenities_id_fk" FOREIGN KEY ("amenity_id") REFERENCES "public"."amenities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "theatres" ADD CONSTRAINT "theatres_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "theatres" ADD CONSTRAINT "theatres_state_id_states_id_fk" FOREIGN KEY ("state_id") REFERENCES "public"."states"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "theatres" ADD CONSTRAINT "theatres_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "theatres" ADD CONSTRAINT "theatres_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_configurations" ADD CONSTRAINT "payment_configurations_theatre_id_theatres_id_fk" FOREIGN KEY ("theatre_id") REFERENCES "public"."theatres"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_theatre_id_theatres_id_fk" FOREIGN KEY ("theatre_id") REFERENCES "public"."theatres"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_payment_config_id_payment_configurations_id_fk" FOREIGN KEY ("payment_config_id") REFERENCES "public"."payment_configurations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hall_layouts" ADD CONSTRAINT "hall_layouts_hall_id_halls_id_fk" FOREIGN KEY ("hall_id") REFERENCES "public"."halls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hall_layouts" ADD CONSTRAINT "hall_layouts_theatre_id_theatres_id_fk" FOREIGN KEY ("theatre_id") REFERENCES "public"."theatres"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hall_sections" ADD CONSTRAINT "hall_sections_layout_id_hall_layouts_id_fk" FOREIGN KEY ("layout_id") REFERENCES "public"."hall_layouts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hall_sections" ADD CONSTRAINT "hall_sections_theatre_id_theatres_id_fk" FOREIGN KEY ("theatre_id") REFERENCES "public"."theatres"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "halls" ADD CONSTRAINT "halls_theatre_id_theatres_id_fk" FOREIGN KEY ("theatre_id") REFERENCES "public"."theatres"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seat_templates" ADD CONSTRAINT "seat_templates_layout_id_hall_layouts_id_fk" FOREIGN KEY ("layout_id") REFERENCES "public"."hall_layouts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seat_templates" ADD CONSTRAINT "seat_templates_section_id_hall_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."hall_sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seat_templates" ADD CONSTRAINT "seat_templates_theatre_id_theatres_id_fk" FOREIGN KEY ("theatre_id") REFERENCES "public"."theatres"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movie_formats" ADD CONSTRAINT "movie_formats_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movie_genres" ADD CONSTRAINT "movie_genres_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movie_images" ADD CONSTRAINT "movie_images_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movie_languages" ADD CONSTRAINT "movie_languages_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movie_trailers" ADD CONSTRAINT "movie_trailers_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seat_inventory" ADD CONSTRAINT "seat_inventory_show_id_shows_id_fk" FOREIGN KEY ("show_id") REFERENCES "public"."shows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seat_inventory" ADD CONSTRAINT "seat_inventory_theatre_id_theatres_id_fk" FOREIGN KEY ("theatre_id") REFERENCES "public"."theatres"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seat_inventory" ADD CONSTRAINT "seat_inventory_seat_template_id_seat_templates_id_fk" FOREIGN KEY ("seat_template_id") REFERENCES "public"."seat_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seat_inventory" ADD CONSTRAINT "seat_inventory_section_id_hall_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."hall_sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "show_pricing" ADD CONSTRAINT "show_pricing_show_id_shows_id_fk" FOREIGN KEY ("show_id") REFERENCES "public"."shows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "show_pricing" ADD CONSTRAINT "show_pricing_section_id_hall_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."hall_sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "show_pricing" ADD CONSTRAINT "show_pricing_theatre_id_theatres_id_fk" FOREIGN KEY ("theatre_id") REFERENCES "public"."theatres"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shows" ADD CONSTRAINT "shows_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shows" ADD CONSTRAINT "shows_theatre_id_theatres_id_fk" FOREIGN KEY ("theatre_id") REFERENCES "public"."theatres"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shows" ADD CONSTRAINT "shows_hall_id_halls_id_fk" FOREIGN KEY ("hall_id") REFERENCES "public"."halls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_seats" ADD CONSTRAINT "booking_seats_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_seats" ADD CONSTRAINT "booking_seats_seat_inventory_id_seat_inventory_id_fk" FOREIGN KEY ("seat_inventory_id") REFERENCES "public"."seat_inventory"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_show_id_shows_id_fk" FOREIGN KEY ("show_id") REFERENCES "public"."shows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_theatre_id_theatres_id_fk" FOREIGN KEY ("theatre_id") REFERENCES "public"."theatres"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_hall_id_halls_id_fk" FOREIGN KEY ("hall_id") REFERENCES "public"."halls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_booking_seat_id_booking_seats_id_fk" FOREIGN KEY ("booking_seat_id") REFERENCES "public"."booking_seats"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_theatre_id_theatres_id_fk" FOREIGN KEY ("theatre_id") REFERENCES "public"."theatres"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_theatre_id_theatres_id_fk" FOREIGN KEY ("theatre_id") REFERENCES "public"."theatres"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_theatre_id_theatres_id_fk" FOREIGN KEY ("theatre_id") REFERENCES "public"."theatres"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_generated_by_users_id_fk" FOREIGN KEY ("generated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_library" ADD CONSTRAINT "media_library_theatre_id_theatres_id_fk" FOREIGN KEY ("theatre_id") REFERENCES "public"."theatres"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_library" ADD CONSTRAINT "media_library_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_theatre_id_theatres_id_fk" FOREIGN KEY ("theatre_id") REFERENCES "public"."theatres"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cities_state_id_idx" ON "cities" USING btree ("state_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cities_state_slug_idx" ON "cities" USING btree ("state_id","slug");--> statement-breakpoint
CREATE INDEX "cities_name_idx" ON "cities" USING btree ("name");--> statement-breakpoint
CREATE INDEX "cities_tier_idx" ON "cities" USING btree ("tier");--> statement-breakpoint
CREATE UNIQUE INDEX "countries_code_idx" ON "countries" USING btree ("code");--> statement-breakpoint
CREATE INDEX "countries_name_idx" ON "countries" USING btree ("name");--> statement-breakpoint
CREATE INDEX "states_country_id_idx" ON "states" USING btree ("country_id");--> statement-breakpoint
CREATE UNIQUE INDEX "states_country_code_idx" ON "states" USING btree ("country_id","code");--> statement-breakpoint
CREATE INDEX "states_name_idx" ON "states" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "permissions_code_idx" ON "permissions" USING btree ("code");--> statement-breakpoint
CREATE INDEX "permissions_module_idx" ON "permissions" USING btree ("module");--> statement-breakpoint
CREATE UNIQUE INDEX "role_permissions_role_perm_idx" ON "role_permissions" USING btree ("role_id","permission_id");--> statement-breakpoint
CREATE INDEX "role_permissions_role_id_idx" ON "role_permissions" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "role_permissions_permission_id_idx" ON "role_permissions" USING btree ("permission_id");--> statement-breakpoint
CREATE UNIQUE INDEX "roles_slug_idx" ON "roles" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "roles_hierarchy_level_idx" ON "roles" USING btree ("hierarchy_level");--> statement-breakpoint
CREATE INDEX "roles_theatre_id_idx" ON "roles" USING btree ("theatre_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_roles_user_role_theatre_idx" ON "user_roles" USING btree ("user_id","role_id","theatre_id");--> statement-breakpoint
CREATE INDEX "user_roles_user_id_idx" ON "user_roles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_roles_role_id_idx" ON "user_roles" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "user_roles_theatre_id_idx" ON "user_roles" USING btree ("theatre_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_clerk_id_idx" ON "users" USING btree ("clerk_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "users_theatre_id_idx" ON "users" USING btree ("theatre_id");--> statement-breakpoint
CREATE INDEX "users_status_idx" ON "users" USING btree ("status");--> statement-breakpoint
CREATE INDEX "users_is_deleted_idx" ON "users" USING btree ("is_deleted");--> statement-breakpoint
CREATE UNIQUE INDEX "amenities_slug_idx" ON "amenities" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "amenities_category_idx" ON "amenities" USING btree ("category");--> statement-breakpoint
CREATE UNIQUE INDEX "customers_user_id_idx" ON "customers" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "customers_loyalty_tier_idx" ON "customers" USING btree ("loyalty_tier");--> statement-breakpoint
CREATE UNIQUE INDEX "hall_managers_theatre_user_idx" ON "hall_managers" USING btree ("theatre_id","user_id");--> statement-breakpoint
CREATE INDEX "hall_managers_theatre_id_idx" ON "hall_managers" USING btree ("theatre_id");--> statement-breakpoint
CREATE INDEX "hall_managers_user_id_idx" ON "hall_managers" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "staff_theatre_employee_code_idx" ON "staff" USING btree ("theatre_id","employee_code");--> statement-breakpoint
CREATE INDEX "staff_theatre_id_idx" ON "staff" USING btree ("theatre_id");--> statement-breakpoint
CREATE INDEX "staff_user_id_idx" ON "staff" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "staff_status_idx" ON "staff" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "theatre_admins_theatre_user_idx" ON "theatre_admins" USING btree ("theatre_id","user_id");--> statement-breakpoint
CREATE INDEX "theatre_admins_theatre_id_idx" ON "theatre_admins" USING btree ("theatre_id");--> statement-breakpoint
CREATE INDEX "theatre_admins_user_id_idx" ON "theatre_admins" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "theatre_amenities_th_amenity_idx" ON "theatre_amenities" USING btree ("theatre_id","amenity_id");--> statement-breakpoint
CREATE INDEX "theatre_amenities_theatre_id_idx" ON "theatre_amenities" USING btree ("theatre_id");--> statement-breakpoint
CREATE INDEX "theatre_amenities_amenity_id_idx" ON "theatre_amenities" USING btree ("amenity_id");--> statement-breakpoint
CREATE UNIQUE INDEX "theatres_slug_idx" ON "theatres" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "theatres_city_idx" ON "theatres" USING btree ("city");--> statement-breakpoint
CREATE INDEX "theatres_state_idx" ON "theatres" USING btree ("state");--> statement-breakpoint
CREATE INDEX "theatres_status_idx" ON "theatres" USING btree ("status");--> statement-breakpoint
CREATE INDEX "theatres_pricing_tier_idx" ON "theatres" USING btree ("pricing_tier");--> statement-breakpoint
CREATE INDEX "theatres_is_deleted_idx" ON "theatres" USING btree ("is_deleted");--> statement-breakpoint
CREATE UNIQUE INDEX "payment_configurations_theatre_id_idx" ON "payment_configurations" USING btree ("theatre_id");--> statement-breakpoint
CREATE INDEX "payment_configurations_upi_id_idx" ON "payment_configurations" USING btree ("upi_id");--> statement-breakpoint
CREATE UNIQUE INDEX "payments_tx_ref_idx" ON "payments" USING btree ("transaction_reference");--> statement-breakpoint
CREATE INDEX "payments_booking_id_idx" ON "payments" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "payments_theatre_id_idx" ON "payments" USING btree ("theatre_id");--> statement-breakpoint
CREATE INDEX "payments_status_idx" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payments_created_at_idx" ON "payments" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "hall_layouts_hall_id_idx" ON "hall_layouts" USING btree ("hall_id");--> statement-breakpoint
CREATE INDEX "hall_layouts_theatre_id_idx" ON "hall_layouts" USING btree ("theatre_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hall_sections_layout_name_idx" ON "hall_sections" USING btree ("layout_id","name");--> statement-breakpoint
CREATE INDEX "hall_sections_layout_id_idx" ON "hall_sections" USING btree ("layout_id");--> statement-breakpoint
CREATE INDEX "hall_sections_theatre_id_idx" ON "hall_sections" USING btree ("theatre_id");--> statement-breakpoint
CREATE INDEX "hall_sections_display_order_idx" ON "hall_sections" USING btree ("display_order");--> statement-breakpoint
CREATE UNIQUE INDEX "halls_theatre_screen_num_idx" ON "halls" USING btree ("theatre_id","screen_number");--> statement-breakpoint
CREATE INDEX "halls_theatre_id_idx" ON "halls" USING btree ("theatre_id");--> statement-breakpoint
CREATE INDEX "halls_status_idx" ON "halls" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "seat_templates_layout_seat_num_idx" ON "seat_templates" USING btree ("layout_id","seat_number");--> statement-breakpoint
CREATE INDEX "seat_templates_layout_id_idx" ON "seat_templates" USING btree ("layout_id");--> statement-breakpoint
CREATE INDEX "seat_templates_section_id_idx" ON "seat_templates" USING btree ("section_id");--> statement-breakpoint
CREATE INDEX "seat_templates_theatre_id_idx" ON "seat_templates" USING btree ("theatre_id");--> statement-breakpoint
CREATE INDEX "seat_templates_row_idx" ON "seat_templates" USING btree ("row");--> statement-breakpoint
CREATE UNIQUE INDEX "movie_formats_movie_format_idx" ON "movie_formats" USING btree ("movie_id","format");--> statement-breakpoint
CREATE INDEX "movie_formats_movie_id_idx" ON "movie_formats" USING btree ("movie_id");--> statement-breakpoint
CREATE INDEX "movie_formats_format_idx" ON "movie_formats" USING btree ("format");--> statement-breakpoint
CREATE UNIQUE INDEX "movie_genres_movie_genre_idx" ON "movie_genres" USING btree ("movie_id","genre");--> statement-breakpoint
CREATE INDEX "movie_genres_movie_id_idx" ON "movie_genres" USING btree ("movie_id");--> statement-breakpoint
CREATE INDEX "movie_genres_genre_idx" ON "movie_genres" USING btree ("genre");--> statement-breakpoint
CREATE INDEX "movie_images_movie_id_idx" ON "movie_images" USING btree ("movie_id");--> statement-breakpoint
CREATE INDEX "movie_images_type_idx" ON "movie_images" USING btree ("image_type");--> statement-breakpoint
CREATE UNIQUE INDEX "movie_languages_movie_lang_idx" ON "movie_languages" USING btree ("movie_id","language");--> statement-breakpoint
CREATE INDEX "movie_languages_movie_id_idx" ON "movie_languages" USING btree ("movie_id");--> statement-breakpoint
CREATE INDEX "movie_languages_language_idx" ON "movie_languages" USING btree ("language");--> statement-breakpoint
CREATE INDEX "movie_trailers_movie_id_idx" ON "movie_trailers" USING btree ("movie_id");--> statement-breakpoint
CREATE UNIQUE INDEX "movies_slug_idx" ON "movies" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "movies_title_idx" ON "movies" USING btree ("title");--> statement-breakpoint
CREATE INDEX "movies_status_idx" ON "movies" USING btree ("status");--> statement-breakpoint
CREATE INDEX "movies_release_date_idx" ON "movies" USING btree ("release_date");--> statement-breakpoint
CREATE INDEX "movies_certificate_idx" ON "movies" USING btree ("certificate");--> statement-breakpoint
CREATE INDEX "movies_is_deleted_idx" ON "movies" USING btree ("is_deleted");--> statement-breakpoint
CREATE UNIQUE INDEX "seat_inventory_show_seat_idx" ON "seat_inventory" USING btree ("show_id","seat_number");--> statement-breakpoint
CREATE INDEX "seat_inventory_show_id_idx" ON "seat_inventory" USING btree ("show_id");--> statement-breakpoint
CREATE INDEX "seat_inventory_theatre_id_idx" ON "seat_inventory" USING btree ("theatre_id");--> statement-breakpoint
CREATE INDEX "seat_inventory_status_idx" ON "seat_inventory" USING btree ("status");--> statement-breakpoint
CREATE INDEX "seat_inventory_section_id_idx" ON "seat_inventory" USING btree ("section_id");--> statement-breakpoint
CREATE INDEX "seat_inventory_locked_until_idx" ON "seat_inventory" USING btree ("locked_until");--> statement-breakpoint
CREATE UNIQUE INDEX "show_pricing_show_section_idx" ON "show_pricing" USING btree ("show_id","section_id");--> statement-breakpoint
CREATE INDEX "show_pricing_show_id_idx" ON "show_pricing" USING btree ("show_id");--> statement-breakpoint
CREATE INDEX "show_pricing_section_id_idx" ON "show_pricing" USING btree ("section_id");--> statement-breakpoint
CREATE INDEX "show_pricing_theatre_id_idx" ON "show_pricing" USING btree ("theatre_id");--> statement-breakpoint
CREATE INDEX "shows_theatre_date_idx" ON "shows" USING btree ("theatre_id","show_date");--> statement-breakpoint
CREATE INDEX "shows_movie_id_idx" ON "shows" USING btree ("movie_id");--> statement-breakpoint
CREATE INDEX "shows_hall_id_idx" ON "shows" USING btree ("hall_id");--> statement-breakpoint
CREATE INDEX "shows_status_idx" ON "shows" USING btree ("status");--> statement-breakpoint
CREATE INDEX "shows_show_date_idx" ON "shows" USING btree ("show_date");--> statement-breakpoint
CREATE UNIQUE INDEX "booking_seats_booking_seat_inv_idx" ON "booking_seats" USING btree ("booking_id","seat_inventory_id");--> statement-breakpoint
CREATE INDEX "booking_seats_booking_id_idx" ON "booking_seats" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "booking_seats_seat_inv_id_idx" ON "booking_seats" USING btree ("seat_inventory_id");--> statement-breakpoint
CREATE UNIQUE INDEX "bookings_ref_code_idx" ON "bookings" USING btree ("reference_code");--> statement-breakpoint
CREATE INDEX "bookings_theatre_id_idx" ON "bookings" USING btree ("theatre_id");--> statement-breakpoint
CREATE INDEX "bookings_customer_id_idx" ON "bookings" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "bookings_show_id_idx" ON "bookings" USING btree ("show_id");--> statement-breakpoint
CREATE INDEX "bookings_booking_status_idx" ON "bookings" USING btree ("booking_status");--> statement-breakpoint
CREATE INDEX "bookings_payment_status_idx" ON "bookings" USING btree ("payment_status");--> statement-breakpoint
CREATE INDEX "bookings_created_at_idx" ON "bookings" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "tickets_ticket_number_idx" ON "tickets" USING btree ("ticket_number");--> statement-breakpoint
CREATE INDEX "tickets_booking_id_idx" ON "tickets" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "tickets_status_idx" ON "tickets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "audit_logs_theatre_id_idx" ON "audit_logs" USING btree ("theatre_id");--> statement-breakpoint
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_module_idx" ON "audit_logs" USING btree ("module");--> statement-breakpoint
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "notifications_user_unread_idx" ON "notifications" USING btree ("user_id","is_read");--> statement-breakpoint
CREATE INDEX "notifications_theatre_id_idx" ON "notifications" USING btree ("theatre_id");--> statement-breakpoint
CREATE INDEX "notifications_audience_idx" ON "notifications" USING btree ("audience");--> statement-breakpoint
CREATE INDEX "notifications_created_at_idx" ON "notifications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "reports_theatre_id_idx" ON "reports" USING btree ("theatre_id");--> statement-breakpoint
CREATE INDEX "reports_category_idx" ON "reports" USING btree ("category");--> statement-breakpoint
CREATE INDEX "reports_period_idx" ON "reports" USING btree ("period");--> statement-breakpoint
CREATE INDEX "reports_created_at_idx" ON "reports" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "media_library_theatre_id_idx" ON "media_library" USING btree ("theatre_id");--> statement-breakpoint
CREATE INDEX "media_library_file_type_idx" ON "media_library" USING btree ("file_type");--> statement-breakpoint
CREATE INDEX "media_library_created_at_idx" ON "media_library" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "media_library_is_deleted_idx" ON "media_library" USING btree ("is_deleted");--> statement-breakpoint
CREATE UNIQUE INDEX "system_settings_theatre_key_idx" ON "system_settings" USING btree ("theatre_id","key");--> statement-breakpoint
CREATE INDEX "system_settings_theatre_id_idx" ON "system_settings" USING btree ("theatre_id");--> statement-breakpoint
CREATE INDEX "system_settings_category_idx" ON "system_settings" USING btree ("category");--> statement-breakpoint
CREATE INDEX "system_settings_is_public_idx" ON "system_settings" USING btree ("is_public");