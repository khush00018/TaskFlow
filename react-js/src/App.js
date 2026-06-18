import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './App.module.css';

// ─── Helpers ──────────────────────────────────────────────────
const STORAGE_KEY = 'taskflow_react_todos';
const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

function loadFromStorage() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

// ─── Icons ────────────────────────────────────────────────────
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const DeleteIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

// ─── TodoItem Component ───────────────────────────────────────
function TodoItem({ todo, onToggle, onDelete, onSave }) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [removing, setRemoving] = useState(false);
  const editRef = useRef(null);

  useEffect(() => { if (editing && editRef.current) { editRef.current.focus(); editRef.current.select(); } }, [editing]);

  const handleDelete = () => {
    setRemoving(true);
    setTimeout(() => onDelete(todo.id), 220);
  };

  const handleSaveEdit = () => {
    const trimmed = editText.trim();
    if (!trimmed || trimmed.length < 2) { setEditText(todo.text); setEditing(false); return; }
    onSave(todo.id, trimmed);
    setEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSaveEdit();
    if (e.key === 'Escape') { setEditText(todo.text); setEditing(false); }
  };

  return (
    <li className={`${styles.todoItem} ${todo.completed ? styles.completed : ''} ${removing ? styles.removing : ''}`}>
      <input
        type="checkbox"
        className={styles.checkbox}
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        aria-label="Mark complete"
      />
      {editing ? (
        <input
          ref={editRef}
          type="text"
          className={styles.editInput}
          value={editText}
          onChange={e => setEditText(e.target.value)}
          onBlur={handleSaveEdit}
          onKeyDown={handleKeyDown}
          maxLength={120}
          aria-label="Edit task"
        />
      ) : (
        <span className={styles.todoText}>{todo.text}</span>
      )}
      <div className={styles.actions}>
        {!editing && (
          <button className={`${styles.actionBtn} ${styles.editBtn}`} onClick={() => setEditing(true)} title="Edit">
            <EditIcon />
          </button>
        )}
        <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={handleDelete} title="Delete">
          <DeleteIcon />
        </button>
      </div>
    </li>
  );
}

// ─── Main App ─────────────────────────────────────────────────
export default function App() {
  const [todos, setTodos]       = useState(loadFromStorage);
  const [input, setInput]       = useState('');
  const [error, setError]       = useState('');
  const [filter, setFilter]     = useState('all');
  const errorTimerRef           = useRef(null);
  const inputRef                = useRef(null);

  // Persist
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(todos)); }, [todos]);

  // Error display
  const showError = useCallback((msg) => {
    setError(msg);
    clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => setError(''), 3000);
  }, []);

  // Add
  const handleAdd = () => {
    const text = input.trim();
    if (!text) { showError('Task cannot be empty.'); inputRef.current?.focus(); return; }
    if (text.length < 2) { showError('Task is too short (min 2 chars).'); return; }
    if (todos.some(t => t.text.toLowerCase() === text.toLowerCase())) {
      showError('This task already exists!'); return;
    }
    setTodos(prev => [{ id: genId(), text, completed: false, createdAt: Date.now() }, ...prev]);
    setInput('');
    setError('');
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleAdd(); };

  // Toggle
  const handleToggle = useCallback((id) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }, []);

  // Delete
  const handleDelete = useCallback((id) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  }, []);

  // Save edit
  const handleSave = useCallback((id, newText) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, text: newText } : t));
  }, []);

  // Clear completed
  const clearCompleted = () => setTodos(prev => prev.filter(t => !t.completed));

  // Filtered
  const filtered = todos.filter(t => {
    if (filter === 'completed') return t.completed;
    if (filter === 'pending')   return !t.completed;
    return true;
  });

  const done  = todos.filter(t => t.completed).length;
  const total = todos.length;

  return (
    <div className={styles.app}>
      <div className={styles.noise} />
      <div className={`${styles.glow} ${styles.glow1}`} />
      <div className={`${styles.glow} ${styles.glow2}`} />

      <main className={styles.main}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <div className={styles.logo}><span className={styles.logoIcon}>✦</span> TaskFlow</div>
            <div className={styles.stats}>
              <span className={styles.statNum}>{done}</span>/<span className={styles.statNum}>{total}</span>
              <span className={styles.statsLabel}> done</span>
            </div>
          </div>
          <h1 className={styles.headline}>Get things<br/><em>done.</em></h1>
        </header>

        {/* Input */}
        <section className={styles.inputSection}>
          <div className={styles.inputWrapper}>
            <input
              ref={inputRef}
              type="text"
              className={styles.todoInput}
              placeholder="What needs to be done?"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={120}
              autoComplete="off"
            />
            <button className={styles.addBtn} onClick={handleAdd} title="Add Task">
              <PlusIcon />
            </button>
          </div>
          <div className={`${styles.errorMsg} ${error ? styles.show : ''}`} role="alert">{error}</div>
        </section>

        {/* Filters */}
        <section className={styles.filterSection}>
          <div className={styles.filters}>
            {['all', 'pending', 'completed'].map(f => (
              <button
                key={f}
                className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <button className={styles.clearBtn} onClick={clearCompleted}>Clear done</button>
        </section>

        {/* List */}
        <section className={styles.listSection}>
          {filtered.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>◈</div>
              <p>No tasks here.<br/>Add one above!</p>
            </div>
          ) : (
            <ul className={styles.todoList}>
              {filtered.map(todo => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onSave={handleSave}
                />
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
