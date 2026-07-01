--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
--SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: enum_admin_action_logs_action; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_admin_action_logs_action AS ENUM (
    'WALLET_FREEZE',
    'WALLET_UNFREEZE',
    'VENDOR_VERIFY',
    'VENDOR_REJECT',
    'ORDER_CANCEL',
    'SETTINGS_UPDATE',
    'USER_DEACTIVATE',
    'USER_REACTIVATE',
    'USER_BAN',
    'USER_UNBAN',
    'USER_DATA_EXPORT',
    'USER_ANONYMIZE',
    'USER_IMPERSONATE'
);


--
-- Name: enum_admin_action_logs_target_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_admin_action_logs_target_type AS ENUM (
    'USER',
    'VENDOR',
    'ORDER',
    'WALLET',
    'SYSTEM',
    'OTHER'
);


--
-- Name: enum_admin_vendors_service_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_admin_vendors_service_type AS ENUM (
    'FLORIST',
    'COFFIN_MAKER',
    'CATERER',
    'PHOTOGRAPHER',
    'VIDEOGRAPHER',
    'FUNERAL_HOME',
    'TRANSPORT',
    'RELIGIOUS_SERVICES',
    'MEMORIAL_ITEMS',
    'CLOTHING',
    'MUSIC',
    'OTHER'
);


--
-- Name: enum_appeals_decision; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_appeals_decision AS ENUM (
    'UPHELD',
    'OVERTURNED',
    'PARTIALLY_OVERTURNED',
    'OTHER'
);


--
-- Name: enum_appeals_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_appeals_status AS ENUM (
    'PENDING',
    'IN_REVIEW',
    'APPROVED',
    'REJECTED',
    'CANCELLED'
);


--
-- Name: enum_appeals_target_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_appeals_target_type AS ENUM (
    'MEMORIAL',
    'COMMENT',
    'USER',
    'DISPUTE',
    'ORDER',
    'OTHER'
);


--
-- Name: enum_disputes_against_party; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_disputes_against_party AS ENUM (
    'VENDOR',
    'BUYER',
    'PLATFORM'
);


--
-- Name: enum_disputes_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_disputes_category AS ENUM (
    'QUALITY',
    'LATE_DELIVERY',
    'NON_DELIVERY',
    'WRONG_ITEM',
    'OTHER'
);


--
-- Name: enum_disputes_resolution; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_disputes_resolution AS ENUM (
    'NO_REFUND',
    'PARTIAL_REFUND',
    'FULL_REFUND',
    'NON_MONETARY',
    'OTHER'
);


--
-- Name: enum_disputes_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_disputes_status AS ENUM (
    'OPEN',
    'IN_REVIEW',
    'RESOLVED',
    'REJECTED',
    'CANCELLED'
);


--
-- Name: enum_fee_configs_scope; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_fee_configs_scope AS ENUM (
    'GLOBAL',
    'SERVICE_TYPE'
);


--
-- Name: enum_fee_configs_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_fee_configs_type AS ENUM (
    'ORDER_COMMISSION',
    'GIFT_FEE'
);


--
-- Name: enum_gift_catalog_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_gift_catalog_category AS ENUM (
    'WHITE_ROSE',
    'CANDLE_PEACE',
    'DOVE_MERCY',
    'ETERNAL_LIGHT'
);


--
-- Name: enum_gift_transactions_payment_method; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_gift_transactions_payment_method AS ENUM (
    'telebirr',
    'cbe_birr',
    'hellocash',
    'paypal',
    'bank_transfer'
);


--
-- Name: enum_gift_transactions_payment_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_gift_transactions_payment_status AS ENUM (
    'pending',
    'completed',
    'failed',
    'refunded',
    'cancelled'
);


--
-- Name: enum_gift_transactions_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_gift_transactions_status AS ENUM (
    'PENDING',
    'COMPLETED',
    'FAILED',
    'REFUNDED'
);


--
-- Name: enum_gift_transactions_visibility; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_gift_transactions_visibility AS ENUM (
    'PUBLIC',
    'PRIVATE',
    'FAMILY_ONLY'
);


--
-- Name: enum_memorial_comments_visibility; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_memorial_comments_visibility AS ENUM (
    'PUBLIC',
    'PRIVATE',
    'FAMILY_ONLY',
    'PENDING',
    'REJECTED'
);


--
-- Name: enum_memorials_admin_visibility; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_memorials_admin_visibility AS ENUM (
    'NONE',
    'FORCE_PUBLIC',
    'FORCE_PRIVATE',
    'FORCE_FAMILY_ONLY'
);


--
-- Name: enum_memorials_cultural_template; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_memorials_cultural_template AS ENUM (
    'ORTHODOX',
    'PROTESTANT',
    'MUSLIM',
    'TRADITIONAL',
    'MODERN',
    'CUSTOM'
);


--
-- Name: enum_memorials_privacy_setting; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_memorials_privacy_setting AS ENUM (
    'public',
    'family_only',
    'private'
);


--
-- Name: enum_memorials_review_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_memorials_review_status AS ENUM (
    'NORMAL',
    'NEEDS_REVIEW',
    'SENSITIVE',
    'HIDDEN'
);


--
-- Name: enum_memorials_sensitivity_level; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_memorials_sensitivity_level AS ENUM (
    'NORMAL',
    'SENSITIVE'
);


--
-- Name: enum_memorials_visibility; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_memorials_visibility AS ENUM (
    'PUBLIC',
    'PRIVATE',
    'FAMILY_ONLY'
);


--
-- Name: enum_notifications_priority; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_notifications_priority AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT'
);


--
-- Name: enum_notifications_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_notifications_type AS ENUM (
    'GIFT_RECEIVED',
    'MEMORIAL_CREATED',
    'ORDER_STATUS_UPDATE',
    'PAYMENT_RECEIVED',
    'VENDOR_VERIFIED',
    'SYSTEM_ANNOUNCEMENT',
    'MEMORIAL_UPDATE'
);


--
-- Name: enum_order_items_item_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_order_items_item_status AS ENUM (
    'PENDING',
    'CONFIRMED',
    'PREPARING',
    'READY',
    'DELIVERED',
    'CANCELLED',
    'REFUNDED'
);


--
-- Name: enum_order_items_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_order_items_status AS ENUM (
    'pending',
    'confirmed',
    'preparing',
    'ready',
    'shipped',
    'delivered',
    'cancelled'
);


--
-- Name: enum_orders_delivery_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_orders_delivery_type AS ENUM (
    'pickup',
    'delivery'
);


--
-- Name: enum_orders_payment_method; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_orders_payment_method AS ENUM (
    'telebirr',
    'cbe_birr',
    'hellocash',
    'paypal',
    'bank_transfer',
    'cash_on_delivery'
);


--
-- Name: enum_orders_payment_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_orders_payment_status AS ENUM (
    'pending',
    'paid',
    'failed',
    'refunded',
    'partially_refunded'
);


--
-- Name: enum_orders_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_orders_status AS ENUM (
    'PENDING',
    'CONFIRMED',
    'PREPARING',
    'READY',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
    'REFUNDED'
);


--
-- Name: enum_products_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_products_category AS ENUM (
    'FLOWERS',
    'COFFINS',
    'FOOD_CATERING',
    'PHOTOGRAPHY',
    'VIDEOGRAPHY',
    'TRANSPORT',
    'MEMORIAL_ITEMS',
    'CLOTHING',
    'MUSIC',
    'RELIGIOUS_ITEMS',
    'DECORATIONS',
    'OTHER'
);


--
-- Name: enum_products_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_products_status AS ENUM (
    'draft',
    'pending',
    'published',
    'archived',
    'private'
);


--
-- Name: enum_products_tax_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_products_tax_status AS ENUM (
    'taxable',
    'shipping',
    'none'
);


--
-- Name: enum_products_visibility; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_products_visibility AS ENUM (
    'visible',
    'catalog',
    'search',
    'hidden',
    'catalog_only'
);


--
-- Name: enum_reports_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_reports_category AS ENUM (
    'ABUSE',
    'SPAM',
    'INAPPROPRIATE',
    'ILLEGAL',
    'OTHER'
);


--
-- Name: enum_reports_resolution; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_reports_resolution AS ENUM (
    'NO_ACTION',
    'CONTENT_HIDDEN',
    'CONTENT_DELETED',
    'USER_WARNED',
    'USER_BANNED',
    'OTHER'
);


--
-- Name: enum_reports_severity; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_reports_severity AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'CRITICAL'
);


--
-- Name: enum_reports_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_reports_status AS ENUM (
    'OPEN',
    'IN_REVIEW',
    'RESOLVED',
    'REJECTED'
);


--
-- Name: enum_reports_target_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_reports_target_type AS ENUM (
    'MEMORIAL',
    'COMMENT',
    'USER',
    'GIFT',
    'OTHER'
);


--
-- Name: enum_system_settings_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_system_settings_category AS ENUM (
    'GENERAL',
    'FEES',
    'FEATURE_FLAG',
    'PAYMENT',
    'SUPPORT'
);


--
-- Name: enum_user_status_history_action; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_user_status_history_action AS ENUM (
    'DEACTIVATE',
    'REACTIVATE',
    'BAN',
    'UNBAN'
);


--
-- Name: enum_users_gender; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_users_gender AS ENUM (
    'male',
    'female',
    'other'
);


--
-- Name: enum_users_language_preference; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_users_language_preference AS ENUM (
    'amharic',
    'afan_oromo',
    'tigrigna',
    'english'
);


--
-- Name: enum_users_preferred_language; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_users_preferred_language AS ENUM (
    'amharic',
    'afan_oromo',
    'tigrigna',
    'english'
);


--
-- Name: enum_users_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_users_role AS ENUM (
    'Administrator',
    'Family Account',
    'Public User',
    'Vendor',
    'Finance Officer'
);


--
-- Name: enum_vendors_service_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_vendors_service_type AS ENUM (
    'FLORIST',
    'COFFIN_MAKER',
    'CATERER',
    'PHOTOGRAPHER',
    'VIDEOGRAPHER',
    'FUNERAL_HOME',
    'TRANSPORT',
    'RELIGIOUS_SERVICES',
    'MEMORIAL_ITEMS',
    'CLOTHING',
    'MUSIC',
    'OTHER'
);


--
-- Name: enum_vendors_subscription_plan; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_vendors_subscription_plan AS ENUM (
    'BASIC',
    'PREMIUM',
    'ENTERPRISE'
);


--
-- Name: enum_vendors_verification_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_vendors_verification_status AS ENUM (
    'PENDING',
    'VERIFIED',
    'REJECTED',
    'SUSPENDED'
);


--
-- Name: enum_wallet_transactions_payment_method; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_wallet_transactions_payment_method AS ENUM (
    'TELEBIRR',
    'CBE_BIRR',
    'HELLO_CASH',
    'PAYPAL',
    'WALLET',
    'ADMIN'
);


--
-- Name: enum_wallet_transactions_reference_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_wallet_transactions_reference_type AS ENUM (
    'MEMORIAL',
    'GIFT',
    'ORDER',
    'DEPOSIT',
    'OTHER'
);


--
-- Name: enum_wallet_transactions_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_wallet_transactions_status AS ENUM (
    'PENDING',
    'COMPLETED',
    'FAILED',
    'CANCELLED',
    'REFUNDED'
);


--
-- Name: enum_wallet_transactions_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_wallet_transactions_type AS ENUM (
    'DEPOSIT',
    'MEMORIAL_CREATION',
    'GIFT_SENT',
    'GIFT_RECEIVED',
    'MARKETPLACE_PURCHASE',
    'MARKETPLACE_SALE',
    'REFUND',
    'ADMIN_ADJUSTMENT',
    'PLATFORM_FEE'
);


--
-- Name: enum_wallets_withdrawal_method; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_wallets_withdrawal_method AS ENUM (
    'bank_transfer',
    'mobile_money',
    'cash_pickup'
);


--
-- Name: enum_wallets_withdrawal_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_wallets_withdrawal_status AS ENUM (
    'active',
    'suspended',
    'blocked'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: SequelizeMeta; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SequelizeMeta" (
    name character varying(255) NOT NULL
);


--
-- Name: admin_action_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_action_logs (
    log_id uuid NOT NULL,
    admin_id uuid NOT NULL,
    action public.enum_admin_action_logs_action NOT NULL,
    target_type public.enum_admin_action_logs_target_type DEFAULT 'OTHER'::public.enum_admin_action_logs_target_type NOT NULL,
    target_id uuid,
    target_label character varying(255),
    reason text,
    metadata jsonb DEFAULT '{}'::jsonb,
    ip_address character varying(45),
    user_agent text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: admin_vendors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_vendors (
    vendor_id uuid NOT NULL,
    user_id uuid NOT NULL,
    vendor_name character varying(200) NOT NULL,
    service_type public.enum_admin_vendors_service_type NOT NULL,
    contact_person character varying(100) NOT NULL,
    phone_number character varying(20) NOT NULL,
    address text NOT NULL,
    description text,
    business_license_no character varying(100),
    logo_url character varying(500),
    working_hours jsonb DEFAULT '{"friday": {"open": "08:00", "close": "18:00", "closed": false}, "monday": {"open": "08:00", "close": "18:00", "closed": false}, "sunday": {"open": "08:00", "close": "18:00", "closed": true}, "tuesday": {"open": "08:00", "close": "18:00", "closed": false}, "saturday": {"open": "08:00", "close": "18:00", "closed": false}, "thursday": {"open": "08:00", "close": "18:00", "closed": false}, "wednesday": {"open": "08:00", "close": "18:00", "closed": false}}'::jsonb,
    delivery_areas character varying(255)[] DEFAULT (ARRAY[]::character varying[])::character varying(255)[],
    can_add_products boolean DEFAULT true,
    can_edit_products boolean DEFAULT true,
    can_manage_orders boolean DEFAULT true,
    can_update_stock boolean DEFAULT true,
    can_edit_profile boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_by uuid NOT NULL,
    last_login timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: appeals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.appeals (
    appeal_id uuid NOT NULL,
    user_id uuid NOT NULL,
    target_type public.enum_appeals_target_type NOT NULL,
    target_id uuid NOT NULL,
    related_report_id uuid,
    related_dispute_id uuid,
    reason text,
    status public.enum_appeals_status DEFAULT 'PENDING'::public.enum_appeals_status NOT NULL,
    decision public.enum_appeals_decision,
    resolution_notes text,
    assigned_to uuid,
    decided_by uuid,
    decided_at timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: delivery_zones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.delivery_zones (
    zone_id uuid NOT NULL,
    vendor_location_id uuid NOT NULL,
    zone_name character varying(100) NOT NULL,
    city character varying(100) NOT NULL,
    region character varying(100) NOT NULL,
    subcity character varying(100),
    woreda character varying(100),
    kebele character varying(100),
    postal_codes json DEFAULT '[]'::json,
    delivery_fee numeric(8,2) DEFAULT 0 NOT NULL,
    delivery_time_min integer DEFAULT 30,
    delivery_time_max integer DEFAULT 120,
    is_active boolean DEFAULT true,
    priority_order integer DEFAULT 1,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: COLUMN delivery_zones.delivery_time_min; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.delivery_zones.delivery_time_min IS 'Minimum delivery time in minutes';


--
-- Name: COLUMN delivery_zones.delivery_time_max; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.delivery_zones.delivery_time_max IS 'Maximum delivery time in minutes';


--
-- Name: COLUMN delivery_zones.priority_order; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.delivery_zones.priority_order IS 'Lower numbers = higher priority';


--
-- Name: disputes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.disputes (
    dispute_id uuid NOT NULL,
    order_id uuid NOT NULL,
    raised_by uuid NOT NULL,
    against_party public.enum_disputes_against_party DEFAULT 'VENDOR'::public.enum_disputes_against_party NOT NULL,
    category public.enum_disputes_category DEFAULT 'OTHER'::public.enum_disputes_category NOT NULL,
    reason text,
    status public.enum_disputes_status DEFAULT 'OPEN'::public.enum_disputes_status NOT NULL,
    resolution public.enum_disputes_resolution,
    requested_refund_amount numeric(10,2),
    approved_refund_amount numeric(10,2),
    currency character varying(3) DEFAULT 'ETB'::character varying NOT NULL,
    assigned_to uuid,
    closed_by uuid,
    closed_at timestamp with time zone,
    admin_notes text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: fee_configs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fee_configs (
    config_id uuid NOT NULL,
    type public.enum_fee_configs_type NOT NULL,
    scope public.enum_fee_configs_scope DEFAULT 'GLOBAL'::public.enum_fee_configs_scope NOT NULL,
    service_type character varying(50),
    percentage numeric(5,2) NOT NULL,
    effective_from timestamp with time zone NOT NULL,
    effective_to timestamp with time zone,
    created_by uuid,
    notes text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: COLUMN fee_configs.service_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.fee_configs.service_type IS 'Optional: applies to specific vendor service_type when scope=SERVICE_TYPE';


--
-- Name: gift_catalog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gift_catalog (
    gift_id uuid NOT NULL,
    name character varying(100) NOT NULL,
    name_amharic character varying(100),
    description text,
    description_amharic text,
    symbolism text,
    symbolism_amharic text,
    category public.enum_gift_catalog_category NOT NULL,
    value numeric(8,2) NOT NULL,
    currency character varying(3) DEFAULT 'ETB'::character varying NOT NULL,
    animation_type character varying(50) NOT NULL,
    animation_duration integer DEFAULT 3000 NOT NULL,
    icon_url character varying(500),
    animation_url character varying(500),
    sound_url character varying(500),
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0 NOT NULL,
    is_featured boolean DEFAULT false,
    usage_count integer DEFAULT 0 NOT NULL,
    total_revenue numeric(12,2) DEFAULT 0 NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: COLUMN gift_catalog.animation_duration; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gift_catalog.animation_duration IS 'Animation duration in milliseconds';


--
-- Name: COLUMN gift_catalog.metadata; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gift_catalog.metadata IS 'Additional gift metadata like colors, themes, etc.';


--
-- Name: gift_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gift_transactions (
    txn_id uuid NOT NULL,
    sender_id uuid NOT NULL,
    recipient_id uuid NOT NULL,
    memorial_id uuid NOT NULL,
    gift_id uuid NOT NULL,
    wallet_txn_id uuid NOT NULL,
    amount numeric(8,2) NOT NULL,
    platform_fee numeric(8,2) DEFAULT 0 NOT NULL,
    net_amount numeric(8,2) NOT NULL,
    currency character varying(3) DEFAULT 'ETB'::character varying NOT NULL,
    message text,
    message_amharic text,
    sender_name character varying(100),
    is_anonymous boolean DEFAULT false,
    status public.enum_gift_transactions_status DEFAULT 'PENDING'::public.enum_gift_transactions_status NOT NULL,
    animation_played boolean DEFAULT false,
    animation_played_at timestamp with time zone,
    is_featured_on_memorial boolean DEFAULT false,
    visibility public.enum_gift_transactions_visibility DEFAULT 'PUBLIC'::public.enum_gift_transactions_visibility NOT NULL,
    processed_at timestamp with time zone,
    refunded_at timestamp with time zone,
    refund_reason text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: COLUMN gift_transactions.net_amount; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gift_transactions.net_amount IS 'Amount credited to recipient after platform fee';


--
-- Name: COLUMN gift_transactions.sender_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gift_transactions.sender_name IS 'Display name for anonymous gifts';


--
-- Name: COLUMN gift_transactions.is_featured_on_memorial; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gift_transactions.is_featured_on_memorial IS 'Whether this gift should be prominently displayed';


--
-- Name: COLUMN gift_transactions.metadata; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.gift_transactions.metadata IS 'Additional transaction metadata';


--
-- Name: memorial_comment_likes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.memorial_comment_likes (
    like_id uuid NOT NULL,
    comment_id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: memorial_comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.memorial_comments (
    comment_id uuid NOT NULL,
    memorial_id uuid NOT NULL,
    user_id uuid NOT NULL,
    message text NOT NULL,
    likes_count integer DEFAULT 0 NOT NULL,
    visibility public.enum_memorial_comments_visibility DEFAULT 'PUBLIC'::public.enum_memorial_comments_visibility NOT NULL,
    is_deleted boolean DEFAULT false,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: memorials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.memorials (
    memorial_id uuid NOT NULL,
    user_id uuid NOT NULL,
    deceased_name character varying(200) NOT NULL,
    deceased_name_amharic character varying(200),
    bio text,
    bio_amharic text,
    date_of_birth date,
    date_of_death date,
    place_of_birth character varying(200),
    place_of_death character varying(200),
    cause_of_death character varying(500),
    profile_image character varying(500),
    cover_image character varying(500),
    gallery_images character varying(255)[] DEFAULT (ARRAY[]::character varying[])::character varying(255)[],
    visibility public.enum_memorials_visibility DEFAULT 'PUBLIC'::public.enum_memorials_visibility NOT NULL,
    paid_status boolean DEFAULT false NOT NULL,
    payment_txn_id uuid,
    cultural_template public.enum_memorials_cultural_template DEFAULT 'MODERN'::public.enum_memorials_cultural_template NOT NULL,
    memorial_url character varying(255),
    is_featured boolean DEFAULT false,
    featured_until timestamp with time zone,
    view_count integer DEFAULT 0 NOT NULL,
    gift_count integer DEFAULT 0 NOT NULL,
    total_gifts_value numeric(12,2) DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true,
    review_status public.enum_memorials_review_status DEFAULT 'NORMAL'::public.enum_memorials_review_status NOT NULL,
    is_hidden_by_admin boolean DEFAULT false,
    sensitivity_level public.enum_memorials_sensitivity_level DEFAULT 'NORMAL'::public.enum_memorials_sensitivity_level NOT NULL,
    admin_notes text,
    archived_at timestamp with time zone,
    archived_by uuid,
    memorial_settings jsonb DEFAULT '{"allow_gifts": true, "allow_stories": true, "allow_comments": true, "show_gift_amounts": true, "notification_preferences": {"new_gifts": true, "new_stories": true, "new_comments": true}}'::jsonb,
    comments_locked boolean DEFAULT false NOT NULL,
    admin_visibility public.enum_memorials_admin_visibility DEFAULT 'NONE'::public.enum_memorials_admin_visibility NOT NULL,
    last_activity_at timestamp with time zone,
    seo_title character varying(255),
    seo_description text,
    seo_keywords character varying(255)[],
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    notification_id uuid NOT NULL,
    user_id uuid NOT NULL,
    type public.enum_notifications_type NOT NULL,
    title character varying(200) NOT NULL,
    message text NOT NULL,
    data jsonb,
    is_read boolean DEFAULT false,
    read_at timestamp with time zone,
    priority public.enum_notifications_priority DEFAULT 'MEDIUM'::public.enum_notifications_priority,
    action_url character varying(500),
    expires_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: COLUMN notifications.data; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.notifications.data IS 'Additional data related to the notification';


--
-- Name: COLUMN notifications.action_url; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.notifications.action_url IS 'URL to navigate when notification is clicked';


--
-- Name: COLUMN notifications.expires_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.notifications.expires_at IS 'When the notification should be automatically removed';


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    item_id uuid NOT NULL,
    order_id uuid NOT NULL,
    product_id uuid NOT NULL,
    product_name character varying(200) NOT NULL,
    product_description text,
    product_image character varying(500),
    unit_price numeric(10,2) NOT NULL,
    quantity integer NOT NULL,
    total_price numeric(10,2) NOT NULL,
    currency character varying(3) DEFAULT 'ETB'::character varying NOT NULL,
    customization_details jsonb,
    special_instructions text,
    item_status public.enum_order_items_item_status DEFAULT 'PENDING'::public.enum_order_items_item_status NOT NULL,
    preparation_time integer,
    actual_preparation_time integer,
    is_gift boolean DEFAULT false,
    gift_message text,
    gift_recipient jsonb,
    refund_amount numeric(10,2),
    refund_reason text,
    refunded_at timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: COLUMN order_items.product_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.order_items.product_name IS 'Snapshot of product name at time of order';


--
-- Name: COLUMN order_items.product_description; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.order_items.product_description IS 'Snapshot of product description at time of order';


--
-- Name: COLUMN order_items.product_image; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.order_items.product_image IS 'Snapshot of product main image at time of order';


--
-- Name: COLUMN order_items.unit_price; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.order_items.unit_price IS 'Price per unit at time of order';


--
-- Name: COLUMN order_items.customization_details; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.order_items.customization_details IS 'Custom options selected for this item';


--
-- Name: COLUMN order_items.preparation_time; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.order_items.preparation_time IS 'Estimated preparation time in hours';


--
-- Name: COLUMN order_items.actual_preparation_time; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.order_items.actual_preparation_time IS 'Actual preparation time in hours';


--
-- Name: COLUMN order_items.gift_recipient; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.order_items.gift_recipient IS 'Gift recipient details if different from buyer';


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    order_id uuid NOT NULL,
    order_number character varying(20) NOT NULL,
    buyer_id uuid NOT NULL,
    vendor_id uuid NOT NULL,
    memorial_id uuid,
    wallet_txn_id uuid NOT NULL,
    status public.enum_orders_status DEFAULT 'PENDING'::public.enum_orders_status NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    delivery_fee numeric(8,2) DEFAULT 0 NOT NULL,
    platform_fee numeric(8,2) NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    vendor_amount numeric(10,2) NOT NULL,
    currency character varying(3) DEFAULT 'ETB'::character varying NOT NULL,
    delivery_address jsonb NOT NULL,
    delivery_instructions text,
    delivery_date timestamp with time zone,
    delivery_time_slot character varying(50),
    customer_notes text,
    vendor_notes text,
    estimated_delivery timestamp with time zone,
    actual_delivery timestamp with time zone,
    tracking_number character varying(100),
    delivery_person jsonb,
    payment_method character varying(50) DEFAULT 'WALLET'::character varying NOT NULL,
    is_urgent boolean DEFAULT false,
    urgency_fee numeric(8,2) DEFAULT 0 NOT NULL,
    cancellation_reason text,
    cancelled_by uuid,
    cancelled_at timestamp with time zone,
    refund_amount numeric(10,2),
    refunded_at timestamp with time zone,
    rating integer,
    review text,
    reviewed_at timestamp with time zone,
    status_history jsonb DEFAULT '[]'::jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: COLUMN orders.memorial_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.orders.memorial_id IS 'Optional: if order is related to a specific memorial';


--
-- Name: COLUMN orders.vendor_amount; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.orders.vendor_amount IS 'Amount credited to vendor after platform fee';


--
-- Name: COLUMN orders.delivery_address; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.orders.delivery_address IS 'Full delivery address details';


--
-- Name: COLUMN orders.delivery_person; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.orders.delivery_person IS 'Delivery person details';


--
-- Name: COLUMN orders.status_history; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.orders.status_history IS 'Array of status changes with timestamps';


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    product_id uuid NOT NULL,
    vendor_id uuid NOT NULL,
    name character varying(200) NOT NULL,
    name_amharic character varying(200),
    description text,
    description_amharic text,
    category public.enum_products_category NOT NULL,
    subcategory character varying(100),
    price numeric(10,2) NOT NULL,
    currency character varying(3) DEFAULT 'ETB'::character varying NOT NULL,
    stock_quantity integer DEFAULT 0 NOT NULL,
    track_inventory boolean DEFAULT true,
    low_stock_threshold integer DEFAULT 5 NOT NULL,
    sku character varying(100),
    barcode character varying(100),
    weight numeric(8,2),
    dimensions jsonb,
    main_image character varying(500),
    gallery_images character varying(255)[] DEFAULT (ARRAY[]::character varying[])::character varying(255)[],
    is_featured boolean DEFAULT false,
    is_active boolean DEFAULT true,
    is_digital boolean DEFAULT false,
    requires_customization boolean DEFAULT false,
    customization_options jsonb DEFAULT '{}'::jsonb,
    delivery_time integer,
    preparation_time integer,
    rating numeric(3,2) DEFAULT 0 NOT NULL,
    total_reviews integer DEFAULT 0 NOT NULL,
    total_sold integer DEFAULT 0 NOT NULL,
    total_revenue numeric(12,2) DEFAULT 0 NOT NULL,
    view_count integer DEFAULT 0 NOT NULL,
    tags character varying(255)[] DEFAULT (ARRAY[]::character varying[])::character varying(255)[],
    seo_title character varying(255),
    seo_description text,
    seo_keywords character varying(255)[],
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: COLUMN products.weight; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.products.weight IS 'Weight in kg';


--
-- Name: COLUMN products.dimensions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.products.dimensions IS 'Length, width, height in cm';


--
-- Name: COLUMN products.is_digital; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.products.is_digital IS 'For digital services like photography sessions';


--
-- Name: COLUMN products.delivery_time; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.products.delivery_time IS 'Delivery time in hours';


--
-- Name: COLUMN products.preparation_time; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.products.preparation_time IS 'Preparation time in hours';


--
-- Name: reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reports (
    report_id uuid NOT NULL,
    reporter_id uuid NOT NULL,
    reported_user_id uuid,
    memorial_id uuid,
    comment_id uuid,
    target_type public.enum_reports_target_type NOT NULL,
    target_id character varying(255),
    category public.enum_reports_category DEFAULT 'OTHER'::public.enum_reports_category NOT NULL,
    reason text,
    status public.enum_reports_status DEFAULT 'OPEN'::public.enum_reports_status NOT NULL,
    severity public.enum_reports_severity DEFAULT 'LOW'::public.enum_reports_severity NOT NULL,
    resolution public.enum_reports_resolution,
    resolved_by uuid,
    resolved_at timestamp with time zone,
    admin_notes text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: system_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.system_settings (
    setting_id uuid NOT NULL,
    key character varying(100) NOT NULL,
    category public.enum_system_settings_category DEFAULT 'GENERAL'::public.enum_system_settings_category NOT NULL,
    value jsonb DEFAULT '{}'::jsonb,
    description text,
    updated_by uuid,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: user_status_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_status_history (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    changed_by uuid NOT NULL,
    action public.enum_user_status_history_action NOT NULL,
    reason text,
    note text,
    previous_is_active boolean NOT NULL,
    previous_is_banned boolean NOT NULL,
    new_is_active boolean NOT NULL,
    new_is_banned boolean NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    user_id uuid NOT NULL,
    name character varying(100) NOT NULL,
    username character varying(50),
    email character varying(255),
    phone character varying(20),
    password character varying(255),
    google_id character varying(255),
    role public.enum_users_role DEFAULT 'Public User'::public.enum_users_role NOT NULL,
    verified boolean DEFAULT false,
    email_verified boolean DEFAULT false,
    phone_verified boolean DEFAULT false,
    verification_token character varying(255),
    reset_password_token character varying(255),
    reset_password_expires timestamp with time zone,
    last_login timestamp with time zone,
    is_active boolean DEFAULT true,
    is_banned boolean DEFAULT false,
    can_create_memorials boolean DEFAULT true,
    can_comment boolean DEFAULT true,
    ban_reason text,
    banned_at timestamp with time zone,
    banned_by uuid,
    profile_image character varying(500),
    bio text,
    date_of_birth date,
    gender character varying(20),
    address text,
    city character varying(100),
    country character varying(100) DEFAULT 'Ethiopia'::character varying,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: vendor_locations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vendor_locations (
    location_id uuid NOT NULL,
    vendor_id uuid NOT NULL,
    shop_name character varying(200) NOT NULL,
    address_line_1 character varying(255) NOT NULL,
    address_line_2 character varying(255),
    city character varying(100) NOT NULL,
    region character varying(100) NOT NULL,
    postal_code character varying(20),
    country character varying(100) DEFAULT 'Ethiopia'::character varying,
    latitude numeric(10,8),
    longitude numeric(11,8),
    phone character varying(15) NOT NULL,
    email character varying(100),
    business_hours json DEFAULT '{"monday":{"open":"08:00","close":"18:00","closed":false},"tuesday":{"open":"08:00","close":"18:00","closed":false},"wednesday":{"open":"08:00","close":"18:00","closed":false},"thursday":{"open":"08:00","close":"18:00","closed":false},"friday":{"open":"08:00","close":"18:00","closed":false},"saturday":{"open":"08:00","close":"16:00","closed":false},"sunday":{"open":"09:00","close":"15:00","closed":false}}'::json,
    delivery_radius_km integer DEFAULT 10,
    delivery_fee numeric(8,2) DEFAULT 0,
    free_delivery_minimum numeric(10,2),
    delivery_time_estimate character varying(50) DEFAULT '1-2 hours'::character varying,
    accepts_online_orders boolean DEFAULT true,
    is_active boolean DEFAULT true,
    is_verified boolean DEFAULT false,
    verification_documents json DEFAULT '[]'::json,
    shop_images json DEFAULT '[]'::json,
    description text,
    specialties json DEFAULT '[]'::json,
    rating numeric(3,2) DEFAULT 0,
    review_count integer DEFAULT 0,
    total_orders integer DEFAULT 0,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: vendors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vendors (
    vendor_id uuid NOT NULL,
    user_id uuid NOT NULL,
    business_name character varying(200) NOT NULL,
    business_name_amharic character varying(200),
    business_description text,
    business_description_amharic text,
    service_type public.enum_vendors_service_type NOT NULL,
    business_license character varying(100),
    tax_id character varying(50),
    verification_status public.enum_vendors_verification_status DEFAULT 'PENDING'::public.enum_vendors_verification_status NOT NULL,
    verification_documents character varying(255)[] DEFAULT (ARRAY[]::character varying[])::character varying(255)[],
    verified_at timestamp with time zone,
    verified_by uuid,
    rejection_reason text,
    business_address text NOT NULL,
    city character varying(100) NOT NULL,
    region character varying(100) NOT NULL,
    country character varying(100) DEFAULT 'Ethiopia'::character varying,
    postal_code character varying(20),
    phone character varying(20) NOT NULL,
    email character varying(255),
    website character varying(255),
    logo_url character varying(500),
    cover_image_url character varying(500),
    gallery_images character varying(255)[] DEFAULT (ARRAY[]::character varying[])::character varying(255)[],
    operating_hours jsonb DEFAULT '{"friday": {"open": "08:00", "close": "18:00", "closed": false}, "monday": {"open": "08:00", "close": "18:00", "closed": false}, "sunday": {"open": "08:00", "close": "18:00", "closed": true}, "tuesday": {"open": "08:00", "close": "18:00", "closed": false}, "saturday": {"open": "08:00", "close": "18:00", "closed": false}, "thursday": {"open": "08:00", "close": "18:00", "closed": false}, "wednesday": {"open": "08:00", "close": "18:00", "closed": false}}'::jsonb,
    delivery_areas character varying(255)[] DEFAULT (ARRAY[]::character varying[])::character varying(255)[],
    delivery_fee numeric(8,2) DEFAULT 0 NOT NULL,
    minimum_order numeric(8,2) DEFAULT 0 NOT NULL,
    rating numeric(3,2) DEFAULT 0 NOT NULL,
    total_reviews integer DEFAULT 0 NOT NULL,
    total_orders integer DEFAULT 0 NOT NULL,
    total_revenue numeric(12,2) DEFAULT 0 NOT NULL,
    commission_rate numeric(5,2) DEFAULT 5 NOT NULL,
    subscription_plan public.enum_vendors_subscription_plan DEFAULT 'BASIC'::public.enum_vendors_subscription_plan NOT NULL,
    subscription_expires_at timestamp with time zone,
    is_featured boolean DEFAULT false,
    featured_until timestamp with time zone,
    is_active boolean DEFAULT true,
    suspended_at timestamp with time zone,
    suspended_by uuid,
    suspension_reason text,
    settings jsonb DEFAULT '{"auto_accept_orders": false, "notification_preferences": {"reviews": true, "new_orders": true, "promotions": false, "order_updates": true}}'::jsonb,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: COLUMN vendors.commission_rate; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.vendors.commission_rate IS 'Platform commission percentage';


--
-- Name: wallet_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wallet_transactions (
    txn_id uuid NOT NULL,
    wallet_id uuid NOT NULL,
    user_id uuid NOT NULL,
    amount numeric(12,2) NOT NULL,
    type public.enum_wallet_transactions_type NOT NULL,
    status public.enum_wallet_transactions_status DEFAULT 'PENDING'::public.enum_wallet_transactions_status NOT NULL,
    description text,
    reference_id uuid,
    reference_type public.enum_wallet_transactions_reference_type,
    payment_method public.enum_wallet_transactions_payment_method,
    external_txn_id character varying(255),
    balance_before numeric(12,2) NOT NULL,
    balance_after numeric(12,2) NOT NULL,
    fee_amount numeric(12,2) DEFAULT 0 NOT NULL,
    net_amount numeric(12,2) NOT NULL,
    processed_at timestamp with time zone,
    processed_by uuid,
    metadata jsonb,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: COLUMN wallet_transactions.reference_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.wallet_transactions.reference_id IS 'Reference to related entity (memorial_id, gift_id, order_id, etc.)';


--
-- Name: COLUMN wallet_transactions.external_txn_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.wallet_transactions.external_txn_id IS 'Transaction ID from external payment gateway';


--
-- Name: COLUMN wallet_transactions.metadata; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.wallet_transactions.metadata IS 'Additional transaction metadata';


--
-- Name: wallets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wallets (
    wallet_id uuid NOT NULL,
    user_id uuid NOT NULL,
    balance numeric(12,2) DEFAULT 0 NOT NULL,
    currency character varying(3) DEFAULT 'ETB'::character varying NOT NULL,
    is_frozen boolean DEFAULT false,
    frozen_reason text,
    frozen_at timestamp with time zone,
    frozen_by uuid,
    total_deposited numeric(12,2) DEFAULT 0 NOT NULL,
    total_spent numeric(12,2) DEFAULT 0 NOT NULL,
    last_transaction_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Data for Name: SequelizeMeta; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SequelizeMeta" (name) FROM stdin;
20241023120001-create-users.js
20241023120002-create-memorials.js
20241023120003-create-gift-catalog.js
20241023120004-create-gift-transactions.js
20241023120005-create-vendor-locations.js
20241023120006-create-products.js
20241023120007-create-orders.js
20241023120008-create-order-items.js
20241023120009-create-wallets.js
20241023120010-create-delivery-zones.js
\.


--
-- Data for Name: admin_action_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admin_action_logs (log_id, admin_id, action, target_type, target_id, target_label, reason, metadata, ip_address, user_agent, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: admin_vendors; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admin_vendors (vendor_id, user_id, vendor_name, service_type, contact_person, phone_number, address, description, business_license_no, logo_url, working_hours, delivery_areas, can_add_products, can_edit_products, can_manage_orders, can_update_stock, can_edit_profile, is_active, created_by, last_login, created_at, updated_at) FROM stdin;
05094092-a8c8-4ec9-9949-a07b53821e1c	912fac09-8d0f-4cfd-a63e-690ba7094d52	saka	FUNERAL_HOME	saka	+251911234567	Test Address, Addis Ababa	Test funeral home description	\N	\N	{"friday": {"open": "08:00", "close": "18:00", "closed": false}, "monday": {"open": "08:00", "close": "18:00", "closed": false}, "sunday": {"open": "08:00", "close": "18:00", "closed": true}, "tuesday": {"open": "08:00", "close": "18:00", "closed": false}, "saturday": {"open": "08:00", "close": "18:00", "closed": false}, "thursday": {"open": "08:00", "close": "18:00", "closed": false}, "wednesday": {"open": "08:00", "close": "18:00", "closed": false}}	{}	t	t	t	t	f	t	2f3710ee-9b80-498c-9b4a-5a1c46a8a34a	\N	2025-12-03 13:05:02.561+03	2025-12-03 13:05:02.561+03
7d8e259a-7c97-43ea-b375-fe5bab7e0523	911a3b55-1589-4408-b08e-5f4f005b5d00	sakka	FUNERAL_HOME	sakka	911234567	Test Address, Addis Ababa	Test funeral home description	\N	/uploads/vendors/1764761976472-c71bdc5da50783b8.jpg	{"friday": {"open": "08:00", "close": "18:00", "closed": false}, "monday": {"open": "08:00", "close": "18:00", "closed": false}, "sunday": {"open": "08:00", "close": "18:00", "closed": true}, "tuesday": {"open": "08:00", "close": "18:00", "closed": false}, "saturday": {"open": "08:00", "close": "18:00", "closed": false}, "thursday": {"open": "08:00", "close": "18:00", "closed": false}, "wednesday": {"open": "08:00", "close": "18:00", "closed": false}}	{}	t	t	t	t	f	t	2f3710ee-9b80-498c-9b4a-5a1c46a8a34a	\N	2025-12-03 14:39:36.773+03	2025-12-03 14:39:36.773+03
\.


--
-- Data for Name: appeals; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.appeals (appeal_id, user_id, target_type, target_id, related_report_id, related_dispute_id, reason, status, decision, resolution_notes, assigned_to, decided_by, decided_at, metadata, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: delivery_zones; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.delivery_zones (zone_id, vendor_location_id, zone_name, city, region, subcity, woreda, kebele, postal_codes, delivery_fee, delivery_time_min, delivery_time_max, is_active, priority_order, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: disputes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.disputes (dispute_id, order_id, raised_by, against_party, category, reason, status, resolution, requested_refund_amount, approved_refund_amount, currency, assigned_to, closed_by, closed_at, admin_notes, metadata, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: fee_configs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fee_configs (config_id, type, scope, service_type, percentage, effective_from, effective_to, created_by, notes, metadata, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: gift_catalog; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.gift_catalog (gift_id, name, name_amharic, description, description_amharic, symbolism, symbolism_amharic, category, value, currency, animation_type, animation_duration, icon_url, animation_url, sound_url, is_active, sort_order, is_featured, usage_count, total_revenue, metadata, created_at, updated_at) FROM stdin;
7fa678a1-7a7e-4464-9624-a116510dbf94	Single White Rose	አንድ ነጭ ሮዝ	A simple gesture of remembrance	የመታሰቢያ ቀላል ምልክት	Represents purity, remembrance, and unconditional love	ንፅህና፣ መታሰቢያ እና ያልተገደበ ፍቅርን ያመለክታል	WHITE_ROSE	5.00	ETB	petal_bloom	3000	/assets/gifts/white-rose-single.svg	/assets/animations/petal-bloom.json	\N	t	1	f	0	0.00	{}	2025-12-03 13:02:40.314+03	2025-12-03 13:02:40.314+03
9e7519be-77fd-432a-898e-c9906fe816a9	White Rose Bouquet	ነጭ ሮዝ ጥቅል	Collective love and purity	የጋራ ፍቅር እና ንፅህና	Multiple roses representing collective remembrance	የጋራ መታሰቢያን የሚወክሉ በርካታ ሮዞች	WHITE_ROSE	10.00	ETB	multiple_petals_bloom	4000	/assets/gifts/white-rose-bouquet.svg	/assets/animations/multiple-petals-bloom.json	\N	t	2	f	0	0.00	{}	2025-12-03 13:02:40.314+03	2025-12-03 13:02:40.314+03
703665fb-43b6-4269-a2b0-61b47e9615eb	Lily & Rose Harmony	ሊሊ እና ሮዝ ስምምነት	Beauty of life and memory combined	የህይወት እና የመታሰቢያ ውበት ተዳምሮ	Harmony between different flowers representing life's beauty	የህይወትን ውበት የሚወክሉ የተለያዩ አበቦች መካከል ያለ ስምምነት	WHITE_ROSE	15.00	ETB	dual_flowers_opening	5000	/assets/gifts/lily-rose-harmony.svg	/assets/animations/dual-flowers-opening.json	\N	t	3	f	0	0.00	{}	2025-12-03 13:02:40.314+03	2025-12-03 13:02:40.314+03
b37d948f-c2f0-432a-9156-6ea80cf22703	Garden of White Roses	የነጭ ሮዞች ገነት	Eternal remembrance	ዘላለማዊ መታሰቢያ	A garden representing eternal memory and lasting love	ዘላለማዊ ትዝታ እና ዘላቂ ፍቅርን የሚወክል ገነት	WHITE_ROSE	20.00	ETB	garden_blooming_sequence	6000	/assets/gifts/white-roses-garden.svg	/assets/animations/garden-blooming-sequence.json	\N	t	4	f	0	0.00	{}	2025-12-03 13:02:40.314+03	2025-12-03 13:02:40.314+03
2a7033dd-88b7-4a9e-a8ca-e7abc2e64e80	Field of Roses	የሮዞች ሜዳ	Universal tribute to all souls	ለሁሉም ነፍሳት ሁለንተናዊ ክብር	An endless field representing universal love and remembrance	ሁለንተናዊ ፍቅር እና መታሰቢያን የሚወክል ማለቂያ የሌለው ሜዳ	WHITE_ROSE	25.00	ETB	expanding_flower_field	7000	/assets/gifts/roses-field.svg	/assets/animations/expanding-flower-field.json	\N	t	5	t	0	0.00	{}	2025-12-03 13:02:40.314+03	2025-12-03 13:02:40.314+03
824ee93d-eec2-4f02-8d9a-281226ac0c2d	Candle of Peace	የሰላም ሻማ	Memory & serenity	ትዝታ እና መረጋጋት	Warmth, reflection, and the eternal flame of memory	ሙቀት፣ ነጸብራቅ እና የዘላለማዊ ትዝታ ነበልባል	CANDLE_PEACE	10.00	ETB	gentle_flame	4000	/assets/gifts/peace-candle.svg	/assets/animations/gentle-flame.json	\N	t	1	f	0	0.00	{}	2025-12-03 13:02:40.314+03	2025-12-03 13:02:40.314+03
0e802ba5-1dcc-45b9-984b-c8aa1a22ac31	Twin Candles	መንትዮች ሻማዎች	Shared remembrance	የጋራ መታሰቢያ	Two flames representing shared memories and mutual support	የጋራ ትዝታዎችን እና የጋራ ድጋፍን የሚወክሉ ሁለት ነበልባሎች	CANDLE_PEACE	15.00	ETB	twin_flames_flickering	5000	/assets/gifts/twin-candles.svg	/assets/animations/twin-flames-flickering.json	\N	t	2	f	0	0.00	{}	2025-12-03 13:02:40.314+03	2025-12-03 13:02:40.314+03
56fd8ca7-f895-49b6-a7c7-a028dfd16e28	Golden Glow Candle	የወርቅ ብርሃን ሻማ	Hope, light, and eternal faith	ተስፋ፣ ብርሃን እና ዘላለማዊ እምነት	Golden light representing hope and divine presence	ተስፋ እና መለኮታዊ መገኘትን የሚወክል የወርቅ ብርሃን	CANDLE_PEACE	20.00	ETB	warm_golden_glow	5000	/assets/gifts/golden-glow-candle.svg	/assets/animations/warm-golden-glow.json	\N	t	3	f	0	0.00	{}	2025-12-03 13:02:40.314+03	2025-12-03 13:02:40.314+03
5fae0f04-f6db-4ac2-8014-045463a22899	Candle Circle	የሻማ ክብ	Family unity in grief	በሀዘን ውስጥ የቤተሰብ አንድነት	Circle of candles representing family unity and collective mourning	የቤተሰብ አንድነት እና የጋራ ሀዘንን የሚወክል የሻማዎች ክብ	CANDLE_PEACE	25.00	ETB	circle_candles_lighting	6000	/assets/gifts/candle-circle.svg	/assets/animations/circle-candles-lighting.json	\N	t	4	f	0	0.00	{}	2025-12-03 13:02:40.314+03	2025-12-03 13:02:40.314+03
d541c7f9-80dd-48e7-9bb2-79db345d79af	Lantern of Serenity	የመረጋጋት ፋኖስ	Guidance through darkness	በጨለማ ውስጥ መመሪያ	A guiding light through difficult times	በከባድ ጊዜያት የሚመራ ብርሃን	CANDLE_PEACE	30.00	ETB	floating_lantern_illumination	7000	/assets/gifts/serenity-lantern.svg	/assets/animations/floating-lantern-illumination.json	\N	t	5	t	0	0.00	{}	2025-12-03 13:02:40.314+03	2025-12-03 13:02:40.314+03
c58840d4-41f5-4c00-adcc-1e8a11f97675	Dove of Mercy	የምሕረት ርግብ	Peace & compassion	ሰላም እና ርኅራኄ	Peace, compassion, and the soul's gentle journey toward heaven	ሰላም፣ ርኅራኄ እና ነፍሱ ወደ ሰማይ የሚያደርገው ረጋ ያለ ጉዞ	DOVE_MERCY	25.00	ETB	dove_flying_softly	5000	/assets/gifts/mercy-dove.svg	/assets/animations/dove-flying-softly.json	\N	t	1	f	0	0.00	{}	2025-12-03 13:02:40.314+03	2025-12-03 13:02:40.314+03
d194d537-9af0-4f7f-90e6-e7e2e064ff3a	Olive Dove	የዘይት ርግብ	Hope and renewal	ተስፋ እና እድሳት	Dove carrying olive branch representing hope and new beginnings	ተስፋ እና አዲስ ጅምሮችን የሚወክል የዘይት ቅርንጫፍ የሚያሸከም ርግብ	DOVE_MERCY	30.00	ETB	dove_with_olive_branch	6000	/assets/gifts/olive-dove.svg	/assets/animations/dove-with-olive-branch.json	\N	t	2	f	0	0.00	{}	2025-12-03 13:02:40.314+03	2025-12-03 13:02:40.314+03
7e811b18-2090-414f-94b5-614f83bd2468	Pair of Doves	ጥንድ ርግቦች	Reunion in eternal love	በዘላለማዊ ፍቅር ውስጥ መገናኘት	Two doves representing eternal love and spiritual reunion	ዘላለማዊ ፍቅር እና መንፈሳዊ መገናኘትን የሚወክሉ ሁለት ርግቦች	DOVE_MERCY	35.00	ETB	two_doves_ascending	7000	/assets/gifts/pair-doves.svg	/assets/animations/two-doves-ascending.json	\N	t	3	f	0	0.00	{}	2025-12-03 13:02:40.314+03	2025-12-03 13:02:40.314+03
27897e94-cb17-4425-9cbf-72dd5a37671c	Messenger Dove	መልእክተኛ ርግብ	Sending prayers to heaven	ወደ ሰማይ ጸሎት መላክ	Dove carrying prayers and messages to the divine realm	ጸሎቶችን እና መልእክቶችን ወደ መለኮታዊ ግዛት የሚያሸከም ርግብ	DOVE_MERCY	40.00	ETB	dove_carrying_ribbon_scroll	8000	/assets/gifts/messenger-dove.svg	/assets/animations/dove-carrying-ribbon-scroll.json	\N	t	4	f	0	0.00	{}	2025-12-03 13:02:40.314+03	2025-12-03 13:02:40.314+03
63e06a94-4160-4f7e-ac8c-9edd8713b880	Heavenly Flight	የሰማያዊ በረራ	Soul's journey to peace	ነፍሱ ወደ ሰላም የሚያደርገው ጉዞ	Doves ascending into divine light representing the soul's peaceful journey	ነፍሱ የሚያደርገውን ሰላማዊ ጉዞ የሚወክሉ ወደ መለኮታዊ ብርሃን የሚወጡ ርግቦች	DOVE_MERCY	50.00	ETB	doves_flying_into_bright_light	10000	/assets/gifts/heavenly-flight.svg	/assets/animations/doves-flying-into-bright-light.json	\N	t	5	t	0	0.00	{}	2025-12-03 13:02:40.314+03	2025-12-03 13:02:40.314+03
a44fa169-2901-4c22-8b1a-6227134d3b85	Eternal Light	ዘላለማዊ ብርሃን	Legacy & honor	ውርስ እና ክብር	The soul's guidance, divine presence, and eternal legacy	የነፍሱ መመሪያ፣ መለኮታዊ መገኘት እና ዘላለማዊ ውርስ	ETERNAL_LIGHT	100.00	ETB	soft_aura	8000	/assets/gifts/eternal-light.svg	/assets/animations/soft-aura.json	\N	t	1	t	0	0.00	{}	2025-12-03 13:02:40.314+03	2025-12-03 13:02:40.314+03
124337d4-76a4-4533-a26c-d1f06dc92405	Golden Halo	የወርቅ ክብ	Sacred remembrance	ቅዱስ መታሰቢያ	Sacred circle of light representing divine blessing and honor	መለኮታዊ በረከት እና ክብርን የሚወክል ቅዱስ የብርሃን ክብ	ETERNAL_LIGHT	125.00	ETB	light_ring_aura	9000	/assets/gifts/golden-halo.svg	/assets/animations/light-ring-aura.json	\N	t	2	f	0	0.00	{}	2025-12-03 13:02:40.314+03	2025-12-03 13:02:40.314+03
4589ce7b-8f97-4a6c-bd23-6619b28d90a6	Star of Legacy	የውርስ ኮከብ	Everlasting inspiration	ዘላቂ መነሳሳት	Bright star representing lasting impact and inspiration	ዘላቂ ተጽዕኖ እና መነሳሳትን የሚወክል ደማቅ ኮከብ	ETERNAL_LIGHT	150.00	ETB	starburst_glow	10000	/assets/gifts/star-legacy.svg	/assets/animations/starburst-glow.json	\N	t	3	f	0	0.00	{}	2025-12-03 13:02:40.314+03	2025-12-03 13:02:40.314+03
a29bb77f-1c8a-4ae1-881a-985f78cc286b	Heavenly Lamp	የሰማያዊ መብራት	Light guiding the spirit	መንፈስን የሚመራ ብርሃን	Divine lamp illuminating the path to eternal peace	ወደ ዘላለማዊ ሰላም የሚወስደውን መንገድ የሚያበራ መለኮታዊ መብራት	ETERNAL_LIGHT	175.00	ETB	floating_lamp_illumination	12000	/assets/gifts/heavenly-lamp.svg	/assets/animations/floating-lamp-illumination.json	\N	t	4	f	0	0.00	{}	2025-12-03 13:02:40.314+03	2025-12-03 13:02:40.314+03
ceaab559-5198-489f-ab33-6f664bee2625	Sun of Memory	የመታሰቢያ ፀሐይ	Radiance of a life well-lived	በደንብ የተኖረ ህይወት ብርሃን	Brilliant sun representing the radiant impact of a meaningful life	ትርጉም ያለው ህይወት የሚያደርገውን ደማቅ ተጽዕኖ የሚወክል ደማቅ ፀሐይ	ETERNAL_LIGHT	200.00	ETB	rising_golden_sun	15000	/assets/gifts/sun-memory.svg	/assets/animations/rising-golden-sun.json	\N	t	5	t	0	0.00	{}	2025-12-03 13:02:40.314+03	2025-12-03 13:02:40.314+03
\.


--
-- Data for Name: gift_transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.gift_transactions (txn_id, sender_id, recipient_id, memorial_id, gift_id, wallet_txn_id, amount, platform_fee, net_amount, currency, message, message_amharic, sender_name, is_anonymous, status, animation_played, animation_played_at, is_featured_on_memorial, visibility, processed_at, refunded_at, refund_reason, metadata, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: memorial_comment_likes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.memorial_comment_likes (like_id, comment_id, user_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: memorial_comments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.memorial_comments (comment_id, memorial_id, user_id, message, likes_count, visibility, is_deleted, deleted_at, deleted_by, metadata, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: memorials; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.memorials (memorial_id, user_id, deceased_name, deceased_name_amharic, bio, bio_amharic, date_of_birth, date_of_death, place_of_birth, place_of_death, cause_of_death, profile_image, cover_image, gallery_images, visibility, paid_status, payment_txn_id, cultural_template, memorial_url, is_featured, featured_until, view_count, gift_count, total_gifts_value, is_active, review_status, is_hidden_by_admin, sensitivity_level, admin_notes, archived_at, archived_by, memorial_settings, comments_locked, admin_visibility, last_activity_at, seo_title, seo_description, seo_keywords, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (notification_id, user_id, type, title, message, data, is_read, read_at, priority, action_url, expires_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_items (item_id, order_id, product_id, product_name, product_description, product_image, unit_price, quantity, total_price, currency, customization_details, special_instructions, item_status, preparation_time, actual_preparation_time, is_gift, gift_message, gift_recipient, refund_amount, refund_reason, refunded_at, metadata, created_at, updated_at) FROM stdin;
aaaae1e6-f31b-4c67-b85c-350a3aa51039	3aff2275-5412-4adf-8dd1-b50c7b2fb8c8	91fcd5b1-c8bd-4e78-93b0-57d6f239347e	flower	aaaaaaaa	/uploads/products/1764762965446-cfaba42e8baaa92a.png	500.00	1	500.00	ETB	\N	\N	PENDING	\N	\N	f	\N	\N	\N	\N	\N	{}	2025-12-03 15:56:06.785+03	2025-12-03 15:56:06.785+03
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.orders (order_id, order_number, buyer_id, vendor_id, memorial_id, wallet_txn_id, status, subtotal, delivery_fee, platform_fee, total_amount, vendor_amount, currency, delivery_address, delivery_instructions, delivery_date, delivery_time_slot, customer_notes, vendor_notes, estimated_delivery, actual_delivery, tracking_number, delivery_person, payment_method, is_urgent, urgency_fee, cancellation_reason, cancelled_by, cancelled_at, refund_amount, refunded_at, rating, review, reviewed_at, status_history, metadata, created_at, updated_at) FROM stdin;
3aff2275-5412-4adf-8dd1-b50c7b2fb8c8	NFS2512032938	f1fe0344-3fdb-440a-acaa-1510ae33a1f3	17aff299-d772-4d74-b52f-293d2e577036	\N	2abfe8c5-5f61-4232-8b75-f83bc501a285	PENDING	500.00	0.00	25.00	5000.00	4975.00	ETB	{"city": "Addis Ababa", "street": "adddis"}	\N	\N	\N	Phone: +2519222222	\N	\N	\N	\N	\N	WALLET	f	0.00	\N	\N	\N	\N	\N	\N	\N	\N	[{"note": "Order created", "status": "PENDING", "timestamp": "2025-12-03T12:56:06.765Z"}]	{}	2025-12-03 15:56:06.765+03	2025-12-03 15:56:06.765+03
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (product_id, vendor_id, name, name_amharic, description, description_amharic, category, subcategory, price, currency, stock_quantity, track_inventory, low_stock_threshold, sku, barcode, weight, dimensions, main_image, gallery_images, is_featured, is_active, is_digital, requires_customization, customization_options, delivery_time, preparation_time, rating, total_reviews, total_sold, total_revenue, view_count, tags, seo_title, seo_description, seo_keywords, metadata, created_at, updated_at) FROM stdin;
e0c5ce97-f3d8-4ebc-aa85-f6a68d66408e	17aff299-d772-4d74-b52f-293d2e577036	testt	\N	aaaaaaaa	\N	PHOTOGRAPHY	\N	2000.00	ETB	10	t	5	PHO-344143-763	\N	\N	\N	\N	{}	f	f	f	f	{}	\N	\N	0.00	0	0	0.00	0	{}	\N	\N	\N	{"created_by_vendor": true, "moderation_status": "PENDING_REVIEW", "last_change_by_vendor_at": "2025-12-03T10:22:24.141Z"}	2025-12-03 13:22:24.142+03	2025-12-03 13:22:24.142+03
b566c71d-9bce-48cc-8069-423f130a5f14	17aff299-d772-4d74-b52f-293d2e577036	test2	\N	aaaaaaaaaaaaa	\N	TRANSPORT	\N	20000.00	ETB	4	t	5	TRA-058419-695	\N	\N	\N	\N	{}	t	t	f	f	{}	\N	\N	0.00	0	0	0.00	0	{}	\N	\N	\N	{"created_by_vendor": true, "moderation_status": "PENDING_REVIEW", "last_change_by_vendor_at": "2025-12-03T10:34:18.418Z"}	2025-12-03 13:34:18.418+03	2025-12-03 13:34:18.418+03
91fcd5b1-c8bd-4e78-93b0-57d6f239347e	17aff299-d772-4d74-b52f-293d2e577036	flower	\N	aaaaaaaa	\N	FLOWERS	\N	500.00	ETB	9	t	5	FLO-965469-779	\N	\N	\N	/uploads/products/1764762965446-cfaba42e8baaa92a.png	{}	t	t	f	f	{}	\N	\N	0.00	0	0	0.00	22	{}	\N	\N	\N	{"created_by_vendor": true, "moderation_status": "PENDING_REVIEW", "last_change_by_vendor_at": "2025-12-03T11:56:05.466Z"}	2025-12-03 14:56:05.468+03	2025-12-03 15:56:06.791+03
\.


--
-- Data for Name: reports; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reports (report_id, reporter_id, reported_user_id, memorial_id, comment_id, target_type, target_id, category, reason, status, severity, resolution, resolved_by, resolved_at, admin_notes, metadata, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: system_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.system_settings (setting_id, key, category, value, description, updated_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_status_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_status_history (id, user_id, changed_by, action, reason, note, previous_is_active, previous_is_banned, new_is_active, new_is_banned, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (user_id, name, username, email, phone, password, google_id, role, verified, email_verified, phone_verified, verification_token, reset_password_token, reset_password_expires, last_login, is_active, is_banned, can_create_memorials, can_comment, ban_reason, banned_at, banned_by, profile_image, bio, date_of_birth, gender, address, city, country, created_at, updated_at) FROM stdin;
911a3b55-1589-4408-b08e-5f4f005b5d00	sakka	testvendor1764761935681	\N	911234567	$2a$12$pB3loiH6/mu/uGMVIfHb6.IA6RwngYN2Yq6ZGxea0HvLEmliyBw.S	\N	Vendor	t	f	f	\N	\N	\N	\N	t	f	t	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	Ethiopia	2025-12-03 14:39:36.477+03	2025-12-03 14:39:36.477+03
912fac09-8d0f-4cfd-a63e-690ba7094d52	saka	saka@gmail.com	\N	+251911234567	$2a$12$iAbZDJpZY8n42wYmdQacxO8BbYEnLFHohwo9A/1P7mcuhygTIjjDW	\N	Vendor	t	f	f	\N	\N	\N	2025-12-03 14:57:56.479+03	t	f	t	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	Ethiopia	2025-12-03 13:05:02.286+03	2025-12-03 14:57:56.479+03
f1fe0344-3fdb-440a-acaa-1510ae33a1f3	cr7	\N	cr7@example.com	+251911111111	$2a$12$FW.Ym7BMmQwEQOwJW4dAoeAcToOW/.qy4X./LzUXxkdPrNXAqoX7a	\N	Public User	f	f	f	3f0c3a5aaeefd099a499ea88f1ff1407205038a2743778babc1fc0daa684fbfe	\N	\N	2025-12-03 14:58:06.886+03	t	f	t	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	Ethiopia	2025-12-03 13:23:43.719+03	2025-12-03 14:58:06.886+03
2f3710ee-9b80-498c-9b4a-5a1c46a8a34a	Super Admin	\N	founder@nefsyimar.com	\N	$2a$12$9onyJL5KFtY25ZCOr3w5oOD/qBVMH63uuuKoW8Ey3sJk/J2oo9r2S	\N	Administrator	t	t	f	\N	\N	\N	2025-12-03 15:56:26.419+03	t	f	t	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	Ethiopia	2025-12-03 13:04:18.679+03	2025-12-03 15:56:26.419+03
\.


--
-- Data for Name: vendor_locations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vendor_locations (location_id, vendor_id, shop_name, address_line_1, address_line_2, city, region, postal_code, country, latitude, longitude, phone, email, business_hours, delivery_radius_km, delivery_fee, free_delivery_minimum, delivery_time_estimate, accepts_online_orders, is_active, is_verified, verification_documents, shop_images, description, specialties, rating, review_count, total_orders, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: vendors; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vendors (vendor_id, user_id, business_name, business_name_amharic, business_description, business_description_amharic, service_type, business_license, tax_id, verification_status, verification_documents, verified_at, verified_by, rejection_reason, business_address, city, region, country, postal_code, phone, email, website, logo_url, cover_image_url, gallery_images, operating_hours, delivery_areas, delivery_fee, minimum_order, rating, total_reviews, total_orders, total_revenue, commission_rate, subscription_plan, subscription_expires_at, is_featured, featured_until, is_active, suspended_at, suspended_by, suspension_reason, settings, created_at, updated_at) FROM stdin;
abdd5068-91b0-4848-8318-986c9f7ccb36	911a3b55-1589-4408-b08e-5f4f005b5d00	sakka	\N	Test funeral home description	\N	FUNERAL_HOME	\N	\N	VERIFIED	{}	2025-12-03 14:39:36.777+03	2f3710ee-9b80-498c-9b4a-5a1c46a8a34a	\N	Test Address, Addis Ababa	Addis Ababa	Addis Ababa	Ethiopia	\N	911234567	\N	\N	/uploads/vendors/1764761976472-c71bdc5da50783b8.jpg	\N	{}	{}	{}	0.00	0.00	0.00	0	0	0.00	5.00	BASIC	\N	f	\N	t	\N	\N	\N	{"auto_accept_orders": false, "notification_preferences": {"reviews": true, "new_orders": true, "promotions": false, "order_updates": true}}	2025-12-03 14:39:36.777+03	2025-12-03 14:39:36.777+03
17aff299-d772-4d74-b52f-293d2e577036	912fac09-8d0f-4cfd-a63e-690ba7094d52	saka	\N	Test funeral home description	\N	FUNERAL_HOME	\N	\N	VERIFIED	{}	2025-12-03 13:05:02.568+03	2f3710ee-9b80-498c-9b4a-5a1c46a8a34a	\N	Test Address, Addis Ababa	Addis Ababa	Addis Ababa	Ethiopia	\N	+251911234567	\N	\N	\N	\N	{}	{}	{}	0.00	0.00	0.00	0	1	4975.00	5.00	BASIC	\N	f	\N	t	\N	\N	\N	{"auto_accept_orders": false, "notification_preferences": {"reviews": true, "new_orders": true, "promotions": false, "order_updates": true}}	2025-12-03 13:05:02.569+03	2025-12-03 15:56:06.846+03
\.


--
-- Data for Name: wallet_transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.wallet_transactions (txn_id, wallet_id, user_id, amount, type, status, description, reference_id, reference_type, payment_method, external_txn_id, balance_before, balance_after, fee_amount, net_amount, processed_at, processed_by, metadata, created_at, updated_at) FROM stdin;
deb39c68-b3f7-4820-b195-6d7ac391d92c	725bc0a4-2b04-4c9c-959c-875fd13ff0b0	f1fe0344-3fdb-440a-acaa-1510ae33a1f3	40000.00	DEPOSIT	COMPLETED	Deposit via TELEBIRR	\N	\N	TELEBIRR	TB_1764763200693_c79db31e	0.00	40000.00	0.00	40000.00	2025-12-03 15:00:00.693+03	\N	\N	2025-12-03 15:00:00.694+03	2025-12-03 15:00:00.694+03
2abfe8c5-5f61-4232-8b75-f83bc501a285	725bc0a4-2b04-4c9c-959c-875fd13ff0b0	f1fe0344-3fdb-440a-acaa-1510ae33a1f3	-5000.00	MARKETPLACE_PURCHASE	COMPLETED	Order from saka	3aff2275-5412-4adf-8dd1-b50c7b2fb8c8	ORDER	\N	\N	40000.00	35000.00	25.00	-5000.00	2025-12-03 15:56:06.754+03	\N	\N	2025-12-03 15:56:06.755+03	2025-12-03 15:56:06.783+03
\.


--
-- Data for Name: wallets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.wallets (wallet_id, user_id, balance, currency, is_frozen, frozen_reason, frozen_at, frozen_by, total_deposited, total_spent, last_transaction_at, created_at, updated_at) FROM stdin;
50fc18af-0a40-4ae6-9e71-60f1cb73cf0e	2f3710ee-9b80-498c-9b4a-5a1c46a8a34a	0.00	ETB	f	\N	\N	\N	0.00	0.00	\N	2025-12-03 13:04:18.981+03	2025-12-03 13:04:18.981+03
725bc0a4-2b04-4c9c-959c-875fd13ff0b0	f1fe0344-3fdb-440a-acaa-1510ae33a1f3	35000.00	ETB	f	\N	\N	\N	40000.00	5000.00	2025-12-03 15:56:06.843+03	2025-12-03 13:23:44.008+03	2025-12-03 15:56:06.843+03
\.


--
-- Name: SequelizeMeta SequelizeMeta_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SequelizeMeta"
    ADD CONSTRAINT "SequelizeMeta_pkey" PRIMARY KEY (name);


--
-- Name: admin_action_logs admin_action_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_action_logs
    ADD CONSTRAINT admin_action_logs_pkey PRIMARY KEY (log_id);


--
-- Name: admin_vendors admin_vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_vendors
    ADD CONSTRAINT admin_vendors_pkey PRIMARY KEY (vendor_id);


--
-- Name: admin_vendors admin_vendors_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_vendors
    ADD CONSTRAINT admin_vendors_user_id_key UNIQUE (user_id);


--
-- Name: appeals appeals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appeals
    ADD CONSTRAINT appeals_pkey PRIMARY KEY (appeal_id);


--
-- Name: delivery_zones delivery_zones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_zones
    ADD CONSTRAINT delivery_zones_pkey PRIMARY KEY (zone_id);


--
-- Name: disputes disputes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT disputes_pkey PRIMARY KEY (dispute_id);


--
-- Name: fee_configs fee_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fee_configs
    ADD CONSTRAINT fee_configs_pkey PRIMARY KEY (config_id);


--
-- Name: gift_catalog gift_catalog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gift_catalog
    ADD CONSTRAINT gift_catalog_pkey PRIMARY KEY (gift_id);


--
-- Name: gift_transactions gift_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gift_transactions
    ADD CONSTRAINT gift_transactions_pkey PRIMARY KEY (txn_id);


--
-- Name: memorial_comment_likes memorial_comment_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memorial_comment_likes
    ADD CONSTRAINT memorial_comment_likes_pkey PRIMARY KEY (like_id);


--
-- Name: memorial_comments memorial_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memorial_comments
    ADD CONSTRAINT memorial_comments_pkey PRIMARY KEY (comment_id);


--
-- Name: memorials memorials_memorial_url_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memorials
    ADD CONSTRAINT memorials_memorial_url_key UNIQUE (memorial_url);


--
-- Name: memorials memorials_memorial_url_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memorials
    ADD CONSTRAINT memorials_memorial_url_key1 UNIQUE (memorial_url);


--
-- Name: memorials memorials_memorial_url_key10; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memorials
    ADD CONSTRAINT memorials_memorial_url_key10 UNIQUE (memorial_url);


--
-- Name: memorials memorials_memorial_url_key11; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memorials
    ADD CONSTRAINT memorials_memorial_url_key11 UNIQUE (memorial_url);


--
-- Name: memorials memorials_memorial_url_key2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memorials
    ADD CONSTRAINT memorials_memorial_url_key2 UNIQUE (memorial_url);


--
-- Name: memorials memorials_memorial_url_key3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memorials
    ADD CONSTRAINT memorials_memorial_url_key3 UNIQUE (memorial_url);


--
-- Name: memorials memorials_memorial_url_key4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memorials
    ADD CONSTRAINT memorials_memorial_url_key4 UNIQUE (memorial_url);


--
-- Name: memorials memorials_memorial_url_key5; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memorials
    ADD CONSTRAINT memorials_memorial_url_key5 UNIQUE (memorial_url);


--
-- Name: memorials memorials_memorial_url_key6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memorials
    ADD CONSTRAINT memorials_memorial_url_key6 UNIQUE (memorial_url);


--
-- Name: memorials memorials_memorial_url_key7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memorials
    ADD CONSTRAINT memorials_memorial_url_key7 UNIQUE (memorial_url);


--
-- Name: memorials memorials_memorial_url_key8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memorials
    ADD CONSTRAINT memorials_memorial_url_key8 UNIQUE (memorial_url);


--
-- Name: memorials memorials_memorial_url_key9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memorials
    ADD CONSTRAINT memorials_memorial_url_key9 UNIQUE (memorial_url);


--
-- Name: memorials memorials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memorials
    ADD CONSTRAINT memorials_pkey PRIMARY KEY (memorial_id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (notification_id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (item_id);


--
-- Name: orders orders_order_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);


--
-- Name: orders orders_order_number_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_key1 UNIQUE (order_number);


--
-- Name: orders orders_order_number_key10; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_key10 UNIQUE (order_number);


--
-- Name: orders orders_order_number_key11; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_key11 UNIQUE (order_number);


--
-- Name: orders orders_order_number_key2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_key2 UNIQUE (order_number);


--
-- Name: orders orders_order_number_key3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_key3 UNIQUE (order_number);


--
-- Name: orders orders_order_number_key4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_key4 UNIQUE (order_number);


--
-- Name: orders orders_order_number_key5; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_key5 UNIQUE (order_number);


--
-- Name: orders orders_order_number_key6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_key6 UNIQUE (order_number);


--
-- Name: orders orders_order_number_key7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_key7 UNIQUE (order_number);


--
-- Name: orders orders_order_number_key8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_key8 UNIQUE (order_number);


--
-- Name: orders orders_order_number_key9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_key9 UNIQUE (order_number);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (order_id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (product_id);


--
-- Name: products products_sku_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key UNIQUE (sku);


--
-- Name: products products_sku_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key1 UNIQUE (sku);


--
-- Name: products products_sku_key10; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key10 UNIQUE (sku);


--
-- Name: products products_sku_key11; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key11 UNIQUE (sku);


--
-- Name: products products_sku_key2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key2 UNIQUE (sku);


--
-- Name: products products_sku_key3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key3 UNIQUE (sku);


--
-- Name: products products_sku_key4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key4 UNIQUE (sku);


--
-- Name: products products_sku_key5; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key5 UNIQUE (sku);


--
-- Name: products products_sku_key6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key6 UNIQUE (sku);


--
-- Name: products products_sku_key7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key7 UNIQUE (sku);


--
-- Name: products products_sku_key8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key8 UNIQUE (sku);


--
-- Name: products products_sku_key9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key9 UNIQUE (sku);


--
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (report_id);


--
-- Name: system_settings system_settings_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_key_key UNIQUE (key);


--
-- Name: system_settings system_settings_key_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_key_key1 UNIQUE (key);


--
-- Name: system_settings system_settings_key_key10; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_key_key10 UNIQUE (key);


--
-- Name: system_settings system_settings_key_key11; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_key_key11 UNIQUE (key);


--
-- Name: system_settings system_settings_key_key2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_key_key2 UNIQUE (key);


--
-- Name: system_settings system_settings_key_key3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_key_key3 UNIQUE (key);


--
-- Name: system_settings system_settings_key_key4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_key_key4 UNIQUE (key);


--
-- Name: system_settings system_settings_key_key5; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_key_key5 UNIQUE (key);


--
-- Name: system_settings system_settings_key_key6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_key_key6 UNIQUE (key);


--
-- Name: system_settings system_settings_key_key7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_key_key7 UNIQUE (key);


--
-- Name: system_settings system_settings_key_key8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_key_key8 UNIQUE (key);


--
-- Name: system_settings system_settings_key_key9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_key_key9 UNIQUE (key);


--
-- Name: system_settings system_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_pkey PRIMARY KEY (setting_id);


--
-- Name: user_status_history user_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_status_history
    ADD CONSTRAINT user_status_history_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_email_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key1 UNIQUE (email);


--
-- Name: users users_email_key10; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key10 UNIQUE (email);


--
-- Name: users users_email_key11; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key11 UNIQUE (email);


--
-- Name: users users_email_key2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key2 UNIQUE (email);


--
-- Name: users users_email_key3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key3 UNIQUE (email);


--
-- Name: users users_email_key4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key4 UNIQUE (email);


--
-- Name: users users_email_key5; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key5 UNIQUE (email);


--
-- Name: users users_email_key6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key6 UNIQUE (email);


--
-- Name: users users_email_key7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key7 UNIQUE (email);


--
-- Name: users users_email_key8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key8 UNIQUE (email);


--
-- Name: users users_email_key9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key9 UNIQUE (email);


--
-- Name: users users_google_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_google_id_key UNIQUE (google_id);


--
-- Name: users users_google_id_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_google_id_key1 UNIQUE (google_id);


--
-- Name: users users_google_id_key10; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_google_id_key10 UNIQUE (google_id);


--
-- Name: users users_google_id_key11; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_google_id_key11 UNIQUE (google_id);


--
-- Name: users users_google_id_key2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_google_id_key2 UNIQUE (google_id);


--
-- Name: users users_google_id_key3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_google_id_key3 UNIQUE (google_id);


--
-- Name: users users_google_id_key4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_google_id_key4 UNIQUE (google_id);


--
-- Name: users users_google_id_key5; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_google_id_key5 UNIQUE (google_id);


--
-- Name: users users_google_id_key6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_google_id_key6 UNIQUE (google_id);


--
-- Name: users users_google_id_key7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_google_id_key7 UNIQUE (google_id);


--
-- Name: users users_google_id_key8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_google_id_key8 UNIQUE (google_id);


--
-- Name: users users_google_id_key9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_google_id_key9 UNIQUE (google_id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_phone_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_key1 UNIQUE (phone);


--
-- Name: users users_phone_key10; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_key10 UNIQUE (phone);


--
-- Name: users users_phone_key11; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_key11 UNIQUE (phone);


--
-- Name: users users_phone_key2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_key2 UNIQUE (phone);


--
-- Name: users users_phone_key3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_key3 UNIQUE (phone);


--
-- Name: users users_phone_key4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_key4 UNIQUE (phone);


--
-- Name: users users_phone_key5; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_key5 UNIQUE (phone);


--
-- Name: users users_phone_key6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_key6 UNIQUE (phone);


--
-- Name: users users_phone_key7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_key7 UNIQUE (phone);


--
-- Name: users users_phone_key8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_key8 UNIQUE (phone);


--
-- Name: users users_phone_key9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_key9 UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: users users_username_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key1 UNIQUE (username);


--
-- Name: users users_username_key10; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key10 UNIQUE (username);


--
-- Name: users users_username_key11; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key11 UNIQUE (username);


--
-- Name: users users_username_key2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key2 UNIQUE (username);


--
-- Name: users users_username_key3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key3 UNIQUE (username);


--
-- Name: users users_username_key4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key4 UNIQUE (username);


--
-- Name: users users_username_key5; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key5 UNIQUE (username);


--
-- Name: users users_username_key6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key6 UNIQUE (username);


--
-- Name: users users_username_key7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key7 UNIQUE (username);


--
-- Name: users users_username_key8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key8 UNIQUE (username);


--
-- Name: users users_username_key9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key9 UNIQUE (username);


--
-- Name: vendor_locations vendor_locations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_locations
    ADD CONSTRAINT vendor_locations_pkey PRIMARY KEY (location_id);


--
-- Name: vendors vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (vendor_id);


--
-- Name: vendors vendors_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_user_id_key UNIQUE (user_id);


--
-- Name: wallet_transactions wallet_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT wallet_transactions_pkey PRIMARY KEY (txn_id);


--
-- Name: wallets wallets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_pkey PRIMARY KEY (wallet_id);


--
-- Name: wallets wallets_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_user_id_key UNIQUE (user_id);


--
-- Name: admin_action_logs_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX admin_action_logs_action ON public.admin_action_logs USING btree (action);


--
-- Name: admin_action_logs_admin_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX admin_action_logs_admin_id ON public.admin_action_logs USING btree (admin_id);


--
-- Name: admin_action_logs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX admin_action_logs_created_at ON public.admin_action_logs USING btree (created_at);


--
-- Name: admin_action_logs_target_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX admin_action_logs_target_type ON public.admin_action_logs USING btree (target_type);


--
-- Name: admin_vendors_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX admin_vendors_created_by ON public.admin_vendors USING btree (created_by);


--
-- Name: admin_vendors_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX admin_vendors_is_active ON public.admin_vendors USING btree (is_active);


--
-- Name: admin_vendors_service_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX admin_vendors_service_type ON public.admin_vendors USING btree (service_type);


--
-- Name: admin_vendors_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX admin_vendors_user_id ON public.admin_vendors USING btree (user_id);


--
-- Name: appeals_assigned_to; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX appeals_assigned_to ON public.appeals USING btree (assigned_to);


--
-- Name: appeals_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX appeals_status ON public.appeals USING btree (status);


--
-- Name: appeals_target_type_target_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX appeals_target_type_target_id ON public.appeals USING btree (target_type, target_id);


--
-- Name: appeals_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX appeals_user_id ON public.appeals USING btree (user_id);


--
-- Name: delivery_zones_city; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX delivery_zones_city ON public.delivery_zones USING btree (city);


--
-- Name: delivery_zones_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX delivery_zones_is_active ON public.delivery_zones USING btree (is_active);


--
-- Name: delivery_zones_region; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX delivery_zones_region ON public.delivery_zones USING btree (region);


--
-- Name: delivery_zones_vendor_location_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX delivery_zones_vendor_location_id ON public.delivery_zones USING btree (vendor_location_id);


--
-- Name: disputes_assigned_to; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX disputes_assigned_to ON public.disputes USING btree (assigned_to);


--
-- Name: disputes_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX disputes_order_id ON public.disputes USING btree (order_id);


--
-- Name: disputes_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX disputes_status ON public.disputes USING btree (status);


--
-- Name: fee_configs_effective_from; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX fee_configs_effective_from ON public.fee_configs USING btree (effective_from);


--
-- Name: fee_configs_scope; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX fee_configs_scope ON public.fee_configs USING btree (scope);


--
-- Name: fee_configs_service_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX fee_configs_service_type ON public.fee_configs USING btree (service_type);


--
-- Name: fee_configs_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX fee_configs_type ON public.fee_configs USING btree (type);


--
-- Name: gift_catalog_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX gift_catalog_category ON public.gift_catalog USING btree (category);


--
-- Name: gift_catalog_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX gift_catalog_is_active ON public.gift_catalog USING btree (is_active);


--
-- Name: gift_catalog_is_featured; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX gift_catalog_is_featured ON public.gift_catalog USING btree (is_featured);


--
-- Name: gift_catalog_sort_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX gift_catalog_sort_order ON public.gift_catalog USING btree (sort_order);


--
-- Name: gift_catalog_value; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX gift_catalog_value ON public.gift_catalog USING btree (value);


--
-- Name: gift_transactions_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX gift_transactions_created_at ON public.gift_transactions USING btree (created_at);


--
-- Name: gift_transactions_gift_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX gift_transactions_gift_id ON public.gift_transactions USING btree (gift_id);


--
-- Name: gift_transactions_is_featured_on_memorial; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX gift_transactions_is_featured_on_memorial ON public.gift_transactions USING btree (is_featured_on_memorial);


--
-- Name: gift_transactions_memorial_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX gift_transactions_memorial_id ON public.gift_transactions USING btree (memorial_id);


--
-- Name: gift_transactions_recipient_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX gift_transactions_recipient_id ON public.gift_transactions USING btree (recipient_id);


--
-- Name: gift_transactions_sender_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX gift_transactions_sender_id ON public.gift_transactions USING btree (sender_id);


--
-- Name: gift_transactions_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX gift_transactions_status ON public.gift_transactions USING btree (status);


--
-- Name: gift_transactions_visibility; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX gift_transactions_visibility ON public.gift_transactions USING btree (visibility);


--
-- Name: gift_transactions_wallet_txn_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX gift_transactions_wallet_txn_id ON public.gift_transactions USING btree (wallet_txn_id);


--
-- Name: memorial_comment_likes_comment_id_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX memorial_comment_likes_comment_id_user_id ON public.memorial_comment_likes USING btree (comment_id, user_id);


--
-- Name: memorial_comment_likes_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX memorial_comment_likes_user_id ON public.memorial_comment_likes USING btree (user_id);


--
-- Name: memorial_comments_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX memorial_comments_created_at ON public.memorial_comments USING btree (created_at);


--
-- Name: memorial_comments_is_deleted; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX memorial_comments_is_deleted ON public.memorial_comments USING btree (is_deleted);


--
-- Name: memorial_comments_memorial_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX memorial_comments_memorial_id ON public.memorial_comments USING btree (memorial_id);


--
-- Name: memorial_comments_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX memorial_comments_user_id ON public.memorial_comments USING btree (user_id);


--
-- Name: memorial_comments_visibility; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX memorial_comments_visibility ON public.memorial_comments USING btree (visibility);


--
-- Name: memorials_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX memorials_created_at ON public.memorials USING btree (created_at);


--
-- Name: memorials_deceased_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX memorials_deceased_name ON public.memorials USING btree (deceased_name);


--
-- Name: memorials_gift_count; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX memorials_gift_count ON public.memorials USING btree (gift_count);


--
-- Name: memorials_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX memorials_is_active ON public.memorials USING btree (is_active);


--
-- Name: memorials_is_featured; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX memorials_is_featured ON public.memorials USING btree (is_featured);


--
-- Name: memorials_last_activity_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX memorials_last_activity_at ON public.memorials USING btree (last_activity_at);


--
-- Name: memorials_memorial_url; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX memorials_memorial_url ON public.memorials USING btree (memorial_url) WHERE (memorial_url IS NOT NULL);


--
-- Name: memorials_paid_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX memorials_paid_status ON public.memorials USING btree (paid_status);


--
-- Name: memorials_review_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX memorials_review_status ON public.memorials USING btree (review_status);


--
-- Name: memorials_sensitivity_level; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX memorials_sensitivity_level ON public.memorials USING btree (sensitivity_level);


--
-- Name: memorials_total_gifts_value; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX memorials_total_gifts_value ON public.memorials USING btree (total_gifts_value);


--
-- Name: memorials_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX memorials_user_id ON public.memorials USING btree (user_id);


--
-- Name: memorials_view_count; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX memorials_view_count ON public.memorials USING btree (view_count);


--
-- Name: memorials_visibility; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX memorials_visibility ON public.memorials USING btree (visibility);


--
-- Name: notifications_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notifications_created_at ON public.notifications USING btree (created_at);


--
-- Name: notifications_expires_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notifications_expires_at ON public.notifications USING btree (expires_at);


--
-- Name: notifications_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notifications_type ON public.notifications USING btree (type);


--
-- Name: notifications_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notifications_user_id ON public.notifications USING btree (user_id);


--
-- Name: notifications_user_id_is_read; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notifications_user_id_is_read ON public.notifications USING btree (user_id, is_read);


--
-- Name: order_items_item_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX order_items_item_status ON public.order_items USING btree (item_status);


--
-- Name: order_items_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX order_items_order_id ON public.order_items USING btree (order_id);


--
-- Name: order_items_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX order_items_product_id ON public.order_items USING btree (product_id);


--
-- Name: orders_buyer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_buyer_id ON public.orders USING btree (buyer_id);


--
-- Name: orders_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_created_at ON public.orders USING btree (created_at);


--
-- Name: orders_delivery_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_delivery_date ON public.orders USING btree (delivery_date);


--
-- Name: orders_memorial_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_memorial_id ON public.orders USING btree (memorial_id);


--
-- Name: orders_order_number; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX orders_order_number ON public.orders USING btree (order_number);


--
-- Name: orders_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_status ON public.orders USING btree (status);


--
-- Name: orders_vendor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_vendor_id ON public.orders USING btree (vendor_id);


--
-- Name: products_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_category ON public.products USING btree (category);


--
-- Name: products_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_is_active ON public.products USING btree (is_active);


--
-- Name: products_is_featured; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_is_featured ON public.products USING btree (is_featured);


--
-- Name: products_price; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_price ON public.products USING btree (price);


--
-- Name: products_rating; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_rating ON public.products USING btree (rating);


--
-- Name: products_sku; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX products_sku ON public.products USING btree (sku) WHERE (sku IS NOT NULL);


--
-- Name: products_total_sold; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_total_sold ON public.products USING btree (total_sold);


--
-- Name: products_vendor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_vendor_id ON public.products USING btree (vendor_id);


--
-- Name: reports_comment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reports_comment_id ON public.reports USING btree (comment_id);


--
-- Name: reports_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reports_created_at ON public.reports USING btree (created_at);


--
-- Name: reports_memorial_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reports_memorial_id ON public.reports USING btree (memorial_id);


--
-- Name: reports_severity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reports_severity ON public.reports USING btree (severity);


--
-- Name: reports_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reports_status ON public.reports USING btree (status);


--
-- Name: reports_target_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reports_target_type ON public.reports USING btree (target_type);


--
-- Name: system_settings_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX system_settings_category ON public.system_settings USING btree (category);


--
-- Name: system_settings_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX system_settings_key ON public.system_settings USING btree (key);


--
-- Name: users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email ON public.users USING btree (email) WHERE (email IS NOT NULL);


--
-- Name: users_phone; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_phone ON public.users USING btree (phone) WHERE (phone IS NOT NULL);


--
-- Name: vendor_locations_city; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX vendor_locations_city ON public.vendor_locations USING btree (city);


--
-- Name: vendor_locations_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX vendor_locations_is_active ON public.vendor_locations USING btree (is_active);


--
-- Name: vendor_locations_is_verified; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX vendor_locations_is_verified ON public.vendor_locations USING btree (is_verified);


--
-- Name: vendor_locations_latitude_longitude; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX vendor_locations_latitude_longitude ON public.vendor_locations USING btree (latitude, longitude);


--
-- Name: vendor_locations_region; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX vendor_locations_region ON public.vendor_locations USING btree (region);


--
-- Name: vendor_locations_vendor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX vendor_locations_vendor_id ON public.vendor_locations USING btree (vendor_id);


--
-- Name: vendors_city; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX vendors_city ON public.vendors USING btree (city);


--
-- Name: vendors_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX vendors_is_active ON public.vendors USING btree (is_active);


--
-- Name: vendors_is_featured; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX vendors_is_featured ON public.vendors USING btree (is_featured);


--
-- Name: vendors_rating; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX vendors_rating ON public.vendors USING btree (rating);


--
-- Name: vendors_service_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX vendors_service_type ON public.vendors USING btree (service_type);


--
-- Name: vendors_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX vendors_user_id ON public.vendors USING btree (user_id);


--
-- Name: vendors_verification_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX vendors_verification_status ON public.vendors USING btree (verification_status);


--
-- Name: wallet_transactions_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX wallet_transactions_created_at ON public.wallet_transactions USING btree (created_at);


--
-- Name: wallet_transactions_external_txn_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX wallet_transactions_external_txn_id ON public.wallet_transactions USING btree (external_txn_id);


--
-- Name: wallet_transactions_reference_id_reference_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX wallet_transactions_reference_id_reference_type ON public.wallet_transactions USING btree (reference_id, reference_type);


--
-- Name: wallet_transactions_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX wallet_transactions_status ON public.wallet_transactions USING btree (status);


--
-- Name: wallet_transactions_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX wallet_transactions_type ON public.wallet_transactions USING btree (type);


--
-- Name: wallet_transactions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX wallet_transactions_user_id ON public.wallet_transactions USING btree (user_id);


--
-- Name: wallet_transactions_wallet_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX wallet_transactions_wallet_id ON public.wallet_transactions USING btree (wallet_id);


--
-- Name: wallets_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX wallets_user_id ON public.wallets USING btree (user_id);


--
-- Name: admin_action_logs admin_action_logs_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_action_logs
    ADD CONSTRAINT admin_action_logs_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: admin_vendors admin_vendors_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_vendors
    ADD CONSTRAINT admin_vendors_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(user_id) ON UPDATE CASCADE;


--
-- Name: admin_vendors admin_vendors_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_vendors
    ADD CONSTRAINT admin_vendors_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: appeals appeals_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appeals
    ADD CONSTRAINT appeals_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: appeals appeals_decided_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appeals
    ADD CONSTRAINT appeals_decided_by_fkey FOREIGN KEY (decided_by) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: appeals appeals_related_dispute_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appeals
    ADD CONSTRAINT appeals_related_dispute_id_fkey FOREIGN KEY (related_dispute_id) REFERENCES public.disputes(dispute_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: appeals appeals_related_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appeals
    ADD CONSTRAINT appeals_related_report_id_fkey FOREIGN KEY (related_report_id) REFERENCES public.reports(report_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: appeals appeals_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appeals
    ADD CONSTRAINT appeals_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: delivery_zones delivery_zones_vendor_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_zones
    ADD CONSTRAINT delivery_zones_vendor_location_id_fkey FOREIGN KEY (vendor_location_id) REFERENCES public.vendor_locations(location_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: disputes disputes_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT disputes_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: disputes disputes_closed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT disputes_closed_by_fkey FOREIGN KEY (closed_by) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: disputes disputes_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT disputes_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: disputes disputes_raised_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT disputes_raised_by_fkey FOREIGN KEY (raised_by) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: fee_configs fee_configs_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fee_configs
    ADD CONSTRAINT fee_configs_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: gift_transactions gift_transactions_gift_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gift_transactions
    ADD CONSTRAINT gift_transactions_gift_id_fkey FOREIGN KEY (gift_id) REFERENCES public.gift_catalog(gift_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: gift_transactions gift_transactions_memorial_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gift_transactions
    ADD CONSTRAINT gift_transactions_memorial_id_fkey FOREIGN KEY (memorial_id) REFERENCES public.memorials(memorial_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: gift_transactions gift_transactions_recipient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gift_transactions
    ADD CONSTRAINT gift_transactions_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: gift_transactions gift_transactions_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gift_transactions
    ADD CONSTRAINT gift_transactions_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: gift_transactions gift_transactions_wallet_txn_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gift_transactions
    ADD CONSTRAINT gift_transactions_wallet_txn_id_fkey FOREIGN KEY (wallet_txn_id) REFERENCES public.wallet_transactions(txn_id) ON UPDATE CASCADE;


--
-- Name: memorial_comment_likes memorial_comment_likes_comment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memorial_comment_likes
    ADD CONSTRAINT memorial_comment_likes_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.memorial_comments(comment_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: memorial_comment_likes memorial_comment_likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memorial_comment_likes
    ADD CONSTRAINT memorial_comment_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE;


--
-- Name: memorial_comments memorial_comments_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memorial_comments
    ADD CONSTRAINT memorial_comments_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: memorial_comments memorial_comments_memorial_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memorial_comments
    ADD CONSTRAINT memorial_comments_memorial_id_fkey FOREIGN KEY (memorial_id) REFERENCES public.memorials(memorial_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: memorial_comments memorial_comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memorial_comments
    ADD CONSTRAINT memorial_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE;


--
-- Name: memorials memorials_archived_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memorials
    ADD CONSTRAINT memorials_archived_by_fkey FOREIGN KEY (archived_by) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: memorials memorials_payment_txn_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memorials
    ADD CONSTRAINT memorials_payment_txn_id_fkey FOREIGN KEY (payment_txn_id) REFERENCES public.wallet_transactions(txn_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: memorials memorials_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.memorials
    ADD CONSTRAINT memorials_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: orders orders_buyer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: orders orders_cancelled_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_cancelled_by_fkey FOREIGN KEY (cancelled_by) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: orders orders_memorial_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_memorial_id_fkey FOREIGN KEY (memorial_id) REFERENCES public.memorials(memorial_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: orders orders_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(vendor_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: orders orders_wallet_txn_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_wallet_txn_id_fkey FOREIGN KEY (wallet_txn_id) REFERENCES public.wallet_transactions(txn_id) ON UPDATE CASCADE;


--
-- Name: products products_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(vendor_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reports reports_comment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.memorial_comments(comment_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: reports reports_memorial_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_memorial_id_fkey FOREIGN KEY (memorial_id) REFERENCES public.memorials(memorial_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reports reports_reported_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_reported_user_id_fkey FOREIGN KEY (reported_user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: reports reports_reporter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reports reports_resolved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES public.users(user_id);


--
-- Name: system_settings system_settings_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: user_status_history user_status_history_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_status_history
    ADD CONSTRAINT user_status_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.users(user_id) ON UPDATE CASCADE;


--
-- Name: user_status_history user_status_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_status_history
    ADD CONSTRAINT user_status_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: users users_banned_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_banned_by_fkey FOREIGN KEY (banned_by) REFERENCES public.users(user_id);


--
-- Name: vendors vendors_suspended_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_suspended_by_fkey FOREIGN KEY (suspended_by) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: vendors vendors_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: vendors vendors_verified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: wallet_transactions wallet_transactions_processed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT wallet_transactions_processed_by_fkey FOREIGN KEY (processed_by) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: wallet_transactions wallet_transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT wallet_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: wallet_transactions wallet_transactions_wallet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT wallet_transactions_wallet_id_fkey FOREIGN KEY (wallet_id) REFERENCES public.wallets(wallet_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: wallets wallets_frozen_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_frozen_by_fkey FOREIGN KEY (frozen_by) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: wallets wallets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

