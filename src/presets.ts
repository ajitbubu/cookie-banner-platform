// Theme presets — each is a --cc-* variable set the user applies then tweaks.
export interface Preset {
  id: string;
  name: string;
  theme: Record<string, string>;
}

export const PRESETS: Preset[] = [
  {
    id: "light",
    name: "Light",
    theme: { "--cc-bg": "#ffffff", "--cc-fg": "#111827", "--cc-accent": "#2563eb", "--cc-accent-fg": "#ffffff", "--cc-radius": "10px" },
  },
  {
    id: "dark",
    name: "Dark",
    theme: { "--cc-bg": "#111827", "--cc-fg": "#f3f4f6", "--cc-accent": "#60a5fa", "--cc-accent-fg": "#0b1220", "--cc-border": "#374151", "--cc-surface": "#1f2937", "--cc-radius": "10px" },
  },
  {
    id: "minimal",
    name: "Minimal",
    theme: { "--cc-bg": "#ffffff", "--cc-fg": "#1a1a1a", "--cc-accent": "#1a1a1a", "--cc-accent-fg": "#ffffff", "--cc-radius": "2px" },
  },
  {
    id: "rounded",
    name: "Rounded",
    theme: { "--cc-bg": "#ffffff", "--cc-fg": "#0f172a", "--cc-accent": "#10b981", "--cc-accent-fg": "#ffffff", "--cc-radius": "16px" },
  },
  {
    id: "high-contrast",
    name: "High contrast",
    theme: { "--cc-bg": "#ffffff", "--cc-fg": "#000000", "--cc-accent": "#0000ee", "--cc-accent-fg": "#ffffff", "--cc-border": "#000000", "--cc-radius": "4px" },
  },
];
