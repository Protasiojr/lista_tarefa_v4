"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";

interface Task {
  id: number;
  titulo: string;
}

interface ItemFormData {
  titulo: string;
  descricao: string;
  tarefaId: string;
}

export function CreateItemForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ItemFormData>();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("/api/tarefa", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setTasks(data);
        }
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar tarefas");
      }
    };
    fetchTasks();
  }, []);

  const onSubmit = async (data: ItemFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/item", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          titulo: data.titulo,
          descricao: data.descricao,
          tarefaId: parseInt(data.tarefaId),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao criar item");
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Criar Novo Item</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="tarefaId">Tarefa</Label>
            <Select onValueChange={(value) => setValue("tarefaId", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma tarefa" />
              </SelectTrigger>
              <SelectContent>
                {tasks.map((task) => (
                  <SelectItem key={task.id} value={task.id.toString()}>
                    {task.titulo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.tarefaId && (
              <p className="text-sm text-red-600">{errors.tarefaId.message}</p>
            )}
          </div>

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
            {isSubmitting ? "Criando..." : "Criar Item"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}