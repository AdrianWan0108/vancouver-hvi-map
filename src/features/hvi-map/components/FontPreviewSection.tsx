import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FONT_PREVIEW_OPTIONS,
  FONT_PREVIEW_STORAGE_KEY,
  type FontPreviewId,
  getFontPreviewOption,
  isFontPreviewId,
} from "../config/fontPreview";

function getInitialFontPreview(): FontPreviewId {
  if (typeof window === "undefined") return "system";

  const saved = window.localStorage.getItem(FONT_PREVIEW_STORAGE_KEY);
  if (saved && isFontPreviewId(saved)) {
    return saved;
  }

  return "system";
}

export default function FontPreviewSection() {
  const [selectedFont, setSelectedFont] = useState<FontPreviewId>(
    getInitialFontPreview
  );

  useEffect(() => {
    const option = getFontPreviewOption(selectedFont);
    document.documentElement.style.setProperty("--font-sans", option.fontFamily);
    window.localStorage.setItem(FONT_PREVIEW_STORAGE_KEY, selectedFont);
  }, [selectedFont]);

  return (
    <div className="grid gap-2">
      <Label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
        Font Preview
      </Label>
      <Select
        value={selectedFont}
        onValueChange={(value) => {
          if (!isFontPreviewId(value)) return;
          setSelectedFont(value);
        }}
      >
        <SelectTrigger size="sm" className="w-full bg-background">
          <SelectValue placeholder="Preview a font" />
        </SelectTrigger>
        <SelectContent align="start">
          {FONT_PREVIEW_OPTIONS.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
