"use client";
import { useState, forwardRef, useImperativeHandle } from "react";

import { Upload, CheckCircle } from "lucide-react";
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
  onFilesAdded?: (hasFiles: boolean) => void;
}

export const PdfUploadSection = forwardRef<
  { handleUpload: () => Promise<boolean> },
  PdfUploadSectionProps
>(({ medicalRecordId, onUploadComplete, onFilesAdded }, ref) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFilesChange = (newFiles: FileWithPreview[]) => {
    const existingFiles = files.filter((f) => f.uploaded);
    const newUniqueFiles = newFiles.filter(
      (newFile) =>
        !files.some(
          (existing) =>
            existing.name === newFile.name && existing.size === newFile.size
        )
    );
    const updatedFiles = [...existingFiles, ...newUniqueFiles];
    setFiles(updatedFiles);

    onFilesAdded?.(updatedFiles.length > 0);
  };

  const handleUpload = async (): Promise<boolean> => {
    const validFiles = files.filter((f) => !f.error && !f.uploaded);
    if (validFiles.length === 0) {
      return true; // No files to upload is considered success
    }

    setUploading(true);
    setUploadProgress(0);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];

      try {
        const validationError = validateFile(file);
        if (validationError) {
          errorCount++;
          continue;
        }

        const compressedFile = await compressPDF(file);

        const result = await uploadAttachment(
          medicalRecordId,
          file,
          compressedFile
        );

        if (result.success) {
          successCount++;
          setFiles((prevFiles) =>
            prevFiles.map((f) =>
              f.id === file.id ? { ...f, uploaded: true } : f
            )
          );
        } else {
          errorCount++;
          toast.error(`Error al subir ${file.name}: ${result.error}`);
        }
      } catch (error) {
        errorCount++;
        toast.error(`Error inesperado al subir ${file.name}`);
      }

      setUploadProgress(((i + 1) / validFiles.length) * 100);
    }

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

    return errorCount === 0; // Return true if all uploads succeeded
  };

  useImperativeHandle(ref, () => ({
    handleUpload,
  }));

  const uploadedFilesCount = files.filter((f) => f.uploaded).length;

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
      </CardContent>
    </Card>
  );
});

PdfUploadSection.displayName = "PdfUploadSection";
