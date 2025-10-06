"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";

interface ItemData {
  titulo: string;
  descricao: string;
}

interface TaskFormData {
  titulo: string;
  descricao: string;
  data: string;
  status: boolean;
  itens: ItemData[];
}

export function CreateTaskForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TaskFormData>({
    defaultValues: {
      status: false,
      itens: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "itens",
  });

  const status = watch("status");

  const onSubmit = async (data: TaskFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Criar tarefa
      const response = await fetch("/api/tarefa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          titulo: data.titulo,
          descricao: data.descricao,
          data: data.data,
          status: data.status,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao criar tarefa");
      }

      const { tarefa } = await response.json();

      // Criar itens se houver
      if (data.itens.length > 0) {
        for (const item of data.itens) {
          const itemResponse = await fetch("/api/item", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              titulo: item.titulo,
              descricao: item.descricao,
              tarefaId: tarefa.id,
            }),
          });

          if (!itemResponse.ok) {
            console.error("Erro ao criar item:", item);
          }
        }
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Criar Nova Tarefa</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              {...register("titulo", { required: "Título é obrigatório" })}
              placeholder="Digite o título da tarefa"
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
              placeholder="Digite a descrição da tarefa"
              rows={3}
            />
            {errors.descricao && (
              <p className="text-sm text-red-600">{errors.descricao.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="data">Data</Label>
            <Input
              id="data"
              type="datetime-local"
              {...register("data", { required: "Data é obrigatória" })}
            />
            {errors.data && (
              <p className="text-sm text-red-600">{errors.data.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="status"
              checked={status}
              onCheckedChange={(checked) => setValue("status", !!checked)}
            />
            <Label htmlFor="status">Concluída</Label>
          </div>

          <div>
            <Label>Itens</Label>
            {fields.map((field, index) => (
              <div key={field.id} className="border p-4 rounded mb-2">
                <div className="mb-2">
                  <Input
                    {...register(`itens.${index}.titulo` as const, { required: "Título é obrigatório" })}
                    placeholder="Título do item"
                  />
                </div>
                <div className="mb-2">
                  <Textarea
                    {...register(`itens.${index}.descricao` as const, { required: "Descrição é obrigatória" })}
                    placeholder="Descrição do item"
                    rows={2}
                  />
                </div>
                <Button type="button" onClick={() => remove(index)} variant="destructive">
                  Remover Item
                </Button>
              </div>
            ))}
            <Button type="button" onClick={() => append({ titulo: "", descricao: "" })}>
              Adicionar Item
            </Button>
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Criando..." : "Criar Tarefa"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}