-- =====================================================
-- SETUP FINAL - SEM CONFIRMAÇÃO DE EMAIL (SUPER SIMPLES)
-- =====================================================
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- 1. CONFIRMAR USUÁRIOS EXISTENTES (apenas email_confirmed_at)
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- 2. REMOVER TRIGGER ANTIGO (se existir)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. CRIAR FUNÇÃO PARA CRIAR PERFIL AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION falconx.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO falconx.profiles (
    id,
    email,
    full_name,
    plan_type
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'free'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. CRIAR TRIGGER PARA NOVOS USUÁRIOS
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION falconx.handle_new_user();

-- 5. CONFIGURAR SEGURANÇA (RLS)
ALTER TABLE falconx.profiles ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Usuários podem ver seus próprios perfis" ON falconx.profiles;
DROP POLICY IF EXISTS "Sistema pode criar perfis automaticamente" ON falconx.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios perfis" ON falconx.profiles;

-- Criar políticas de segurança
CREATE POLICY "Usuários podem ver seus próprios perfis" ON falconx.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Sistema pode criar perfis automaticamente" ON falconx.profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuários podem atualizar seus próprios perfis" ON falconx.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 6. INSERIR PLANOS BÁSICOS (apenas se a tabela estiver vazia)
INSERT INTO falconx.plans (name, price, domain_limit, extra_domain_price, features, is_active) 
SELECT 'Free', 0.00, 1, 0.00, '{"basic_detection": true}', true
WHERE NOT EXISTS (SELECT 1 FROM falconx.plans WHERE name = 'Free');

INSERT INTO falconx.plans (name, price, domain_limit, extra_domain_price, features, is_active) 
SELECT 'Bronze', 29.99, 5, 5.00, '{"advanced_detection": true, "analytics": true}', true
WHERE NOT EXISTS (SELECT 1 FROM falconx.plans WHERE name = 'Bronze');

INSERT INTO falconx.plans (name, price, domain_limit, extra_domain_price, features, is_active) 
SELECT 'Silver', 59.99, 15, 3.00, '{"advanced_detection": true, "analytics": true, "api_access": true}', true
WHERE NOT EXISTS (SELECT 1 FROM falconx.plans WHERE name = 'Silver');

INSERT INTO falconx.plans (name, price, domain_limit, extra_domain_price, features, is_active) 
SELECT 'Gold', 99.99, -1, 0.00, '{"unlimited_domains": true, "advanced_detection": true, "analytics": true, "api_access": true, "priority_support": true}', true
WHERE NOT EXISTS (SELECT 1 FROM falconx.plans WHERE name = 'Gold');

-- SUCESSO!
SELECT 'Setup concluído com sucesso!' as resultado; 