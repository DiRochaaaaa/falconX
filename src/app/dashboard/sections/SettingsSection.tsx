import { Icons } from '@/components/Icons'

export default function SettingsSection() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-gradient mb-2 text-2xl font-bold">Configurações</h2>
        <p className="text-gray-300">Personalize suas preferências e configurações do sistema</p>
      </div>

      <div className="glass rounded-xl p-6">
        <div className="py-8 text-center">
          <Icons.Settings className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <p className="text-gray-400">Configurações em desenvolvimento</p>
        </div>
      </div>
    </div>
  )
}
