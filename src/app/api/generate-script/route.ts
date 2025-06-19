import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateScriptId } from '@/lib/script-utils'
import { Database } from '@/lib/types/database'

// Cliente com Service Role para operações backend seguras
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Cliente para verificar auth do usuário
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // 1. Verificar autenticação
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      )
    }

    // 2. Verificar token JWT
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      )
    }

    // 3. Obter baseUrl do body
    const { baseUrl } = await request.json()
    if (!baseUrl) {
      return NextResponse.json(
        { error: 'baseUrl is required' },
        { status: 400 }
      )
    }

    // 4. Gerar script ID
    const scriptId = generateScriptId(user.id)

    // 5. Salvar na tabela generated_scripts (com Service Role)
    const { error: insertError } = await supabaseAdmin
      .from('generated_scripts')
      .upsert(
        {
          script_id: scriptId,
          user_id: user.id,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        { 
          onConflict: 'script_id', 
          ignoreDuplicates: false 
        }
      )

    if (insertError) {
      console.error('❌ Erro ao salvar script no banco:', insertError)
      return NextResponse.json(
        { error: 'Failed to save script' },
        { status: 500 }
      )
    }

    // 6. Gerar script loader
    const loaderScript = `<script src="${baseUrl}/api/js/${scriptId}" async defer></script>`

    return NextResponse.json({
      success: true,
      script: loaderScript,
      scriptId: scriptId
    })

  } catch (error) {
    console.error('❌ Erro na API generate-script:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 