import React, { useState } from 'react';
import TodoItem from './TodoItem';
import EmptyState from './EmptyState';

export default function TodoList({
  todos = [],
  onToggle,
  onEdit,
  onDelete,
  onUpdateSubtasks,
  onReorder,
  isFiltered,
  onResetFilter,
  onOpenNewTodo
}) {
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== targetIndex && onReorder) {
      onReorder(draggedIndex, targetIndex);
    }
    setDraggedIndex(null);
  };

  if (todos.length === 0) {
    return (
      <EmptyState
        isFiltered={isFiltered}
        onResetFilter={onResetFilter}
        onOpenNewTask={onOpenNewTodo}
      />
    );
  }

  return (
    <div className="space-y-3" role="list" aria-label="Todos list">
      {todos.map((todo, index) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          index={index}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
          onUpdateSubtasks={onUpdateSubtasks}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        />
      ))}
    </div>
  );
}
