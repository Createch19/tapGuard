-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "TenantPlan" AS ENUM ('LITE', 'STARTER', 'GROWTH', 'BUSINESS', 'ENTERPRISE', 'BASIC', 'PRO');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('LIFETIME', 'MONTHLY', 'YEARLY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'OWNER', 'MANAGER', 'STAFF');

-- CreateEnum
CREATE TYPE "CardStatus" AS ENUM ('UNASSIGNED', 'ACTIVE', 'DEACTIVATED', 'LOST');

-- CreateEnum
CREATE TYPE "GateTemplate" AS ENUM ('GOOGLE_REVIEW', 'SOCIAL_HUB', 'DELIVERY_DINING', 'CUSTOM_REDIRECT', 'BUSINESS_PROFILE');

-- CreateEnum
CREATE TYPE "TapOutcome" AS ENUM ('REDIRECTED', 'FEEDBACK_CAPTURED', 'DIRECT_REDIRECT', 'BOUNCED', 'REVIEW_COPIED');

-- CreateEnum
CREATE TYPE "DeviceOS" AS ENUM ('IOS', 'ANDROID', 'DESKTOP', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIALING', 'ACTIVE', 'PAST_DUE', 'PAUSED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('TENANT_CREATED', 'TENANT_UPDATED', 'TENANT_SUSPENDED', 'TENANT_DELETED', 'SUBSCRIPTION_CREATED', 'SUBSCRIPTION_UPDATED', 'SUBSCRIPTION_CANCELLED', 'PLAN_CONFIG_UPDATED', 'CARD_BATCH_GENERATED', 'CARD_REASSIGNED', 'USER_ROLE_CHANGED', 'ADMIN_LOGIN');

-- CreateEnum
CREATE TYPE "KeywordTone" AS ENUM ('CASUAL', 'ENTHUSIASTIC', 'DETAILED', 'SHORT');

-- CreateTable
CREATE TABLE "tenants" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "google_review_url" TEXT,
    "smart_gate_enabled" BOOLEAN NOT NULL DEFAULT true,
    "greeting_title" TEXT NOT NULL DEFAULT 'How was your experience?',
    "greeting_subtitle" TEXT,
    "gate_template" "GateTemplate" NOT NULL DEFAULT 'GOOGLE_REVIEW',
    "instagram_url" TEXT,
    "facebook_url" TEXT,
    "youtube_url" TEXT,
    "swiggy_url" TEXT,
    "zomato_url" TEXT,
    "delivery_offer_text" TEXT,
    "delivery_phone" TEXT,
    "custom_redirect_url" TEXT,
    "custom_redirect_title" TEXT DEFAULT 'View Online Menu',
    "custom_redirect_direct" BOOLEAN NOT NULL DEFAULT false,
    "business_profile" JSONB,
    "plan" "TenantPlan" NOT NULL DEFAULT 'STARTER',
    "business_type" TEXT DEFAULT 'Restaurant & Café',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "max_cards" INTEGER NOT NULL DEFAULT 3,
    "max_locations" INTEGER NOT NULL DEFAULT 1,
    "webhook_url" TEXT,
    "alert_email" TEXT,
    "google_business_email" TEXT,
    "google_location_id" TEXT,
    "custom_google_client_id" TEXT,
    "custom_google_client_secret" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_branding" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "logo_url" TEXT,
    "primary_color" TEXT NOT NULL DEFAULT '#0D9488',
    "secondary_color" TEXT NOT NULL DEFAULT '#F0FDFA',
    "accent_color" TEXT NOT NULL DEFAULT '#14B8A6',
    "font_family" TEXT,
    "custom_css" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_branding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "tenant_id" UUID,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "email_verified" TIMESTAMP(3),
    "password" TEXT,
    "image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'OWNER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "plan_configs" (
    "id" UUID NOT NULL,
    "plan" "TenantPlan" NOT NULL,
    "display_name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "yearly_price" DECIMAL(10,2),
    "currency" VARCHAR(3) NOT NULL DEFAULT 'INR',
    "billing_cycle" "BillingCycle" NOT NULL,
    "max_cards" INTEGER NOT NULL,
    "max_locations" INTEGER NOT NULL DEFAULT 1,
    "max_catalog_items" INTEGER NOT NULL DEFAULT 25,
    "booking_form_enabled" BOOLEAN NOT NULL DEFAULT true,
    "remove_powered_by" BOOLEAN NOT NULL DEFAULT false,
    "smart_gate" BOOLEAN NOT NULL DEFAULT true,
    "multi_gate_templates" BOOLEAN NOT NULL DEFAULT false,
    "custom_branding" BOOLEAN NOT NULL DEFAULT false,
    "webhook_alerts" BOOLEAN NOT NULL DEFAULT false,
    "keyword_suggestions" BOOLEAN NOT NULL DEFAULT false,
    "google_hub" BOOLEAN NOT NULL DEFAULT false,
    "team_access" BOOLEAN NOT NULL DEFAULT false,
    "qr_code_tier" TEXT NOT NULL DEFAULT 'basic',
    "analytics_ret_days" INTEGER NOT NULL DEFAULT 30,
    "priority_support" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "plan" "TenantPlan" NOT NULL DEFAULT 'STARTER',
    "billing_cycle" "BillingCycle" NOT NULL DEFAULT 'MONTHLY',
    "price_paid" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'INR',
    "trial_start_date" TIMESTAMP(3),
    "trial_end_date" TIMESTAMP(3),
    "current_period_start" TIMESTAMP(3),
    "current_period_end" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "cancel_reason" TEXT,
    "external_payment_id" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "actor_id" UUID NOT NULL,
    "actor_email" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "target_type" TEXT NOT NULL,
    "target_id" UUID,
    "metadata" JSONB,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "card_batches" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "prefix" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "card_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cards" (
    "id" UUID NOT NULL,
    "short_code" TEXT NOT NULL,
    "url_slug" TEXT NOT NULL,
    "tenant_id" UUID,
    "batch_id" UUID,
    "status" "CardStatus" NOT NULL DEFAULT 'UNASSIGNED',
    "label" TEXT,
    "activated_at" TIMESTAMP(3),
    "deactivated_at" TIMESTAMP(3),
    "override_gate" BOOLEAN NOT NULL DEFAULT false,
    "gate_template" "GateTemplate",
    "custom_redirect_url" TEXT,
    "custom_redirect_title" TEXT,
    "custom_redirect_direct" BOOLEAN,
    "google_review_url" TEXT,
    "smart_gate_enabled" BOOLEAN,
    "zomato_url" TEXT,
    "swiggy_url" TEXT,
    "instagram_url" TEXT,
    "facebook_url" TEXT,
    "youtube_url" TEXT,
    "delivery_offer_text" TEXT,
    "delivery_phone" TEXT,
    "greeting_title" TEXT,
    "greeting_subtitle" TEXT,
    "business_profile" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tap_events" (
    "id" UUID NOT NULL,
    "card_id" UUID NOT NULL,
    "tenant_id" UUID,
    "device_os" "DeviceOS" NOT NULL DEFAULT 'UNKNOWN',
    "user_agent" TEXT,
    "ip_hash" TEXT,
    "rating" SMALLINT,
    "outcome" "TapOutcome" NOT NULL DEFAULT 'BOUNCED',
    "referrer" TEXT,
    "country" VARCHAR(2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tap_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "private_feedback" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "card_id" UUID NOT NULL,
    "tap_event_id" UUID NOT NULL,
    "rating" SMALLINT NOT NULL,
    "feedback_text" TEXT,
    "phone_number" TEXT,
    "customer_name" TEXT,
    "is_resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolved_at" TIMESTAMP(3),
    "resolved_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "private_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_types" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT DEFAULT 'Store',
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "business_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_review_keywords" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "primary_language" TEXT NOT NULL DEFAULT 'EN',
    "enabled_languages" TEXT[] DEFAULT ARRAY['EN', 'TANGLISH', 'TA']::TEXT[],
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "customSentences" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tone" "KeywordTone" NOT NULL DEFAULT 'CASUAL',
    "last_served_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_review_keywords_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "google_profile_connections" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "google_account_id" TEXT NOT NULL,
    "account_name" TEXT,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "token_expires_at" TIMESTAMP(3) NOT NULL,
    "scope" TEXT NOT NULL,
    "connected_email" TEXT NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "last_synced_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "google_profile_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_gemini_configs" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "custom_api_key" TEXT,
    "model" TEXT NOT NULL DEFAULT 'gemini-1.5-flash',
    "brand_tone" TEXT NOT NULL DEFAULT 'WARM',
    "custom_persona" TEXT,
    "knowledge_base" TEXT,
    "escalation_phone" TEXT,
    "escalation_email" TEXT,
    "auto_pilot_5_star" BOOLEAN NOT NULL DEFAULT false,
    "min_confidence" INTEGER NOT NULL DEFAULT 85,
    "auto_match_language" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_gemini_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "google_locations" (
    "id" UUID NOT NULL,
    "connection_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "google_location_id" TEXT NOT NULL,
    "place_id" TEXT,
    "title" TEXT NOT NULL,
    "store_code" TEXT,
    "primary_phone" TEXT,
    "website_uri" TEXT,
    "address_json" JSONB NOT NULL,
    "coordinates_lat" DOUBLE PRECISION,
    "coordinates_lng" DOUBLE PRECISION,
    "regular_hours_json" JSONB,
    "special_hours_json" JSONB,
    "primary_category" TEXT,
    "attributes_json" JSONB,
    "auto_reply_reviews" BOOLEAN NOT NULL DEFAULT false,
    "auto_answer_qa" BOOLEAN NOT NULL DEFAULT false,
    "is_primary_branch" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "google_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "google_reviews" (
    "id" UUID NOT NULL,
    "location_id" UUID NOT NULL,
    "google_review_id" TEXT NOT NULL,
    "reviewer_name" TEXT NOT NULL,
    "reviewer_photo_url" TEXT,
    "is_anonymous" BOOLEAN NOT NULL DEFAULT false,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "reply_comment" TEXT,
    "reply_updated_at" TIMESTAMP(3),
    "gemini_draft_reply" TEXT,
    "review_created_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "google_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "google_questions" (
    "id" UUID NOT NULL,
    "location_id" UUID NOT NULL,
    "google_question_id" TEXT NOT NULL,
    "author_name" TEXT NOT NULL,
    "author_photo_url" TEXT,
    "question_text" TEXT NOT NULL,
    "upvote_count" INTEGER NOT NULL DEFAULT 0,
    "official_answer" TEXT,
    "official_answer_id" TEXT,
    "gemini_draft_answer" TEXT,
    "is_answered" BOOLEAN NOT NULL DEFAULT false,
    "question_created_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "google_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "google_menu_sections" (
    "id" UUID NOT NULL,
    "location_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "google_menu_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "google_menu_items" (
    "id" UUID NOT NULL,
    "section_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'INR',
    "image_url" TEXT,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "dietary_tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "google_menu_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "google_posts" (
    "id" UUID NOT NULL,
    "location_id" UUID NOT NULL,
    "google_post_id" TEXT,
    "topic_type" TEXT NOT NULL DEFAULT 'STANDARD',
    "summary" TEXT NOT NULL,
    "call_to_action" TEXT,
    "action_url" TEXT,
    "media_url" TEXT,
    "coupon_code" TEXT,
    "terms_conditions" TEXT,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "google_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "google_media_items" (
    "id" UUID NOT NULL,
    "location_id" UUID NOT NULL,
    "google_media_id" TEXT,
    "media_format" TEXT NOT NULL DEFAULT 'PHOTO',
    "category" TEXT NOT NULL DEFAULT 'ADDITIONAL',
    "source_url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "is_customer_user" BOOLEAN NOT NULL DEFAULT false,
    "flagged_for_removal" BOOLEAN NOT NULL DEFAULT false,
    "flag_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "google_media_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "google_performance_daily" (
    "id" UUID NOT NULL,
    "location_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "search_impressions" INTEGER NOT NULL DEFAULT 0,
    "maps_impressions" INTEGER NOT NULL DEFAULT 0,
    "call_clicks" INTEGER NOT NULL DEFAULT 0,
    "website_clicks" INTEGER NOT NULL DEFAULT 0,
    "directions_requests" INTEGER NOT NULL DEFAULT 0,
    "bookings_clicks" INTEGER NOT NULL DEFAULT 0,
    "top_queries_json" JSONB,

    CONSTRAINT "google_performance_daily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_branding_tenant_id_key" ON "tenant_branding"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "plan_configs_plan_key" ON "plan_configs"("plan");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_tenant_id_key" ON "subscriptions"("tenant_id");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

-- CreateIndex
CREATE INDEX "subscriptions_plan_idx" ON "subscriptions"("plan");

-- CreateIndex
CREATE INDEX "subscriptions_current_period_end_idx" ON "subscriptions"("current_period_end");

-- CreateIndex
CREATE INDEX "audit_logs_actor_id_idx" ON "audit_logs"("actor_id");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_target_type_target_id_idx" ON "audit_logs"("target_type", "target_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "cards_short_code_key" ON "cards"("short_code");

-- CreateIndex
CREATE UNIQUE INDEX "cards_url_slug_key" ON "cards"("url_slug");

-- CreateIndex
CREATE INDEX "cards_tenant_id_idx" ON "cards"("tenant_id");

-- CreateIndex
CREATE INDEX "cards_status_idx" ON "cards"("status");

-- CreateIndex
CREATE INDEX "cards_url_slug_idx" ON "cards"("url_slug");

-- CreateIndex
CREATE INDEX "tap_events_tenant_id_created_at_idx" ON "tap_events"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "tap_events_card_id_created_at_idx" ON "tap_events"("card_id", "created_at");

-- CreateIndex
CREATE INDEX "tap_events_outcome_idx" ON "tap_events"("outcome");

-- CreateIndex
CREATE UNIQUE INDEX "private_feedback_tap_event_id_key" ON "private_feedback"("tap_event_id");

-- CreateIndex
CREATE INDEX "private_feedback_tenant_id_created_at_idx" ON "private_feedback"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "private_feedback_is_resolved_idx" ON "private_feedback"("is_resolved");

-- CreateIndex
CREATE UNIQUE INDEX "business_types_name_key" ON "business_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "business_types_slug_key" ON "business_types"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_review_keywords_tenant_id_key" ON "tenant_review_keywords"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "google_profile_connections_tenant_id_key" ON "google_profile_connections"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_gemini_configs_tenant_id_key" ON "tenant_gemini_configs"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "google_locations_google_location_id_key" ON "google_locations"("google_location_id");

-- CreateIndex
CREATE UNIQUE INDEX "google_reviews_google_review_id_key" ON "google_reviews"("google_review_id");

-- CreateIndex
CREATE INDEX "google_reviews_location_id_rating_idx" ON "google_reviews"("location_id", "rating");

-- CreateIndex
CREATE UNIQUE INDEX "google_questions_google_question_id_key" ON "google_questions"("google_question_id");

-- CreateIndex
CREATE INDEX "google_questions_location_id_is_answered_idx" ON "google_questions"("location_id", "is_answered");

-- CreateIndex
CREATE UNIQUE INDEX "google_posts_google_post_id_key" ON "google_posts"("google_post_id");

-- CreateIndex
CREATE UNIQUE INDEX "google_media_items_google_media_id_key" ON "google_media_items"("google_media_id");

-- CreateIndex
CREATE UNIQUE INDEX "google_performance_daily_location_id_date_key" ON "google_performance_daily"("location_id", "date");

-- AddForeignKey
ALTER TABLE "tenant_branding" ADD CONSTRAINT "tenant_branding_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "card_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tap_events" ADD CONSTRAINT "tap_events_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tap_events" ADD CONSTRAINT "tap_events_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "private_feedback" ADD CONSTRAINT "private_feedback_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "private_feedback" ADD CONSTRAINT "private_feedback_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "private_feedback" ADD CONSTRAINT "private_feedback_tap_event_id_fkey" FOREIGN KEY ("tap_event_id") REFERENCES "tap_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "private_feedback" ADD CONSTRAINT "private_feedback_resolved_by_id_fkey" FOREIGN KEY ("resolved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_review_keywords" ADD CONSTRAINT "tenant_review_keywords_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "google_profile_connections" ADD CONSTRAINT "google_profile_connections_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_gemini_configs" ADD CONSTRAINT "tenant_gemini_configs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "google_locations" ADD CONSTRAINT "google_locations_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "google_profile_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "google_reviews" ADD CONSTRAINT "google_reviews_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "google_locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "google_questions" ADD CONSTRAINT "google_questions_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "google_locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "google_menu_sections" ADD CONSTRAINT "google_menu_sections_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "google_locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "google_menu_items" ADD CONSTRAINT "google_menu_items_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "google_menu_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "google_posts" ADD CONSTRAINT "google_posts_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "google_locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "google_media_items" ADD CONSTRAINT "google_media_items_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "google_locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "google_performance_daily" ADD CONSTRAINT "google_performance_daily_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "google_locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

