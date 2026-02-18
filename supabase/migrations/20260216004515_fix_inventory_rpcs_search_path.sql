-- Fix search_path security warning for inventory stats RPCs
alter function get_total_stock() set search_path = public;
alter function get_low_stock_count() set search_path = public;
