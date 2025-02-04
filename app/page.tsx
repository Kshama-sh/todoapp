
'use client'

import { useState, useEffect } from 'react'
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import Link from 'next/link'

import * as api from '@/lib/api'

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Todo } from '@/types'
import { useToast } from '@/hooks/use-toast'

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [isLoading, setIsLoading] = useState(true)
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  useEffect(() => {
    loadTodos()
  }, [])

  async function loadTodos() {
    try {
      const data = await api.fetchTodos()
      setTodos(data.sort((a, b) => a.order - b.order))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load todos",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function addTodo(e: React.FormEvent) {
    e.preventDefault()
    if (!newTodo.trim()) return

    try {
      const newTodoItem = {
        text: newTodo,
        completed: false,
        order: todos.length + 1
      }
      const created = await api.createTodo(newTodoItem)
      setTodos([...todos, created])
      setNewTodo('')
      toast({
        title: "Success",
        description: "Todo added successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add todo",
        variant: "destructive"
      })
    }
  }

  async function toggleTodo(id: string) {
    try {
      const todo = todos.find(t => t.id === id)
      if (!todo) return

      const updated = await api.updateTodo(id, {
        completed: !todo.completed
      })
      setTodos(todos.map(t => t.id === id ? updated : t))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update todo",
        variant: "destructive"
      })
    }
  }

  async function deleteTodo(id: string) {
    try {
      await api.deleteTodo(id)
      setTodos(todos.filter(todo => todo.id !== id))
      toast({
        title: "Success",
        description: "Todo deleted successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete todo",
        variant: "destructive"
      })
    }
  }

  async function clearCompleted() {
    try {
      const completedTodos = todos.filter(todo => todo.completed)
      await Promise.all(completedTodos.map(todo => api.deleteTodo(todo.id)))
      setTodos(todos.filter(todo => !todo.completed))
      toast({
        title: "Success",
        description: "Completed todos cleared"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear completed todos",
        variant: "destructive"
      })
    }
  }

  async function handleDragEnd(result: any) {
    if (!result.destination) return

    const items = Array.from(todos)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index + 1
    }))

    try {
      await api.reorderTodos(updatedItems)
      setTodos(updatedItems)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reorder todos",
        variant: "destructive"
      })
    }
  }

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed
    if (filter === 'completed') return todo.completed
    return true
  })

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <h1 className="text-2xl font-bold">Todo App</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={addTodo} className="flex gap-2 mb-4">
            <Input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a new todo..."
              className="flex-1"
            />
            <Button type="submit">Add</Button>
          </form>

          <div className="flex gap-2 mb-4">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'active' ? 'default' : 'outline'}
              onClick={() => setFilter('active')}
            >
              Active
            </Button>
            <Button
              variant={filter === 'completed' ? 'default' : 'outline'}
              onClick={() => setFilter('completed')}
            >
              Completed
            </Button>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="todos">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {filteredTodos.map((todo, index) => (
                    <Draggable key={todo.id} draggableId={todo.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="flex items-center gap-2 p-2 border rounded-lg hover:bg-accent"
                        >
                          <Checkbox
                            checked={todo.completed}
                            onCheckedChange={() => toggleTodo(todo.id)}
                          />
                          <span className={`flex-1 ${todo.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {todo.text}
                          </span>
                          <Link href={`/todo/${todo.id}`}>
                            <Button variant="outline" size="sm">View</Button>
                          </Link>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteTodo(todo.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </CardContent>

        <CardFooter>
          <Button variant="outline" onClick={clearCompleted}>
            Clear Completed
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}