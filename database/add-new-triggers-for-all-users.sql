-- Script para adicionar novos triggers para todos os usuários
-- Execute este script no SQL Editor do Supabase quando quiser adicionar novos triggers

-- EXEMPLO: Adicionando novos triggers para Instagram e Snapchat
-- Substitua os triggers abaixo pelos que você quer adicionar

DO $$
DECLARE
    new_triggers JSONB := '{
        "igclid": true,
        "ig_source": false,
        "snapclid": true,
        "snap_campaign": false,
        "pinterest_id": false,
        "pin_source": false
    }';
    user_record RECORD;
    current_triggers JSONB;
    updated_triggers JSONB;
    added_count INTEGER := 0;
BEGIN
    -- Percorrer todos os usuários que têm configurações de triggers
    FOR user_record IN 
        SELECT user_id, trigger_params 
        FROM public.user_trigger_configs
    LOOP
        current_triggers := user_record.trigger_params;
        updated_triggers := current_triggers;
        
        -- Adicionar apenas os novos triggers que não existem
        SELECT jsonb_object_agg(key, value) INTO updated_triggers
        FROM (
            SELECT key, value FROM jsonb_each(current_triggers)
            UNION
            SELECT key, value FROM jsonb_each(new_triggers)
            WHERE key NOT IN (SELECT jsonb_object_keys(current_triggers))
        ) AS combined_triggers;
        
        -- Atualizar apenas se houve mudanças
        IF updated_triggers != current_triggers THEN
            UPDATE public.user_trigger_configs 
            SET 
                trigger_params = updated_triggers,
                updated_at = NOW()
            WHERE user_id = user_record.user_id;
            
            added_count := added_count + 1;
        END IF;
    END LOOP;
    
    -- Adicionar configurações para novos usuários que não têm triggers configurados
    INSERT INTO public.user_trigger_configs (user_id, trigger_params)
    SELECT 
        id as user_id,
        jsonb_build_object(
            'fbclid', true,
            'gclid', true,
            'utm_source', true,
            'utm_medium', true,
            'utm_campaign', true,
            'ttclid', true
        ) || new_triggers as trigger_params
    FROM auth.users
    WHERE id NOT IN (
        SELECT user_id 
        FROM public.user_trigger_configs 
        WHERE user_id IS NOT NULL
    )
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Mostrar resultado
    RAISE NOTICE 'Novos triggers adicionados para % usuários existentes', added_count;
    RAISE NOTICE 'Triggers adicionados: %', new_triggers;
END $$;

-- Verificar resultado final
SELECT 
    COUNT(*) as total_users_with_triggers,
    jsonb_object_keys(trigger_params) as available_triggers
FROM public.user_trigger_configs, jsonb_object_keys(trigger_params)
GROUP BY jsonb_object_keys(trigger_params)
ORDER BY available_triggers; 