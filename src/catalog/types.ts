export type ComponentVariant = {
  id: string;
  label: string;
  kind: "baseline" | "library" | "integration";
  implementationId: string;
  demoId?: string;
  exportName?: string;
  requiresFrame?: boolean;
  previewGroup?: string;
  description: string;
  codeFiles: string[];
  props: [string, string, string][];
};

export type ComponentFamily = {
  id: string;
  name: string;
  group: string;
  description: string;
  variants: ComponentVariant[];
};
