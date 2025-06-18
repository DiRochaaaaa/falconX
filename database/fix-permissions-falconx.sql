-- =====================================================
-- CORREÇÃO DE PERMISSÕES - SCHEMA FALCONX
-- =====================================================
-- Este script corrige todas as permissões necessárias
-- para o PostgREST acessar o schema falconx
-- =====================================================

-- 1. CONCEDER PERMISSÕES NO SCHEMA (ESSENCIAL!)
GRANT USAGE ON SCHEMA falconx TO authenticated;
GRANT USAGE ON SCHEMA falconx TO anon;

-- 2. CONCEDER PERMISSÕES EM TODAS AS TABELAS EXISTENTES
GRANT ALL ON ALL TABLES IN SCHEMA falconx TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA falconx TO anon;

-- 3. CONCEDER PERMISSÕES EM SEQUÊNCIAS (PARA AUTO-INCREMENT)
GRANT ALL ON ALL SEQUENCES IN SCHEMA falconx TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA falconx TO anon;

-- 4. CONCEDER PERMISSÕES EM FUNÇÕES
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA falconx TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA falconx TO anon;

-- 5. CONFIGURAR PERMISSÕES PADRÃO PARA OBJETOS FUTUROS
ALTER DEFAULT PRIVILEGES IN SCHEMA falconx GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA falconx GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA falconx GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA falconx GRANT USAGE ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA falconx GRANT EXECUTE ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA falconx GRANT EXECUTE ON FUNCTIONS TO anon;

-- 6. VERIFICAR PERMISSÕES (OPCIONAL - PARA DEBUG)
-- Descomente as linhas abaixo se quiser verificar as permissões:

-- SELECT 
--     schemaname,
--     tablename,
--     tableowner,
--     hasinsert,
--     hasselect,
--     hasupdate,
--     hasdelete
-- FROM pg_tables 
-- WHERE schemaname = 'falconx';

-- SELECT 
--     n.nspname as schema_name,
--     r.rolname as role_name,
--     p.privilege_type
-- FROM information_schema.role_usage_grants p
-- JOIN pg_namespace n ON n.nspname = p.object_schema
-- JOIN pg_roles r ON r.rolname = p.grantee
-- WHERE n.nspname = 'falconx'
-- ORDER BY schema_name, role_name, privilege_type;

-- =====================================================
-- SCRIPT CONCLUÍDO
-- =====================================================
-- Execute este script no SQL Editor do Supabase
-- Após executar, teste novamente a adição de domínios
-- =====================================================

SELECT 'Permissões do schema falconx corrigidas com sucesso!' as resultado; 