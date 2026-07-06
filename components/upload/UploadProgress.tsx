"use client";

interface FileUploadState {
  name: string;
  progress: number; // 0-100
  status: "hashing" | "presigning" | "uploading" | "completing" | "done" | "duplicate" | "error";
  error?: string;
}

interface Props {
  files: FileUploadState[];
}

const STATUS_LABELS: Record<FileUploadState["status"], string> = {
  hashing: "Computing hash…",
  presigning: "Preparing…",
  uploading: "Uploading…",
  completing: "Finalizing…",
  done: "Done",
  duplicate: "Already exists",
  error: "Error",
};

const STATUS_COLORS: Record<FileUploadState["status"], string> = {
  hashing: "bg-blue-500",
  presigning: "bg-blue-500",
  uploading: "bg-hive-gold",
  completing: "bg-hive-gold",
  done: "bg-green-500",
  duplicate: "bg-yellow-500",
  error: "bg-red-500",
};

export type { FileUploadState };

export default function UploadProgress({ files }: Props) {
  if (!files.length) return null;

  return (
    <div className="mt-6 space-y-3">
      {files.map((file, i) => (
        <div key={i} className="bg-hive-surface border border-hive-border rounded-lg p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm text-white truncate max-w-xs">{file.name}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded font-medium ${
                file.status === "done"
                  ? "text-green-400"
                  : file.status === "duplicate"
                  ? "text-yellow-400"
                  : file.status === "error"
                  ? "text-red-400"
                  : "text-gray-400"
              }`}
            >
              {STATUS_LABELS[file.status]}
            </span>
          </div>

          {file.status !== "done" && file.status !== "duplicate" && (
            <div className="w-full bg-hive-border rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${STATUS_COLORS[file.status]}`}
                style={{ width: `${file.progress}%` }}
              />
            </div>
          )}

          {file.error && <p className="text-xs text-red-400 mt-1">{file.error}</p>}
        </div>
      ))}
    </div>
  );
}



<!-- Stripe Checkout Block -->
<div id="stripe-checkout-cta" style="margin: 2rem auto; padding: 2rem; border-radius: 12px; background: rgba(59,130,246,0.05); border: 1px solid rgba(59,130,246,0.2); text-align: center; font-family: sans-serif; max-width: 600px;">
    <h3 style="margin-top: 0; color: #fff;">Activate Premium License</h3>
    <p style="color: #9ca3af; font-size: 0.95rem; margin-bottom: 1.5rem;">Get instant access to all advanced capabilities and integration features.</p>
    <a href="https://buy.stripe.com/6oU00lb2L6F37bIazv0RG0J" target="_blank" style="display: inline-block; padding: 0.8rem 2rem; background: #3b82f6; color: #fff; font-weight: bold; border-radius: 8px; text-decoration: none; transition: background 0.2s;">Unlock Now</a>
</div>
