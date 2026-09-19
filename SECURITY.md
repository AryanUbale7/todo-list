# 🛡️ Security & Data Privacy Policy

## 🔒 Client-Side Data Sovereignty
FocusList is built strictly as a client-side web application. All data resides exclusively in the browser's `localStorage` and memory. No personal task data, titles, notes, or schedules are ever transmitted to third-party servers.

## 🛡️ Input Sanitization & XSS Mitigation
- User-supplied inputs are sanitized via utility functions in `src/utils/validators.js` before rendering.
- React's JSX templating provides automatic HTML entity escaping.
- No dynamic code execution (e.g. `eval`, `Function`, or unsanitized `dangerouslySetInnerHTML`) is allowed anywhere in the codebase.

## 📦 Dependency Scanning
Dependencies are regularly scanned using `npm audit` to ensure zero vulnerable packages are included in production builds.

## 🚨 Reporting a Security Vulnerability
If you discover a potential security flaw, please open an issue or reach out via repository maintainers.
