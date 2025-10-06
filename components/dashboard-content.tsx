"use client";

import { useState } from "react";
import { TaskCard } from "@/components/task-card";

interface Item {
  id: number;
  titulo: string;
  descricao: string;
}

interface Tarefa {
  id: number;
  titulo: string;
  descricao: string;
  data: Date;
  status: boolean;
  itens: Item[];
}

interface Usuario {
  id: number;
  nome: string;
  email: string;
}

interface DashboardContentProps {
  initialTarefas: Tarefa[];
  user: Usuario;
}

export function DashboardContent({ initialTarefas, user }: DashboardContentProps) {
  const [tarefas, setTarefas] = useState(initialTarefas);

  const handleItemAdded = async () => {
    // Recarregar tarefas após adicionar item
    try {
      const response = await fetch("/api/dashboard", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTarefas(data.tarefas);
      }
    } catch (error) {
      console.error("Erro ao recarregar tarefas:", error);
      // Fallback: recarregar página
      window.location.reload();
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Bem-vindo, {user.nome}!</h1>
      <h2 className="text-xl mb-4">Suas Tarefas</h2>
      <div className="space-y-4">
        {tarefas.length === 0 ? (
          <p>Você ainda não tem tarefas.</p>
        ) : (
          tarefas.map((tarefa) => (
            <TaskCard
              key={tarefa.id}
              tarefa={tarefa}
              onItemAdded={handleItemAdded}
            />
          ))
        )}
      </div>
    </div>
  );
}