-- Add order column to session_flavors table to track the order of flavors
-- This allows us to identify the main flavor (order = 1)

-- Add order column with default value
ALTER TABLE public.session_flavors
ADD COLUMN IF NOT EXISTS flavor_order INTEGER NOT NULL DEFAULT 1;

-- Create index for performance when querying by order
CREATE INDEX IF NOT EXISTS idx_session_flavors_order ON public.session_flavors(session_id, flavor_order);

-- Update existing data to set proper order based on created_at
-- This ensures the first created flavor has order = 1
WITH ordered_flavors AS (
    SELECT 
        id,
        ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY created_at ASC) as new_order
    FROM public.session_flavors
)
UPDATE public.session_flavors sf
SET flavor_order = of.new_order
FROM ordered_flavors of
WHERE sf.id = of.id;

-- Add check constraint to ensure order starts from 1
ALTER TABLE public.session_flavors
ADD CONSTRAINT check_flavor_order_positive CHECK (flavor_order > 0);