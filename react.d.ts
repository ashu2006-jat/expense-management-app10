declare namespace React {
  type ReactNode = any;
  type FC<P = {}> = (props: P) => any;
  type ComponentType<P = {}> = (props: P) => any;
  type ReactElement<P = any, T = any> = any;

  const StrictMode: (props: { children?: any }) => any;
  function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
  function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  function createElement(type: any, props?: any, ...children: any[]): any;

  namespace JSX {
    type Element = any;
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

declare module "react" {
  export = React;
  export as namespace React;
}

declare module "react/jsx-runtime" {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}

declare module "react/jsx-dev-runtime" {
  export const jsxDEV: any;
  export const Fragment: any;
}

declare module "react-dom" {
  export const render: any;
}

declare module "react-dom/client" {
  export interface Root {
    render(children: any): void;
    unmount(): void;
  }
  export function createRoot(container: any): Root;
  const ReactDOM: { createRoot: typeof createRoot };
  export default ReactDOM;
}

declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}

declare namespace JSX {
  type Element = any;
  interface IntrinsicElements {
    [elemName: string]: any;
  }
  interface ElementClass {
    render(): any;
  }
  interface ElementAttributesProperty {
    props: {};
  }
  interface ElementChildrenAttribute {
    children: {};
  }
}
