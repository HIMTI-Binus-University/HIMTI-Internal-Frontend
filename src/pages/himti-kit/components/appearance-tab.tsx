import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpenText,
  Check,
  CodeXml,
  Copy,
  Download,
  Eye,
  FileText,
  Image as ImageIcon,
  Lock,
  LogOut,
  Paintbrush,
  Palette,
  Pipette,
  RotateCcw,
  Save,
  Search,
  Sliders,
  Sparkles,
} from "lucide-react";
import {
  DEFAULT_APPEARANCE_CONFIG,
  useGetHimtiKitAppearance,
  useResetHimtiKitAppearance,
  useUpdateHimtiKitAppearance,
} from "@/api/himti-kit/queries";
import { Container } from "@/components/Utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { HimtiKitAppearanceConfig } from "@/types/himti-kit";

type PreviewPage = "login" | "kit" | "software";

const PREVIEW_RESOURCES = [
  {
    id: "data-structures",
    title: "Data Structures",
    description: "Lecture notes and algorithm cheat-sheets for Data Structures & Algorithms.",
    majors: ["Computer Science", "Software Engineering"],
    coverImageUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRGPTKk5gIT4WmHn09kAYA-wOjVmz-zlUfZw8OehN4kg&s=10",
  },
  {
    id: "basic-statistics",
    title: "Basic Statistics",
    description: "Probability distributions, hypothesis testing, and statistical computing.",
    majors: ["Computer Science", "Data Science", "Artificial Intelligence"],
    coverImageUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBKTKf_bz61_kBkUbw7PuvEyUMU6plxid_-WeWm5WAYQ&s",
  },
  {
    id: "linear-algebra",
    title: "Linear Algebra",
    description: "Vectors, matrices, eigenvalues, and transformations for CS students.",
    majors: ["Computer Science", "Mathematics", "Data Science"],
    coverImageUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJb3lp6CG0fl-3y9ddIyDGfMy2hSRTOGH_rP0DGpTz_w&s=10",
  },
  {
    id: "discrete-mathematics",
    title: "Discrete Mathematics",
    description: "Logic, set theory, graph theory, and mathematical proof structures.",
    majors: ["Computer Science", "Cyber Security", "Game Application and Technology"],
    coverImageUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThGjf_pP9J0IVXzPfl4X2Fq-60VdKa4WG34eeBGkCllA&s=10",
  },
];

const PREVIEW_SOFTWARES = [
  {
    id: "visual-studio-code",
    title: "Visual Studio Code",
    description: "Code editor redefined and optimized for building and debugging modern web and cloud apps.",
    majors: [
      "Computer Science",
      "Software Engineering",
      "Cyber Security",
    ],
  },
  {
    id: "git",
    title: "Git",
    description: "Fast, scalable, distributed revision control system with an unusually rich command set.",
    majors: [
      "Computer Science",
      "Data Science",
      "Software Engineering",
    ],
  },
  {
    id: "postgresql",
    title: "PostgreSQL",
    description: "Powerful, open source object-relational database system with advanced query optimization.",
    majors: [
      "Computer Science",
      "Data Science",
      "Artificial Intelligence",
    ],
  },
];

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
  const resetMutation = useResetHimtiKitAppearance();

  const [config, setConfig] = useState<HimtiKitAppearanceConfig>(
    initialData || DEFAULT_APPEARANCE_CONFIG
  );
  const [previewBgUrl, setPreviewBgUrl] = useState(
    initialData?.backgroundUrl || DEFAULT_APPEARANCE_CONFIG.backgroundUrl
  );
  const [isSaved, setIsSaved] = useState(false);
  const [copiedTokens, setCopiedTokens] = useState(false);
  const [previewPage, setPreviewPage] = useState<PreviewPage>("login");
  const [previewSearch, setPreviewSearch] = useState("");

  const currentPreviewUrl =
    previewPage === "login"
      ? "https://himtikit.himtibinus.or.id/"
      : previewPage === "kit"
      ? "https://himtikit.himtibinus.or.id/kit"
      : "https://himtikit.himtibinus.or.id/software";

  const filteredResources = PREVIEW_RESOURCES.filter(
    (item) =>
      previewSearch.trim() === "" ||
      `${item.title} ${item.majors.join(" ")}`
        .toLowerCase()
        .includes(previewSearch.trim().toLowerCase())
  );

  const filteredSoftwares = PREVIEW_SOFTWARES.filter(
    (item) =>
      previewSearch.trim() === "" ||
      `${item.title} ${item.majors.join(" ")}`
        .toLowerCase()
        .includes(previewSearch.trim().toLowerCase())
  );

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
    console.log("%c[HIMTI-KIT:Dashboard] Save Changes triggered with settings:", "font-weight: bold; color: #0284c7;", config);
    try {
      await updateMutation.mutateAsync(config);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error("%c[HIMTI-KIT:Dashboard] Error during save:", "color: red;", err);
    }
  };

  const handleReset = async () => {
    console.log("%c[HIMTI-KIT:Dashboard] Reset to Default triggered", "font-weight: bold; color: #f59e0b;");
    setConfig(DEFAULT_APPEARANCE_CONFIG);
    setPreviewBgUrl(DEFAULT_APPEARANCE_CONFIG.backgroundUrl);
    try {
      await resetMutation.mutateAsync();
      setIsSaved(false);
    } catch (err) {
      console.error("%c[HIMTI-KIT:Dashboard] Error during reset:", "color: red;", err);
    }
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

        {/* Right Column: Live Multi-Page Portal Preview */}
        <Container className="overflow-hidden p-5 lg:col-span-7 flex flex-col justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">
                Live Portal Preview (16:9)
              </span>
            </div>

            {/* Segmented Page Selector Tabs */}
            <div className="flex items-center gap-1 rounded-lg bg-muted/80 p-0.5 border border-border">
              <button
                type="button"
                onClick={() => setPreviewPage("login")}
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition-all ${
                  previewPage === "login"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Preview Student Gate Login Page"
              >
                <Lock className="h-3 w-3" />
                <span>Gate (/)</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewPage("kit")}
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition-all ${
                  previewPage === "kit"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Preview Notes Resource Catalog Page"
              >
                <BookOpenText className="h-3 w-3" />
                <span>Notes (/kit)</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewPage("software")}
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition-all ${
                  previewPage === "software"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Preview Software Catalog Page"
              >
                <CodeXml className="h-3 w-3" />
                <span>Software (/software)</span>
              </button>
            </div>
          </div>

          {/* Browser Chrome Window Container */}
          <div className="mt-4 relative aspect-video w-full overflow-hidden rounded-xl border border-border shadow-md flex flex-col bg-slate-950">
            {/* macOS-style Top Bar */}
            <div className="relative z-30 flex h-7 items-center justify-between border-b border-white/10 bg-slate-900/80 px-3 backdrop-blur-md">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
              </div>

              <div className="flex items-center gap-1 rounded-md bg-white/10 px-3 py-0.5 text-[10px] text-slate-300 font-mono">
                <Lock className="h-2.5 w-2.5 text-emerald-400" />
                <span>{currentPreviewUrl}</span>
              </div>

              <div className="flex items-center gap-1 text-[9px] text-slate-400 font-medium">
                <span className="capitalize">{previewPage}</span>
              </div>
            </div>

            {/* Viewport with Background & Active Page Content */}
            <div className="relative flex-1 overflow-hidden flex flex-col">
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

              {/* Page 1: Exact HIMTI-KIT-Frontend Student Gate Login UI */}
              {previewPage === "login" && (
                <section className="relative z-10 mx-auto flex h-full max-w-lg flex-col items-center justify-center px-4 py-6 text-center text-white select-none animate-in fade-in duration-200">
                  <p className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-[0.3em] text-white/75">
                    School of Computer Science
                  </p>

                  <h1 className="mt-1 text-2xl sm:text-4xl font-bold tracking-tight text-white drop-shadow-sm">
                    HIMTI KIT
                  </h1>

                  <p className="mt-2 sm:mt-3 max-w-xs sm:max-w-md text-[10px] sm:text-xs leading-relaxed text-white/90">
                    A learning kit for new School of Computer Science students at
                    Bina Nusantara University. Find materials and software for your
                    first semesters in one place.
                  </p>

                  <div
                    className="mt-3.5 sm:mt-5 flex w-full max-w-[260px] sm:max-w-sm overflow-hidden rounded-xl sm:rounded-2xl bg-white shadow-2xl cursor-pointer transition-transform hover:scale-[1.02]"
                    onClick={() => setPreviewPage("kit")}
                    title="Click to enter notes catalog"
                  >
                    <div className="min-w-0 flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-[10px] sm:text-xs text-slate-400 text-left flex items-center font-normal">
                      Insert your Student ID (NIM)
                    </div>

                    <div
                      className="grid w-9 sm:w-11 place-items-center text-white transition-colors"
                      style={{ backgroundColor: config.primaryColor }}
                      aria-label="Continue"
                    >
                      <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </div>
                  </div>
                </section>
              )}

              {/* Page 2 & 3: Notes & Software Catalog Pages */}
              {(previewPage === "kit" || previewPage === "software") && (
                <div className="relative z-10 flex flex-col h-full overflow-hidden animate-in fade-in duration-200">
                  {/* Mini KitHeader from HIMTI-KIT-Frontend */}
                  <header className="shrink-0 border-b border-slate-300 bg-white/95 px-3 sm:px-4 py-1.5 backdrop-blur-sm shadow-xs">
                    <div className="flex w-full items-center gap-2 sm:gap-3">
                      <div className="flex shrink-0 items-center gap-1.5">
                        <img
                          src="/assets/HIMTI-logo.jpg"
                          alt="HIMTI BINUS"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/himti-icon.svg";
                          }}
                          className="h-6 w-6 object-contain rounded"
                        />
                        <div className="leading-tight text-slate-950">
                          <p className="text-[10px] font-bold">HIMTI BINUS</p>
                          <p className="text-[8px] font-medium text-slate-500">HIMTI KIT</p>
                        </div>
                      </div>

                      <div className="h-5 w-px shrink-0 bg-slate-200" />

                      <nav className="flex shrink-0 gap-1 text-[10px] font-semibold" aria-label="Catalog navigation">
                        <button
                          type="button"
                          onClick={() => setPreviewPage("kit")}
                          className={`flex items-center gap-1 rounded-md px-2 py-1 transition ${
                            previewPage === "kit"
                              ? "font-bold shadow-2xs"
                              : "text-slate-600 hover:text-slate-950"
                          }`}
                          style={
                            previewPage === "kit"
                              ? { backgroundColor: `${config.primaryColor}18`, color: config.primaryColor }
                              : {}
                          }
                        >
                          <BookOpenText className="h-3 w-3" />
                          <span>Notes</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPreviewPage("software")}
                          className={`flex items-center gap-1 rounded-md px-2 py-1 transition ${
                            previewPage === "software"
                              ? "font-bold shadow-2xs"
                              : "text-slate-600 hover:text-slate-950"
                          }`}
                          style={
                            previewPage === "software"
                              ? { backgroundColor: `${config.primaryColor}18`, color: config.primaryColor }
                              : {}
                          }
                        >
                          <CodeXml className="h-3 w-3" />
                          <span>Applications</span>
                        </button>
                      </nav>

                      <button
                        type="button"
                        onClick={() => setPreviewPage("login")}
                        className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-md border border-slate-300 px-2 py-0.5 text-[9px] font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                        title="Simulate logout"
                      >
                        <LogOut className="h-2.5 w-2.5" />
                        <span>Log out</span>
                      </button>
                    </div>
                  </header>

                  {/* Catalog Content Area */}
                  <div className="relative flex-1 overflow-y-auto p-2.5 sm:p-3.5 scrollbar-thin">
                    <div className="mx-auto max-w-xl rounded-xl sm:rounded-2xl bg-white/95 p-3 sm:p-4 shadow-xl border border-white/60">
                      <h2 className="text-sm sm:text-base font-bold tracking-tight text-slate-950">
                        {previewPage === "kit" ? "Notes" : "Applications"}
                      </h2>
                      <p className="mt-0.5 text-[8px] sm:text-[10px] text-slate-600">
                        {previewPage === "kit"
                          ? "Find your subject notes in PDF form. All materials are available to view or download."
                          : "Find recommended software and development tools for your studies."}
                      </p>

                      <div className="my-2 h-px bg-slate-200" />

                      {/* Search Bar matching HIMTI-KIT-Frontend */}
                      <div className="relative max-w-xs mb-2.5">
                        <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={previewSearch}
                          onChange={(e) => setPreviewSearch(e.target.value)}
                          placeholder={`Search ${previewPage === "kit" ? "notes" : "applications"}...`}
                          className="w-full rounded-lg border border-slate-300 bg-white py-1 pl-7 pr-2.5 text-[9px] sm:text-[10px] text-slate-900 outline-none transition focus:border-slate-800"
                        />
                      </div>

                      {/* Items Grid */}
                      {previewPage === "kit" ? (
                        filteredResources.length ? (
                          <div className="grid grid-cols-2 gap-2">
                            {filteredResources.map((item) => (
                              <article
                                key={item.id}
                                className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xs flex flex-col justify-between"
                              >
                                <div>
                                  <div className="flex aspect-[16/9] items-center justify-center bg-slate-100 overflow-hidden">
                                    {item.coverImageUrl ? (
                                      <img
                                        src={item.coverImageUrl}
                                        alt={`${item.title} cover`}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <FileText className="h-5 w-5 text-slate-400" />
                                    )}
                                  </div>
                                  <div className="p-2">
                                    <h3 className="text-[10px] font-bold text-slate-950 line-clamp-1">
                                      {item.title}
                                    </h3>
                                    <p className="mt-0.5 line-clamp-2 text-[8px] leading-snug text-slate-600">
                                      {item.description}
                                    </p>
                                    <div className="mt-1 flex flex-wrap gap-1">
                                      {item.majors.map((m) => (
                                        <span
                                          key={m}
                                          className="rounded bg-slate-100 px-1 py-0.2 text-[7px] font-medium text-slate-600"
                                        >
                                          {m}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                <div className="border-t border-slate-100 px-2 py-1 flex items-center justify-between">
                                  <span
                                    className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[8px] font-semibold transition"
                                    style={{
                                      borderColor: config.primaryColor,
                                      color: config.primaryColor,
                                      backgroundColor: `${config.primaryColor}10`,
                                    }}
                                  >
                                    <Download className="h-2 w-2" />
                                    <span>Download</span>
                                  </span>
                                  <span className="text-[7px] text-slate-400 font-mono">PDF</span>
                                </div>
                              </article>
                            ))}
                          </div>
                        ) : (
                          <p className="py-4 text-center text-[10px] text-slate-500">
                            No notes match your search.
                          </p>
                        )
                      ) : (
                        filteredSoftwares.length ? (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {filteredSoftwares.map((item) => (
                              <article
                                key={item.id}
                                className="overflow-hidden rounded-lg border border-slate-200 bg-white p-2.5 shadow-2xs flex flex-col justify-between"
                              >
                                <div>
                                  <h3 className="text-[10px] sm:text-[11px] font-bold text-slate-950">
                                    {item.title}
                                  </h3>
                                  <p className="mt-1 text-[8px] leading-snug text-slate-600 line-clamp-2">
                                    {item.description}
                                  </p>
                                  <div className="mt-1.5 flex flex-wrap gap-1">
                                    {item.majors.slice(0, 3).map((m) => (
                                      <span
                                        key={m}
                                        className="rounded bg-slate-100 px-1 py-0.2 text-[7px] font-medium text-slate-600"
                                      >
                                        {m}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                <div className="mt-2 pt-1.5 border-t border-slate-100">
                                  <span
                                    className="inline-flex items-center justify-center gap-1 w-full rounded-md py-1 text-[8px] font-semibold text-white shadow-2xs transition"
                                    style={{ backgroundColor: config.primaryColor }}
                                  >
                                    <Download className="h-2 w-2" />
                                    <span>Download</span>
                                  </span>
                                </div>
                              </article>
                            ))}
                          </div>
                        ) : (
                          <p className="py-4 text-center text-[10px] text-slate-500">
                            No applications match your search.
                          </p>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>
                Preview updates in real-time across Gate, Notes, and Software pages.
              </span>
            </span>
            <span className="text-[10px] font-mono">Accent: {config.primaryColor}</span>
          </div>
        </Container>
      </div>
    </div>
  );
}
