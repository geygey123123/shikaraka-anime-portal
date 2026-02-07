-- Migration 005: Create Admin Flag Trigger
-- This migration creates a trigger to automatically set is_admin = true for lifeshindo96@gmail.com

-- ============================================
-- CREATE ADMIN FLAG FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION set_admin_flag()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the new user's email is the admin email
  IF NEW.email = 'lifeshindo96@gmail.com' THEN
    -- Update the corresponding profile to set is_admin = true
    UPDATE profiles 
    SET is_admin = true 
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- CREATE TRIGGER ON AUTH.USERS
-- ============================================
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION set_admin_flag();

-- Note: This trigger will automatically set is_admin = true in the profiles table
-- when a user with email lifeshindo96@gmail.com registers
