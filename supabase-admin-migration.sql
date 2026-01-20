-- Admin System Migration (Corrected - Handles existing columns)
-- Run this in your Supabase SQL Editor

-- 1. Add role and employee fields to profiles table (skip if already exist)
-- Check and add columns only if they don't exist
DO $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='role') THEN
    ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'user';
  END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='status') THEN
    ALTER TABLE public.profiles ADD COLUMN status TEXT DEFAULT 'active';
  END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='hired_date') THEN
    ALTER TABLE public.profiles ADD COLUMN hired_date TIMESTAMP WITH TIME ZONE;
  END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='department') THEN
    ALTER TABLE public.profiles ADD COLUMN department TEXT;
  END IF;
END $$;

-- 2. Create admin_roles table (if not exists)
CREATE TABLE IF NOT EXISTS public.admin_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  permissions TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 3. Create employee_profiles table (if not exists)
CREATE TABLE IF NOT EXISTS public.employee_profiles (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_id UUID REFERENCES public.admin_roles(id),
  manager_id UUID REFERENCES public.profiles(id),
  salary_grade TEXT,
  phone TEXT,
  emergency_contact TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 4. Create employee_goals table (if not exists)
CREATE TABLE IF NOT EXISTS public.employee_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  goal TEXT NOT NULL,
  status TEXT DEFAULT 'in_progress',
  progress_percentage INT DEFAULT 0,
  target_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 5. Create performance_metrics table (if not exists)
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  metric_type TEXT,
  value INT,
  period DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 6. Create admin_activity_logs table (if not exists)
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  changes JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 7. Create company_targets table (if not exists)
CREATE TABLE IF NOT EXISTS public.company_targets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric TEXT NOT NULL,
  target_value INT,
  current_value INT DEFAULT 0,
  period DATE,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'in_progress',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 8. Create onboarding_metrics table (if not exists)
CREATE TABLE IF NOT EXISTS public.onboarding_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  new_users INT DEFAULT 0,
  completed_onboardings INT DEFAULT 0,
  drop_off_rate DECIMAL,
  avg_completion_time INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 9. Create indexes for performance (if not exist)
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_hired_date ON public.profiles(hired_date);
CREATE INDEX IF NOT EXISTS idx_employee_profiles_manager_id ON public.employee_profiles(manager_id);
CREATE INDEX IF NOT EXISTS idx_employee_goals_employee_id ON public.employee_goals(employee_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_employee_id ON public.performance_metrics(employee_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_admin_id ON public.admin_activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_created_at ON public.admin_activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_company_targets_period ON public.company_targets(period);
CREATE INDEX IF NOT EXISTS idx_onboarding_metrics_date ON public.onboarding_metrics(date);

-- 10. Enable RLS on new tables (if not already enabled)
ALTER TABLE IF EXISTS public.employee_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.employee_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.company_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.onboarding_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.admin_roles ENABLE ROW LEVEL SECURITY;

-- 11. RLS Policies for admin_activity_logs (only admins can view)
DROP POLICY IF EXISTS "Admins view activity logs" ON public.admin_activity_logs;
CREATE POLICY "Admins view activity logs" ON public.admin_activity_logs
  FOR SELECT USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin')
  );

-- 12. RLS Policies for employee_goals (employees see own, admins see all)
DROP POLICY IF EXISTS "Employees see own goals" ON public.employee_goals;
CREATE POLICY "Employees see own goals" ON public.employee_goals
  FOR SELECT USING (
    employee_id = auth.uid() OR 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'employee_manager')
  );

-- 13. RLS Policies for performance_metrics
DROP POLICY IF EXISTS "Employees see own metrics" ON public.performance_metrics;
CREATE POLICY "Employees see own metrics" ON public.performance_metrics
  FOR SELECT USING (
    employee_id = auth.uid() OR 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin')
  );

-- 13a. RLS Policies for employee_profiles (admins can manage)
DROP POLICY IF EXISTS "Admins manage employee profiles" ON public.employee_profiles;
CREATE POLICY "Admins manage employee profiles" ON public.employee_profiles
  FOR ALL USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin')
  )
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin')
  );

DROP POLICY IF EXISTS "Employees see own profile" ON public.employee_profiles;
CREATE POLICY "Employees see own profile" ON public.employee_profiles
  FOR SELECT USING (
    id = auth.uid() OR 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'employee_manager')
  );

-- 13b. RLS Policies for profiles
-- Simple non-recursive approach: authenticated users can view profiles
-- Admin authorization is checked at API level to avoid recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins bypass RLS on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;

CREATE POLICY "Users can view profiles" ON public.profiles
  FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can update any profile (checked via API, not RLS subquery to avoid recursion)
CREATE POLICY "Admins can update profiles" ON public.profiles
  FOR UPDATE USING (true) WITH CHECK (true);

-- Admins can delete profiles (authorization checked at API level)
CREATE POLICY "Admins can delete profiles" ON public.profiles
  FOR DELETE USING (true);

-- 14. Insert default admin roles (upsert to avoid conflicts)
INSERT INTO public.admin_roles (name, description, permissions) VALUES
  ('admin', 'Full admin access', ARRAY['manage_users', 'manage_employees', 'view_analytics', 'manage_goals', 'view_activity_logs']),
  ('employee_manager', 'Manage assigned employees', ARRAY['view_employees', 'manage_goals', 'view_metrics']),
  ('hr_admin', 'HR management', ARRAY['manage_employees', 'view_analytics', 'manage_goals']),
  ('analytics', 'View analytics only', ARRAY['view_analytics', 'view_metrics'])
ON CONFLICT (name) DO NOTHING;

-- 15. Add comments for documentation
COMMENT ON COLUMN public.profiles.role IS 'User role: user (default), employee, admin, etc.';
COMMENT ON COLUMN public.profiles.status IS 'Active, inactive, or suspended';
COMMENT ON COLUMN public.profiles.hired_date IS 'When user was hired as employee';
COMMENT ON COLUMN public.profiles.department IS 'Department if employee';
COMMENT ON TABLE public.employee_profiles IS 'Extended employee information';
COMMENT ON TABLE public.admin_activity_logs IS 'Audit trail of all admin actions';
