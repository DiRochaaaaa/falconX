# 🚀 Falcon X - Instalação Inicial

## 📋 Passos para Configurar o Sistema

### 1. **Instalar Dependências**

```bash
# Instalar dependências principais
npm install @supabase/supabase-js @supabase/ssr

# Instalar dependências do Next.js (se ainda não tiver)
npm install next@latest react@latest react-dom@latest typescript@latest

# Instalar dependências de desenvolvimento
npm install -D @types/react @types/node @types/react-dom

# Instalar Tailwind CSS para estilização
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 2. **Configurar Tailwind CSS**

Edite o arquivo `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### 3. **Configurar CSS Global**

Crie ou edite `styles/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Estilos personalizados */
body {
  font-family: system-ui, -apple-system, sans-serif;
}
```

### 4. **Configurar Variáveis de Ambiente**

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Configurações do Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-publica-anonima
SUPABASE_SERVICE_ROLE_KEY=sua-chave-de-servico

# URL do site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 5. **Estrutura de Pastas**

Certifique-se de ter esta estrutura:

```
seu-projeto/
├── pages/
│   ├── login.tsx
│   ├── register.tsx
│   └── _app.tsx
├── lib/
│   ├── supabase.ts
│   ├── types/
│   │   └── database.ts
│   └── hooks/
│       └── useAuth.ts
├── styles/
│   └── globals.css
├── .env.local
└── package.json
```

### 6. **Configurar _app.tsx**

Crie ou edite `pages/_app.tsx`:

```typescript
import type { AppProps } from 'next/app'
import '../styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
```

### 7. **Configurar TypeScript**

Crie `tsconfig.json` na raiz do projeto:

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 8. **Configurar package.json**

Certifique-se de ter estes scripts no `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

### 9. **Executar o Banco de Dados**

1. Vá para o Supabase Dashboard
2. Execute o script `falconx-database-setup-safe.sql`
3. Verifique se todas as tabelas foram criadas

### 10. **Testar o Sistema**

```bash
# Executar em modo desenvolvimento
npm run dev
```

Acesse:
- `http://localhost:3000/login` - Página de login
- `http://localhost:3000/register` - Página de cadastro

---

## 🔧 Resolução de Problemas

### **Erro: Cannot find module 'react'**
```bash
npm install react@latest react-dom@latest
```

### **Erro: TypeScript não reconhece JSX**
```bash
npm install -D @types/react @types/react-dom
```

### **Erro: Tailwind CSS não funciona**
1. Verifique se `tailwind.config.js` está correto
2. Importe CSS no `_app.tsx`
3. Execute: `npm run dev` novamente

### **Erro: Supabase não conecta**
1. Verifique as variáveis de ambiente
2. Confirme se o projeto Supabase está ativo
3. Verifique se as chaves estão corretas

### **Erro: RLS (Row Level Security)**
Execute as queries do arquivo `falconx-useful-queries.sql` para verificar permissões.

---

## 🎯 Próximos Passos

Após a instalação:

1. ✅ Testar login/cadastro
2. ✅ Criar dashboard básico
3. ✅ Implementar geração de scripts
4. ✅ Configurar detecção de clones
5. ✅ Implementar sistema de planos

---

## 📞 Suporte

Se tiver problemas:
1. Verifique se todas as dependências estão instaladas
2. Confirme se o banco de dados foi criado corretamente
3. Teste as variáveis de ambiente
4. Verifique os logs no console do navegador 