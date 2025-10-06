"use client";

import { useState } from "react";
import { AddItemForm } from "@/components/add-item-form";

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

interface TaskCardProps {
  tarefa: Tarefa;
  onItemAdded: () => void;
  onTaskCompleted: () => void;
}

export function TaskCard({ tarefa, onItemAdded, onTaskCompleted }: TaskCardProps) {
  const [showAddForm, setShowAddForm] = useState(false);

  const handleItemAdded = () => {
    setShowAddForm(false);
    onItemAdded();
  };

  const handleCompleteTask = async () => {
    try {
      const response = await fetch(`/api/tarefa/${tarefa.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: true }),
      });

      if (response.ok) {
        onTaskCompleted();
      } else {
        console.error('Erro ao concluir tarefa');
      }
    } catch (error) {
      console.error('Erro ao concluir tarefa:', error);
    }
  };

  return (
    <div className="border p-4 rounded">
      <h3 className="font-semibold">{tarefa.titulo}</h3>
      <p>{tarefa.descricao}</p>
      <p>Status: {tarefa.status ? 'Concluída' : 'Pendente'}</p>
      <p>Data: {new Date(tarefa.data).toLocaleDateString('pt-BR')}</p>
      <h4>Itens:</h4>
      <ul>
        {tarefa.itens.map((item) => (
          <li key={item.id}>{item.titulo}: {item.descricao}</li>
        ))}
      </ul>
      <button
        onClick={() => setShowAddForm(!showAddForm)}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        {showAddForm ? "Cancelar" : "Adicionar Item"}
      </button>
      {!tarefa.status && (
        <button
          onClick={handleCompleteTask}
          className="mt-2 ml-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Concluir Tarefa
        </button>
      )}
      {showAddForm && (
        <div className="mt-4">
          <AddItemForm tarefaId={tarefa.id} onItemAdded={handleItemAdded} />
        </div>
      )}
    </div>
  );
}