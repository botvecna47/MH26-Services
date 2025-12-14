# Git & GitHub Quick Reference

> Common commands for pushing, pulling, and managing changes

---

## 📤 Basic Push Workflow

```bash
# 1. Check what's changed
git status

# 2. Stage all changes
git add .

# 3. Commit with message
git commit -m "feat: your message here"

# 4. Push to remote
git push origin main
```

---

## 🔄 Common Scenarios

### Scenario 1: Normal Push (Most Common)
```bash
git add .
git commit -m "feat: add new feature"
git push
```

### Scenario 2: Push to Specific Branch
```bash
git push origin branch-name
```

### Scenario 3: First Push (New Repo)
```bash
git remote add origin https://github.com/username/repo.git
git branch -M main
git push -u origin main
```

### Scenario 4: Force Push (⚠️ Dangerous - Overwrites Remote)
```bash
git push --force origin main
# OR safer version:
git push --force-with-lease origin main
```

### Scenario 5: Push After Rebase
```bash
git rebase main
git push --force-with-lease origin feature-branch
```

---

## 📥 Pull & Sync

### Pull Latest Changes
```bash
git pull origin main
```

### Pull with Rebase (Cleaner History)
```bash
git pull --rebase origin main
```

### Fetch Without Merging
```bash
git fetch origin
git diff main origin/main  # See what changed
```

---

## 🌿 Branch Operations

### Create & Switch to New Branch
```bash
git checkout -b new-feature
# OR (newer syntax)
git switch -c new-feature
```

### List All Branches
```bash
git branch -a
```

### Delete Local Branch
```bash
git branch -d branch-name
# Force delete:
git branch -D branch-name
```

### Delete Remote Branch
```bash
git push origin --delete branch-name
```

### Rename Current Branch
```bash
git branch -m new-name
```

---

## ↩️ Undo Changes

### Unstage Files (Keep Changes)
```bash
git reset HEAD file.txt
# OR all files:
git reset HEAD
```

### Discard Local Changes (⚠️ Permanent)
```bash
git checkout -- file.txt
# OR all files:
git checkout -- .
```

### Undo Last Commit (Keep Changes)
```bash
git reset --soft HEAD~1
```

### Undo Last Commit (Discard Changes)
```bash
git reset --hard HEAD~1
```

### Revert a Pushed Commit (Safe)
```bash
git revert commit-hash
git push
```

---

## 🔀 Merge & Conflicts

### Merge Branch into Current
```bash
git merge feature-branch
```

### Abort a Merge
```bash
git merge --abort
```

### Resolve Conflicts
```bash
# 1. Edit conflicted files
# 2. Stage resolved files
git add .
# 3. Continue merge
git commit
```

---

## 📋 Stash (Temporary Storage)

### Save Work-in-Progress
```bash
git stash
# With message:
git stash push -m "work in progress"
```

### Apply Stashed Changes
```bash
git stash pop           # Apply and remove from stash
git stash apply         # Apply but keep in stash
```

### List Stashes
```bash
git stash list
```

### Apply Specific Stash
```bash
git stash apply stash@{2}
```

---

## 🏷️ Tags & Releases

### Create Tag
```bash
git tag v1.0.0
git tag -a v1.0.0 -m "Release version 1.0.0"
```

### Push Tags
```bash
git push origin v1.0.0
# Push all tags:
git push origin --tags
```

### Delete Tag
```bash
git tag -d v1.0.0                    # Local
git push origin --delete v1.0.0     # Remote
```

---

## 🔍 View History

### View Commit Log
```bash
git log --oneline -10    # Last 10 commits, short format
git log --graph          # With branch visualization
```

### View Changes in Commit
```bash
git show commit-hash
```

### View File History
```bash
git log --follow -p file.txt
```

---

## 🛠️ Configuration

### Set User Info
```bash
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

### View Current Config
```bash
git config --list
```

### Set Default Branch Name
```bash
git config --global init.defaultBranch main
```

---

## 🚨 Emergency Fixes

### Amend Last Commit Message
```bash
git commit --amend -m "new message"
```

### Add Forgotten File to Last Commit
```bash
git add forgotten-file.txt
git commit --amend --no-edit
```

### Recover Deleted Branch
```bash
git reflog                    # Find the commit hash
git checkout -b recovered-branch commit-hash
```

### Reset to Remote State (⚠️ Discards Local)
```bash
git fetch origin
git reset --hard origin/main
```

---

## 📝 Commit Message Conventions

```
feat:     New feature
fix:      Bug fix
docs:     Documentation changes
style:    Formatting, no code change
refactor: Code restructuring
test:     Adding tests
chore:    Maintenance tasks
```

**Examples:**
```bash
git commit -m "feat: add user authentication"
git commit -m "fix: resolve login redirect issue"
git commit -m "docs: update README with setup instructions"
git commit -m "refactor: extract email service to separate module"
```

---

## 🔗 Remote Management

### View Remotes
```bash
git remote -v
```

### Add Remote
```bash
git remote add origin https://github.com/user/repo.git
```

### Change Remote URL
```bash
git remote set-url origin https://github.com/user/new-repo.git
```

### Remove Remote
```bash
git remote remove origin
```
