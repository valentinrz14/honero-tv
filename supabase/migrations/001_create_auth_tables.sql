-- Honero TV Authentication Schema
-- Users are identified by a 6-digit access code
-- Each user has a max number of allowed devices
-- Devices expire after 30 days from registration

-- Users table (each user = one access code)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  access_code VARCHAR(6) UNIQUE NOT NULL,
  label VARCHAR(100) NOT NULL, -- friendly name, e.g. "Juan Pérez"
  max_devices INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Devices table (registered devices per user)
CREATE TABLE IF NOT EXISTS devices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id VARCHAR(255) NOT NULL, -- unique Android device identifier
  device_name VARCHAR(255), -- e.g. "Android TV - Living"
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_seen_at TIMESTAMPTZ DEFAULT now()
);

-- Unique constraint: one device can only be registered once per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_devices_user_device ON devices(user_id, device_id);

-- Index for quick lookups by access code
CREATE INDEX IF NOT EXISTS idx_users_access_code ON users(access_code);

-- Index for quick device lookup
CREATE INDEX IF NOT EXISTS idx_devices_device_id ON devices(device_id);

-- Auto-update updated_at on users
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;

-- Policies: allow all operations for authenticated service role (admin panel)
-- The admin panel uses the service_role key
CREATE POLICY "Service role full access on users"
  ON users FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access on devices"
  ON devices FOR ALL
  USING (true)
  WITH CHECK (true);

-- Function to validate an access code and register/validate a device
-- Called from the app. Returns status: 'ok', 'expired', 'max_devices', 'invalid_code', 'inactive'
CREATE OR REPLACE FUNCTION validate_device(
  p_access_code VARCHAR(6),
  p_device_id VARCHAR(255),
  p_device_name VARCHAR(255) DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_user RECORD;
  v_device RECORD;
  v_device_count INTEGER;
BEGIN
  -- Find user by access code
  SELECT * INTO v_user FROM users WHERE access_code = p_access_code;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'invalid_code', 'message', 'Código inválido');
  END IF;

  IF NOT v_user.is_active THEN
    RETURN jsonb_build_object('status', 'inactive', 'message', 'Tu cuenta está desactivada. Contactá a soporte.');
  END IF;

  -- Check if this device is already registered for this user
  SELECT * INTO v_device FROM devices
    WHERE user_id = v_user.id AND device_id = p_device_id;

  IF FOUND THEN
    -- Device exists, check if active and not expired
    IF NOT v_device.is_active THEN
      RETURN jsonb_build_object('status', 'revoked', 'message', 'Este dispositivo fue revocado. Contactá a soporte.');
    END IF;

    IF v_device.expires_at < now() THEN
      -- Mark as inactive
      UPDATE devices SET is_active = false WHERE id = v_device.id;
      RETURN jsonb_build_object('status', 'expired', 'message', 'Tu acceso expiró. Contactá a soporte para renovar.');
    END IF;

    -- Update last seen
    UPDATE devices SET last_seen_at = now() WHERE id = v_device.id;

    RETURN jsonb_build_object(
      'status', 'ok',
      'user_id', v_user.id,
      'user_label', v_user.label,
      'expires_at', v_device.expires_at,
      'days_remaining', EXTRACT(DAY FROM v_device.expires_at - now())
    );
  ELSE
    -- New device - check if user has room
    SELECT COUNT(*) INTO v_device_count FROM devices
      WHERE user_id = v_user.id AND is_active = true;

    IF v_device_count >= v_user.max_devices THEN
      RETURN jsonb_build_object(
        'status', 'max_devices',
        'message', 'Alcanzaste el máximo de dispositivos (' || v_user.max_devices || '). Contactá a soporte.'
      );
    END IF;

    -- Register new device
    INSERT INTO devices (user_id, device_id, device_name)
    VALUES (v_user.id, p_device_id, COALESCE(p_device_name, 'Dispositivo Android TV'));

    RETURN jsonb_build_object(
      'status', 'ok',
      'user_id', v_user.id,
      'user_label', v_user.label,
      'expires_at', now() + INTERVAL '30 days',
      'days_remaining', 30,
      'message', 'Dispositivo registrado correctamente'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
