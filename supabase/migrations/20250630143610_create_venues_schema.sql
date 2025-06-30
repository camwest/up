create extension if not exists "postgis" with schema "public" version '3.3.7';

create table "public"."patterns" (
    "id" uuid not null default gen_random_uuid(),
    "venue_id" text,
    "pattern" jsonb not null,
    "contrast_vector" double precision[],
    "location" geography(Point,4326),
    "created_at" timestamp with time zone default now(),
    "last_ping" timestamp with time zone default now()
);


alter table "public"."patterns" enable row level security;

create table "public"."venue_labels" (
    "venue_id" text not null,
    "label" text not null,
    "count" integer default 1
);


alter table "public"."venue_labels" enable row level security;

create table "public"."venues" (
    "id" text not null,
    "label" text,
    "center" geography(Point,4326),
    "use_count" integer default 1,
    "created_at" timestamp with time zone default now(),
    "last_active" timestamp with time zone default now()
);


alter table "public"."venues" enable row level security;

CREATE INDEX idx_patterns_last_ping ON public.patterns USING btree (last_ping);

CREATE INDEX idx_patterns_venue ON public.patterns USING btree (venue_id);

CREATE INDEX idx_venues_location ON public.venues USING gist (center);

CREATE UNIQUE INDEX patterns_pkey ON public.patterns USING btree (id);

CREATE UNIQUE INDEX venue_labels_pkey ON public.venue_labels USING btree (venue_id, label);

CREATE UNIQUE INDEX venues_pkey ON public.venues USING btree (id);

alter table "public"."patterns" add constraint "patterns_pkey" PRIMARY KEY using index "patterns_pkey";

alter table "public"."venue_labels" add constraint "venue_labels_pkey" PRIMARY KEY using index "venue_labels_pkey";

alter table "public"."venues" add constraint "venues_pkey" PRIMARY KEY using index "venues_pkey";

alter table "public"."patterns" add constraint "patterns_venue_id_fkey" FOREIGN KEY (venue_id) REFERENCES venues(id) not valid;

alter table "public"."patterns" validate constraint "patterns_venue_id_fkey";

alter table "public"."venue_labels" add constraint "venue_labels_venue_id_fkey" FOREIGN KEY (venue_id) REFERENCES venues(id) not valid;

alter table "public"."venue_labels" validate constraint "venue_labels_venue_id_fkey";

grant delete on table "public"."patterns" to "anon";

grant insert on table "public"."patterns" to "anon";

grant references on table "public"."patterns" to "anon";

grant select on table "public"."patterns" to "anon";

grant trigger on table "public"."patterns" to "anon";

grant truncate on table "public"."patterns" to "anon";

grant update on table "public"."patterns" to "anon";

grant delete on table "public"."patterns" to "authenticated";

grant insert on table "public"."patterns" to "authenticated";

grant references on table "public"."patterns" to "authenticated";

grant select on table "public"."patterns" to "authenticated";

grant trigger on table "public"."patterns" to "authenticated";

grant truncate on table "public"."patterns" to "authenticated";

grant update on table "public"."patterns" to "authenticated";

grant delete on table "public"."patterns" to "service_role";

grant insert on table "public"."patterns" to "service_role";

grant references on table "public"."patterns" to "service_role";

grant select on table "public"."patterns" to "service_role";

grant trigger on table "public"."patterns" to "service_role";

grant truncate on table "public"."patterns" to "service_role";

grant update on table "public"."patterns" to "service_role";

grant delete on table "public"."spatial_ref_sys" to "anon";

grant insert on table "public"."spatial_ref_sys" to "anon";

grant references on table "public"."spatial_ref_sys" to "anon";

grant select on table "public"."spatial_ref_sys" to "anon";

grant trigger on table "public"."spatial_ref_sys" to "anon";

grant truncate on table "public"."spatial_ref_sys" to "anon";

grant update on table "public"."spatial_ref_sys" to "anon";

grant delete on table "public"."spatial_ref_sys" to "authenticated";

grant insert on table "public"."spatial_ref_sys" to "authenticated";

grant references on table "public"."spatial_ref_sys" to "authenticated";

grant select on table "public"."spatial_ref_sys" to "authenticated";

grant trigger on table "public"."spatial_ref_sys" to "authenticated";

grant truncate on table "public"."spatial_ref_sys" to "authenticated";

grant update on table "public"."spatial_ref_sys" to "authenticated";

grant delete on table "public"."spatial_ref_sys" to "postgres";

grant insert on table "public"."spatial_ref_sys" to "postgres";

grant references on table "public"."spatial_ref_sys" to "postgres";

grant select on table "public"."spatial_ref_sys" to "postgres";

grant trigger on table "public"."spatial_ref_sys" to "postgres";

grant truncate on table "public"."spatial_ref_sys" to "postgres";

grant update on table "public"."spatial_ref_sys" to "postgres";

grant delete on table "public"."spatial_ref_sys" to "service_role";

grant insert on table "public"."spatial_ref_sys" to "service_role";

grant references on table "public"."spatial_ref_sys" to "service_role";

grant select on table "public"."spatial_ref_sys" to "service_role";

grant trigger on table "public"."spatial_ref_sys" to "service_role";

grant truncate on table "public"."spatial_ref_sys" to "service_role";

grant update on table "public"."spatial_ref_sys" to "service_role";

grant delete on table "public"."venue_labels" to "anon";

grant insert on table "public"."venue_labels" to "anon";

grant references on table "public"."venue_labels" to "anon";

grant select on table "public"."venue_labels" to "anon";

grant trigger on table "public"."venue_labels" to "anon";

grant truncate on table "public"."venue_labels" to "anon";

grant update on table "public"."venue_labels" to "anon";

grant delete on table "public"."venue_labels" to "authenticated";

grant insert on table "public"."venue_labels" to "authenticated";

grant references on table "public"."venue_labels" to "authenticated";

grant select on table "public"."venue_labels" to "authenticated";

grant trigger on table "public"."venue_labels" to "authenticated";

grant truncate on table "public"."venue_labels" to "authenticated";

grant update on table "public"."venue_labels" to "authenticated";

grant delete on table "public"."venue_labels" to "service_role";

grant insert on table "public"."venue_labels" to "service_role";

grant references on table "public"."venue_labels" to "service_role";

grant select on table "public"."venue_labels" to "service_role";

grant trigger on table "public"."venue_labels" to "service_role";

grant truncate on table "public"."venue_labels" to "service_role";

grant update on table "public"."venue_labels" to "service_role";

grant delete on table "public"."venues" to "anon";

grant insert on table "public"."venues" to "anon";

grant references on table "public"."venues" to "anon";

grant select on table "public"."venues" to "anon";

grant trigger on table "public"."venues" to "anon";

grant truncate on table "public"."venues" to "anon";

grant update on table "public"."venues" to "anon";

grant delete on table "public"."venues" to "authenticated";

grant insert on table "public"."venues" to "authenticated";

grant references on table "public"."venues" to "authenticated";

grant select on table "public"."venues" to "authenticated";

grant trigger on table "public"."venues" to "authenticated";

grant truncate on table "public"."venues" to "authenticated";

grant update on table "public"."venues" to "authenticated";

grant delete on table "public"."venues" to "service_role";

grant insert on table "public"."venues" to "service_role";

grant references on table "public"."venues" to "service_role";

grant select on table "public"."venues" to "service_role";

grant trigger on table "public"."venues" to "service_role";

grant truncate on table "public"."venues" to "service_role";

grant update on table "public"."venues" to "service_role";

create policy "Anonymous users can create patterns"
on "public"."patterns"
as permissive
for insert
to public
with check (true);


create policy "Anonymous users can delete patterns"
on "public"."patterns"
as permissive
for delete
to public
using (true);


create policy "Anonymous users can read patterns"
on "public"."patterns"
as permissive
for select
to public
using (true);


create policy "Anonymous users can update patterns"
on "public"."patterns"
as permissive
for update
to public
using (true);


create policy "Anonymous users can create venue labels"
on "public"."venue_labels"
as permissive
for insert
to public
with check (true);


create policy "Anonymous users can read venue labels"
on "public"."venue_labels"
as permissive
for select
to public
using (true);


create policy "Anonymous users can update venue labels"
on "public"."venue_labels"
as permissive
for update
to public
using (true);


create policy "Anonymous users can create venues"
on "public"."venues"
as permissive
for insert
to public
with check (true);


create policy "Anonymous users can read venues"
on "public"."venues"
as permissive
for select
to public
using (true);


create policy "Anonymous users can update venues"
on "public"."venues"
as permissive
for update
to public
using (true);



