"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Image as ImageIcon, X } from "lucide-react";

export function AvatarUploader({
  value,
  previewUrl,
  onChange,
}: {
  value?: File;
  previewUrl?: string;
  onChange: (file: File | undefined, previewUrl?: string) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [localPreview, setLocalPreview] = React.useState<string | undefined>(previewUrl);

  React.useEffect(() => {
    setLocalPreview(previewUrl);
  }, [previewUrl]);

  function pickFile() {
    inputRef.current?.click();
  }
  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setLocalPreview(url);
    onChange(file, url);
  }
  function clear() {
    setLocalPreview(undefined);
    if (inputRef.current) inputRef.current.value = "";
    onChange(undefined, undefined);
  }

  const initials = (() => {
    const name = value?.name || "";
    const letters = name.match(/[A-Za-z]/g) || [];
    return letters.slice(0, 2).join("").toUpperCase() || "?";
  })();

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <Avatar className="h-24 w-24">
          <AvatarImage src={localPreview} alt="avatar" />
          <AvatarFallback className="text-base">{initials}</AvatarFallback>
        </Avatar>
        {localPreview && (
          <button
            type="button"
            onClick={clear}
            className="absolute -right-2 -top-2 inline-flex h-6 w-6 items-center justify-center rounded-full border bg-background text-muted-foreground shadow"
            aria-label="Remove image"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileChange}
        />
        <Button type="button" variant="secondary" size="sm" onClick={pickFile}>
          <ImageIcon className="mr-2 h-4 w-4" /> Choose photo
        </Button>
      </div>
    </div>
  );
}
