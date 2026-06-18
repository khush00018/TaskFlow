'use strict';

// ─── State ───────────────────────────────────────────────────
const STORAGE_KEY = 'taskflow_todos';
let todos = [];
let currentFilter = 'all';

// ─── Helpers ─────────────────────────────────────────────────
const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function loadTodos() {
  try {
    todos = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    todos = [];
  }
}

// ─── DOM refs ────────────────────────────────────────────────
const todoInput     = document.getElementById('todoInput');
const addBtn        = document.getElementById('addBtn');
const todoList      = document.getElementById('todoList');
const errorMsg      = document.getElementById('errorMsg');
const emptyState    = document.getElementById('emptyState');
const completedCount = document.getElementById('completedCount');
const totalCount     = document.getElementById('totalCount');
const clearCompleted = document.getElementById('clearCompleted');
const filterBtns    = document.querySelectorAll('.filter-btn');

// ─── Error handling ───────────────────────────────────────────
function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.classList.add('show');
  todoInput.classList.add('error');
  clearTimeout(showError._t);
  showError._t = setTimeout(() => {
    errorMsg.classList.remove('show');
    todoInput.classList.remove('error');
  }, 3000);
}

// ─── Add todo ─────────────────────────────────────────────────
function addTodo() {
  const text = todoInput.value.trim();
  if (!text) { showError('Task cannot be empty.'); todoInput.focus(); return; }
  if (text.length < 2) { showError('Task is too short (min 2 chars).'); return; }
  if (todos.some(t => t.text.toLowerCase() === text.toLowerCase())) {
    showError('This task already exists!'); return;
  }

  const todo = { id: genId(), text, completed: false, createdAt: Date.now() };
  todos.unshift(todo);
  saveTodos();
  todoInput.value = '';
  errorMsg.classList.remove('show');
  renderList();
}

// ─── Toggle complete ──────────────────────────────────────────
function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (todo) { todo.completed = !todo.completed; saveTodos(); renderList(); }
}

// ─── Delete todo ──────────────────────────────────────────────
function deleteTodo(id) {
  const li = todoList.querySelector(`[data-id="${id}"]`);
  if (li) {
    li.classList.add('removing');
    li.addEventListener('transitionend', () => {
      todos = todos.filter(t => t.id !== id);
      saveTodos();
      renderList();
    }, { once: true });
  }
}

// ─── Edit todo ────────────────────────────────────────────────
function startEdit(id) {
  const li = todoList.querySelector(`[data-id="${id}"]`);
  if (!li) return;
  const todo = todos.find(t => t.id === id);
  const input = li.querySelector('.todo-edit-input');
  li.classList.add('editing');
  input.value = todo.text;
  input.focus();
  input.select();

  function saveEdit() {
    const newText = input.value.trim();
    if (!newText) { showError('Task cannot be empty.'); input.focus(); return; }
    if (newText.length < 2) { showError('Task is too short.'); return; }
    todo.text = newText;
    saveTodos();
    li.classList.remove('editing');
    renderList();
  }

  input.onblur = saveEdit;
  input.onkeydown = (e) => {
    if (e.key === 'Enter') { saveEdit(); }
    if (e.key === 'Escape') { li.classList.remove('editing'); renderList(); }
  };
}

// ─── Render ───────────────────────────────────────────────────
function getFilteredTodos() {
  if (currentFilter === 'completed') return todos.filter(t => t.completed);
  if (currentFilter === 'pending')   return todos.filter(t => !t.completed);
  return todos;
}

function renderList() {
  const filtered = getFilteredTodos();
  todoList.innerHTML = '';

  // Update stats
  const done = todos.filter(t => t.completed).length;
  completedCount.textContent = done;
  totalCount.textContent = todos.length;

  // Empty state
  if (filtered.length === 0) {
    emptyState.classList.add('show');
    return;
  }
  emptyState.classList.remove('show');

  // Use event delegation — render items via template
  filtered.forEach((todo) => {
    const li = document.createElement('li');
    li.className = 'todo-item' + (todo.completed ? ' completed' : '');
    li.dataset.id = todo.id;

    li.innerHTML = `
      <input type="checkbox" class="todo-check" ${todo.completed ? 'checked' : ''} aria-label="Mark complete" />
      <span class="todo-text">${escapeHtml(todo.text)}</span>
      <input type="text" class="todo-edit-input" aria-label="Edit task" />
      <div class="todo-actions">
        <button class="action-btn edit-btn" data-action="edit" title="Edit">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button class="action-btn delete-btn" data-action="delete" title="Delete">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </button>
      </div>
    `;

    // Checkbox — direct listener
    li.querySelector('.todo-check').addEventListener('change', () => toggleTodo(todo.id));

    todoList.appendChild(li);
  });
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ─── Event Delegation for delete/edit buttons ─────────────────
todoList.addEventListener('click', (e) => {
  const btn = e.target.closest('.action-btn');
  if (!btn) return;
  e.stopPropagation();
  const li = btn.closest('.todo-item');
  const id = li?.dataset.id;
  if (!id) return;
  const action = btn.dataset.action;
  if (action === 'delete') deleteTodo(id);
  if (action === 'edit')   startEdit(id);
});

// ─── Submit (click & Enter key) ───────────────────────────────
addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTodo();
});

// ─── Filter buttons ───────────────────────────────────────────
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderList();
  });
});

// ─── Clear completed ──────────────────────────────────────────
clearCompleted.addEventListener('click', () => {
  todos = todos.filter(t => !t.completed);
  saveTodos();
  renderList();
});

// ─── Init ─────────────────────────────────────────────────────
loadTodos();
renderList();
