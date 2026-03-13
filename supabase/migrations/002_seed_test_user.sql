-- Test user for development
-- Access code: 123456
-- Max devices: 3
INSERT INTO users (access_code, label, max_devices, is_active)
VALUES ('123456', 'Usuario de Prueba', 3, true)
ON CONFLICT (access_code) DO NOTHING;
