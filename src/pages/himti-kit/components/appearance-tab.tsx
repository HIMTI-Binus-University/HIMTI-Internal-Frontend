import { useState } from "react";
import { Eye, Image as ImageIcon, RotateCcw, Save, Sparkles } from "lucide-react";
import { Container } from "@/components/Utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DEFAULT_BACKGROUND_URL =
  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1600&auto=format&fit=crop&q=80";

export function AppearanceTab() {
  const [backgroundUrl, setBackgroundUrl] = useState(DEFAULT_BACKGROUND_URL);
  const [previewUrl, setPreviewUrl] = useState(DEFAULT_BACKGROUND_URL);
  const [isSaved, setIsSaved] = useState(false);

  const handleApplyPreview = () => {
    setPreviewUrl(backgroundUrl.trim() || DEFAULT_BACKGROUND_URL);
    setIsSaved(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setPreviewUrl(backgroundUrl.trim() || DEFAULT_BACKGROUND_URL);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleReset = () => {
    setBackgroundUrl(DEFAULT_BACKGROUND_URL);
    setPreviewUrl(DEFAULT_BACKGROUND_URL);
    setIsSaved(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            HIMTI-KIT Public Appearance
          </h2>
          <p className="text-xs text-muted-foreground">
            Configure visual assets and background branding for the public student portal.
          </p>
        </div>
        <Badge variant="secondary" className="self-start text-xs sm:self-auto gap-1">
          <Sparkles className="h-3 w-3 text-primary" />
          <span>Placeholder Config</span>
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Settings Form Column */}
        <Container className="p-5 lg:col-span-5">
          <form onSubmit={handleSave} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="bg-image-url" className="text-sm font-semibold">
                Background Image URL
              </Label>
              <div className="relative">
                <Input
                  id="bg-image-url"
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={backgroundUrl}
                  onChange={(e) => setBackgroundUrl(e.target.value)}
                  className="pr-10 text-xs"
                />
                <button
                  type="button"
                  onClick={handleApplyPreview}
                  title="Preview URL"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Paste a direct link to an optimized landscape image (PNG, JPG, or WebP).
              </p>
            </div>

            {/* Quick Presets */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-foreground">
                Theme Presets:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    const url =
                      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1600&auto=format&fit=crop&q=80";
                    setBackgroundUrl(url);
                    setPreviewUrl(url);
                  }}
                  className="rounded-lg border border-border bg-card p-2.5 text-left transition-colors hover:border-primary/40 hover:bg-muted/30"
                >
                  <p className="font-semibold text-foreground">Cyber Workspace</p>
                  <p className="text-[10px] text-muted-foreground">Clean dev aesthetic</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const url =
                      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1600&auto=format&fit=crop&q=80";
                    setBackgroundUrl(url);
                    setPreviewUrl(url);
                  }}
                  className="rounded-lg border border-border bg-card p-2.5 text-left transition-colors hover:border-primary/40 hover:bg-muted/30"
                >
                  <p className="font-semibold text-foreground">Retro TECHNO</p>
                  <p className="text-[10px] text-muted-foreground">Futuristic neon vibe</p>
                </button>
              </div>
            </div>

            {isSaved && (
              <div className="rounded-lg border border-semantic-success-border bg-semantic-success-background p-3 text-xs text-semantic-success">
                Background configuration updated successfully!
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <Button type="submit" size="sm" className="gap-1.5 flex-1">
                <Save className="h-4 w-4" />
                <span>Save Background</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReset}
                title="Reset to default"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </Container>

        {/* Live Preview Column */}
        <Container className="overflow-hidden p-5 lg:col-span-7">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <ImageIcon className="h-4 w-4 text-primary" />
              Live Public Portal Mockup
            </span>
            <span className="text-[10px] text-muted-foreground">Aspect ratio: 16:9</span>
          </div>

          {/* Browser / Website Frame Preview */}
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border shadow-sm">
            {/* Background image */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-500"
              style={{ backgroundImage: `url(${previewUrl})` }}
            >
              {/* Subtle dark overlay so UI stands out */}
              <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px]" />
            </div>

            {/* Mocked Public Website UI */}
            <div className="relative flex h-full flex-col justify-between p-4 sm:p-6 text-white">
              {/* Mock Navbar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded bg-primary flex items-center justify-center text-xs font-bold">
                    H
                  </div>
                  <span className="text-xs font-bold tracking-tight">HIMTI KIT</span>
                </div>
                <div className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] backdrop-blur font-medium">
                  TECHNO Edition
                </div>
              </div>

              {/* Mock Hero Content */}
              <div className="mx-auto my-auto max-w-xs text-center">
                <h3 className="text-base sm:text-lg font-bold tracking-tight">
                  Welcome, Binusian!
                </h3>
                <p className="mt-1 text-[11px] text-slate-300">
                  Enter your NIM to access official HIMTI KIT study materials & software tools.
                </p>
                <div className="mt-3 flex items-center justify-center gap-1.5">
                  <div className="h-7 w-36 rounded bg-white/20 px-2 text-[10px] flex items-center text-slate-300 border border-white/20">
                    NIM (e.g. 2602111111)
                  </div>
                  <div className="h-7 rounded bg-primary px-3 text-[10px] font-semibold flex items-center justify-center text-white">
                    Enter
                  </div>
                </div>
              </div>

              {/* Mock Footer */}
              <div className="text-center text-[9px] text-slate-400">
                HIMTI BINUS University &copy; 2026
              </div>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}
