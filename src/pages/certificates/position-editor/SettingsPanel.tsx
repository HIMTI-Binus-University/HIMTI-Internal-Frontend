import { useRef, useState } from "react";
import { RotateCcw, Type, Upload } from "lucide-react";

import { ContainerSection } from "@/components/Utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ColorPicker } from "@/components/ui/color-picker";
import { cn } from "@/lib/utils";
import { useCertificateStore } from "../store";
import { DEFAULT_FONTS, FONT_WEIGHTS, TEXT_ALIGNMENTS } from "../constants";
import { isFont } from "../utils";
import { listCustomFonts, registerCustomFont } from "../utils/customFonts";
import ConfirmDialog from "../components/ConfirmDialog";
import InlineNotice from "../components/InlineNotice";
import { CheckboxRow, NumberField, SettingsGroup } from "./fields";

const ROTATION_PRESETS = [-45, 0, 45, 90];

const SettingsPanel = () => {
  const { state, updateTextSettings, resetTextSettings } = useCertificateStore();
  const { textSettings } = state;

  const fontInputRef = useRef<HTMLInputElement>(null);
  const [customFonts, setCustomFonts] = useState(() =>
    listCustomFonts().map((font) => font.name),
  );
  const [fontStatus, setFontStatus] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);

  const handleCustomFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!isFont(file)) {
      setFontStatus({ tone: "error", message: "The font must be a .ttf or .otf file." });
      return;
    }

    const fontName = file.name.replace(/\.(ttf|otf)$/i, "");

    try {
      await registerCustomFont(fontName, file);
      setCustomFonts(listCustomFonts().map((font) => font.name));
      updateTextSettings({ fontFamily: fontName });
      setFontStatus({ tone: "success", message: `Font “${fontName}” loaded.` });
    } catch (error) {
      console.error(error);
      setFontStatus({ tone: "error", message: "The font could not be loaded. Try another file." });
    }
  };

  const { shadow, stroke, abbreviate } = textSettings;

  return (
    <ContainerSection
      icon={Type}
      title="Name style"
      description="Position, font and how long names are handled."
      actions={
        <ConfirmDialog
          trigger={
            <Button variant="ghost" size="sm">
              <RotateCcw aria-hidden="true" />
              Reset
            </Button>
          }
          title="Reset all name style settings?"
          description="Position, font, effects and long-name options go back to their defaults."
          confirmLabel="Reset settings"
          onConfirm={resetTextSettings}
        />
      }
    >
      <div className="space-y-5">
        <SettingsGroup title="Position">
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="X"
              suffix="%"
              value={textSettings.x}
              min={0}
              max={100}
              onChange={(x) => updateTextSettings({ x })}
            />
            <NumberField
              label="Y"
              suffix="%"
              value={textSettings.y}
              min={0}
              max={100}
              onChange={(y) => updateTextSettings({ y })}
            />
            <NumberField
              label="Width"
              suffix="%"
              value={textSettings.width}
              min={1}
              max={100}
              onChange={(width) => updateTextSettings({ width })}
            />
            <NumberField
              label="Rotation"
              suffix="°"
              value={textSettings.rotation}
              min={-180}
              max={180}
              onChange={(rotation) => updateTextSettings({ rotation })}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateTextSettings({ x: 50 })}
            >
              Center horizontally
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateTextSettings({ y: 50 })}
            >
              Center vertically
            </Button>
          </div>

          <div
            role="group"
            aria-label="Rotation presets"
            className="grid grid-cols-4 gap-2"
          >
            {ROTATION_PRESETS.map((angle) => (
              <Button
                key={angle}
                variant={textSettings.rotation === angle ? "secondary" : "outline"}
                size="sm"
                aria-pressed={textSettings.rotation === angle}
                onClick={() => updateTextSettings({ rotation: angle })}
              >
                {angle}°
              </Button>
            ))}
          </div>
        </SettingsGroup>

        <SettingsGroup title="Typography">
          <div>
            <Label htmlFor="fontFamily" className="text-xs">
              Font family
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
                {customFonts.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name} (custom)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <input
              ref={fontInputRef}
              type="file"
              accept=".ttf,.otf"
              className="hidden"
              aria-label="Custom font file"
              onChange={handleCustomFontUpload}
            />
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => fontInputRef.current?.click()}
            >
              <Upload aria-hidden="true" />
              Upload custom font (.ttf / .otf)
            </Button>
            {fontStatus && (
              <InlineNotice tone={fontStatus.tone} className="mt-2">
                {fontStatus.message}
              </InlineNotice>
            )}
          </div>

          <NumberField
            label="Font size"
            suffix="px"
            value={textSettings.fontSize}
            min={8}
            max={500}
            onChange={(fontSize) => updateTextSettings({ fontSize })}
          />

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
        </SettingsGroup>

        <SettingsGroup title="Text effects">
          <CheckboxRow
            label="Text shadow"
            checked={shadow.enabled}
            onChange={(enabled) => updateTextSettings({ shadow: { ...shadow, enabled } })}
          />
          {shadow.enabled && (
            <div className="space-y-3 border-l-2 border-semantic-info-border pl-3">
              <div>
                <Label className="text-xs">Shadow color</Label>
                <div className="mt-1">
                  <ColorPicker
                    value={shadow.color}
                    onChange={(color) => updateTextSettings({ shadow: { ...shadow, color } })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <NumberField
                  label="Blur"
                  suffix="px"
                  value={shadow.blur}
                  min={0}
                  max={20}
                  onChange={(blur) => updateTextSettings({ shadow: { ...shadow, blur } })}
                />
                <NumberField
                  label="Offset X"
                  suffix="px"
                  value={shadow.offsetX}
                  min={-10}
                  max={10}
                  onChange={(offsetX) => updateTextSettings({ shadow: { ...shadow, offsetX } })}
                />
                <NumberField
                  label="Offset Y"
                  suffix="px"
                  value={shadow.offsetY}
                  min={-10}
                  max={10}
                  onChange={(offsetY) => updateTextSettings({ shadow: { ...shadow, offsetY } })}
                />
              </div>
            </div>
          )}

          <CheckboxRow
            label="Text outline"
            checked={stroke.enabled}
            onChange={(enabled) => updateTextSettings({ stroke: { ...stroke, enabled } })}
          />
          {stroke.enabled && (
            <div className="space-y-3 border-l-2 border-semantic-info-border pl-3">
              <div>
                <Label className="text-xs">Outline color</Label>
                <div className="mt-1">
                  <ColorPicker
                    value={stroke.color}
                    onChange={(color) => updateTextSettings({ stroke: { ...stroke, color } })}
                  />
                </div>
              </div>
              <NumberField
                label="Width"
                suffix="px"
                value={stroke.width}
                min={0}
                max={10}
                onChange={(width) => updateTextSettings({ stroke: { ...stroke, width } })}
              />
            </div>
          )}

          <div>
            <Label htmlFor="opacity" className="text-xs">
              Opacity <span className="text-muted-foreground">(%)</span>
            </Label>
            <div className="mt-1 flex items-center gap-3">
              <input
                id="opacity"
                type="range"
                min={0}
                max={100}
                value={textSettings.opacity}
                onChange={(e) => updateTextSettings({ opacity: Number(e.target.value) })}
                className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-muted accent-primary"
              />
              <span className="w-10 text-right text-sm tabular-nums text-foreground">
                {textSettings.opacity}
              </span>
            </div>
          </div>
        </SettingsGroup>

        <SettingsGroup title="Spacing">
          <div className="grid grid-cols-3 gap-3">
            <NumberField
              label="Letter spacing"
              suffix="px"
              value={textSettings.letterSpacing}
              min={-20}
              max={100}
              onChange={(letterSpacing) => updateTextSettings({ letterSpacing })}
            />
            <NumberField
              label="Line height"
              value={textSettings.lineHeight}
              min={0.5}
              max={3}
              step={0.1}
              onChange={(lineHeight) => updateTextSettings({ lineHeight })}
            />
            <NumberField
              label="Max lines"
              value={textSettings.maxLines}
              min={1}
              max={10}
              onChange={(maxLines) => updateTextSettings({ maxLines: Math.round(maxLines) })}
            />
          </div>
          <CheckboxRow
            label="Display in UPPERCASE"
            checked={textSettings.uppercase}
            onChange={(uppercase) => updateTextSettings({ uppercase })}
          />
        </SettingsGroup>

        <SettingsGroup
          title="Long names"
          description="When a name does not fit the name box: shrink it first, then shorten it."
        >
          <CheckboxRow
            label="Shrink the font to fit"
            hint="Reduces the size, never below the minimum."
            checked={textSettings.autoFit}
            onChange={(autoFit) => updateTextSettings({ autoFit })}
          />

          <NumberField
            label="Minimum font size"
            suffix="px"
            value={textSettings.minFontSize}
            min={8}
            max={500}
            onChange={(minFontSize) => updateTextSettings({ minFontSize })}
            className={cn(!textSettings.autoFit && "opacity-50")}
          />

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Shorten to an initial if shrinking is not enough:
            </p>
            <CheckboxRow
              label="First name"
              checked={abbreviate.firstName}
              onChange={(firstName) =>
                updateTextSettings({ abbreviate: { ...abbreviate, firstName } })
              }
            />
            <CheckboxRow
              label="Middle names"
              checked={abbreviate.middleName}
              onChange={(middleName) =>
                updateTextSettings({ abbreviate: { ...abbreviate, middleName } })
              }
            />
            <CheckboxRow
              label="Last name"
              checked={abbreviate.lastName}
              onChange={(lastName) =>
                updateTextSettings({ abbreviate: { ...abbreviate, lastName } })
              }
            />
          </div>
        </SettingsGroup>
      </div>
    </ContainerSection>
  );
};

export default SettingsPanel;
