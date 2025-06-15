-- =====================================================
-- FALCON X - DATABASE SETUP SCRIPT (VERSÃO SEGURA)
-- =====================================================
-- Este script cria toda a estrutura do banco de dados
-- para o sistema Falcon X no schema 'falconx'
-- Versão que trata elementos já existentes
-- =====================================================

-- Criar schema falconx se não existir
CREATE SCHEMA IF NOT EXISTS falconx;

-- Habilitar RLS em todo o schema
ALTER DEFAULT PRIVILEGES IN SCHEMA falconx GRANT ALL ON TABLES TO authenticated;

-- =====================================================
-- 1. CRIAÇÃO DOS ENUMS (COM VERIFICAÇÃO)
-- =====================================================

-- Enum para tipos de planos
DO $$ BEGIN
    CREATE TYPE falconx.plan_type_enum AS ENUM (
        'free',
        'bronze',
        'silver', 
        'gold'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enum para status de assinatura
DO $$ BEGIN
    CREATE TYPE falconx.subscription_status_enum AS ENUM (
        'active',
        'expired',
        'cancelled',
        'pending'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enum para tipos de ações
DO $$ BEGIN
    CREATE TYPE falconx.action_type_enum AS ENUM (
        'redirect_traffic',
        'blank_page',
        'custom_message'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- 2. TABELAS PRINCIPAIS
-- =====================================================

-- Tabela: profiles (extensão do auth.users)
CREATE TABLE IF NOT EXISTS falconx.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    plan_type falconx.plan_type_enum DEFAULT 'free',
    api_key TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: plans (planos de assinatura)
CREATE TABLE IF NOT EXISTS falconx.plans (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    domain_limit INTEGER NOT NULL DEFAULT 0,
    extra_domain_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    features JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: user_subscriptions (assinaturas dos usuários)
CREATE TABLE IF NOT EXISTS falconx.user_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES falconx.profiles(id) ON DELETE CASCADE,
    plan_id INTEGER REFERENCES falconx.plans(id),
    status falconx.subscription_status_enum DEFAULT 'pending',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    webhook_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: allowed_domains (domínios permitidos)
CREATE TABLE IF NOT EXISTS falconx.allowed_domains (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES falconx.profiles(id) ON DELETE CASCADE,
    domain TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar constraint única se não existir
DO $$ BEGIN
    ALTER TABLE falconx.allowed_domains ADD CONSTRAINT allowed_domains_user_id_domain_key UNIQUE(user_id, domain);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tabela: generated_scripts (scripts gerados)
CREATE TABLE IF NOT EXISTS falconx.generated_scripts (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES falconx.profiles(id) ON DELETE CASCADE,
    script_id TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
    script_content TEXT NOT NULL,
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: detected_clones (clones detectados)
CREATE TABLE IF NOT EXISTS falconx.detected_clones (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES falconx.profiles(id) ON DELETE CASCADE,
    clone_domain TEXT NOT NULL,
    original_domain TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    first_detected TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    detection_count INTEGER DEFAULT 1,
    is_blocked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar constraint única se não existir
DO $$ BEGIN
    ALTER TABLE falconx.detected_clones ADD CONSTRAINT detected_clones_user_id_clone_domain_key UNIQUE(user_id, clone_domain);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tabela: clone_actions (ações configuradas)
CREATE TABLE IF NOT EXISTS falconx.clone_actions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES falconx.profiles(id) ON DELETE CASCADE,
    clone_id INTEGER REFERENCES falconx.detected_clones(id) ON DELETE CASCADE,
    action_type falconx.action_type_enum NOT NULL,
    redirect_url TEXT,
    redirect_percentage INTEGER DEFAULT 100,
    trigger_params JSONB DEFAULT '{"fbclid": true}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar constraint de check se não existir
DO $$ BEGIN
    ALTER TABLE falconx.clone_actions ADD CONSTRAINT clone_actions_redirect_percentage_check CHECK (redirect_percentage BETWEEN 1 AND 100);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tabela: detection_logs (logs de detecção)
CREATE TABLE IF NOT EXISTS falconx.detection_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES falconx.profiles(id) ON DELETE CASCADE,
    clone_id INTEGER REFERENCES falconx.detected_clones(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    page_url TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para profiles
CREATE INDEX IF NOT EXISTS idx_profiles_api_key ON falconx.profiles(api_key);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON falconx.profiles(email);

-- Índices para allowed_domains
CREATE INDEX IF NOT EXISTS idx_allowed_domains_user_domain ON falconx.allowed_domains(user_id, domain);
CREATE INDEX IF NOT EXISTS idx_allowed_domains_domain ON falconx.allowed_domains(domain);

-- Índices para detected_clones
CREATE INDEX IF NOT EXISTS idx_detected_clones_user_domain ON falconx.detected_clones(user_id, clone_domain);
CREATE INDEX IF NOT EXISTS idx_detected_clones_domain ON falconx.detected_clones(clone_domain);
CREATE INDEX IF NOT EXISTS idx_detected_clones_last_seen ON falconx.detected_clones(last_seen);

-- Índices para detection_logs
CREATE INDEX IF NOT EXISTS idx_detection_logs_timestamp ON falconx.detection_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_detection_logs_user_timestamp ON falconx.detection_logs(user_id, timestamp);

-- Índices para user_subscriptions
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON falconx.user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_expires ON falconx.user_subscriptions(expires_at);

-- =====================================================
-- 4. TRIGGERS PARA UPDATED_AT
-- =====================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION falconx.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar triggers em todas as tabelas com updated_at
DO $$ BEGIN
    CREATE TRIGGER update_profiles_updated_at 
        BEFORE UPDATE ON falconx.profiles 
        FOR EACH ROW EXECUTE FUNCTION falconx.update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_plans_updated_at 
        BEFORE UPDATE ON falconx.plans 
        FOR EACH ROW EXECUTE FUNCTION falconx.update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_user_subscriptions_updated_at 
        BEFORE UPDATE ON falconx.user_subscriptions 
        FOR EACH ROW EXECUTE FUNCTION falconx.update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_allowed_domains_updated_at 
        BEFORE UPDATE ON falconx.allowed_domains 
        FOR EACH ROW EXECUTE FUNCTION falconx.update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_generated_scripts_updated_at 
        BEFORE UPDATE ON falconx.generated_scripts 
        FOR EACH ROW EXECUTE FUNCTION falconx.update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_detected_clones_updated_at 
        BEFORE UPDATE ON falconx.detected_clones 
        FOR EACH ROW EXECUTE FUNCTION falconx.update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_clone_actions_updated_at 
        BEFORE UPDATE ON falconx.clone_actions 
        FOR EACH ROW EXECUTE FUNCTION falconx.update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE falconx.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE falconx.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE falconx.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE falconx.allowed_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE falconx.generated_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE falconx.detected_clones ENABLE ROW LEVEL SECURITY;
ALTER TABLE falconx.clone_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE falconx.detection_logs ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes e recriar
DROP POLICY IF EXISTS "Users can view own profile" ON falconx.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON falconx.profiles;
DROP POLICY IF EXISTS "Anyone can view plans" ON falconx.plans;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON falconx.user_subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON falconx.user_subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON falconx.user_subscriptions;
DROP POLICY IF EXISTS "Users can manage own domains" ON falconx.allowed_domains;
DROP POLICY IF EXISTS "Users can manage own scripts" ON falconx.generated_scripts;
DROP POLICY IF EXISTS "Users can view own detections" ON falconx.detected_clones;
DROP POLICY IF EXISTS "Users can manage own actions" ON falconx.clone_actions;
DROP POLICY IF EXISTS "Users can view own logs" ON falconx.detection_logs;
DROP POLICY IF EXISTS "System can insert logs" ON falconx.detection_logs;

-- Políticas RLS para profiles
CREATE POLICY "Users can view own profile" ON falconx.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON falconx.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Políticas RLS para plans (todos podem ler)
CREATE POLICY "Anyone can view plans" ON falconx.plans
    FOR SELECT USING (true);

-- Políticas RLS para user_subscriptions
CREATE POLICY "Users can view own subscriptions" ON falconx.user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON falconx.user_subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON falconx.user_subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para allowed_domains
CREATE POLICY "Users can manage own domains" ON falconx.allowed_domains
    FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para generated_scripts
CREATE POLICY "Users can manage own scripts" ON falconx.generated_scripts
    FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para detected_clones
CREATE POLICY "Users can view own detections" ON falconx.detected_clones
    FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para clone_actions
CREATE POLICY "Users can manage own actions" ON falconx.clone_actions
    FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para detection_logs
CREATE POLICY "Users can view own logs" ON falconx.detection_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert logs" ON falconx.detection_logs
    FOR INSERT WITH CHECK (true);

-- =====================================================
-- 6. DADOS INICIAIS (SEED DATA)
-- =====================================================

-- Inserir planos iniciais (apenas se não existirem)
INSERT INTO falconx.plans (name, price, domain_limit, extra_domain_price, features) 
SELECT 'Free', 0.00, 0, 0, '{"show_clone_count": true, "show_clone_domains": false}'
WHERE NOT EXISTS (SELECT 1 FROM falconx.plans WHERE name = 'Free');

INSERT INTO falconx.plans (name, price, domain_limit, extra_domain_price, features) 
SELECT 'Bronze', 29.90, 10, 2.00, '{"show_clone_count": true, "show_clone_domains": true, "basic_actions": true}'
WHERE NOT EXISTS (SELECT 1 FROM falconx.plans WHERE name = 'Bronze');

INSERT INTO falconx.plans (name, price, domain_limit, extra_domain_price, features) 
SELECT 'Silver', 59.90, 50, 1.50, '{"show_clone_count": true, "show_clone_domains": true, "basic_actions": true, "advanced_actions": true}'
WHERE NOT EXISTS (SELECT 1 FROM falconx.plans WHERE name = 'Silver');

INSERT INTO falconx.plans (name, price, domain_limit, extra_domain_price, features) 
SELECT 'Gold', 99.90, 200, 1.00, '{"show_clone_count": true, "show_clone_domains": true, "basic_actions": true, "advanced_actions": true, "priority_support": true}'
WHERE NOT EXISTS (SELECT 1 FROM falconx.plans WHERE name = 'Gold');

-- =====================================================
-- 7. FUNÇÕES AUXILIARES
-- =====================================================

-- Função para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION falconx.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO falconx.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover trigger existente e recriar
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION falconx.handle_new_user();

-- Função para atualizar contagem de detecções
CREATE OR REPLACE FUNCTION falconx.update_detection_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar contagem e última visualização
    UPDATE falconx.detected_clones 
    SET 
        detection_count = detection_count + 1,
        last_seen = NOW(),
        updated_at = NOW()
    WHERE id = NEW.clone_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remover trigger existente e recriar
DROP TRIGGER IF EXISTS update_detection_count_trigger ON falconx.detection_logs;

CREATE TRIGGER update_detection_count_trigger
    AFTER INSERT ON falconx.detection_logs
    FOR EACH ROW EXECUTE FUNCTION falconx.update_detection_count();

-- =====================================================
-- SCRIPT CONCLUÍDO COM SEGURANÇA
-- =====================================================
-- Para executar este script:
-- 1. Abra o SQL Editor no Supabase Dashboard
-- 2. Cole este código (versão segura)
-- 3. Execute o script
-- 4. Verifique se todas as tabelas foram criadas no schema 'falconx'
-- 
-- Este script pode ser executado múltiplas vezes sem erro!
-- ===================================================== 