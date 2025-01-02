drop trigger if exists "handle_updated_at" on "public"."entities";

drop trigger if exists "update_counterparts_updated_at" on "public"."monite_counterparts";

drop trigger if exists "update_entities_updated_at" on "public"."monite_entities";

drop trigger if exists "update_tokens_updated_at" on "public"."monite_tokens";

drop policy if exists "Users can insert their own entities" on "public"."entities";

drop policy if exists "Users can update their own entities" on "public"."entities";

drop policy if exists "Users can view their own entities" on "public"."entities";

drop policy if exists "Users can only access their own entities" on "public"."monite_entities";

drop policy if exists "Users can only access their own tokens" on "public"."monite_tokens";

drop policy if exists "Users can create their own entity mappings" on "public"."monite_user_entities";

drop policy if exists "Users can view their own entity mappings" on "public"."monite_user_entities";

revoke delete on table "public"."entities" from "anon";

revoke insert on table "public"."entities" from "anon";

revoke references on table "public"."entities" from "anon";

revoke select on table "public"."entities" from "anon";

revoke trigger on table "public"."entities" from "anon";

revoke truncate on table "public"."entities" from "anon";

revoke update on table "public"."entities" from "anon";

revoke delete on table "public"."entities" from "authenticated";

revoke insert on table "public"."entities" from "authenticated";

revoke references on table "public"."entities" from "authenticated";

revoke select on table "public"."entities" from "authenticated";

revoke trigger on table "public"."entities" from "authenticated";

revoke truncate on table "public"."entities" from "authenticated";

revoke update on table "public"."entities" from "authenticated";

revoke delete on table "public"."entities" from "service_role";

revoke insert on table "public"."entities" from "service_role";

revoke references on table "public"."entities" from "service_role";

revoke select on table "public"."entities" from "service_role";

revoke trigger on table "public"."entities" from "service_role";

revoke truncate on table "public"."entities" from "service_role";

revoke update on table "public"."entities" from "service_role";

revoke delete on table "public"."monite_cache" from "anon";

revoke insert on table "public"."monite_cache" from "anon";

revoke references on table "public"."monite_cache" from "anon";

revoke select on table "public"."monite_cache" from "anon";

revoke trigger on table "public"."monite_cache" from "anon";

revoke truncate on table "public"."monite_cache" from "anon";

revoke update on table "public"."monite_cache" from "anon";

revoke delete on table "public"."monite_cache" from "authenticated";

revoke insert on table "public"."monite_cache" from "authenticated";

revoke references on table "public"."monite_cache" from "authenticated";

revoke select on table "public"."monite_cache" from "authenticated";

revoke trigger on table "public"."monite_cache" from "authenticated";

revoke truncate on table "public"."monite_cache" from "authenticated";

revoke update on table "public"."monite_cache" from "authenticated";

revoke delete on table "public"."monite_cache" from "service_role";

revoke insert on table "public"."monite_cache" from "service_role";

revoke references on table "public"."monite_cache" from "service_role";

revoke select on table "public"."monite_cache" from "service_role";

revoke trigger on table "public"."monite_cache" from "service_role";

revoke truncate on table "public"."monite_cache" from "service_role";

revoke update on table "public"."monite_cache" from "service_role";

revoke delete on table "public"."monite_counterparts" from "anon";

revoke insert on table "public"."monite_counterparts" from "anon";

revoke references on table "public"."monite_counterparts" from "anon";

revoke select on table "public"."monite_counterparts" from "anon";

revoke trigger on table "public"."monite_counterparts" from "anon";

revoke truncate on table "public"."monite_counterparts" from "anon";

revoke update on table "public"."monite_counterparts" from "anon";

revoke delete on table "public"."monite_counterparts" from "authenticated";

revoke insert on table "public"."monite_counterparts" from "authenticated";

revoke references on table "public"."monite_counterparts" from "authenticated";

revoke select on table "public"."monite_counterparts" from "authenticated";

revoke trigger on table "public"."monite_counterparts" from "authenticated";

revoke truncate on table "public"."monite_counterparts" from "authenticated";

revoke update on table "public"."monite_counterparts" from "authenticated";

revoke delete on table "public"."monite_counterparts" from "service_role";

revoke insert on table "public"."monite_counterparts" from "service_role";

revoke references on table "public"."monite_counterparts" from "service_role";

revoke select on table "public"."monite_counterparts" from "service_role";

revoke trigger on table "public"."monite_counterparts" from "service_role";

revoke truncate on table "public"."monite_counterparts" from "service_role";

revoke update on table "public"."monite_counterparts" from "service_role";

revoke delete on table "public"."monite_entities" from "anon";

revoke insert on table "public"."monite_entities" from "anon";

revoke references on table "public"."monite_entities" from "anon";

revoke select on table "public"."monite_entities" from "anon";

revoke trigger on table "public"."monite_entities" from "anon";

revoke truncate on table "public"."monite_entities" from "anon";

revoke update on table "public"."monite_entities" from "anon";

revoke delete on table "public"."monite_entities" from "authenticated";

revoke insert on table "public"."monite_entities" from "authenticated";

revoke references on table "public"."monite_entities" from "authenticated";

revoke select on table "public"."monite_entities" from "authenticated";

revoke trigger on table "public"."monite_entities" from "authenticated";

revoke truncate on table "public"."monite_entities" from "authenticated";

revoke update on table "public"."monite_entities" from "authenticated";

revoke delete on table "public"."monite_entities" from "service_role";

revoke insert on table "public"."monite_entities" from "service_role";

revoke references on table "public"."monite_entities" from "service_role";

revoke select on table "public"."monite_entities" from "service_role";

revoke trigger on table "public"."monite_entities" from "service_role";

revoke truncate on table "public"."monite_entities" from "service_role";

revoke update on table "public"."monite_entities" from "service_role";

revoke delete on table "public"."monite_logs" from "anon";

revoke insert on table "public"."monite_logs" from "anon";

revoke references on table "public"."monite_logs" from "anon";

revoke select on table "public"."monite_logs" from "anon";

revoke trigger on table "public"."monite_logs" from "anon";

revoke truncate on table "public"."monite_logs" from "anon";

revoke update on table "public"."monite_logs" from "anon";

revoke delete on table "public"."monite_logs" from "authenticated";

revoke insert on table "public"."monite_logs" from "authenticated";

revoke references on table "public"."monite_logs" from "authenticated";

revoke select on table "public"."monite_logs" from "authenticated";

revoke trigger on table "public"."monite_logs" from "authenticated";

revoke truncate on table "public"."monite_logs" from "authenticated";

revoke update on table "public"."monite_logs" from "authenticated";

revoke delete on table "public"."monite_logs" from "service_role";

revoke insert on table "public"."monite_logs" from "service_role";

revoke references on table "public"."monite_logs" from "service_role";

revoke select on table "public"."monite_logs" from "service_role";

revoke trigger on table "public"."monite_logs" from "service_role";

revoke truncate on table "public"."monite_logs" from "service_role";

revoke update on table "public"."monite_logs" from "service_role";

revoke delete on table "public"."monite_metrics" from "anon";

revoke insert on table "public"."monite_metrics" from "anon";

revoke references on table "public"."monite_metrics" from "anon";

revoke select on table "public"."monite_metrics" from "anon";

revoke trigger on table "public"."monite_metrics" from "anon";

revoke truncate on table "public"."monite_metrics" from "anon";

revoke update on table "public"."monite_metrics" from "anon";

revoke delete on table "public"."monite_metrics" from "authenticated";

revoke insert on table "public"."monite_metrics" from "authenticated";

revoke references on table "public"."monite_metrics" from "authenticated";

revoke select on table "public"."monite_metrics" from "authenticated";

revoke trigger on table "public"."monite_metrics" from "authenticated";

revoke truncate on table "public"."monite_metrics" from "authenticated";

revoke update on table "public"."monite_metrics" from "authenticated";

revoke delete on table "public"."monite_metrics" from "service_role";

revoke insert on table "public"."monite_metrics" from "service_role";

revoke references on table "public"."monite_metrics" from "service_role";

revoke select on table "public"."monite_metrics" from "service_role";

revoke trigger on table "public"."monite_metrics" from "service_role";

revoke truncate on table "public"."monite_metrics" from "service_role";

revoke update on table "public"."monite_metrics" from "service_role";

revoke delete on table "public"."monite_tokens" from "anon";

revoke insert on table "public"."monite_tokens" from "anon";

revoke references on table "public"."monite_tokens" from "anon";

revoke select on table "public"."monite_tokens" from "anon";

revoke trigger on table "public"."monite_tokens" from "anon";

revoke truncate on table "public"."monite_tokens" from "anon";

revoke update on table "public"."monite_tokens" from "anon";

revoke delete on table "public"."monite_tokens" from "authenticated";

revoke insert on table "public"."monite_tokens" from "authenticated";

revoke references on table "public"."monite_tokens" from "authenticated";

revoke select on table "public"."monite_tokens" from "authenticated";

revoke trigger on table "public"."monite_tokens" from "authenticated";

revoke truncate on table "public"."monite_tokens" from "authenticated";

revoke update on table "public"."monite_tokens" from "authenticated";

revoke delete on table "public"."monite_tokens" from "service_role";

revoke insert on table "public"."monite_tokens" from "service_role";

revoke references on table "public"."monite_tokens" from "service_role";

revoke select on table "public"."monite_tokens" from "service_role";

revoke trigger on table "public"."monite_tokens" from "service_role";

revoke truncate on table "public"."monite_tokens" from "service_role";

revoke update on table "public"."monite_tokens" from "service_role";

revoke delete on table "public"."monite_user_entities" from "anon";

revoke insert on table "public"."monite_user_entities" from "anon";

revoke references on table "public"."monite_user_entities" from "anon";

revoke select on table "public"."monite_user_entities" from "anon";

revoke trigger on table "public"."monite_user_entities" from "anon";

revoke truncate on table "public"."monite_user_entities" from "anon";

revoke update on table "public"."monite_user_entities" from "anon";

revoke delete on table "public"."monite_user_entities" from "authenticated";

revoke insert on table "public"."monite_user_entities" from "authenticated";

revoke references on table "public"."monite_user_entities" from "authenticated";

revoke select on table "public"."monite_user_entities" from "authenticated";

revoke trigger on table "public"."monite_user_entities" from "authenticated";

revoke truncate on table "public"."monite_user_entities" from "authenticated";

revoke update on table "public"."monite_user_entities" from "authenticated";

revoke delete on table "public"."monite_user_entities" from "service_role";

revoke insert on table "public"."monite_user_entities" from "service_role";

revoke references on table "public"."monite_user_entities" from "service_role";

revoke select on table "public"."monite_user_entities" from "service_role";

revoke trigger on table "public"."monite_user_entities" from "service_role";

revoke truncate on table "public"."monite_user_entities" from "service_role";

revoke update on table "public"."monite_user_entities" from "service_role";

revoke delete on table "public"."monite_webhook_events" from "anon";

revoke insert on table "public"."monite_webhook_events" from "anon";

revoke references on table "public"."monite_webhook_events" from "anon";

revoke select on table "public"."monite_webhook_events" from "anon";

revoke trigger on table "public"."monite_webhook_events" from "anon";

revoke truncate on table "public"."monite_webhook_events" from "anon";

revoke update on table "public"."monite_webhook_events" from "anon";

revoke delete on table "public"."monite_webhook_events" from "authenticated";

revoke insert on table "public"."monite_webhook_events" from "authenticated";

revoke references on table "public"."monite_webhook_events" from "authenticated";

revoke select on table "public"."monite_webhook_events" from "authenticated";

revoke trigger on table "public"."monite_webhook_events" from "authenticated";

revoke truncate on table "public"."monite_webhook_events" from "authenticated";

revoke update on table "public"."monite_webhook_events" from "authenticated";

revoke delete on table "public"."monite_webhook_events" from "service_role";

revoke insert on table "public"."monite_webhook_events" from "service_role";

revoke references on table "public"."monite_webhook_events" from "service_role";

revoke select on table "public"."monite_webhook_events" from "service_role";

revoke trigger on table "public"."monite_webhook_events" from "service_role";

revoke truncate on table "public"."monite_webhook_events" from "service_role";

revoke update on table "public"."monite_webhook_events" from "service_role";

alter table "public"."entities" drop constraint "entities_status_check";

alter table "public"."entities" drop constraint "entities_user_id_fkey";

alter table "public"."monite_counterparts" drop constraint "monite_counterparts_entity_id_fkey";

alter table "public"."monite_counterparts" drop constraint "valid_type";

alter table "public"."monite_entities" drop constraint "monite_entities_monite_entity_id_key";

alter table "public"."monite_entities" drop constraint "valid_status";

alter table "public"."monite_tokens" drop constraint "monite_tokens_entity_id_fkey";

alter table "public"."monite_tokens" drop constraint "valid_token_type";

alter table "public"."monite_user_entities" drop constraint "monite_user_entities_user_id_entity_id_key";

alter table "public"."monite_user_entities" drop constraint "monite_user_entities_user_id_fkey";

alter table "public"."monite_webhook_events" drop constraint "monite_webhook_events_entity_id_fkey";

drop function if exists "public"."handle_updated_at"();

drop function if exists "public"."update_updated_at_column"();

alter table "public"."entities" drop constraint "entities_pkey";

alter table "public"."monite_cache" drop constraint "monite_cache_pkey";

alter table "public"."monite_counterparts" drop constraint "monite_counterparts_pkey";

alter table "public"."monite_entities" drop constraint "monite_entities_pkey";

alter table "public"."monite_logs" drop constraint "monite_logs_pkey";

alter table "public"."monite_metrics" drop constraint "monite_metrics_pkey";

alter table "public"."monite_tokens" drop constraint "monite_tokens_pkey";

alter table "public"."monite_user_entities" drop constraint "monite_user_entities_pkey";

alter table "public"."monite_webhook_events" drop constraint "monite_webhook_events_pkey";

drop index if exists "public"."entities_pkey";

drop index if exists "public"."idx_monite_cache_expires_at";

drop index if exists "public"."idx_monite_counterparts_email";

drop index if exists "public"."idx_monite_counterparts_entity_id";

drop index if exists "public"."idx_monite_tokens_entity_id";

drop index if exists "public"."idx_monite_tokens_expires_at";

drop index if exists "public"."idx_monite_webhook_events_entity_id";

drop index if exists "public"."idx_monite_webhook_events_processed";

drop index if exists "public"."idx_user_entities_entity_id";

drop index if exists "public"."idx_user_entities_user_id";

drop index if exists "public"."monite_cache_pkey";

drop index if exists "public"."monite_counterparts_pkey";

drop index if exists "public"."monite_entities_monite_entity_id_key";

drop index if exists "public"."monite_entities_pkey";

drop index if exists "public"."monite_logs_pkey";

drop index if exists "public"."monite_metrics_pkey";

drop index if exists "public"."monite_tokens_pkey";

drop index if exists "public"."monite_user_entities_pkey";

drop index if exists "public"."monite_user_entities_user_id_entity_id_key";

drop index if exists "public"."monite_webhook_events_pkey";

drop table "public"."entities";

drop table "public"."monite_cache";

drop table "public"."monite_counterparts";

drop table "public"."monite_entities";

drop table "public"."monite_logs";

drop table "public"."monite_metrics";

drop table "public"."monite_tokens";

drop table "public"."monite_user_entities";

drop table "public"."monite_webhook_events";


