import { Icons } from '@/components/Icons'
import { User, DashboardUser } from '@/modules/dashboard'

interface ProfileSectionProps {
  user: User | null
  profile: DashboardUser | null
}

export default function ProfileSection({ profile }: ProfileSectionProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-gradient mb-2 text-2xl font-bold">Meu Perfil</h2>
        <p className="text-gray-300">Gerencie suas informações pessoais e preferências</p>
      </div>

      <div className="glass rounded-xl p-6">
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-green rounded-full p-4">
              <Icons.User className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">
                {profile?.full_name || 'Usuário'}
              </h3>
              <p className="text-gray-400">{profile?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Nome Completo</label>
              <input
                type="text"
                defaultValue={profile?.full_name || ''}
                className="input-primary w-full"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Email</label>
              <input
                type="email"
                defaultValue={profile?.email || ''}
                className="input-primary w-full"
                disabled
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button className="btn btn-primary">Salvar Alterações</button>
          </div>
        </div>
      </div>
    </div>
  )
}
