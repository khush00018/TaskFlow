# TaskFlow — Todo App (Vanilla JS + React)

A fully-featured, beautifully designed Todo application built in two flavors.

---

## 📁 Project Structure

```
todo-apps/
├── vanilla-js/          ← Pure HTML + CSS + JavaScript
│   ├── index.html
│   ├── style.css
│   └── app.js
│
└── react-js/            ← React 18 + CSS Modules
    ├── public/index.html
    ├── src/
    │   ├── index.js
    │   ├── index.css
    │   ├── App.js
    │   └── App.module.css
    └── package.json
```

---

## ✅ Features Implemented

### DOM Manipulation
- Dynamically add and remove todo items with smooth animations
- Update task status (completed / pending) with visual feedback

### Events & Event Bubbling
- `click`, `submit (Enter key)`, `change` events handled
- Event delegation for delete/edit buttons on the todo list

### LocalStorage
- All todos persisted in `localStorage`
- Data survives page refresh

### Error Handling
- Prevents empty or too-short submissions
- Prevents duplicate tasks
- Inline error messages shown via JavaScript/React state

---

## 🚀 Running the Apps

### Vanilla JS
Just open `vanilla-js/index.html` in any browser. No build step needed.

### React
```bash
cd react-js
npm install
npm run dev
```
Open http://localhost:3000

---

## 🎨 Design
- Dark theme with lime accent (`#c8ff57`)
- Syne (display) + DM Sans (body) typography
- Animated task entries with spring physics
- Smooth remove/complete transitions
