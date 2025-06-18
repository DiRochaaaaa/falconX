-- Criar tabela user_trigger_configs no schema PUBLIC (Supabase na nuvem)
-- Execute este script no SQL Editor do Supabase

-- Verificar se a tabela clone_actions já tem trigger_params
DO $$ 
BEGIN
    -- Verificar se a coluna trigger_params existe na tabela clone_actions
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'clone_actions' 
        AND column_name = 'trigger_params'
    ) THEN
        -- Adicionar coluna trigger_params se não existir
        ALTER TABLE public.clone_actions 
        ADD COLUMN trigger_params JSONB DEFAULT '{"fbclid": true}';
        
        RAISE NOTICE 'Coluna trigger_params adicionada à tabela clone_actions';
    ELSE
        RAISE NOTICE 'Coluna trigger_params já existe na tabela clone_actions';
    END IF;
END $$;

-- Criar tabela user_trigger_configs no schema public
CREATE TABLE IF NOT EXISTS public.user_trigger_configs (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    trigger_params JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Comentário sobre a estrutura
COMMENT ON TABLE public.user_trigger_configs IS 'Configurações personalizadas de triggers por usuário';
COMMENT ON COLUMN public.user_trigger_configs.trigger_params IS 'JSON com configuração de triggers: {"fbclid": true, "utm_source": true, ...}';

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_user_trigger_configs_user_id ON public.user_trigger_configs(user_id);

-- Função para atualizar updated_at (se não existir)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
DO $$ BEGIN
    CREATE TRIGGER update_user_trigger_configs_updated_at 
        BEFORE UPDATE ON public.user_trigger_configs 
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN 
        RAISE NOTICE 'Trigger update_user_trigger_configs_updated_at já existe';
END $$;

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.user_trigger_configs ENABLE ROW LEVEL SECURITY;

-- Política RLS - usuários só podem ver/editar suas próprias configurações
DO $$ BEGIN
    CREATE POLICY "Users can manage own trigger configs" ON public.user_trigger_configs
        FOR ALL USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN 
        RAISE NOTICE 'Política RLS já existe para user_trigger_configs';
END $$;

-- Inserir configurações padrão para usuários existentes
INSERT INTO public.user_trigger_configs (user_id, trigger_params)
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
FROM auth.users
WHERE id NOT IN (
    SELECT user_id 
    FROM public.user_trigger_configs 
    WHERE user_id IS NOT NULL
)
ON CONFLICT (user_id) DO NOTHING;

-- Verificar resultado
DO $$
DECLARE
    user_count INTEGER;
    config_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM auth.users;
    SELECT COUNT(*) INTO config_count FROM public.user_trigger_configs;
    
    RAISE NOTICE 'Usuários totais: %, Configurações criadas: %', user_count, config_count;
END $$;

-- Comentário de conclusão
SELECT 'Tabela user_trigger_configs criada com sucesso no schema public!' as resultado; 