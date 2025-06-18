-- Adicionar tabela para configurações de triggers dos usuários
-- Execute este script no SQL Editor do Supabase

-- Criar tabela user_trigger_configs
CREATE TABLE IF NOT EXISTS falconx.user_trigger_configs (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES falconx.profiles(id) ON DELETE CASCADE,
    trigger_params JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_user_trigger_configs_user_id ON falconx.user_trigger_configs(user_id);

-- Trigger para atualizar updated_at
DO $$ BEGIN
    CREATE TRIGGER update_user_trigger_configs_updated_at 
        BEFORE UPDATE ON falconx.user_trigger_configs 
        FOR EACH ROW EXECUTE FUNCTION falconx.update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Inserir configurações padrão para usuários existentes (opcional)
INSERT INTO falconx.user_trigger_configs (user_id, trigger_params)
SELECT 
    id,
    '{
        "fbclid": true,
        "gclid": true,
        "utm_source": true,
        "utm_medium": true,
        "utm_campaign": true,
        "ttclid": true
    }'::jsonb
FROM falconx.profiles
WHERE id NOT IN (SELECT user_id FROM falconx.user_trigger_configs)
ON CONFLICT (user_id) DO NOTHING;

-- Comentário de conclusão
-- Tabela user_trigger_configs criada com sucesso!
-- Os usuários agora podem configurar seus próprios triggers dinamicamente. 