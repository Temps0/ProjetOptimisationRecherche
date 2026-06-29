---
name: git-skill
description: Git workflow rules
---
This skill defines the rules and best practices for managing Git in this project. As an AI agent or developer, you must strictly follow these instructions whenever you perform Git operations to ensure a highly efficient, clean, and professional version control system.

## 1. Atomic Commits
- **Do not use `git add .`** unless the changes are truly cohesive and limited to a single feature or bug fix.
- Group changes logically. Each commit must represent a single, focused change.
- If multiple unrelated files are modified, use granular `git add <file>` to stage and commit them separately.

## 2. Commit Message Format (Conventional Commits)
- All commit messages must be written in **English**.
- Follow the Conventional Commits specification: `<type>(<optional scope>): <description>`
- Types:
  - `feat`: A new feature
  - `fix`: A bug fix
  - `docs`: Documentation only changes
  - `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc.)
  - `refactor`: A code change that neither fixes a bug nor adds a feature
  - `perf`: A code change that improves performance
  - `test`: Adding missing tests or correcting existing tests
  - `build`: Changes that affect the build system or external dependencies
  - `ci`: Changes to CI configuration files and scripts
  - `chore`: Other changes that don't modify `src` or test files
- **Scopes**: Use scopes to identify the component affected (e.g., `feat(ui): ...`, `fix(auth): ...`).

## 3. Commit Descriptions
- The subject line must be written in the imperative mood (e.g., "add feature" not "added feature" or "adds feature").
- Keep the subject line under 50 characters.
- Do not capitalize the first letter of the subject line.
- Do not end the subject line with a period.
- **Always** provide a detailed description in the body of the commit message, wrapping at 72 characters. The description must thoroughly explain *what* the changes are, *why* they were made, and provide detailed insights into the *implementation* and changes made (the *how*).

## 4. Branching Strategy (Personal Branch Workflow)
- **`master` / `main` branch**: The original repository's primary branch. You should rarely need to interact with it directly.
- **`temps0` branch**: This is your dedicated personal contribution branch (acting as your own `main`). All contributions for this project must be made on this branch.
  - Do not create feature branches (e.g. `feat/...`). Simply commit all changes directly to `temps0`.
- **Rebase over Merge**: Keep `temps0` updated with the original repository's `main` via rebase (`git pull --rebase origin main`) when necessary to avoid merge commits and conflicts.
- **Pull Requests**: Push the `temps0` branch to your remote fork (`origin`) using `git push -u origin temps0` and open or update the Pull Request against the original upstream repository.

## 5. Hooks and Code Quality
- **Pre-commit Hooks**: The project uses `husky` and `lint-staged`. Commits will automatically trigger linters (`eslint`, `prettier`). 
- Fix any linting errors before committing. Do not bypass hooks (`--no-verify`) unless absolutely necessary.

## 6. Version Management (Semantic Versioning)
- Use **Semantic Versioning (SemVer)** for tags and releases: `vMAJOR.MINOR.PATCH`.
  - **MAJOR**: Incompatible API changes or significant architecture overhauls.
  - **MINOR**: New features added in a backward-compatible manner.
  - **PATCH**: Backward-compatible bug fixes.

## 7. The `/git` AI Trigger Workflow
Whenever the user types `/git` in the chat, the AI MUST execute the following comprehensive checklist to ensure maximum efficiency:

1. **Pre-flight & Audit**: 
   - Run `git status -u` (with `-u` to show untracked files) and `git diff` to find all uncommitted changes across the entire repository.
   - Run `git branch` and `git remote -v` to check current branches and remotes.
   - **Crucial**: Ensure the current branch is `temps0`. If not, switch to it (`git checkout temps0`) or create it if missing.
2. **Branch Cleanup**:
   - Delete any legacy local branches (like old feature branches) if they are no longer relevant to keep the repository clean.
3. **Analyze & Group (Atomicity)**: 
   - Logically group the changes into atomic units. 
4. **Commit & Push (PR Prep)**: 
   - Stage files precisely (`git add <file>`).
   - Commit using Conventional Commits with scopes.
   - Push the branch to the remote fork (`git push -u origin temps0`) so the user's PR is automatically updated.
5. **Mandatory Version Bump**: 
   - Analyze the new commits to determine the Semantic Version bump (Major, Minor, or Patch). You MUST always update the version in `package.json` (or other relevant manifest files) and include this change in your commit.
6. **Changelog Generation**:
   - Append new `feat` and `fix` summaries to a `CHANGELOG.md` file if requested.
