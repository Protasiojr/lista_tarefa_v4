"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AddItemFormProps {
  tarefaId: number;
  onItemAdded: () => void;
}

interface ItemFormData {
  titulo: string;
  descricao: string;
}

export function AddItemForm({ tarefaId, onItemAdded }: AddItemFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ItemFormData>();

  const onSubmit = async (data: ItemFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/item", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          titulo: data.titulo,
          descricao: data.descricao,
          tarefaId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao criar item");
      }

      reset();
      onItemAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Adicionar Novo Item</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              {...register("titulo", { required: "Título é obrigatório" })}
              placeholder="Digite o título do item"
            />
            {errors.titulo && (
              <p className="text-sm text-red-600">{errors.titulo.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              {...register("descricao", { required: "Descrição é obrigatória" })}
              placeholder="Digite a descrição do item"
              rows={3}
            />
            {errors.descricao && (
              <p className="text-sm text-red-600">{errors.descricao.message}</p>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Adicionando..." : "Adicionar Item"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}