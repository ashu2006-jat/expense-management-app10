declare module "vite" {
  export type HtmlTagDescriptor = {
    tag: string;
    attrs?: Record<string, any>;
    children?: string;
    injectTo?: 'head' | 'body' | 'head-prepend' | 'body-prepend';
  };
  export interface Plugin {
    name: string;
    apply?: 'serve' | 'build' | ((config: any, env: any) => boolean);
    enforce?: 'pre' | 'post';
    configureServer?: (server: any) => void;
    transformIndexHtml?: any;
    generateBundle?: any;
    resolveId?: (id: string) => any;
    load?: (id: string) => any;
    transform?: (code: string, id: string) => any;
    [key: string]: any;
  }
  export function defineConfig(config: any): any;
  export default defineConfig;
}

declare module "@vitejs/plugin-react" {
  export default function react(options?: any): any;
}

declare module "@tailwindcss/vite" {
  export default function tailwindcss(options?: any): any;
}

declare module "node:path" {
  export function resolve(...paths: string[]): string;
  const path: { resolve: typeof resolve; [key: string]: any };
  export default path;
}

declare module "path" {
  export function resolve(...paths: string[]): string;
  const path: { resolve: typeof resolve; [key: string]: any };
  export default path;
}

declare const process: {
  env: Record<string, string | undefined>;
  [key: string]: any;
};

declare const __dirname: string;

interface ImportMeta {
  glob: (pattern: string | string[]) => Record<string, () => Promise<any>>;
  env: Record<string, string | undefined>;
}
