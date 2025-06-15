export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-8 border border-white/30">
        <h1 className="text-4xl font-bold text-white mb-4">Falcon X</h1>
        <p className="text-white/80 mb-6">Sistema funcionando! Tailwind CSS está ativo.</p>
        <div className="flex gap-4">
          <a 
            href="/login" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Login
          </a>
          <a 
            href="/register" 
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Cadastro
          </a>
        </div>
      </div>
    </div>
  )
} 