--
-- PostgreSQL database dump
--

-- Dumped from database version 14.17 (Homebrew)
-- Dumped by pg_dump version 14.17 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: ActionPriority; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ActionPriority" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT'
);


ALTER TYPE public."ActionPriority" OWNER TO postgres;

--
-- Name: ActionStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ActionStatus" AS ENUM (
    'PENDING',
    'IN_PROGRESS',
    'COMPLETED'
);


ALTER TYPE public."ActionStatus" OWNER TO postgres;

--
-- Name: KanbanColumn; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."KanbanColumn" AS ENUM (
    'TODO',
    'IN_PROGRESS',
    'DONE'
);


ALTER TYPE public."KanbanColumn" OWNER TO postgres;

--
-- Name: PlanFeature; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PlanFeature" AS ENUM (
    'ACTIONS',
    'COLLABORATORS',
    'MANAGERS',
    'AI_SUGGESTIONS'
);


ALTER TYPE public."PlanFeature" OWNER TO postgres;

--
-- Name: PlanType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PlanType" AS ENUM (
    'FREE',
    'PAID'
);


ALTER TYPE public."PlanType" OWNER TO postgres;

--
-- Name: SubscriptionStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SubscriptionStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'CANCELLED',
    'EXPIRED'
);


ALTER TYPE public."SubscriptionStatus" OWNER TO postgres;

--
-- Name: TaskStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TaskStatus" AS ENUM (
    'PENDING',
    'IN_PROGRESS',
    'COMPLETED'
);


ALTER TYPE public."TaskStatus" OWNER TO postgres;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserRole" AS ENUM (
    'MASTER',
    'ADMIN',
    'MANAGER',
    'COLLABORATOR'
);


ALTER TYPE public."UserRole" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AISuggestion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AISuggestion" (
    id text NOT NULL,
    "actionId" text NOT NULL,
    prompt text NOT NULL,
    response text NOT NULL,
    "tokensUsed" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "cacheKey" text,
    cost double precision NOT NULL,
    "isCached" boolean DEFAULT false NOT NULL,
    model text NOT NULL
);


ALTER TABLE public."AISuggestion" OWNER TO postgres;

--
-- Name: Action; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Action" (
    id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    "actualStartDate" timestamp(3) without time zone,
    "actualEndDate" timestamp(3) without time zone,
    status public."ActionStatus" DEFAULT 'PENDING'::public."ActionStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "companyId" text NOT NULL,
    "creatorId" text NOT NULL,
    "blockedReason" text,
    "estimatedEndDate" timestamp(3) without time zone NOT NULL,
    "estimatedStartDate" timestamp(3) without time zone NOT NULL,
    "isBlocked" boolean DEFAULT false NOT NULL,
    "isLate" boolean DEFAULT false NOT NULL,
    priority public."ActionPriority" DEFAULT 'MEDIUM'::public."ActionPriority" NOT NULL,
    "responsibleId" text NOT NULL
);


ALTER TABLE public."Action" OWNER TO postgres;

--
-- Name: ActionMetric; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ActionMetric" (
    id text NOT NULL,
    "actionId" text NOT NULL,
    "completedAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ActionMetric" OWNER TO postgres;

--
-- Name: ActionMovement; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ActionMovement" (
    id text NOT NULL,
    "actionId" text NOT NULL,
    "fromColumn" public."KanbanColumn" NOT NULL,
    "toColumn" public."KanbanColumn" NOT NULL,
    "movedById" text NOT NULL,
    "movedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "timeSpent" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ActionMovement" OWNER TO postgres;

--
-- Name: ChecklistItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ChecklistItem" (
    id text NOT NULL,
    "actionId" text NOT NULL,
    description text NOT NULL,
    "isCompleted" boolean DEFAULT false NOT NULL,
    "completedAt" timestamp(3) without time zone,
    "order" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ChecklistItem" OWNER TO postgres;

--
-- Name: CollaboratorPerformance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CollaboratorPerformance" (
    id text NOT NULL,
    "collaboratorId" text NOT NULL,
    "managerId" text NOT NULL,
    period timestamp(3) without time zone NOT NULL,
    "totalTasks" integer DEFAULT 0 NOT NULL,
    "completedTasks" integer DEFAULT 0 NOT NULL,
    "averageTimeSpent" double precision DEFAULT 0 NOT NULL,
    "onTimeDelivery" double precision DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CollaboratorPerformance" OWNER TO postgres;

--
-- Name: Company; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Company" (
    id text NOT NULL,
    name text NOT NULL,
    cnpj text NOT NULL,
    address text,
    phone text,
    email text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "planId" text NOT NULL,
    "ownerId" text NOT NULL
);


ALTER TABLE public."Company" OWNER TO postgres;

--
-- Name: CompanyAICredits; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CompanyAICredits" (
    id text NOT NULL,
    "companyId" text NOT NULL,
    "totalCredits" double precision DEFAULT 0 NOT NULL,
    "usedCredits" double precision DEFAULT 0 NOT NULL,
    "lastResetAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dailyUsage" integer DEFAULT 0 NOT NULL,
    "lastDailyReset" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CompanyAICredits" OWNER TO postgres;

--
-- Name: CompanyUsage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CompanyUsage" (
    id text NOT NULL,
    "companyId" text NOT NULL,
    feature public."PlanFeature" NOT NULL,
    "currentUsage" integer DEFAULT 0 NOT NULL,
    "lastResetAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CompanyUsage" OWNER TO postgres;

--
-- Name: KanbanOrder; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."KanbanOrder" (
    id text NOT NULL,
    "column" public."KanbanColumn" NOT NULL,
    "position" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "lastMovedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "actionId" text NOT NULL
);


ALTER TABLE public."KanbanOrder" OWNER TO postgres;

--
-- Name: Plan; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Plan" (
    id text NOT NULL,
    type public."PlanType" NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    price double precision NOT NULL,
    features public."PlanFeature"[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Plan" OWNER TO postgres;

--
-- Name: PlanLimit; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PlanLimit" (
    id text NOT NULL,
    "planId" text NOT NULL,
    feature public."PlanFeature" NOT NULL,
    "limit" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."PlanLimit" OWNER TO postgres;

--
-- Name: RefreshToken; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RefreshToken" (
    id text NOT NULL,
    "userId" text NOT NULL,
    token text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."RefreshToken" OWNER TO postgres;

--
-- Name: Subscription; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Subscription" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "companyId" text NOT NULL,
    status public."SubscriptionStatus" DEFAULT 'ACTIVE'::public."SubscriptionStatus" NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "planId" text NOT NULL
);


ALTER TABLE public."Subscription" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    name text NOT NULL,
    role public."UserRole" NOT NULL,
    plan public."PlanType" DEFAULT 'FREE'::public."PlanType" NOT NULL,
    "maxCompanies" integer DEFAULT 1 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "managerId" text,
    "maxActions" integer DEFAULT 30 NOT NULL,
    "currentPlanId" text
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: _CompanyUsers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_CompanyUsers" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_CompanyUsers" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Data for Name: AISuggestion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AISuggestion" (id, "actionId", prompt, response, "tokensUsed", "createdAt", "updatedAt", "cacheKey", cost, "isCached", model) FROM stdin;
\.


--
-- Data for Name: Action; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Action" (id, title, description, "actualStartDate", "actualEndDate", status, "createdAt", "updatedAt", "deletedAt", "companyId", "creatorId", "blockedReason", "estimatedEndDate", "estimatedStartDate", "isBlocked", "isLate", priority, "responsibleId") FROM stdin;
ecd69e6e-7f9e-4b0e-abad-af2ef301f879	Primeiro Plano de Acaoa	Primeiro Plano de Acaoa	\N	\N	PENDING	2025-05-23 01:47:38.466	2025-05-23 01:47:38.466	\N	738112b1-90e6-4059-88a6-3fa441b3865a	cc223eb2-98a3-4789-9e28-fa0753bdb6b6	\N	2025-05-22 00:00:00	2025-05-22 00:00:00	f	f	MEDIUM	cc223eb2-98a3-4789-9e28-fa0753bdb6b6
\.


--
-- Data for Name: ActionMetric; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ActionMetric" (id, "actionId", "completedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ActionMovement; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ActionMovement" (id, "actionId", "fromColumn", "toColumn", "movedById", "movedAt", "timeSpent", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ChecklistItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ChecklistItem" (id, "actionId", description, "isCompleted", "completedAt", "order", "createdAt", "updatedAt") FROM stdin;
0d287718-c41d-4af5-958a-da6a10e77532	ecd69e6e-7f9e-4b0e-abad-af2ef301f879	desdsdsd	f	\N	0	2025-05-23 01:47:38.466	2025-05-23 01:47:38.466
cbb9c63c-799a-4176-9c2b-b1faa1c51ae8	ecd69e6e-7f9e-4b0e-abad-af2ef301f879	dsdsd	f	\N	1	2025-05-23 01:47:38.466	2025-05-23 01:47:38.466
\.


--
-- Data for Name: CollaboratorPerformance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CollaboratorPerformance" (id, "collaboratorId", "managerId", period, "totalTasks", "completedTasks", "averageTimeSpent", "onTimeDelivery", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Company; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Company" (id, name, cnpj, address, phone, email, "createdAt", "updatedAt", "deletedAt", "planId", "ownerId") FROM stdin;
738112b1-90e6-4059-88a6-3fa441b3865a	Empresa Master	56785678904321	Rua Exemplo, 123	(11) 99999-9999	contato@empresamaster.com	2025-05-22 23:33:36.151	2025-05-22 23:33:36.151	\N	caad3357-a077-4326-80f3-61f54a4ef7c9	3455f569-7584-48c9-813b-fa8eaf29162c
\.


--
-- Data for Name: CompanyAICredits; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CompanyAICredits" (id, "companyId", "totalCredits", "usedCredits", "lastResetAt", "dailyUsage", "lastDailyReset", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: CompanyUsage; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CompanyUsage" (id, "companyId", feature, "currentUsage", "lastResetAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: KanbanOrder; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."KanbanOrder" (id, "column", "position", "createdAt", "updatedAt", "lastMovedAt", "sortOrder", "actionId") FROM stdin;
76b0b2aa-fd45-4477-8561-6d5d6918ff79	TODO	1	2025-05-23 01:47:38.466	2025-05-23 01:47:38.466	2025-05-23 01:47:38.466	1	ecd69e6e-7f9e-4b0e-abad-af2ef301f879
\.


--
-- Data for Name: Plan; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Plan" (id, type, name, description, price, features, "createdAt", "updatedAt") FROM stdin;
caad3357-a077-4326-80f3-61f54a4ef7c9	PAID	Plano Premium	Plano com recursos avançados	299.9	{ACTIONS,COLLABORATORS,MANAGERS,AI_SUGGESTIONS}	2025-05-22 23:33:20.36	2025-05-22 23:33:20.36
\.


--
-- Data for Name: PlanLimit; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PlanLimit" (id, "planId", feature, "limit", "createdAt", "updatedAt") FROM stdin;
63f90510-4e3c-4d14-abcc-15c085912b48	caad3357-a077-4326-80f3-61f54a4ef7c9	ACTIONS	1000	2025-05-22 23:33:20.36	2025-05-22 23:33:20.36
c917d5a9-ff34-411a-a90c-c390f027ff86	caad3357-a077-4326-80f3-61f54a4ef7c9	COLLABORATORS	50	2025-05-22 23:33:20.36	2025-05-22 23:33:20.36
1a5a3b78-40b3-4098-82af-fe6925847639	caad3357-a077-4326-80f3-61f54a4ef7c9	MANAGERS	10	2025-05-22 23:33:20.36	2025-05-22 23:33:20.36
\.


--
-- Data for Name: RefreshToken; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RefreshToken" (id, "userId", token, "expiresAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Subscription; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Subscription" (id, "userId", "companyId", status, "startDate", "endDate", "createdAt", "updatedAt", "planId") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, email, password, name, role, plan, "maxCompanies", "isActive", "createdAt", "updatedAt", "deletedAt", "managerId", "maxActions", "currentPlanId") FROM stdin;
eb87b8ef-144a-4db2-a2f1-19da06fa8966	admin@gmail.com	$2b$10$NemfxFlbyLDFJhlbseQN8.ejVQVS/6rFX1Rg8tHTwHHa1NhRCSGy6	Admin	ADMIN	FREE	999999	t	2025-05-22 23:32:59.405	2025-05-22 23:32:59.405	\N	\N	999999	\N
3455f569-7584-48c9-813b-fa8eaf29162c	maria@gmail.com	$2b$10$N9agyw1l.00keH1bzTigPeaMRWGs.89jJ916Lt9JO9nkdnWewah2m	Maria	MASTER	PAID	999999	t	2025-05-22 23:33:36.147	2025-05-22 23:33:36.147	\N	\N	999999	caad3357-a077-4326-80f3-61f54a4ef7c9
fe7b2c46-2b6e-434d-951f-5b449ee21e47	gestor2@empresa.com	$2b$10$QMms1LfGcB6jW5ex//lmuOwSlgUOBmy1vicT564w3lD17ZrBkpevW	Matheus	MANAGER	PAID	1	t	2025-05-23 01:13:14.589	2025-05-23 01:13:14.589	\N	\N	30	caad3357-a077-4326-80f3-61f54a4ef7c9
1322b0ba-2961-4724-8e21-27dea8c0525a	colaborador@empresa.com	$2b$10$ldSZyFbwB1FBLvdmE4uTAeRwPeX9kZDxFXZ86bBzDyhG8UL4Xs82G	Colaborador	COLLABORATOR	PAID	1	t	2025-05-23 01:14:26.234	2025-05-23 01:14:26.234	\N	fe7b2c46-2b6e-434d-951f-5b449ee21e47	30	caad3357-a077-4326-80f3-61f54a4ef7c9
cc223eb2-98a3-4789-9e28-fa0753bdb6b6	ajudete@gmail.com	$2b$10$iWv7ypg.lSSGG/cIrubpaex81BisK4YTAV.6TCWAIK45C5jjVbUIy	Colaborador	COLLABORATOR	PAID	1	t	2025-05-23 01:26:30.182	2025-05-23 01:26:30.182	\N	fe7b2c46-2b6e-434d-951f-5b449ee21e47	30	caad3357-a077-4326-80f3-61f54a4ef7c9
\.


--
-- Data for Name: _CompanyUsers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_CompanyUsers" ("A", "B") FROM stdin;
738112b1-90e6-4059-88a6-3fa441b3865a	3455f569-7584-48c9-813b-fa8eaf29162c
738112b1-90e6-4059-88a6-3fa441b3865a	fe7b2c46-2b6e-434d-951f-5b449ee21e47
738112b1-90e6-4059-88a6-3fa441b3865a	1322b0ba-2961-4724-8e21-27dea8c0525a
738112b1-90e6-4059-88a6-3fa441b3865a	cc223eb2-98a3-4789-9e28-fa0753bdb6b6
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
eb827041-11b0-43d7-ac4c-85996a847019	3a7d356a4bc3b0496647146c75b58fe42be3230f33dd3e8d00bdf1f18955ea9f	2025-05-22 20:09:23.760016-03	20250417183940_init	\N	\N	2025-05-22 20:09:23.736648-03	1
bf6d026e-b932-41ba-a28e-2ad1dd90cf47	bc385c3344d08a45cc34e6277cac3fb697ef10c5296c8252990307be577e0e36	2025-05-22 20:09:23.76198-03	20250421020418_add_max_actions_to_user	\N	\N	2025-05-22 20:09:23.760447-03	1
6c6a6d4f-90cc-4b59-b8da-881945393ba2	6d068af01d1c82f9d69003183cdf9af0984dc68716a9156c971dcc42570d1c97	2025-05-22 20:09:23.780071-03	20250522193613_add_plan_table	\N	\N	2025-05-22 20:09:23.762425-03	1
6236c1b1-247e-4aa5-964b-eb626ed85902	213610818ef1d5f55fef2d3b81111040b01e9ac5be01d388d7edd520acf96d95	2025-05-22 20:09:23.781973-03	20250522195317_add_user_plan_relation	\N	\N	2025-05-22 20:09:23.780368-03	1
2104d47a-0dd8-4235-8f3b-cae13c9de9e1	9742bcbabc534a9dc683651d80cf29011cea452eed77814fa12c629c3dccc320	2025-05-22 20:09:23.800246-03	20250522203218_add_checklist	\N	\N	2025-05-22 20:09:23.782358-03	1
7f3cfb5e-621a-4bda-9816-10997fef106c	6cdf84dd802a9ae7411df53be5040ff3f0508ab33c5dd31dcf8dda459948ae67	2025-05-22 22:47:19.172231-03	20250523014718_add_kanban_order	\N	\N	2025-05-22 22:47:19.154879-03	1
\.


--
-- Name: AISuggestion AISuggestion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AISuggestion"
    ADD CONSTRAINT "AISuggestion_pkey" PRIMARY KEY (id);


--
-- Name: ActionMetric ActionMetric_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ActionMetric"
    ADD CONSTRAINT "ActionMetric_pkey" PRIMARY KEY (id);


--
-- Name: ActionMovement ActionMovement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ActionMovement"
    ADD CONSTRAINT "ActionMovement_pkey" PRIMARY KEY (id);


--
-- Name: Action Action_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Action"
    ADD CONSTRAINT "Action_pkey" PRIMARY KEY (id);


--
-- Name: ChecklistItem ChecklistItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChecklistItem"
    ADD CONSTRAINT "ChecklistItem_pkey" PRIMARY KEY (id);


--
-- Name: CollaboratorPerformance CollaboratorPerformance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CollaboratorPerformance"
    ADD CONSTRAINT "CollaboratorPerformance_pkey" PRIMARY KEY (id);


--
-- Name: CompanyAICredits CompanyAICredits_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CompanyAICredits"
    ADD CONSTRAINT "CompanyAICredits_pkey" PRIMARY KEY (id);


--
-- Name: CompanyUsage CompanyUsage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CompanyUsage"
    ADD CONSTRAINT "CompanyUsage_pkey" PRIMARY KEY (id);


--
-- Name: Company Company_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Company"
    ADD CONSTRAINT "Company_pkey" PRIMARY KEY (id);


--
-- Name: KanbanOrder KanbanOrder_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KanbanOrder"
    ADD CONSTRAINT "KanbanOrder_pkey" PRIMARY KEY (id);


--
-- Name: PlanLimit PlanLimit_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PlanLimit"
    ADD CONSTRAINT "PlanLimit_pkey" PRIMARY KEY (id);


--
-- Name: Plan Plan_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Plan"
    ADD CONSTRAINT "Plan_pkey" PRIMARY KEY (id);


--
-- Name: RefreshToken RefreshToken_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RefreshToken"
    ADD CONSTRAINT "RefreshToken_pkey" PRIMARY KEY (id);


--
-- Name: Subscription Subscription_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _CompanyUsers _CompanyUsers_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_CompanyUsers"
    ADD CONSTRAINT "_CompanyUsers_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: AISuggestion_cacheKey_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AISuggestion_cacheKey_idx" ON public."AISuggestion" USING btree ("cacheKey");


--
-- Name: ActionMovement_actionId_movedAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ActionMovement_actionId_movedAt_idx" ON public."ActionMovement" USING btree ("actionId", "movedAt");


--
-- Name: Action_actualEndDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Action_actualEndDate_idx" ON public."Action" USING btree ("actualEndDate");


--
-- Name: Action_actualStartDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Action_actualStartDate_idx" ON public."Action" USING btree ("actualStartDate");


--
-- Name: Action_companyId_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Action_companyId_status_idx" ON public."Action" USING btree ("companyId", status);


--
-- Name: Action_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Action_createdAt_idx" ON public."Action" USING btree ("createdAt");


--
-- Name: Action_estimatedEndDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Action_estimatedEndDate_idx" ON public."Action" USING btree ("estimatedEndDate");


--
-- Name: Action_estimatedStartDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Action_estimatedStartDate_idx" ON public."Action" USING btree ("estimatedStartDate");


--
-- Name: Action_responsibleId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Action_responsibleId_idx" ON public."Action" USING btree ("responsibleId");


--
-- Name: ChecklistItem_actionId_order_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ChecklistItem_actionId_order_idx" ON public."ChecklistItem" USING btree ("actionId", "order");


--
-- Name: CollaboratorPerformance_collaboratorId_managerId_period_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "CollaboratorPerformance_collaboratorId_managerId_period_key" ON public."CollaboratorPerformance" USING btree ("collaboratorId", "managerId", period);


--
-- Name: CompanyAICredits_companyId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "CompanyAICredits_companyId_key" ON public."CompanyAICredits" USING btree ("companyId");


--
-- Name: CompanyUsage_companyId_feature_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "CompanyUsage_companyId_feature_key" ON public."CompanyUsage" USING btree ("companyId", feature);


--
-- Name: Company_cnpj_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Company_cnpj_key" ON public."Company" USING btree (cnpj);


--
-- Name: KanbanOrder_actionId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "KanbanOrder_actionId_key" ON public."KanbanOrder" USING btree ("actionId");


--
-- Name: KanbanOrder_column_lastMovedAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "KanbanOrder_column_lastMovedAt_idx" ON public."KanbanOrder" USING btree ("column", "lastMovedAt");


--
-- Name: KanbanOrder_column_position_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "KanbanOrder_column_position_idx" ON public."KanbanOrder" USING btree ("column", "position");


--
-- Name: KanbanOrder_column_sortOrder_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "KanbanOrder_column_sortOrder_idx" ON public."KanbanOrder" USING btree ("column", "sortOrder");


--
-- Name: PlanLimit_planId_feature_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "PlanLimit_planId_feature_key" ON public."PlanLimit" USING btree ("planId", feature);


--
-- Name: RefreshToken_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "RefreshToken_token_key" ON public."RefreshToken" USING btree (token);


--
-- Name: RefreshToken_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "RefreshToken_userId_idx" ON public."RefreshToken" USING btree ("userId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: _CompanyUsers_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_CompanyUsers_B_index" ON public."_CompanyUsers" USING btree ("B");


--
-- Name: AISuggestion AISuggestion_actionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AISuggestion"
    ADD CONSTRAINT "AISuggestion_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES public."Action"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ActionMetric ActionMetric_actionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ActionMetric"
    ADD CONSTRAINT "ActionMetric_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES public."Action"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ActionMovement ActionMovement_actionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ActionMovement"
    ADD CONSTRAINT "ActionMovement_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES public."Action"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ActionMovement ActionMovement_movedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ActionMovement"
    ADD CONSTRAINT "ActionMovement_movedById_fkey" FOREIGN KEY ("movedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Action Action_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Action"
    ADD CONSTRAINT "Action_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Action Action_creatorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Action"
    ADD CONSTRAINT "Action_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Action Action_responsibleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Action"
    ADD CONSTRAINT "Action_responsibleId_fkey" FOREIGN KEY ("responsibleId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ChecklistItem ChecklistItem_actionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChecklistItem"
    ADD CONSTRAINT "ChecklistItem_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES public."Action"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CollaboratorPerformance CollaboratorPerformance_collaboratorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CollaboratorPerformance"
    ADD CONSTRAINT "CollaboratorPerformance_collaboratorId_fkey" FOREIGN KEY ("collaboratorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CollaboratorPerformance CollaboratorPerformance_managerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CollaboratorPerformance"
    ADD CONSTRAINT "CollaboratorPerformance_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CompanyAICredits CompanyAICredits_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CompanyAICredits"
    ADD CONSTRAINT "CompanyAICredits_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CompanyUsage CompanyUsage_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CompanyUsage"
    ADD CONSTRAINT "CompanyUsage_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Company Company_ownerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Company"
    ADD CONSTRAINT "Company_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Company Company_planId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Company"
    ADD CONSTRAINT "Company_planId_fkey" FOREIGN KEY ("planId") REFERENCES public."Plan"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: KanbanOrder KanbanOrder_actionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."KanbanOrder"
    ADD CONSTRAINT "KanbanOrder_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES public."Action"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PlanLimit PlanLimit_planId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PlanLimit"
    ADD CONSTRAINT "PlanLimit_planId_fkey" FOREIGN KEY ("planId") REFERENCES public."Plan"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: RefreshToken RefreshToken_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RefreshToken"
    ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Subscription Subscription_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Subscription Subscription_planId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES public."Plan"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Subscription Subscription_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: User User_currentPlanId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_currentPlanId_fkey" FOREIGN KEY ("currentPlanId") REFERENCES public."Plan"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: User User_managerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: _CompanyUsers _CompanyUsers_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_CompanyUsers"
    ADD CONSTRAINT "_CompanyUsers_A_fkey" FOREIGN KEY ("A") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _CompanyUsers _CompanyUsers_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_CompanyUsers"
    ADD CONSTRAINT "_CompanyUsers_B_fkey" FOREIGN KEY ("B") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

