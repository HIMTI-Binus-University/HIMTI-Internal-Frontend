import { useEffect, useState } from "react";
import {
  Check,
  Copy,
  Eye,
  Image as ImageIcon,
  Lock,
  Paintbrush,
  Palette,
  Pipette,
  RotateCcw,
  Save,
  Sliders,
  Sparkles,
} from "lucide-react";
import {
  DEFAULT_APPEARANCE_CONFIG,
  useGetHimtiKitAppearance,
  useUpdateHimtiKitAppearance,
} from "@/api/himti-kit/queries";
import { Container } from "@/components/Utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { HimtiKitAppearanceConfig } from "@/types/himti-kit";

const PRESET_COLORS = [
  "#0284c7", // Sky Blue
  "#2563eb", // Royal Blue
  "#4f46e5", // Indigo
  "#7c3aed", // Violet
  "#9333ea", // Purple
  "#db2777", // Pink
  "#e11d48", // Crimson Rose
  "#ea580c", // Deep Orange
  "#d97706", // Amber
  "#16a34a", // Forest Green
  "#059669", // Emerald
  "#0891b2", // Cyber Teal
];

export function AppearanceTab() {
  const { data: initialData } = useGetHimtiKitAppearance();
  const updateMutation = useUpdateHimtiKitAppearance();

  const [config, setConfig] = useState<HimtiKitAppearanceConfig>(
    initialData || DEFAULT_APPEARANCE_CONFIG
  );
  const [previewBgUrl, setPreviewBgUrl] = useState(
    initialData?.backgroundUrl || DEFAULT_APPEARANCE_CONFIG.backgroundUrl
  );
  const [isSaved, setIsSaved] = useState(false);
  const [copiedTokens, setCopiedTokens] = useState(false);

  useEffect(() => {
    if (initialData) {
      setConfig(initialData);
      setPreviewBgUrl(initialData.backgroundUrl || DEFAULT_APPEARANCE_CONFIG.backgroundUrl);
    }
  }, [initialData]);

  const handleApplyBgPreview = () => {
    setPreviewBgUrl(config.backgroundUrl.trim() || DEFAULT_APPEARANCE_CONFIG.backgroundUrl);
    setIsSaved(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPreviewBgUrl(config.backgroundUrl.trim() || DEFAULT_APPEARANCE_CONFIG.backgroundUrl);
    await updateMutation.mutateAsync(config);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleReset = async () => {
    setConfig(DEFAULT_APPEARANCE_CONFIG);
    setPreviewBgUrl(DEFAULT_APPEARANCE_CONFIG.backgroundUrl);
    await updateMutation.mutateAsync(DEFAULT_APPEARANCE_CONFIG);
    setIsSaved(false);
  };

  const handleCopyCssTokens = () => {
    const effectiveOpacity = config.enableOverlay
      ? (config.overlayOpacity / 100).toFixed(2)
      : "0";
    const effectiveBlur = config.enableBlur ? `${config.blurLevel}px` : "0px";

    const cssContent = `:root {
  /* HIMTI-KIT Public Theme Tokens */
  --himti-kit-primary: ${config.primaryColor};
  --himti-kit-overlay-opacity: ${effectiveOpacity};
  --himti-kit-blur-level: ${effectiveBlur};
  --himti-kit-bg-url: url("${config.backgroundUrl}");
}`;
    navigator.clipboard.writeText(cssContent);
    setCopiedTokens(true);
    setTimeout(() => setCopiedTokens(false), 2500);
  };

  const overlayStyle = config.enableOverlay
    ? `rgba(2, 6, 23, ${config.overlayOpacity / 100})`
    : "transparent";

  const blurStyle =
    config.enableBlur && config.blurLevel > 0
      ? `blur(${config.blurLevel}px)`
      : "none";

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" />
            <span>HIMTI-KIT Public Appearance & Branding</span>
          </h2>
          <p className="text-xs text-muted-foreground">
            Configure the brand color accent and background visual settings for the public login page.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Badge variant="secondary" className="text-xs gap-1.5 px-2.5 py-1">
            <span
              className="h-2.5 w-2.5 rounded-full border border-black/20"
              style={{ backgroundColor: config.primaryColor }}
            />
            <span className="font-medium">Accent: {config.primaryColor}</span>
          </Badge>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyCssTokens}
            className="text-xs h-8 gap-1.5"
            title="Copy CSS Theme Variables"
          >
            {copiedTokens ? (
              <>
                <Check className="h-3.5 w-3.5 text-semantic-success" />
                <span>Copied CSS</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy CSS Tokens</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Settings Form */}
        <Container className="p-5 lg:col-span-5 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Section 1: Color Palette & Brand Accent */}
            <div className="space-y-4 border-b border-border pb-5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Paintbrush className="h-3.5 w-3.5 text-primary" />
                  Color Palette
                </Label>
                <span className="text-[11px] text-muted-foreground">Primary Accent</span>
              </div>

              <div className="space-y-3 rounded-lg border border-border bg-card/60 p-3.5">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-foreground">
                      Color Palette Options
                    </Label>
                    <span
                      className="inline-flex items-center justify-center rounded px-2 py-0.5 text-[10px] font-bold text-white shadow-sm"
                      style={{ backgroundColor: config.primaryColor }}
                    >
                      Active Accent
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Select one of the 12 predetermined color accents, or pick your own custom shade using the color wheel.
                  </p>
                </div>

                {/* 12 Predetermined Color Squares + Color Wheel Picker */}
                <div className="space-y-2 pt-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {PRESET_COLORS.map((colorHex) => {
                      const isSelected =
                        config.primaryColor.toLowerCase() === colorHex.toLowerCase();
                      return (
                        <button
                          key={colorHex}
                          type="button"
                          onClick={() => {
                            setConfig((prev) => ({ ...prev, primaryColor: colorHex }));
                            setIsSaved(false);
                          }}
                          title={colorHex}
                          className={`relative h-7 w-7 rounded-md shadow-sm transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                            isSelected
                              ? "ring-2 ring-foreground ring-offset-2 ring-offset-background scale-105"
                              : "hover:ring-1 hover:ring-border"
                          }`}
                          style={{ backgroundColor: colorHex }}
                        >
                          {isSelected && (
                            <Check className="mx-auto h-3.5 w-3.5 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]" />
                          )}
                        </button>
                      );
                    })}

                    {/* Color Wheel Picker Button */}
                    <label
                      htmlFor="custom-color-wheel"
                      title="Choose custom color from wheel"
                      className="relative flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-dashed border-border bg-muted/40 transition-all hover:scale-110 hover:border-primary hover:bg-muted"
                    >
                      <Pipette className="h-3.5 w-3.5 text-foreground" />
                      <input
                        type="color"
                        id="custom-color-wheel"
                        value={config.primaryColor}
                        onChange={(e) => {
                          setConfig((prev) => ({ ...prev, primaryColor: e.target.value }));
                          setIsSaved(false);
                        }}
                        className="sr-only"
                      />
                    </label>
                  </div>
                </div>

                {/* Custom HEX code input */}
                <div className="flex items-center gap-2.5 pt-1">
                  <div className="relative flex items-center">
                    <input
                      type="color"
                      id="custom-primary-color-picker"
                      value={config.primaryColor}
                      onChange={(e) => {
                        setConfig((prev) => ({
                          ...prev,
                          primaryColor: e.target.value,
                        }));
                        setIsSaved(false);
                      }}
                      className="h-8 w-9 cursor-pointer rounded border border-border bg-transparent p-0.5"
                      title="Open color wheel"
                    />
                  </div>
                  <div className="relative flex-1">
                    <Input
                      id="custom-primary-color"
                      type="text"
                      value={config.primaryColor}
                      onChange={(e) => {
                        setConfig((prev) => ({
                          ...prev,
                          primaryColor: e.target.value,
                        }));
                        setIsSaved(false);
                      }}
                      placeholder="#0284c7"
                      className="h-8 text-xs font-mono uppercase tracking-wider font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: BACKGROUND SETTINGS */}
            <div className="space-y-4 border-b border-border pb-5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-primary" />
                  BACKGROUND SETTINGS
                </Label>
              </div>

              {/* Background URL Input */}
              <div className="space-y-1.5">
                <Label htmlFor="bg-image-url" className="text-xs font-medium">
                  Background Image URL
                </Label>
                <div className="relative">
                  <Input
                    id="bg-image-url"
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={config.backgroundUrl}
                    onChange={(e) => {
                      setConfig((prev) => ({
                        ...prev,
                        backgroundUrl: e.target.value,
                      }));
                      setIsSaved(false);
                    }}
                    className="pr-10 text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleApplyBgPreview}
                    title="Apply preview URL"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Paste a direct link to any high-resolution image for the public login background.
                </p>
              </div>

              {/* Darkness Overlay Toggle & Custom Slider */}
              <div className="rounded-lg border border-border bg-card/60 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label
                      htmlFor="toggle-darkness-overlay"
                      className="text-xs font-semibold text-foreground cursor-pointer"
                    >
                      Darkness Overlay
                    </Label>
                    <p className="text-[11px] text-muted-foreground">
                      Darkens the background to maintain clear text and button readability.
                    </p>
                  </div>
                  <Switch
                    id="toggle-darkness-overlay"
                    checked={config.enableOverlay}
                    onCheckedChange={(val) => {
                      setConfig((prev) => ({ ...prev, enableOverlay: val }));
                      setIsSaved(false);
                    }}
                  />
                </div>

                {/* Show custom slider only if option is enabled */}
                {config.enableOverlay && (
                  <div className="space-y-2.5 border-t border-border/60 pt-3 animate-in fade-in-50 duration-200">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-muted-foreground">Overlay Darkness</span>
                      <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-primary font-bold">
                        {config.overlayOpacity}%
                      </span>
                    </div>

                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={config.overlayOpacity}
                      onChange={(e) => {
                        setConfig((prev) => ({
                          ...prev,
                          overlayOpacity: Number(e.target.value),
                        }));
                        setIsSaved(false);
                      }}
                      className="w-full accent-primary cursor-pointer"
                    />

                    <div className="flex items-center gap-1.5 pt-1">
                      {[25, 50, 65, 80, 95].map((presetVal) => (
                        <button
                          key={presetVal}
                          type="button"
                          onClick={() => {
                            setConfig((prev) => ({
                              ...prev,
                              overlayOpacity: presetVal,
                            }));
                            setIsSaved(false);
                          }}
                          className={`flex-1 rounded border py-1 text-[10px] font-medium transition-colors ${
                            config.overlayOpacity === presetVal
                              ? "border-primary bg-primary/15 font-semibold text-primary"
                              : "border-border bg-card text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {presetVal}%
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Backdrop Blur Toggle & Custom Slider */}
              <div className="rounded-lg border border-border bg-card/60 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label
                      htmlFor="toggle-backdrop-blur"
                      className="text-xs font-semibold text-foreground cursor-pointer"
                    >
                      Backdrop Blur (Glassmorphism)
                    </Label>
                    <p className="text-[11px] text-muted-foreground">
                      Applies a gaussian blur to the background image behind portal content.
                    </p>
                  </div>
                  <Switch
                    id="toggle-backdrop-blur"
                    checked={config.enableBlur}
                    onCheckedChange={(val) => {
                      setConfig((prev) => ({ ...prev, enableBlur: val }));
                      setIsSaved(false);
                    }}
                  />
                </div>

                {/* Show custom slider only if option is enabled */}
                {config.enableBlur && (
                  <div className="space-y-2.5 border-t border-border/60 pt-3 animate-in fade-in-50 duration-200">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-muted-foreground">Blur Intensity</span>
                      <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-primary font-bold">
                        {config.blurLevel}px
                      </span>
                    </div>

                    <input
                      type="range"
                      min={0}
                      max={24}
                      step={1}
                      value={config.blurLevel}
                      onChange={(e) => {
                        setConfig((prev) => ({
                          ...prev,
                          blurLevel: Number(e.target.value),
                        }));
                        setIsSaved(false);
                      }}
                      className="w-full accent-primary cursor-pointer"
                    />

                    <div className="flex items-center gap-1.5 pt-1">
                      {[2, 4, 8, 12, 16].map((presetVal) => (
                        <button
                          key={presetVal}
                          type="button"
                          onClick={() => {
                            setConfig((prev) => ({
                              ...prev,
                              blurLevel: presetVal,
                            }));
                            setIsSaved(false);
                          }}
                          className={`flex-1 rounded border py-1 text-[10px] font-medium transition-colors ${
                            config.blurLevel === presetVal
                              ? "border-primary bg-primary/15 font-semibold text-primary"
                              : "border-border bg-card text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {presetVal}px
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {isSaved && (
              <div className="rounded-lg border border-semantic-success-border bg-semantic-success-background p-3 text-xs text-semantic-success flex items-center gap-2">
                <Check className="h-4 w-4" />
                <span>Appearance preferences saved to persistent storage!</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <Button
                type="submit"
                size="sm"
                disabled={updateMutation.isPending}
                className="gap-1.5 flex-1"
              >
                <Save className="h-4 w-4" />
                <span>{updateMutation.isPending ? "Saving..." : "Save Appearance"}</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReset}
                title="Reset all settings to defaults"
                className="gap-1 text-xs"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </Button>
            </div>
          </form>
        </Container>

        {/* Right Column: Live Login Page Preview (Only) */}
        <Container className="overflow-hidden p-5 lg:col-span-7 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">
                Live Login Page Preview (16:9)
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono">
              Aspect Ratio 16:9
            </span>
          </div>

          {/* Browser Chrome Window Container */}
          <div className="mt-4 relative aspect-video w-full overflow-hidden rounded-xl border border-border shadow-md flex flex-col bg-slate-950">
            {/* macOS-style Top Bar */}
            <div className="relative z-10 flex h-7 items-center justify-between border-b border-white/10 bg-slate-900/80 px-3 backdrop-blur-md">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
              </div>

              <div className="flex items-center gap-1 rounded-md bg-white/10 px-3 py-0.5 text-[10px] text-slate-300">
                <Lock className="h-2.5 w-2.5 text-slate-400" />
                <span>kit.himtibinus.or.id</span>
              </div>

              <div className="w-10" />
            </div>

            {/* Viewport with Background & Login Gate Content */}
            <div className="relative flex-1 overflow-hidden">
              {/* Dynamic Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-all duration-500"
                style={{ backgroundImage: `url(${previewBgUrl})` }}
              >
                {/* Dynamic Overlay & Blur */}
                <div
                  className="absolute inset-0 transition-all duration-300"
                  style={{
                    backgroundColor: overlayStyle,
                    backdropFilter: blurStyle,
                  }}
                />
              </div>

              {/* Student Gate Login UI */}
              <div className="relative flex h-full flex-col justify-between p-4 sm:p-6 text-white">
                {/* Navbar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-6 w-6 rounded-md flex items-center justify-center text-xs font-bold text-white shadow-sm transition-colors"
                      style={{ backgroundColor: config.primaryColor }}
                    >
                      H
                    </div>
                    <span className="text-xs font-bold tracking-tight">
                      HIMTI KIT
                    </span>
                  </div>

                  <div
                    className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold border backdrop-blur transition-colors"
                    style={{
                      backgroundColor: `${config.primaryColor}22`,
                      borderColor: `${config.primaryColor}55`,
                      color: config.primaryColor,
                    }}
                  >
                    TECHNO Edition
                  </div>
                </div>

                {/* Hero Card Content */}
                <div className="mx-auto my-auto max-w-xs text-center">
                  <h3 className="text-base sm:text-lg font-bold tracking-tight">
                    Welcome, Binusian!
                  </h3>
                  <p className="mt-1 text-[11px] text-slate-300 leading-relaxed">
                    Enter your NIM to access official HIMTI KIT study materials & software tools.
                  </p>

                  {/* Interactive Mock Input */}
                  <div className="mt-3.5 flex items-center justify-center gap-1.5">
                    <div
                      className="h-7 w-40 rounded-md bg-white/10 px-2.5 text-[10px] flex items-center text-slate-300 border transition-colors"
                      style={{ borderColor: `${config.primaryColor}66` }}
                    >
                      NIM (e.g. 2602111111)
                    </div>
                    <button
                      type="button"
                      className="h-7 rounded-md px-3.5 text-[10px] font-semibold flex items-center justify-center text-white shadow-sm hover:opacity-90 transition-all"
                      style={{ backgroundColor: config.primaryColor }}
                    >
                      Enter
                    </button>
                  </div>
                </div>

                {/* Footer */}
                <div className="text-center text-[9px] text-slate-400">
                  HIMTI BINUS University &copy; 2026 &bull; Authorized Students Only
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Preview updates instantly with custom color, overlay, and blur.</span>
            </span>
            <span className="text-[10px] font-mono">Accent: {config.primaryColor}</span>
          </div>
        </Container>
      </div>
    </div>
  );
}
