// src/app/admin/login/page.tsx
"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, getUser } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string[] | undefined }>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const user = await getUser();
      if (user) {
        router.replace("/admin"); // Redirect if already logged in
      }
    };
    checkUser();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({}); // Clear previous errors

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    const result = await signIn(formData);

    if (!result.success) {
      if (result.errors) {
        setErrors(result.errors);
      }
      toast.error("Error de inicio de sesión", {
        description: result.message,
      });
    } else {
      toast.success("Inicio de sesión exitoso", {
        description: "Redirigiendo al panel de administración...",
      });
      // Redirection is handled by the server action
    }
    setIsSubmitting(false);
  };

  const getFirstError = (field: keyof typeof errors) => {
    const fieldErrors = errors[field];
    return fieldErrors && fieldErrors.length > 0 ? fieldErrors[0] : null;
  };

  return (
    <div className="flex-grow flex items-center justify-center pt-22 pb-14 bg-gradient-to-br from-purple-50 via-white to-indigo-50 min-h-screen">
      <Card className="w-full max-w-md shadow-lg border-purple-100">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-900">
            Acceso de Administrador
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Ingresa tus credenciales para acceder al panel.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="admin@nutricionpro.com"
                required
                className="mt-1"
                aria-invalid={!!getFirstError("email")}
              />
              {getFirstError("email") && (
                <p className="text-red-500 text-xs mt-1">
                  {getFirstError("email")}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                placeholder="••••••••"
                required
                className="mt-1"
                aria-invalid={!!getFirstError("password")}
              />
              {getFirstError("password") && (
                <p className="text-red-500 text-xs mt-1">
                  {getFirstError("password")}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
