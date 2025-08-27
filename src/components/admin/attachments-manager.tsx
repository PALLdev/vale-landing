"use client";
import { useState, useEffect, useCallback } from "react";
import { Download, Eye, Trash2, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  getAttachmentsByMedicalRecord,
  getAttachmentDownloadUrl,
  deleteAttachment,
  type MedicalRecordAttachment,
} from "@/actions/attachments";
import { formatFileSize } from "@/lib/storage-config";

interface AttachmentsManagerProps {
  medicalRecordId: string;
  canDelete?: boolean;
}

export function AttachmentsManager({
  medicalRecordId,
  canDelete = true,
}: AttachmentsManagerProps) {
  const [attachments, setAttachments] = useState<MedicalRecordAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewingPdf, setViewingPdf] = useState<string | null>(null);

  const loadAttachments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAttachmentsByMedicalRecord(medicalRecordId);
      setAttachments(data);
    } catch (error) {
      console.error("Error loading attachments:", error);
      toast.error("No se pudieron cargar los archivos adjuntos");
    } finally {
      setLoading(false);
    }
  }, [medicalRecordId]);

  useEffect(() => {
    loadAttachments();
  }, [loadAttachments]);

  const handleDownload = async (attachment: MedicalRecordAttachment) => {
    try {
      const downloadUrl = await getAttachmentDownloadUrl(attachment.file_path);
      if (downloadUrl) {
        // Create a temporary link and trigger download
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = attachment.file_name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success(`Descargando ${attachment.file_name}`);
      } else {
        throw new Error("No se pudo generar la URL de descarga");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("No se pudo descargar el archivo");
    }
  };

  const handleView = async (attachment: MedicalRecordAttachment) => {
    try {
      const viewUrl = await getAttachmentDownloadUrl(attachment.file_path);
      if (viewUrl) {
        setViewingPdf(viewUrl);
      } else {
        throw new Error("No se pudo generar la URL de visualización");
      }
    } catch (error) {
      console.error("Error viewing file:", error);
      toast.error("No se pudo abrir el archivo para visualización");
    }
  };

  const handleDelete = async (attachmentId: string) => {
    try {
      setDeletingId(attachmentId);
      const success = await deleteAttachment(attachmentId);

      if (success) {
        setAttachments((prev) => prev.filter((att) => att.id !== attachmentId));
        toast.success("El archivo se eliminó correctamente");
      } else {
        throw new Error("No se pudo eliminar el archivo");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("No se pudo eliminar el archivo");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CL", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Archivos Adjuntos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--color-prim)]" />
            <span className="ml-2 text-muted-foreground">
              Cargando archivos...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Archivos Adjuntos</span>
            <Badge
              variant="secondary"
              className="bg-[var(--color-prim-very-lighter)] text-[var(--color-prim)]"
            >
              {attachments.length} archivo{attachments.length !== 1 ? "s" : ""}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {attachments.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay archivos adjuntos</p>
              <p className="text-sm text-muted-foreground mt-1">
                Los archivos PDF se mostrarán aquí una vez que se suban
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="p-2 rounded-md bg-[var(--color-prim-very-lighter)] text-[var(--color-prim)] flex-shrink-0 dark:bg-[var(--color-prim-darker)]/30">
                      <FileText className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {attachment.file_name}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{formatFileSize(attachment.file_size)}</span>
                        <span>•</span>
                        <span>{formatDate(attachment.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {/* View Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleView(attachment)}
                      className="h-8 w-8 p-0 hover:bg-[var(--color-prim-very-lighter)] hover:text-[var(--color-prim)]"
                      title="Ver archivo"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>

                    {/* Download Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(attachment)}
                      className="h-8 w-8 p-0 hover:bg-[var(--color-prim-very-lighter)] hover:text-[var(--color-prim)]"
                      title="Descargar archivo"
                    >
                      <Download className="w-4 h-4" />
                    </Button>

                    {/* Delete Button */}
                    {canDelete && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                            title="Eliminar archivo"
                            disabled={deletingId === attachment.id}
                          >
                            {deletingId === attachment.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              ¿Eliminar archivo?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. El archivo
                              &quot;{attachment.file_name}&quot; será eliminado
                              permanentemente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(attachment.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* PDF Viewer Dialog */}
      <Dialog open={!!viewingPdf} onOpenChange={() => setViewingPdf(null)}>
        <DialogContent className="max-w-4xl w-full h-[80vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Visualizar PDF</DialogTitle>
          </DialogHeader>
          <div className="flex-1 p-6 pt-0">
            {viewingPdf ? (
              <iframe
                src={viewingPdf}
                className="w-full h-full border rounded-lg"
                title="PDF Viewer"
                onError={() => {
                  toast.error("No se pudo cargar el PDF para visualización");
                  setViewingPdf(null);
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-prim)]" />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
