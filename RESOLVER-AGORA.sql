-- =====================================================
-- RESOLVER AGORA - SEM CONFIRMAÇÃO DE EMAIL
-- =====================================================

-- 1. DESABILITAR CONFIRMAÇÃO DE EMAIL COMPLETAMENTE
UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;

-- 2. REMOVER TRIGGER ANTIGO
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. FUNÇÃO SUPER SIMPLES
CREATE OR REPLACE FUNCTION falconx.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO falconx.profiles (id, email, full_name, plan_type) 
  VALUES (NEW.id, NEW.email, NEW.email, 'free');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. CRIAR TRIGGER
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION falconx.handle_new_user();

-- 5. CORRIGIR USUÁRIOS SEM PERFIL
INSERT INTO falconx.profiles (id, email, full_name, plan_type)
SELECT u.id, u.email, u.email, 'free'
FROM auth.users u
LEFT JOIN falconx.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- 6. VERIFICAR
SELECT u.email, p.email FROM auth.users u 
INNER JOIN falconx.profiles p ON u.id = p.id; 