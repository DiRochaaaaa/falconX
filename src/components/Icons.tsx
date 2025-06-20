import {
  // Navigation & Layout
  Menu,
  X,
  Home,
  Settings,
  User,
  CreditCard,
  LogOut,
  ChevronDown,
  Plus,
  
  // Actions & States
  Check,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Zap,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Search,
  RefreshCw,
  RotateCcw,
  Save,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Download,
  Upload,
  
  // Data & Analytics
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Globe,
  Users,
  Clock,
  Calendar,
  Filter,
  
  // Communication
  MessageSquare,
  
  // Technology
  Code,
  
  // UI Elements
  ArrowRight,
  Square,
  CheckSquare,
  Star,
  
  // Status & Progress
  Loader2,
  
  // Social & Platforms
  Facebook,
  
  // Security
  ShieldCheck,
} from 'lucide-react'

// Interface para props dos ícones
interface IconProps {
  className?: string
  size?: number | string
  color?: string
  strokeWidth?: number
}

// Exportando ícones modernos do Lucide 
export const Icons = {
  // Navigation & Layout
  Menu: ({ className = 'h-5 w-5', ...props }: IconProps) => <Menu className={className} {...props} />,
  X: ({ className = 'h-5 w-5', ...props }: IconProps) => <X className={className} {...props} />,
  Dashboard: ({ className = 'h-5 w-5', ...props }: IconProps) => <Home className={className} {...props} />,
  Settings: ({ className = 'h-5 w-5', ...props }: IconProps) => <Settings className={className} {...props} />,
  User: ({ className = 'h-5 w-5', ...props }: IconProps) => <User className={className} {...props} />,
  CreditCard: ({ className = 'h-5 w-5', ...props }: IconProps) => <CreditCard className={className} {...props} />,
  Logout: ({ className = 'h-5 w-5', ...props }: IconProps) => <LogOut className={className} {...props} />,
  ChevronDown: ({ className = 'h-5 w-5', ...props }: IconProps) => <ChevronDown className={className} {...props} />,
  Plus: ({ className = 'h-5 w-5', ...props }: IconProps) => <Plus className={className} {...props} />,

  // Actions & States  
  Check: ({ className = 'h-5 w-5', ...props }: IconProps) => <Check className={className} {...props} />,
  CheckCircle: ({ className = 'h-5 w-5', ...props }: IconProps) => <CheckCircle className={className} {...props} />,
  AlertCircle: ({ className = 'h-5 w-5', ...props }: IconProps) => <AlertCircle className={className} {...props} />,
  Warning: ({ className = 'h-5 w-5', ...props }: IconProps) => <AlertTriangle className={className} {...props} />,
  Zap: ({ className = 'h-5 w-5', ...props }: IconProps) => <Zap className={className} {...props} />,
  Lightning: ({ className = 'h-5 w-5', ...props }: IconProps) => <Zap className={className} {...props} />,
  Shield: ({ className = 'h-5 w-5', ...props }: IconProps) => <Shield className={className} {...props} />,
  Lock: ({ className = 'h-5 w-5', ...props }: IconProps) => <Lock className={className} {...props} />,
  Eye: ({ className = 'h-5 w-5', ...props }: IconProps) => <Eye className={className} {...props} />,
  EyeOff: ({ className = 'h-5 w-5', ...props }: IconProps) => <EyeOff className={className} {...props} />,
  Search: ({ className = 'h-5 w-5', ...props }: IconProps) => <Search className={className} {...props} />,
  RefreshCw: ({ className = 'h-5 w-5', ...props }: IconProps) => <RefreshCw className={className} {...props} />,
  RotateCcw: ({ className = 'h-5 w-5', ...props }: IconProps) => <RotateCcw className={className} {...props} />,
  Save: ({ className = 'h-5 w-5', ...props }: IconProps) => <Save className={className} {...props} />,
  Edit: ({ className = 'h-5 w-5', ...props }: IconProps) => <Edit className={className} {...props} />,
  Trash: ({ className = 'h-5 w-5', ...props }: IconProps) => <Trash2 className={className} {...props} />,
  Copy: ({ className = 'h-5 w-5', ...props }: IconProps) => <Copy className={className} {...props} />,
  ExternalLink: ({ className = 'h-5 w-5', ...props }: IconProps) => <ExternalLink className={className} {...props} />,
  Download: ({ className = 'h-5 w-5', ...props }: IconProps) => <Download className={className} {...props} />,
  Upload: ({ className = 'h-5 w-5', ...props }: IconProps) => <Upload className={className} {...props} />,

  // Data & Analytics
  BarChart: ({ className = 'h-5 w-5', ...props }: IconProps) => <BarChart3 className={className} {...props} />,
  TrendingUp: ({ className = 'h-5 w-5', ...props }: IconProps) => <TrendingUp className={className} {...props} />,
  TrendingDown: ({ className = 'h-5 w-5', ...props }: IconProps) => <TrendingDown className={className} {...props} />,
  Activity: ({ className = 'h-5 w-5', ...props }: IconProps) => <Activity className={className} {...props} />,
  Globe: ({ className = 'h-5 w-5', ...props }: IconProps) => <Globe className={className} {...props} />,
  Users: ({ className = 'h-5 w-5', ...props }: IconProps) => <Users className={className} {...props} />,
  Clock: ({ className = 'h-5 w-5', ...props }: IconProps) => <Clock className={className} {...props} />,
  Calendar: ({ className = 'h-5 w-5', ...props }: IconProps) => <Calendar className={className} {...props} />,
  Filter: ({ className = 'h-5 w-5', ...props }: IconProps) => <Filter className={className} {...props} />,

  // Communication
  MessageSquare: ({ className = 'h-5 w-5', ...props }: IconProps) => <MessageSquare className={className} {...props} />,

  // Technology
  Code: ({ className = 'h-5 w-5', ...props }: IconProps) => <Code className={className} {...props} />,

  // UI Elements
  ArrowRight: ({ className = 'h-5 w-5', ...props }: IconProps) => <ArrowRight className={className} {...props} />,
  Square: ({ className = 'h-5 w-5', ...props }: IconProps) => <Square className={className} {...props} />,
  CheckSquare: ({ className = 'h-5 w-5', ...props }: IconProps) => <CheckSquare className={className} {...props} />,

  // Status & Progress
  Loader: ({ className = 'h-5 w-5', ...props }: IconProps) => <Loader2 className={className} {...props} />,

  // Security
  ShieldCheck: ({ className = 'h-5 w-5', ...props }: IconProps) => <ShieldCheck className={className} {...props} />,

  // Specific icons for FalconX
  Crown: ({ className = 'h-5 w-5', ...props }: IconProps) => <Star className={className} {...props} />,
  Percent: ({ className = 'h-5 w-5', ...props }: IconProps) => (
    <svg className={className} {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8l3-3 3 3m0 5l-3 3-3-3" />
    </svg>
  ),

  // Platform specific icons
  Google: ({ className = 'h-5 w-5', ...props }: IconProps) => (
    <svg className={className} {...props} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    </svg>
  ),

  Facebook: ({ className = 'h-5 w-5', ...props }: IconProps) => <Facebook className={className} {...props} />,
  
  TikTok: ({ className = 'h-5 w-5', ...props }: IconProps) => (
    <svg className={className} {...props} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.321 5.562a5.124 5.124 0 0 1-.443-.258 6.228 6.228 0 0 1-1.137-.966c-.849-.966-1.312-2.035-1.312-3.337h-3.555v14.345c0 1.864-1.513 3.377-3.378 3.377s-3.378-1.513-3.378-3.377 1.513-3.377 3.378-3.377c.332 0 .652.048.956.138V8.562a6.89 6.89 0 0 0-.956-.066c-3.797 0-6.877 3.08-6.877 6.877s3.08 6.876 6.877 6.876 6.877-3.08 6.877-6.876V9.855a9.712 9.712 0 0 0 5.572 1.75v-3.5c-1.197 0-2.302-.353-3.233-.966Z"/>
    </svg>
  ),

  Taboola: ({ className = 'h-5 w-5', ...props }: IconProps) => (
    <svg className={className} {...props} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M8 12l2 2 4-4" stroke="currentColor" strokeWidth="2" fill="none"/>
    </svg>
  ),

  Generic: ({ className = 'h-5 w-5', ...props }: IconProps) => <Globe className={className} {...props} />,
} as const

export default Icons
