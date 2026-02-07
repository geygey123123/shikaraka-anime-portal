-- Check favorites table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'favorites'
ORDER BY ordinal_position;

-- Check if there's any data
SELECT COUNT(*) as total_favorites FROM favorites;

-- Show sample data
SELECT * FROM favorites LIMIT 5;
