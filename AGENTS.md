## Project
Private intimacy tracker built with Expo, React Native, and TypeScript.

## Product direction
This app should feel discreet, premium, calm, and privacy-first.
Avoid crude or overly explicit language in UI labels, screen names, and copy.
Prefer language like:
- Intimacy Log
- Shared Experience
- Reflection
- Preferences
- Invite
- Cycle

## Stack
- Expo
- React Native
- TypeScript
- Expo Router
- expo-sqlite
- expo-secure-store
- expo-local-authentication
- Zustand
- React Hook Form
- Zod

## Architecture rules
- Use Expo Router for navigation
- Keep screens thin
- Move reusable logic into feature or lib modules
- Keep types explicit
- Prefer simple, readable implementations
- Avoid unnecessary abstractions early

## Data rules
- Local-first storage for sensitive data
- Use SQLite for persisted app data
- Use SecureStore only for secrets or lock-related values
- Do not assume cloud sync unless explicitly implemented

## UI rules
- Keep the interface minimal, elegant, soft, and private
- Use consistent spacing and rounded cards
- Handle loading, empty, and error states
- Build mobile-friendly forms with clear validation

## Workflow rules
- Before making major edits, inspect the codebase and summarize relevant files
- For non-trivial tasks, create a short plan first
- Then implement end-to-end
- Reuse existing patterns
- Avoid adding dependencies unless needed

## Done means
A task is done when:
1. The requested feature is implemented in the right files
2. Types are correct
3. Navigation and state are wired properly
4. Basic edge cases are handled
5. Any required commands or manual checks are listed clearly