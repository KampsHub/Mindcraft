"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase";
import { colors, fonts } from "@/lib/theme";

const display = fonts.display;
const body = fonts.bodyAlt;

export interface EnneagramDoc {
  url: string;
  filename: string;
  uploaded_at: string;
}

export interface EnneagramAnalysis {
  type: string;
  wing: string;
  tritype: string;
  centers: { action: number; feeling: number; thinking: number };
  key_development_areas: string[];
  integration_plan: string;
  documents: EnneagramDoc[];
  analyzed_at: string;
}

interface Props {
  clientId: string;
  onAnalysisComplete: (data: EnneagramAnalysis) => void;
  existingDocs?: EnneagramDoc[];
}

const ACCEPTED = ".pdf,.jpg,.jpeg,.png";
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 2;

export default function EnneagramUpload({ clientId, onAnalysisComplete, existingDocs = [] }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  function handleFiles(incoming: FileList | null) {
    if (!incoming) return;
    setError(null);
    const newFiles = Array.from(incoming).slice(0, MAX_FILES - files.length);
    for (const f of newFiles) {
      if (f.size > MAX_SIZE) {
        setError(`${f.name} exceeds 10MB limit.`);
        return;
      }
      if (!f.type.match(/^(application\/pdf|image\/(jpeg|png))$/)) {
        setError(`${f.name} is not a supported format. Use PDF, JPEG, or PNG.`);
        return;
      }
    }
    setFiles(prev => [...prev, ...newFiles].slice(0, MAX_FILES));
  }

  function removeFile(idx: number) {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  }

  async function handleUploadAndAnalyze() {
    if (files.length === 0) return;
    setUploading(true);
    setError(null);
    setProgress("Uploading documents...");

    try {
      const fileUrls: string[] = [];

      for (const file of files) {
        const ts = Date.now();
        const path = `${clientId}/${ts}-${file.name}`;
        const { error: uploadErr } = await supabase.storage
          .from("enneagram-docs")
          .upload(path, file, { contentType: file.type });

        if (uploadErr) {
          setError(`Upload failed: ${uploadErr.message}`);
          setUploading(false);
          setProgress("");
          return;
        }

        const { data: urlData } = supabase.storage
          .from("enneagram-docs")
          .getPublicUrl(path);

        fileUrls.push(urlData.publicUrl);
      }

      setUploading(false);
      setAnalyzing(true);
      setProgress("Analyzing your Enneagram documents... This takes about 30 seconds.");

      const res = await fetch("/api/enneagram-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, fileUrls }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Analysis failed. Please try again.");
        setAnalyzing(false);
        setProgress("");
        return;
      }

      const data = await res.json();
      setAnalyzing(false);
      setProgress("");
      setFiles([]);
      onAnalysisComplete(data.analysis);
    } catch (err) {
      console.error("Enneagram upload/analyze failed:", err);
      setError("Something went wrong. Please try again.");
      setUploading(false);
      setAnalyzing(false);
      setProgress("");
    }
  }

  const totalDocs = existingDocs.length + files.length;
  const canAdd = totalDocs < MAX_FILES;
  const isWorking = uploading || analyzing;

  return (
    <div style={{
      backgroundColor: colors.bgSurface,
      borderRadius: 14,
      padding: 24,
      border: `1px solid ${colors.borderDefault}`,
    }}>
      <p style={{
        fontFamily: display, fontSize: 16, fontWeight: 700,
        color: colors.textPrimary, margin: "0 0 6px 0",
      }}>
        Enneagram Documents
      </p>
      <p style={{
        fontFamily: body, fontSize: 14, color: colors.textPrimary,
        lineHeight: 1.5, margin: "0 0 16px 0",
      }}>
        Upload your IEQ9 Enneagram report (and optional coaching companion) to unlock personalized development areas. Accepts PDF or images.
      </p>

      {/* Existing docs */}
      {existingDocs.map((doc, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "8px 12px", borderRadius: 8,
          backgroundColor: colors.bgElevated,
          marginBottom: 8,
        }}>
          <span style={{ fontSize: 16 }}>📄</span>
          <span style={{ fontFamily: body, fontSize: 13, color: colors.textPrimary, flex: 1 }}>
            {doc.filename}
          </span>
          <a
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontFamily: body, fontSize: 12, color: colors.coral, textDecoration: "none" }}
          >
            Download
          </a>
        </div>
      ))}

      {/* Staged files */}
      {files.map((f, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "8px 12px", borderRadius: 8,
          backgroundColor: colors.bgElevated,
          marginBottom: 8,
        }}>
          <span style={{ fontSize: 16 }}>📎</span>
          <span style={{ fontFamily: body, fontSize: 13, color: colors.textPrimary, flex: 1 }}>
            {f.name} ({(f.size / 1024 / 1024).toFixed(1)} MB)
          </span>
          {!isWorking && (
            <button
              onClick={() => removeFile(i)}
              style={{
                background: "none", border: "none", color: colors.textMuted,
                cursor: "pointer", fontSize: 14, fontFamily: body,
              }}
            >
              Remove
            </button>
          )}
        </div>
      ))}

      {/* Upload area */}
      {canAdd && !isWorking && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onDrop={(e) => { e.preventDefault(); e.stopPropagation(); handleFiles(e.dataTransfer.files); }}
          style={{
            border: `2px dashed ${colors.borderDefault}`,
            borderRadius: 10,
            padding: "20px 16px",
            textAlign: "center",
            cursor: "pointer",
            marginBottom: 12,
            transition: "border-color 0.2s",
          }}
        >
          <p style={{ fontFamily: body, fontSize: 13, color: colors.textMuted, margin: 0 }}>
            Drop files here or click to browse
          </p>
          <p style={{ fontFamily: body, fontSize: 11, color: colors.textMuted, margin: "4px 0 0 0" }}>
            PDF, JPEG, or PNG — max 10MB each — up to {MAX_FILES - totalDocs + files.length} more
          </p>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED}
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            style={{ display: "none" }}
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <p style={{ fontFamily: body, fontSize: 13, color: colors.error, margin: "0 0 12px 0" }}>
          {error}
        </p>
      )}

      {/* Progress */}
      {progress && (
        <p style={{ fontFamily: body, fontSize: 13, color: colors.coral, margin: "0 0 12px 0" }}>
          {progress}
        </p>
      )}

      {/* Analyze button */}
      {files.length > 0 && !isWorking && (
        <button
          onClick={handleUploadAndAnalyze}
          style={{
            fontFamily: display, fontSize: 14, fontWeight: 600,
            padding: "10px 24px", borderRadius: 100,
            backgroundColor: colors.coral, color: colors.bgDeep,
            border: "none", cursor: "pointer",
          }}
        >
          Upload & Analyze
        </button>
      )}
    </div>
  );
}
