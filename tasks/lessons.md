# Lessons Learned

## Session 2026-03-18
- Always test in a real browser before declaring tools "functionally correct" — code review alone missed the download and button styling bugs that broke ALL 19 tools
- The `!important` CSS flag on a class applied unconditionally will override inline styles and Tailwind classes — always check for this pattern
- `URL.revokeObjectURL()` called immediately after `a.click()` can race with Chrome's download initiation — always delay cleanup
- **CRITICAL: Parallel Claude Code tabs sharing one working directory will clobber each other's git branches.** When tab 2 runs `git checkout branch-2`, it switches the branch for ALL tabs since they share the same `.git` directory. Use `git worktree add` to give each tab its own isolated working copy. Example: `git worktree add ../qa-wave-1 qa/wave-1` then `cd ../qa-wave-1 && claude`. Each worktree has its own checked-out branch independently.
- **"Push" means push to BOTH GitHub AND Vercel.** Auto-deploy from GitHub is not reliable. Every time the user says "push" or "commit and push", ALWAYS run `git push origin main` followed by `vercel deploy --prod`. Never assume GitHub auto-deploy will handle it.
