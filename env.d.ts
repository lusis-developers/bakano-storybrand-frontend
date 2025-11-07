/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly APP_VERSION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Declaración para permitir importación de archivos .vue en TypeScript
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}