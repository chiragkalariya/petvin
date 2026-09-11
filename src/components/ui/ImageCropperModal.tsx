"use client";

import React, { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import Cropper, { Area, Point } from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import { RotateCw, ZoomIn, ZoomOut, Check, X, RefreshCw } from "lucide-react";
import { getCroppedImg } from "@/lib/cropImage";

interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string;
  originalFileName?: string;
  onCropComplete: (croppedFile: File, croppedPreviewUrl: string) => void;
  onClose: () => void;
  defaultAspect?: number; // default 4/3
}

const ASPECT_RATIOS = [
  { label: "4:3 (Portfolio)", value: 4 / 3 },
  { label: "1:1 (Square)", value: 1 / 1 },
  { label: "16:9 (Wide)", value: 16 / 9 },
  { label: "Free", value: undefined },
];

export function ImageCropperModal({
  isOpen,
  imageSrc,
  originalFileName = "portfolio-image.jpg",
  onCropComplete,
  onClose,
  defaultAspect = 4 / 3,
}: ImageCropperModalProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspect, setAspect] = useState<number | undefined>(defaultAspect);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const onCropChange = (location: Point) => {
    setCrop(location);
  };

  const onCropCompleteHandler = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setAspect(defaultAspect);
  };

  const handleConfirmCrop = async () => {
    if (!croppedAreaPixels) return;

    try {
      setIsProcessing(true);
      const result = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation,
        { horizontal: false, vertical: false },
        originalFileName
      );

      if (result) {
        onCropComplete(result.file, result.url);
        onClose();
      }
    } catch (err) {
      console.error("Failed to crop image:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10050] flex flex-col bg-black/95 text-white backdrop-blur-md animate-fadeIn">
      {/* Top Header */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-4 sm:px-6">
        <div>
          <h2 className="text-base font-semibold tracking-wide text-white">Crop & Adjust Image</h2>
          <p className="text-xs text-ink-dimmer">Drag to move • Pinch or slider to zoom</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            title="Cancel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Cropper Stage */}
      <div className="relative flex-1 w-full overflow-hidden bg-neutral-950">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={aspect}
          onCropChange={onCropChange}
          onCropComplete={onCropCompleteHandler}
          onZoomChange={setZoom}
          onRotationChange={setRotation}
          showGrid={true}
          style={{
            containerStyle: {
              background: "#09090b",
            },
            cropAreaStyle: {
              border: "2px solid #ea580c",
              boxShadow: "0 0 0 9999em rgba(0, 0, 0, 0.75)",
            },
          }}
        />
      </div>

      {/* Bottom Controls Bar */}
      <div className="shrink-0 border-t border-white/10 bg-neutral-900/95 px-4 py-3 sm:px-6 space-y-3">
        {/* Aspect Ratio Selector */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-ink-dimmer mr-1">
            Ratio:
          </span>
          {ASPECT_RATIOS.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => setAspect(item.value)}
              className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                aspect === item.value
                  ? "bg-accent text-white font-semibold shadow-sm"
                  : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Sliders and Quick Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 max-w-4xl mx-auto">
          {/* Zoom Slider */}
          <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-md">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(1, z - 0.2))}
              className="text-white/60 hover:text-white p-1"
              title="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-lg bg-white/20 accent-accent"
            />
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
              className="text-white/60 hover:text-white p-1"
              title="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <span className="text-[11px] font-mono text-white/60 w-9 text-right">
              {zoom.toFixed(1)}x
            </span>
          </div>

          {/* Action Buttons: Rotate & Reset */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRotate}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white/10 text-white hover:bg-white/15 transition-colors"
              title="Rotate 90 degrees"
            >
              <RotateCw className="h-3.5 w-3.5" />
              <span>Rotate</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
              title="Reset view"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Submit / Done */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-white/70 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleConfirmCrop}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-lg bg-accent text-white hover:bg-accent/90 disabled:opacity-50 shadow-md transition-all active:scale-95"
            >
              {isProcessing ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Cropping...</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Done</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
