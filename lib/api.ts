import { Todo } from "@/types"


const API_URL = 'http://localhost:3001'

export async function fetchTodos(): Promise<Todo[]> {
  const response = await fetch(`${API_URL}/todos`)
  if (!response.ok) {
    throw new Error('Failed to fetch todos')
  }
  return response.json()
}

export async function createTodo(todo: Omit<Todo, 'id'>): Promise<Todo> {
  const response = await fetch(`${API_URL}/todos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(todo),
  })
  if (!response.ok) {
    throw new Error('Failed to create todo')
  }
  return response.json()
}

export async function updateTodo(id: string, updates: Partial<Todo>): Promise<Todo> {
  const response = await fetch(`${API_URL}/todos/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  })
  if (!response.ok) {
    throw new Error('Failed to update todo')
  }
  return response.json()
}

export async function deleteTodo(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/todos/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error('Failed to delete todo')
  }
}

export async function reorderTodos(todos: Todo[]): Promise<Todo[]> {
  const response = await fetch(`${API_URL}/todos`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(todos),
  })
  if (!response.ok) {
    throw new Error('Failed to reorder todos')
  }
  return response.json()
}