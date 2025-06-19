import { DashboardUser } from '@/modules/dashboard/domain/types'

interface BillingSectionProps {
  profile: DashboardUser | null
}

export default function BillingSection({ profile }: BillingSectionProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-gradient mb-2 text-2xl font-bold">Faturamento</h2>
        <p className="text-gray-300">Gerencie seu plano e informações de faturamento</p>
      </div>

      <div className="glass rounded-xl p-6">
        <div className="space-y-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">Plano Atual</h3>
            <p className="text-gray-400">Você está no plano {profile?.plan?.name ?? 'Gratuito'}</p>
            <div className="bg-gray-800 p-4 rounded-lg mt-4">
              {profile?.plan?.name ?? 'Gratuito'}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="glass-strong rounded-lg p-4 text-center">
              <h4 className="mb-2 font-medium text-white">Bronze</h4>
              <p className="mb-1 text-2xl font-bold text-green-400">R$ 39,90</p>
              <p className="mb-4 text-sm text-gray-400">5 clonadores/mês</p>
              <button className="btn btn-primary w-full">Upgrade</button>
            </div>

            <div className="glass-strong rounded-lg p-4 text-center">
              <h4 className="mb-2 font-medium text-white">Prata</h4>
              <p className="mb-1 text-2xl font-bold text-green-400">R$ 79,90</p>
              <p className="mb-4 text-sm text-gray-400">10 clonadores/mês</p>
              <button className="btn btn-primary w-full">Upgrade</button>
            </div>

            <div className="glass-strong rounded-lg border border-green-500/30 p-4 text-center">
              <h4 className="mb-2 font-medium text-white">Ouro</h4>
              <p className="mb-1 text-2xl font-bold text-green-400">R$ 149,90</p>
              <p className="mb-4 text-sm text-gray-400">20 clonadores/mês</p>
              <button className="btn btn-primary w-full">Upgrade</button>
            </div>

            <div className="glass-strong rounded-lg p-4 text-center">
              <h4 className="mb-2 font-medium text-white">Diamante</h4>
              <p className="mb-1 text-2xl font-bold text-green-400">R$ 299,90</p>
              <p className="mb-4 text-sm text-gray-400">50 clonadores/mês</p>
              <button className="btn btn-primary w-full">Upgrade</button>
            </div>
          </div>

          <div className="mt-6 rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-4">
            <p className="text-sm text-yellow-400">
              <strong>💡 Pay-as-you-go:</strong> Nos planos pagos, se ultrapassar o limite, 
              pague apenas R$ 1,00 por clonador adicional detectado.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
