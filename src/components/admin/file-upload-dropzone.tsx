"use client";

import type React from "react";
import { useState, useCallback, useRef } from "react";
import { Upload, X, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { validateFile as validateFileUtil } from "@/lib/validate-file";
import { compressPDF } from "@/lib/pdf-compression";

interface FileWithPreview extends File {
  id: string;
  preview?: string;
  compressed?: File;
  error?: string;
}

interface FileUploadDropzoneProps {
  onFilesChange: (files: FileWithPreview[]) => void;
  maxFiles?: number;
  maxSizePerFile?: number; // in MB
  acceptedTypes?: string[];
  disabled?: boolean;
}

export function FileUploadDropzone({
  onFilesChange,
  maxFiles = 10,
  maxSizePerFile = 5,
  acceptedTypes = ["application/pdf"],
  disabled = false,
}: FileUploadDropzoneProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    return validateFileUtil(file, maxSizePerFile);
  };

  const compressFile = async (file: File): Promise<File> => {
    try {
      const compressed = await compressPDF(file, {
        quality: 0.7,
        removeMetadata: true,
        optimizeImages: true,
      });

      return compressed;
    } catch (error) {
      console.error("File compression failed:", error);
      return file;
    }
  };

  const processFiles = useCallback(
    async (newFiles: File[]) => {
      setIsProcessing(true);
      setProcessingProgress(0);

      const processedFiles: FileWithPreview[] = [];

      for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i];
        const fileWithPreview = Object.assign(file, {
          id: `${Date.now()}-${i}`,
        }) as FileWithPreview;

        const error = validateFile(file);
        if (error) {
          fileWithPreview.error = error;
        } else {
          try {
            // Compress the file
            const compressedFile = await compressFile(file);
            fileWithPreview.compressed = compressedFile;
          } catch {
            fileWithPreview.error = "Error al procesar el archivo";
          }
        }

        processedFiles.push(fileWithPreview);
        setProcessingProgress(((i + 1) / newFiles.length) * 100);
      }

      const updatedFiles = [...files, ...processedFiles].slice(0, maxFiles);
      setFiles(updatedFiles);
      onFilesChange(updatedFiles);
      setIsProcessing(false);
      setProcessingProgress(0);
    },
    [files, maxFiles, onFilesChange]
  ); // added processFiles dependencies

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      if (disabled) return;

      const droppedFiles = Array.from(e.dataTransfer.files);
      if (droppedFiles.length > 0) {
        processFiles(droppedFiles);
      }
    },
    [disabled, processFiles] // replaced files and maxFiles with processFiles dependency
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      processFiles(selectedFiles);
    }
  };

  const removeFile = (fileId: string) => {
    const updatedFiles = files.filter((f) => f.id !== fileId);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  return (
    <div className="w-full space-y-4">
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-all duration-200
          ${
            isDragOver
              ? "border-[var(--color-prim)] bg-[var(--color-prim-very-lighter)] dark:bg-[var(--color-prim-darker)]/20"
              : "border-border hover:border-[var(--color-prim-lighter)]"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(",")}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />

        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div
            className={`
            p-3 rounded-full transition-colors
            ${
              isDragOver
                ? "bg-[var(--color-prim)] text-white"
                : "bg-[var(--color-prim-very-lighter)] text-[var(--color-prim)] dark:bg-[var(--color-prim-darker)]/30"
            }
          `}
          >
            <Upload className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              {isDragOver
                ? "Suelta los archivos aquí"
                : "Arrastra archivos PDF o haz clic para seleccionar"}
            </p>
            <p className="text-xs text-muted-foreground">
              Máximo {maxFiles} archivos • {maxSizePerFile}MB por archivo • Solo
              PDF
            </p>
          </div>

          {files.length > 0 && (
            <p className="text-xs text-[var(--color-prim)]">
              {files.length} archivo{files.length !== 1 ? "s" : ""} seleccionado
              {files.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      {/* Processing Progress */}
      {isProcessing && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Procesando archivos...
            </span>
            <span className="text-[var(--color-prim)]">
              {Math.round(processingProgress)}%
            </span>
          </div>
          <Progress value={processingProgress} className="h-2" />
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">
            Archivos seleccionados:
          </h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {files.map((file) => (
              <div
                key={file.id}
                className={`
                  flex items-center justify-between p-3 rounded-lg border transition-colors
                  ${
                    file.error
                      ? "border-destructive bg-destructive/5"
                      : "border-border bg-card hover:bg-accent/50"
                  }
                `}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div
                    className={`
                    p-2 rounded-md flex-shrink-0
                    ${
                      file.error
                        ? "bg-destructive/10 text-destructive"
                        : "bg-[var(--color-prim-very-lighter)] text-[var(--color-prim)] dark:bg-[var(--color-prim-darker)]/30"
                    }
                  `}
                  >
                    {file.error ? (
                      <AlertCircle className="w-4 h-4" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {file.name}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <span>{formatFileSize(file.size)}</span>
                      {file.compressed &&
                        file.compressed.size !== file.size && (
                          <>
                            <span>→</span>
                            <span className="text-[var(--color-prim)]">
                              {formatFileSize(file.compressed.size)}{" "}
                              (comprimido)
                            </span>
                          </>
                        )}
                    </div>
                    {file.error && (
                      <p className="text-xs text-destructive mt-1">
                        {file.error}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file.id);
                  }}
                  className="flex-shrink-0 h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {files.length > 0 && (
        <div className="flex items-center justify-between text-sm p-3 bg-accent/30 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-[var(--color-prim)]" />
            <span className="text-foreground">
              {files.filter((f) => !f.error).length} archivo
              {files.filter((f) => !f.error).length !== 1 ? "s" : ""} listo
              {files.filter((f) => !f.error).length !== 1 ? "s" : ""} para subir
            </span>
          </div>
          {files.some((f) => f.error) && (
            <span className="text-destructive text-xs">
              {files.filter((f) => f.error).length} con errores
            </span>
          )}
        </div>
      )}
    </div>
  );
}
