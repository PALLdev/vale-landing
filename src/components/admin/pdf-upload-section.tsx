"use client";
import { useState } from "react";
import { Upload, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { FileUploadDropzone } from "./file-upload-dropzone";
import { uploadAttachment, compressPDF } from "@/actions/attachments";
import { validateFile } from "@/lib/validate-file";

interface FileWithPreview extends File {
  id: string;
  preview?: string;
  compressed?: File;
  error?: string;
  uploaded?: boolean;
}

interface PdfUploadSectionProps {
  medicalRecordId: string;
  onUploadComplete?: () => void;
}

export function PdfUploadSection({
  medicalRecordId,
  onUploadComplete,
}: PdfUploadSectionProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  console.log(
    "[v0] PdfUploadSection initialized with medicalRecordId:",
    medicalRecordId
  );

  const handleFilesChange = (newFiles: FileWithPreview[]) => {
    console.log("[v0] Files changed, new count:", newFiles.length);
    const existingFiles = files.filter((f) => f.uploaded);
    const newUniqueFiles = newFiles.filter(
      (newFile) =>
        !files.some(
          (existing) =>
            existing.name === newFile.name && existing.size === newFile.size
        )
    );
    setFiles([...existingFiles, ...newUniqueFiles]);
  };

  const handleUpload = async () => {
    const validFiles = files.filter((f) => !f.error && !f.uploaded);
    if (validFiles.length === 0) {
      toast.error("No hay archivos nuevos para subir");
      return;
    }

    console.log("[v0] Starting upload process for", validFiles.length, "files");
    console.log("[v0] Medical Record ID:", medicalRecordId);

    setUploading(true);
    setUploadProgress(0);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      console.log(
        "[v0] Processing file:",
        file.name,
        "Size:",
        file.size,
        "Type:",
        file.type
      );

      try {
        const validationError = validateFile(file);
        if (validationError) {
          console.log("[v0] File validation failed:", validationError);
          errorCount++;
          continue;
        }
        console.log("[v0] File validation passed");

        console.log("[v0] Compressing file...");
        const compressedFile = await compressPDF(file);
        console.log("[v0] File compressed, new size:", compressedFile.size);

        console.log("[v0] Uploading file to Supabase...");
        const result = await uploadAttachment(
          medicalRecordId,
          file,
          compressedFile
        );
        console.log("[v0] Upload result:", result);

        if (result.success) {
          console.log("[v0] File uploaded successfully:", result.attachment);
          successCount++;
          setFiles((prevFiles) =>
            prevFiles.map((f) =>
              f.id === file.id ? { ...f, uploaded: true } : f
            )
          );
        } else {
          console.log("[v0] Upload failed:", result.error);
          errorCount++;
          toast.error(`Error al subir ${file.name}: ${result.error}`);
        }
      } catch (error) {
        console.log("[v0] Unexpected error uploading file:", error);
        errorCount++;
        toast.error(`Error inesperado al subir ${file.name}`);
      }

      setUploadProgress(((i + 1) / validFiles.length) * 100);
    }

    console.log(
      "[v0] Upload process completed. Success:",
      successCount,
      "Errors:",
      errorCount
    );

    setUploading(false);
    setUploadProgress(0);

    if (successCount > 0) {
      toast.success(
        `${successCount} archivo${successCount !== 1 ? "s" : ""} subido${
          successCount !== 1 ? "s" : ""
        } correctamente`
      );
    }

    if (errorCount > 0) {
      toast.error(
        `${errorCount} archivo${errorCount !== 1 ? "s" : ""} no se pudo${
          errorCount !== 1 ? "ieron" : ""
        } subir`
      );
    }
  };

  const uploadedFilesCount = files.filter((f) => f.uploaded).length;
  const pendingFilesCount = files.filter((f) => !f.error && !f.uploaded).length;
  const hasAnyFiles = files.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <Upload className="w-5 h-5 text-[var(--color-prim)]" />
          <span>Subir Archivos PDF</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FileUploadDropzone
          onFilesChange={handleFilesChange}
          maxFiles={10}
          maxSizePerFile={5}
          acceptedTypes={["application/pdf"]}
          disabled={uploading}
        />

        {uploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Subiendo archivos...
              </span>
              <span className="text-[var(--color-prim)]">
                {Math.round(uploadProgress)}%
              </span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {uploadedFilesCount > 0 && (
          <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 p-2 rounded">
            <CheckCircle className="w-4 h-4" />
            <span>
              {uploadedFilesCount} archivo{uploadedFilesCount !== 1 ? "s" : ""}{" "}
              subido
              {uploadedFilesCount !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {pendingFilesCount > 0 && !uploading && hasAnyFiles && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-[var(--color-prim)]" />
              <span>
                {pendingFilesCount} archivo{pendingFilesCount !== 1 ? "s" : ""}{" "}
                listo
                {pendingFilesCount !== 1 ? "s" : ""} para subir
              </span>
            </div>

            <Button
              onClick={handleUpload}
              disabled={uploading || pendingFilesCount === 0}
              className="bg-[var(--color-prim)] hover:bg-[var(--color-prim-dark)] text-white"
            >
              <Upload className="w-4 h-4 mr-2" />
              Subir Archivo{pendingFilesCount !== 1 ? "s" : ""}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
