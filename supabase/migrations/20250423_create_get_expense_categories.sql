
CREATE OR REPLACE FUNCTION public.get_expense_categories()
RETURNS SETOF public.expense_categories
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM public.expense_categories ORDER BY name;
$$;

-- Grant execute permission to the anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.get_expense_categories() TO anon, authenticated;
