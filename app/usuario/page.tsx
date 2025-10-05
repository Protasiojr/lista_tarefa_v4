'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { SidebarLayout } from '@/components/sidebar';

interface Usuario {
  id: number;
  email: string;
  nome: string;
}

export default function UsuarioCRUD() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState({ email: '', nome: '', senha: '' });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const response = await fetch('/api/usuario');
      if (response.ok) {
        const data = await response.json();
        setUsuarios(data);
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingUser ? `/api/usuario/${editingUser.id}` : '/api/usuario';
      const method = editingUser ? 'PUT' : 'POST';
      const body = editingUser
        ? { email: formData.email, nome: formData.nome }
        : { email: formData.email, nome: formData.nome, senha: formData.senha };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        fetchUsuarios();
        setIsDialogOpen(false);
        setFormData({ email: '', nome: '', senha: '' });
        setEditingUser(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao salvar usuário');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao salvar usuário');
    }
  };

  const handleEdit = (user: Usuario) => {
    setEditingUser(user);
    setFormData({ email: user.email, nome: user.nome, senha: '' });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/usuario/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchUsuarios();
      } else {
        alert('Erro ao deletar usuário');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao deletar usuário');
    }
  };

  const openAddDialog = () => {
    setEditingUser(null);
    setFormData({ email: '', nome: '', senha: '' });
    setIsDialogOpen(true);
  };

  const filteredUsuarios = usuarios.filter(user =>
    user.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div>Carregando...</div>;

  return (
    <SidebarLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Gerenciamento de Usuários</h1>
        <Button onClick={openAddDialog} className="mb-4">Adicionar Usuário</Button>
        <Input
          placeholder="Buscar usuários por nome ou email..."
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          className="mb-4"
        />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsuarios.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.nome}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(user)} className="mr-2">Editar</Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">Deletar</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja deletar o usuário {user.nome}?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(user.id)}>Deletar</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Editar Usuário' : 'Adicionar Usuário'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>
              {!editingUser && (
                <div>
                  <Label htmlFor="senha">Senha</Label>
                  <Input
                    id="senha"
                    type="password"
                    value={formData.senha}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, senha: e.target.value })}
                    required
                  />
                </div>
              )}
              <Button type="submit">{editingUser ? 'Atualizar' : 'Criar'}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarLayout>
  );
}