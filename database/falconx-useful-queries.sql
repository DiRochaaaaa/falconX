-- =====================================================
-- FALCON X - QUERIES ÚTEIS PARA ADMINISTRAÇÃO
-- =====================================================

-- =====================================================
-- 1. CONSULTAS DE USUÁRIOS
-- =====================================================

-- Ver todos os usuários com seus planos
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.plan_type,
    p.created_at,
    us.status as subscription_status,
    us.expires_at,
    pl.name as plan_name,
    pl.price as plan_price
FROM falconx.profiles p
LEFT JOIN falconx.user_subscriptions us ON p.id = us.user_id AND us.status = 'active'
LEFT JOIN falconx.plans pl ON us.plan_id = pl.id
ORDER BY p.created_at DESC;

-- Contar usuários por plano
SELECT 
    plan_type,
    COUNT(*) as total_users
FROM falconx.profiles
GROUP BY plan_type
ORDER BY total_users DESC;

-- =====================================================
-- 2. CONSULTAS DE DETECÇÕES
-- =====================================================

-- Top 10 usuários com mais clones detectados
SELECT 
    p.email,
    p.full_name,
    COUNT(dc.id) as total_clones_detected,
    SUM(dc.detection_count) as total_detections
FROM falconx.profiles p
LEFT JOIN falconx.detected_clones dc ON p.id = dc.user_id
GROUP BY p.id, p.email, p.full_name
HAVING COUNT(dc.id) > 0
ORDER BY total_clones_detected DESC
LIMIT 10;

-- Clones mais ativos (com mais detecções)
SELECT 
    dc.clone_domain,
    dc.original_domain,
    p.email as victim_email,
    dc.detection_count,
    dc.first_detected,
    dc.last_seen
FROM falconx.detected_clones dc
JOIN falconx.profiles p ON dc.user_id = p.id
ORDER BY dc.detection_count DESC
LIMIT 20;

-- Estatísticas de detecções por dia (últimos 30 dias)
SELECT 
    DATE(dl.timestamp) as detection_date,
    COUNT(*) as total_detections,
    COUNT(DISTINCT dl.clone_id) as unique_clones,
    COUNT(DISTINCT dl.user_id) as affected_users
FROM falconx.detection_logs dl
WHERE dl.timestamp >= NOW() - INTERVAL '30 days'
GROUP BY DATE(dl.timestamp)
ORDER BY detection_date DESC;

-- =====================================================
-- 3. CONSULTAS FINANCEIRAS
-- =====================================================

-- Receita mensal por plano
SELECT 
    pl.name as plan_name,
    pl.price,
    COUNT(us.id) as active_subscriptions,
    (pl.price * COUNT(us.id)) as monthly_revenue
FROM falconx.plans pl
LEFT JOIN falconx.user_subscriptions us ON pl.id = us.plan_id AND us.status = 'active'
GROUP BY pl.id, pl.name, pl.price
ORDER BY monthly_revenue DESC;

-- Assinaturas que vencem nos próximos 7 dias
SELECT 
    p.email,
    p.full_name,
    pl.name as plan_name,
    us.expires_at,
    (us.expires_at - NOW()) as time_until_expiry
FROM falconx.user_subscriptions us
JOIN falconx.profiles p ON us.user_id = p.id
JOIN falconx.plans pl ON us.plan_id = pl.id
WHERE us.status = 'active'
AND us.expires_at <= NOW() + INTERVAL '7 days'
ORDER BY us.expires_at ASC;

-- =====================================================
-- 4. CONSULTAS DE AÇÕES
-- =====================================================

-- Ações configuradas por usuário
SELECT 
    p.email,
    dc.clone_domain,
    ca.action_type,
    ca.redirect_url,
    ca.redirect_percentage,
    ca.is_active,
    ca.created_at
FROM falconx.clone_actions ca
JOIN falconx.detected_clones dc ON ca.clone_id = dc.id
JOIN falconx.profiles p ON ca.user_id = p.id
ORDER BY ca.created_at DESC;

-- Estatísticas de tipos de ações
SELECT 
    action_type,
    COUNT(*) as total_actions,
    COUNT(CASE WHEN is_active THEN 1 END) as active_actions
FROM falconx.clone_actions
GROUP BY action_type;

-- =====================================================
-- 5. QUERIES DE MANUTENÇÃO
-- =====================================================

-- Limpar logs antigos (manter apenas últimos 90 dias)
DELETE FROM falconx.detection_logs 
WHERE timestamp < NOW() - INTERVAL '90 days';

-- Atualizar assinaturas expiradas
UPDATE falconx.user_subscriptions 
SET status = 'expired' 
WHERE status = 'active' 
AND expires_at < NOW();

-- Resetar API key de um usuário
UPDATE falconx.profiles 
SET api_key = gen_random_uuid()::text 
WHERE email = 'usuario@exemplo.com';

-- =====================================================
-- 6. QUERIES PARA DASHBOARD
-- =====================================================

-- KPIs principais para dashboard admin
SELECT 
    (SELECT COUNT(*) FROM falconx.profiles) as total_users,
    (SELECT COUNT(*) FROM falconx.user_subscriptions WHERE status = 'active') as active_subscriptions,
    (SELECT COUNT(*) FROM falconx.detected_clones) as total_clones_detected,
    (SELECT COUNT(*) FROM falconx.detection_logs WHERE timestamp >= CURRENT_DATE) as detections_today,
    (SELECT SUM(pl.price) FROM falconx.user_subscriptions us JOIN falconx.plans pl ON us.plan_id = pl.id WHERE us.status = 'active') as monthly_revenue;

-- Usuários mais ativos (com mais domínios permitidos)
SELECT 
    p.email,
    p.full_name,
    p.plan_type,
    COUNT(ad.id) as allowed_domains_count,
    COUNT(dc.id) as clones_detected_count
FROM falconx.profiles p
LEFT JOIN falconx.allowed_domains ad ON p.id = ad.user_id AND ad.is_active = true
LEFT JOIN falconx.detected_clones dc ON p.id = dc.user_id
GROUP BY p.id, p.email, p.full_name, p.plan_type
ORDER BY allowed_domains_count DESC, clones_detected_count DESC
LIMIT 10;

-- =====================================================
-- 7. QUERIES PARA RELATÓRIOS
-- =====================================================

-- Relatório mensal de crescimento
SELECT 
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as new_users,
    SUM(COUNT(*)) OVER (ORDER BY DATE_TRUNC('month', created_at)) as cumulative_users
FROM falconx.profiles
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- Relatório de retenção de usuários
SELECT 
    plan_type,
    COUNT(*) as total_users,
    COUNT(CASE WHEN last_login >= NOW() - INTERVAL '7 days' THEN 1 END) as active_last_7_days,
    COUNT(CASE WHEN last_login >= NOW() - INTERVAL '30 days' THEN 1 END) as active_last_30_days
FROM falconx.profiles p
LEFT JOIN auth.users au ON p.id = au.id
GROUP BY plan_type;

-- =====================================================
-- 8. QUERIES DE SEGURANÇA
-- =====================================================

-- Detectar possíveis ataques (muitas detecções do mesmo IP)
SELECT 
    ip_address,
    COUNT(*) as detection_count,
    COUNT(DISTINCT user_id) as affected_users,
    MIN(timestamp) as first_detection,
    MAX(timestamp) as last_detection
FROM falconx.detection_logs
WHERE timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY ip_address
HAVING COUNT(*) > 100
ORDER BY detection_count DESC;

-- Usuários com muitas API calls suspeitas
SELECT 
    p.email,
    COUNT(dl.id) as api_calls_24h
FROM falconx.profiles p
JOIN falconx.detection_logs dl ON p.id = dl.user_id
WHERE dl.timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY p.id, p.email
HAVING COUNT(dl.id) > 1000
ORDER BY api_calls_24h DESC; 