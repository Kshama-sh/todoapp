'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import * as api from '@/lib/api'

import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { Todo } from '@/types'

export default function TodoDetail({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [todo, setTodo] = useState<Todo | null>(null)
  const [editText, setEditText] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadTodo()
  }, [params.id])

  async function loadTodo() {
    try {
      const todos = await api.fetchTodos()
      const foundTodo = todos.find(t => t.id === params.id)
      if (foundTodo) {
        setTodo(foundTodo)
        setEditText(foundTodo.text)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load todo",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function updateTodo() {
    if (!todo) return
    
    try {
      const updated = await api.updateTodo(todo.id, { text: editText })
      setTodo(updated)
      setIsEditing(false)
      toast({
        title: "Success",
        description: "Todo updated successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update todo",
        variant: "destructive"
      })
    }
  }

  async function toggleComplete() {
    if (!todo) return

    try {
      const updated = await api.updateTodo(todo.id, { completed: !todo.completed })
      setTodo(updated)
      toast({
        title: "Success",
        description: "Todo status updated"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update todo status",
        variant: "destructive"
      })
    }
  }

  async function deleteTodo() {
    try {
      await api.deleteTodo(params.id)
      toast({
        title: "Success",
        description: "Todo deleted successfully"
      })
      router.push('/')
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete todo",
        variant: "destructive"
      })
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  if (!todo) {
    return <div className="flex justify-center items-center min-h-screen">Todo not found</div>
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Todo Details</h1>
          <Link href="/">
            <Button variant="outline">Back</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Checkbox checked={todo.completed} onCheckedChange={toggleComplete} />
            {isEditing ? (
              <Input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="flex-1"
              />
            ) : (
              <span className={`flex-1 ${todo.completed ? 'line-through text-muted-foreground' : ''}`}>
                {todo.text}
              </span>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          {isEditing ? (
            <>
              <Button onClick={updateTodo}>Save</Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setIsEditing(true)}>Edit</Button>
          )}
          <Button variant="destructive" onClick={deleteTodo}>Delete</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
