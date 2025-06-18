import { UserProfile } from '@/modules/dashboard'

interface BillingSectionProps {
  profile: UserProfile | null
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
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Plano Atual</h3>
              <p className="text-gray-400">Você está no plano {profile?.plan_type || 'Free'}</p>
            </div>
            <span className="rounded-full bg-green-500/20 px-3 py-1 text-sm font-medium capitalize text-green-400">
              {profile?.plan_type || 'Free'}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="glass-strong rounded-lg p-4 text-center">
              <h4 className="mb-2 font-medium text-white">Bronze</h4>
              <p className="mb-1 text-2xl font-bold text-green-400">R$ 29,99</p>
              <p className="mb-4 text-sm text-gray-400">5 domínios</p>
              <button className="btn btn-primary w-full">Upgrade</button>
            </div>

            <div className="glass-strong rounded-lg border border-green-500/30 p-4 text-center">
              <h4 className="mb-2 font-medium text-white">Silver</h4>
              <p className="mb-1 text-2xl font-bold text-green-400">R$ 59,99</p>
              <p className="mb-4 text-sm text-gray-400">15 domínios</p>
              <button className="btn btn-primary w-full">Upgrade</button>
            </div>

            <div className="glass-strong rounded-lg p-4 text-center">
              <h4 className="mb-2 font-medium text-white">Gold</h4>
              <p className="mb-1 text-2xl font-bold text-green-400">R$ 99,99</p>
              <p className="mb-4 text-sm text-gray-400">Ilimitado</p>
              <button className="btn btn-primary w-full">Upgrade</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
