# 🤝 Contributing to FocusList

Thank you for your interest in improving **FocusList**! We welcome contributions to make task management cleaner, faster, and more accessible.

---

## 🛠️ Development Workflow

1. **Clone the repository:**
   ```bash
   git clone https://github.com/AryanUbale7/todo-list.git
   cd todo-list
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start local development server:**
   ```bash
   npm run dev
   ```

4. **Run domain unit tests:**
   ```bash
   npm test
   ```

5. **Verify production bundle:**
   ```bash
   npm run build
   ```

---

## 📐 Code Style & Best Practices

- **Frontend-Only Integrity:** FocusList must remain a pure client-side application. Do not introduce mandatory backend servers or external API dependencies.
- **Accessibility (A11y):** All interactive elements must adhere to WCAG 2.1 AA standards (labels, ARIA tags, visible focus rings, keyboard navigability).
- **Performance:** Use `React.memo`, `useMemo`, and `useCallback` judiciously. Ensure zero layout thrashing or unmemoized heavy loops.
- **Testing:** New features or bug fixes must include corresponding tests in `src/__tests__/TodoList.test.js`.
