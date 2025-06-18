import { Icons } from '@/components/Icons'

/**
 * Obtém ícone para tipo de ação
 * @param type - Tipo da ação
 * @returns Componente do ícone
 */
export function getActionIcon(type: string) {
  switch (type) {
    case 'redirect_traffic':
      return Icons.ArrowRight
    case 'blank_page':
      return Icons.EyeOff
    case 'custom_message':
      return Icons.MessageSquare
    default:
      return Icons.Lightning
  }
}

/**
 * Obtém nome amigável para tipo de ação
 * @param type - Tipo da ação
 * @returns Nome em português
 */
export function getActionName(type: string): string {
  switch (type) {
    case 'redirect_traffic':
      return 'Redirecionamento'
    case 'blank_page':
      return 'Página em Branco'
    case 'custom_message':
      return 'Mensagem Custom'
    default:
      return type
  }
}
