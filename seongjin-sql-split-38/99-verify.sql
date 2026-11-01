SELECT count(*) AS stored_keys FROM public.academy_shared_data;
SELECT jsonb_array_length(value) AS student_count FROM public.academy_shared_data WHERE key='cf.students';
SELECT key, pg_column_size(value) AS bytes FROM public.academy_shared_data ORDER BY key;
