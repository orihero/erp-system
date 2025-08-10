--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: enum_directory_fields_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_directory_fields_type AS ENUM (
    'text',
    'file',
    'bool',
    'date',
    'time',
    'datetime',
    'json',
    'relation',
    'decimal',
    'integer',
    'number',
    'string',
    'email',
    'tel',
    'select',
    'textarea'
);


--
-- Name: enum_permissions_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_permissions_type AS ENUM (
    'read',
    'write',
    'manage'
);


--
-- Name: enum_receipts_payment_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_receipts_payment_status AS ENUM (
    'paid',
    'pending'
);


--
-- Name: enum_report_execution_history_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_report_execution_history_status AS ENUM (
    'pending',
    'running',
    'completed',
    'failed',
    'cancelled'
);


--
-- Name: enum_report_structures_templateType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_report_structures_templateType" AS ENUM (
    'tabular',
    'chart',
    'dashboard',
    'document'
);


--
-- Name: enum_report_template_bindings_accessLevel; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_report_template_bindings_accessLevel" AS ENUM (
    'read',
    'execute',
    'modify',
    'admin'
);


--
-- Name: enum_report_template_bindings_bindingType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_report_template_bindings_bindingType" AS ENUM (
    'company',
    'module',
    'company_module',
    'global'
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
-- Name: companies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.companies (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    admin_email character varying(255),
    employee_count character varying(255),
    status character varying(255) DEFAULT 'active'::character varying,
    logo character varying(255),
    address text,
    description text,
    website character varying(255),
    phone character varying(255),
    tax_id character varying(255),
    registration_number character varying(255),
    industry character varying(255),
    founded_year integer,
    contacts jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    parent_company_id uuid
);


--
-- Name: company_directories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.company_directories (
    id uuid NOT NULL,
    company_id uuid,
    directory_id uuid,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    module_id uuid
);


--
-- Name: company_modules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.company_modules (
    id uuid NOT NULL,
    company_id uuid NOT NULL,
    module_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    is_enabled boolean DEFAULT false NOT NULL
);


--
-- Name: directories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.directories (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    icon_name character varying(255) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    directory_type character varying(255) DEFAULT 'Company'::character varying NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb
);


--
-- Name: COLUMN directories.metadata; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.directories.metadata IS 'Directory metadata such as settings, component to render, etc.';


--
-- Name: directory_fields; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.directory_fields (
    id uuid NOT NULL,
    directory_id uuid,
    name character varying(255) NOT NULL,
    type public.enum_directory_fields_type NOT NULL,
    required boolean DEFAULT false NOT NULL,
    relation_id uuid,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb
);


--
-- Name: COLUMN directory_fields.metadata; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.directory_fields.metadata IS 'Field metadata such as isVisibleOnTable, fieldOrder, etc.';


--
-- Name: directory_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.directory_records (
    id uuid NOT NULL,
    company_directory_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb
);


--
-- Name: COLUMN directory_records.metadata; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.directory_records.metadata IS 'Record metadata such as cascading configurations, parent field info, etc.';


--
-- Name: directory_values; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.directory_values (
    id uuid NOT NULL,
    field_id uuid,
    value text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    directory_record_id uuid NOT NULL
);


--
-- Name: modules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.modules (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    description character varying(255),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    icon_name character varying(255) DEFAULT 'cube'::character varying NOT NULL
);


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.permissions (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    description character varying(255),
    type character varying(255) NOT NULL,
    module_id uuid,
    directory_id uuid,
    effective_from timestamp with time zone,
    effective_until timestamp with time zone,
    constraint_data jsonb,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: receipts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.receipts (
    id uuid NOT NULL,
    invoice_number character varying(50) NOT NULL,
    date date NOT NULL,
    product_name character varying(255) NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    payment_status public.enum_receipts_payment_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: report_execution_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.report_execution_history (
    id uuid NOT NULL,
    "reportStructureId" uuid NOT NULL,
    parameters jsonb DEFAULT '{}'::jsonb,
    status public.enum_report_execution_history_status DEFAULT 'pending'::public.enum_report_execution_history_status NOT NULL,
    "outputPath" character varying(255),
    "outputFormat" character varying(255),
    "executionTime" integer,
    "errorMessage" text,
    "executedBy" uuid NOT NULL,
    "startedAt" timestamp with time zone,
    "completedAt" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: report_structures; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.report_structures (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    "univerData" jsonb NOT NULL,
    "reportStructureData" jsonb NOT NULL,
    "createdBy" uuid,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    category character varying(255) DEFAULT 'custom'::character varying NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "templateType" public."enum_report_structures_templateType" DEFAULT 'tabular'::public."enum_report_structures_templateType" NOT NULL,
    tags character varying(255)[] DEFAULT (ARRAY[]::character varying[])::character varying(255)[],
    "dataSourceConfig" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "layoutConfig" jsonb DEFAULT '{"sections": []}'::jsonb NOT NULL,
    "parametersConfig" jsonb DEFAULT '[]'::jsonb,
    "outputConfig" jsonb DEFAULT '{"formats": ["pdf"], "scheduling": {"enabled": false}, "distribution": {"enabled": false}}'::jsonb NOT NULL,
    "updatedBy" uuid,
    "estimatedUsageFrequency" character varying(255),
    "targetAudience" character varying(255),
    "businessPurpose" text,
    "complianceRequirements" text
);


--
-- Name: report_template_bindings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.report_template_bindings (
    id uuid NOT NULL,
    "reportStructureId" uuid NOT NULL,
    "companyId" uuid,
    "moduleId" uuid,
    "bindingType" public."enum_report_template_bindings_bindingType" DEFAULT 'company'::public."enum_report_template_bindings_bindingType" NOT NULL,
    "accessLevel" public."enum_report_template_bindings_accessLevel" DEFAULT 'execute'::public."enum_report_template_bindings_accessLevel" NOT NULL,
    "inheritanceEnabled" boolean DEFAULT false NOT NULL,
    "customizationAllowed" boolean DEFAULT true NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdBy" uuid NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: report_template_versions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.report_template_versions (
    id uuid NOT NULL,
    "reportStructureId" uuid NOT NULL,
    version integer NOT NULL,
    changes jsonb NOT NULL,
    "changeDescription" text,
    "createdBy" uuid NOT NULL,
    "createdAt" timestamp with time zone NOT NULL
);


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.role_permissions (
    id uuid NOT NULL,
    role_id uuid NOT NULL,
    permission_id uuid NOT NULL,
    effective_from timestamp with time zone,
    effective_until timestamp with time zone,
    constraint_data jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_role_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_role_assignments (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    role_id uuid NOT NULL,
    company_id uuid,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    description character varying(255),
    is_super_admin boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    firstname character varying(255) NOT NULL,
    lastname character varying(255) NOT NULL,
    company_id uuid,
    status character varying(255) DEFAULT 'active'::character varying,
    is_active boolean DEFAULT true,
    last_login timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: SequelizeMeta SequelizeMeta_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SequelizeMeta"
    ADD CONSTRAINT "SequelizeMeta_pkey" PRIMARY KEY (name);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: company_directories company_directories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_directories
    ADD CONSTRAINT company_directories_pkey PRIMARY KEY (id);


--
-- Name: company_modules company_modules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_modules
    ADD CONSTRAINT company_modules_pkey PRIMARY KEY (id);


--
-- Name: directories directories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.directories
    ADD CONSTRAINT directories_pkey PRIMARY KEY (id);


--
-- Name: directory_fields directory_fields_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.directory_fields
    ADD CONSTRAINT directory_fields_pkey PRIMARY KEY (id);


--
-- Name: directory_records directory_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.directory_records
    ADD CONSTRAINT directory_records_pkey PRIMARY KEY (id);


--
-- Name: directory_values directory_values_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.directory_values
    ADD CONSTRAINT directory_values_pkey PRIMARY KEY (id);


--
-- Name: modules modules_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_name_key UNIQUE (name);


--
-- Name: modules modules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_name_key UNIQUE (name);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: receipts receipts_invoice_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.receipts
    ADD CONSTRAINT receipts_invoice_number_key UNIQUE (invoice_number);


--
-- Name: receipts receipts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.receipts
    ADD CONSTRAINT receipts_pkey PRIMARY KEY (id);


--
-- Name: report_execution_history report_execution_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_execution_history
    ADD CONSTRAINT report_execution_history_pkey PRIMARY KEY (id);


--
-- Name: report_structures report_structures_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_structures
    ADD CONSTRAINT report_structures_name_key UNIQUE (name);


--
-- Name: report_structures report_structures_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_structures
    ADD CONSTRAINT report_structures_pkey PRIMARY KEY (id);


--
-- Name: report_template_bindings report_template_bindings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_template_bindings
    ADD CONSTRAINT report_template_bindings_pkey PRIMARY KEY (id);


--
-- Name: report_template_versions report_template_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_template_versions
    ADD CONSTRAINT report_template_versions_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);


--
-- Name: role_permissions unique_role_permission; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT unique_role_permission UNIQUE (role_id, permission_id);


--
-- Name: user_role_assignments user_role_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_role_assignments
    ADD CONSTRAINT user_role_assignments_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_name_key UNIQUE (name);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: company_modules_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX company_modules_unique ON public.company_modules USING btree (company_id, module_id);


--
-- Name: report_execution_history_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX report_execution_history_created_at ON public.report_execution_history USING btree ("createdAt");


--
-- Name: report_execution_history_executed_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX report_execution_history_executed_by ON public.report_execution_history USING btree ("executedBy");


--
-- Name: report_execution_history_report_structure_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX report_execution_history_report_structure_id ON public.report_execution_history USING btree ("reportStructureId");


--
-- Name: report_execution_history_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX report_execution_history_status ON public.report_execution_history USING btree (status);


--
-- Name: report_structures_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX report_structures_category ON public.report_structures USING btree (category);


--
-- Name: report_structures_data_source_config; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX report_structures_data_source_config ON public.report_structures USING gin ("dataSourceConfig");


--
-- Name: report_structures_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX report_structures_is_active ON public.report_structures USING btree ("isActive");


--
-- Name: report_structures_layout_config; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX report_structures_layout_config ON public.report_structures USING gin ("layoutConfig");


--
-- Name: report_structures_name_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX report_structures_name_unique ON public.report_structures USING btree (name);


--
-- Name: report_structures_tags; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX report_structures_tags ON public.report_structures USING gin (tags);


--
-- Name: report_structures_template_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX report_structures_template_type ON public.report_structures USING btree ("templateType");


--
-- Name: report_template_bindings_binding_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX report_template_bindings_binding_type ON public.report_template_bindings USING btree ("bindingType");


--
-- Name: report_template_bindings_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX report_template_bindings_company_id ON public.report_template_bindings USING btree ("companyId");


--
-- Name: report_template_bindings_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX report_template_bindings_is_active ON public.report_template_bindings USING btree ("isActive");


--
-- Name: report_template_bindings_module_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX report_template_bindings_module_id ON public.report_template_bindings USING btree ("moduleId");


--
-- Name: report_template_bindings_report_structure_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX report_template_bindings_report_structure_id ON public.report_template_bindings USING btree ("reportStructureId");


--
-- Name: report_template_versions_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX report_template_versions_created_by ON public.report_template_versions USING btree ("createdBy");


--
-- Name: report_template_versions_report_structure_id_version; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX report_template_versions_report_structure_id_version ON public.report_template_versions USING btree ("reportStructureId", version);


--
-- Name: unique_template_binding; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_template_binding ON public.report_template_bindings USING btree ("reportStructureId", "companyId", "moduleId");


--
-- Name: companies companies_parent_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_parent_company_id_fkey FOREIGN KEY (parent_company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: company_directories company_directories_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_directories
    ADD CONSTRAINT company_directories_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: company_directories company_directories_directory_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_directories
    ADD CONSTRAINT company_directories_directory_id_fkey FOREIGN KEY (directory_id) REFERENCES public.directories(id);


--
-- Name: company_directories company_directories_module_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_directories
    ADD CONSTRAINT company_directories_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.company_modules(id) ON DELETE SET NULL;


--
-- Name: company_modules company_modules_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_modules
    ADD CONSTRAINT company_modules_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: company_modules company_modules_module_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_modules
    ADD CONSTRAINT company_modules_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.modules(id) ON DELETE CASCADE;


--
-- Name: directory_fields directory_fields_directory_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.directory_fields
    ADD CONSTRAINT directory_fields_directory_id_fkey FOREIGN KEY (directory_id) REFERENCES public.directories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: directory_fields directory_fields_relation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.directory_fields
    ADD CONSTRAINT directory_fields_relation_id_fkey FOREIGN KEY (relation_id) REFERENCES public.directories(id);


--
-- Name: directory_records directory_records_company_directory_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.directory_records
    ADD CONSTRAINT directory_records_company_directory_id_fkey FOREIGN KEY (company_directory_id) REFERENCES public.company_directories(id);


--
-- Name: directory_values directory_values_directory_record_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.directory_values
    ADD CONSTRAINT directory_values_directory_record_id_fkey FOREIGN KEY (directory_record_id) REFERENCES public.directory_records(id);


--
-- Name: directory_values directory_values_field_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.directory_values
    ADD CONSTRAINT directory_values_field_id_fkey FOREIGN KEY (field_id) REFERENCES public.directory_fields(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: permissions permissions_directory_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_directory_id_fkey FOREIGN KEY (directory_id) REFERENCES public.directories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: permissions permissions_module_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.modules(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: report_execution_history report_execution_history_executedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_execution_history
    ADD CONSTRAINT "report_execution_history_executedBy_fkey" FOREIGN KEY ("executedBy") REFERENCES public.users(id);


--
-- Name: report_execution_history report_execution_history_reportStructureId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_execution_history
    ADD CONSTRAINT "report_execution_history_reportStructureId_fkey" FOREIGN KEY ("reportStructureId") REFERENCES public.report_structures(id);


--
-- Name: report_structures report_structures_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_structures
    ADD CONSTRAINT "report_structures_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: report_structures report_structures_updatedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_structures
    ADD CONSTRAINT "report_structures_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES public.users(id);


--
-- Name: report_template_bindings report_template_bindings_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_template_bindings
    ADD CONSTRAINT "report_template_bindings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public.companies(id);


--
-- Name: report_template_bindings report_template_bindings_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_template_bindings
    ADD CONSTRAINT "report_template_bindings_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id);


--
-- Name: report_template_bindings report_template_bindings_moduleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_template_bindings
    ADD CONSTRAINT "report_template_bindings_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES public.modules(id);


--
-- Name: report_template_bindings report_template_bindings_reportStructureId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_template_bindings
    ADD CONSTRAINT "report_template_bindings_reportStructureId_fkey" FOREIGN KEY ("reportStructureId") REFERENCES public.report_structures(id) ON DELETE CASCADE;


--
-- Name: report_template_versions report_template_versions_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_template_versions
    ADD CONSTRAINT "report_template_versions_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public.users(id);


--
-- Name: report_template_versions report_template_versions_reportStructureId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report_template_versions
    ADD CONSTRAINT "report_template_versions_reportStructureId_fkey" FOREIGN KEY ("reportStructureId") REFERENCES public.report_structures(id) ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.user_roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_role_assignments user_role_assignments_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_role_assignments
    ADD CONSTRAINT user_role_assignments_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: user_role_assignments user_role_assignments_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_role_assignments
    ADD CONSTRAINT user_role_assignments_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.user_roles(id);


--
-- Name: user_role_assignments user_role_assignments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_role_assignments
    ADD CONSTRAINT user_role_assignments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: users users_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- PostgreSQL database dump complete
--

