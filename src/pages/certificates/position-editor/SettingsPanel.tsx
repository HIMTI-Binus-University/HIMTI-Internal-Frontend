import { useState } from "react";
import { Upload } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ColorPicker } from "@/components/ui/color-picker";
import { useCertificateStore } from "../store";
import { DEFAULT_FONTS, FONT_WEIGHTS, TEXT_ALIGNMENTS } from "../constants";
import { loadCustomFont, isFont } from "../utils";

const SettingsPanel = () => {
  const { state, updateTextSettings, resetTextSettings } =
    useCertificateStore();
  const { textSettings } = state;

  const [customFonts, setCustomFonts] = useState<
    Array<{ label: string; value: string }>
  >([]);

  const handleCustomFontUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isFont(file)) {
      alert("File harus berformat .ttf atau .otf");
      return;
    }

    try {
      const fontName = file.name.replace(/\.(ttf|otf)$/i, "");
      const fontUrl = URL.createObjectURL(file);

      await loadCustomFont(fontName, fontUrl);

      setCustomFonts((prev) => [
        ...prev,
        { label: fontName, value: fontName },
      ]);
      updateTextSettings({ fontFamily: fontName });
      alert(`Font "${fontName}" berhasil dimuat!`);
    } catch (error) {
      alert("Gagal memuat font. Silakan coba lagi.");
      console.error(error);
    }
  };

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto">
      {/* Section 1: Posisi & Dimensi */}
      <Card className="p-4">
        <h3 className="mb-3 text-sm font-semibold">📍 Posisi & Dimensi</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="x" className="text-xs">
              X (%)
            </Label>
            <Input
              id="x"
              type="number"
              min={0}
              max={100}
              value={textSettings.x}
              onChange={(e) =>
                updateTextSettings({ x: Number(e.target.value) })
              }
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="y" className="text-xs">
              Y (%)
            </Label>
            <Input
              id="y"
              type="number"
              min={0}
              max={100}
              value={textSettings.y}
              onChange={(e) =>
                updateTextSettings({ y: Number(e.target.value) })
              }
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="width" className="text-xs">
              Width (%)
            </Label>
            <Input
              id="width"
              type="number"
              min={0}
              max={100}
              value={textSettings.width}
              onChange={(e) =>
                updateTextSettings({ width: Number(e.target.value) })
              }
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="height" className="text-xs">
              Height (%)
            </Label>
            <Input
              id="height"
              type="number"
              min={0}
              max={100}
              value={textSettings.height}
              onChange={(e) =>
                updateTextSettings({ height: Number(e.target.value) })
              }
              className="mt-1"
            />
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => updateTextSettings({ x: 50 })}
          >
            Tengah Horizontal
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => updateTextSettings({ y: 50 })}
          >
            Tengah Vertikal
          </Button>
        </div>
      </Card>

      {/* Section 2: Tipografi */}
      <Card className="p-4">
        <h3 className="mb-3 text-sm font-semibold">🔤 Tipografi</h3>
        <div className="space-y-3">
          <div>
            <Label htmlFor="fontFamily" className="text-xs">
              Font Family
            </Label>
            <Select
              value={textSettings.fontFamily}
              onValueChange={(value) =>
                updateTextSettings({ fontFamily: value || "Plus Jakarta Sans" })
              }
            >
              <SelectTrigger id="fontFamily" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEFAULT_FONTS.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    {font.label}
                  </SelectItem>
                ))}
                {customFonts.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    {font.label} (Custom)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="customFont" className="text-xs">
              Upload Custom Font
            </Label>
            <div className="mt-1">
              <label htmlFor="customFont">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  asChild
                >
                  <span>
                    <Upload className="mr-2 h-3 w-3" />
                    Upload Font (.ttf/.otf)
                  </span>
                </Button>
              </label>
              <input
                id="customFont"
                type="file"
                accept=".ttf,.otf"
                className="hidden"
                onChange={handleCustomFontUpload}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="fontSize" className="text-xs">
                Font Size (px)
              </Label>
              <Input
                id="fontSize"
                type="number"
                min={8}
                max={200}
                value={textSettings.fontSize}
                onChange={(e) =>
                  updateTextSettings({ fontSize: Number(e.target.value) })
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="minFontSize" className="text-xs">
                Min Size (px)
              </Label>
              <Input
                id="minFontSize"
                type="number"
                min={8}
                max={200}
                value={textSettings.minFontSize}
                onChange={(e) =>
                  updateTextSettings({ minFontSize: Number(e.target.value) })
                }
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="fontWeight" className="text-xs">
                Weight
              </Label>
              <Select
                value={textSettings.fontWeight}
                onValueChange={(value) =>
                  updateTextSettings({ fontWeight: value || "normal" })
                }
              >
                <SelectTrigger id="fontWeight" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_WEIGHTS.map((weight) => (
                    <SelectItem key={weight.value} value={weight.value}>
                      {weight.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="textAlign" className="text-xs">
                Align
              </Label>
              <Select
                value={textSettings.textAlign}
                onValueChange={(value) =>
                  updateTextSettings({ textAlign: value || "center" })
                }
              >
                <SelectTrigger id="textAlign" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEXT_ALIGNMENTS.map((align) => (
                    <SelectItem key={align.value} value={align.value}>
                      {align.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs">Color</Label>
            <div className="mt-1">
              <ColorPicker
                value={textSettings.color}
                onChange={(color) => updateTextSettings({ color })}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Section 3: Pengaturan Lanjutan */}
      <Card className="p-4">
        <h3 className="mb-3 text-sm font-semibold">⚙️ Pengaturan Lanjutan</h3>
        <div className="space-y-3">
          <div>
            <Label htmlFor="letterSpacing" className="text-xs">
              Letter Spacing (px)
            </Label>
            <Input
              id="letterSpacing"
              type="number"
              value={textSettings.letterSpacing}
              onChange={(e) =>
                updateTextSettings({ letterSpacing: Number(e.target.value) })
              }
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="lineHeight" className="text-xs">
              Line Height
            </Label>
            <Input
              id="lineHeight"
              type="number"
              step={0.1}
              min={0.5}
              max={3}
              value={textSettings.lineHeight}
              onChange={(e) =>
                updateTextSettings({ lineHeight: Number(e.target.value) })
              }
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="maxLines" className="text-xs">
              Max Lines
            </Label>
            <Input
              id="maxLines"
              type="number"
              min={1}
              max={10}
              value={textSettings.maxLines}
              onChange={(e) =>
                updateTextSettings({ maxLines: Number(e.target.value) })
              }
              className="mt-1"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="uppercase"
              checked={textSettings.uppercase}
              onCheckedChange={(checked) =>
                updateTextSettings({ uppercase: checked as boolean })
              }
            />
            <Label
              htmlFor="uppercase"
              className="text-xs font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Tampilkan UPPERCASE
            </Label>
          </div>
        </div>
      </Card>

      {/* Section 4: Nama Panjang */}
      <Card className="p-4">
        <h3 className="mb-3 text-sm font-semibold">📏 Nama Panjang</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="autoFit"
              checked={textSettings.autoFit}
              onCheckedChange={(checked) =>
                updateTextSettings({ autoFit: checked as boolean })
              }
            />
            <Label
              htmlFor="autoFit"
              className="text-xs font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Aktifkan Auto Fit
            </Label>
          </div>

          {!textSettings.autoFit && (
            <div className="space-y-2 border-t pt-3">
              <p className="text-xs text-muted-foreground">
                Singkat nama panjang:
              </p>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="abbrevFirst"
                  checked={textSettings.abbreviate.firstName}
                  onCheckedChange={(checked) =>
                    updateTextSettings({
                      abbreviate: {
                        ...textSettings.abbreviate,
                        firstName: checked as boolean,
                      },
                    })
                  }
                />
                <Label
                  htmlFor="abbrevFirst"
                  className="text-xs font-normal leading-none"
                >
                  Nama pertama
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="abbrevMiddle"
                  checked={textSettings.abbreviate.middleName}
                  onCheckedChange={(checked) =>
                    updateTextSettings({
                      abbreviate: {
                        ...textSettings.abbreviate,
                        middleName: checked as boolean,
                      },
                    })
                  }
                />
                <Label
                  htmlFor="abbrevMiddle"
                  className="text-xs font-normal leading-none"
                >
                  Nama tengah
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="abbrevLast"
                  checked={textSettings.abbreviate.lastName}
                  onCheckedChange={(checked) =>
                    updateTextSettings({
                      abbreviate: {
                        ...textSettings.abbreviate,
                        lastName: checked as boolean,
                      },
                    })
                  }
                />
                <Label
                  htmlFor="abbrevLast"
                  className="text-xs font-normal leading-none"
                >
                  Nama terakhir
                </Label>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Reset Button */}
      <Button
        variant="destructive"
        onClick={resetTextSettings}
        className="mt-2"
      >
        Reset Pengaturan
      </Button>
    </div>
  );
};

export default SettingsPanel;
