export const SYSTEM_FONT_STACK =
  'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

export const FONT_PREVIEW_OPTIONS = [
  {
    id: "system",
    label: "System",
    fontFamily: SYSTEM_FONT_STACK,
  },
  {
    id: "inter",
    label: "Inter",
    fontFamily: `"Inter", ${SYSTEM_FONT_STACK}`,
  },
  {
    id: "ibm-plex-sans",
    label: "IBM Plex Sans",
    fontFamily: `"IBM Plex Sans", ${SYSTEM_FONT_STACK}`,
  },
  {
    id: "space-grotesque",
    label: "Space Grotesque",
    fontFamily: `"Space Grotesque", ${SYSTEM_FONT_STACK}`,
  },
  {
    id: "public-sans",
    label: "Public Sans",
    fontFamily: `"Public Sans", ${SYSTEM_FONT_STACK}`,
  },
  {
    id: "fira-sans",
    label: "Fira Sans",
    fontFamily: `"Fira Sans", ${SYSTEM_FONT_STACK}`,
  },
  {
    id: "manrope",
    label: "Manrope",
    fontFamily: `"Manrope", ${SYSTEM_FONT_STACK}`,
  },
  {
    id: "jetbrains-mono",
    label: "JetBrains Mono",
    fontFamily: `"JetBrains Mono", ${SYSTEM_FONT_STACK}`,
  },
] as const;

export type FontPreviewId = (typeof FONT_PREVIEW_OPTIONS)[number]["id"];

export const FONT_PREVIEW_STORAGE_KEY = "hvi-font-preview";

export function isFontPreviewId(value: string): value is FontPreviewId {
  return FONT_PREVIEW_OPTIONS.some((option) => option.id === value);
}

export function getFontPreviewOption(fontId: FontPreviewId) {
  return (
    FONT_PREVIEW_OPTIONS.find((option) => option.id === fontId) ??
    FONT_PREVIEW_OPTIONS[0]
  );
}
