---
id: workflow-iterate-loop
title: The Iterate Loop
difficulty: 1
concepts:
  - workflow
  - objdiff
  - tooling
concept: true
---

# The iterate loop

Matching a function is a tight cycle you'll run dozens of times an hour. It looks
like this:

1. **Pick a function.** Usually one that's at 0% or a low partial match.
2. **Read the target asm.** Pull the retail disassembly and understand what the
   function *does* — the loads, the arithmetic, the calls, the control flow. (See
   the "Reading objdump" lesson for how to interpret each line.)
3. **Write plausible C.** Your best guess at the original source — the kind of
   plausible, period C a developer would have written, not assembly transcribed
   into C.
4. **Rebuild one .o.** Compile *just* your unit, not the whole game. Fast loops
   win.
5. **Diff.** Compare your object against the retail object.
6. **Find the FIRST diverging instruction.** Not all of them — the first one.
   Everything after the first divergence is often just downstream noise.
7. **Hypothesize and repeat.** Form one theory about *why* that instruction is
   wrong ("wrong signedness," "wrong struct field," "declaration order"), change
   the C, and go back to step 4.

The discipline that separates fast matchers from slow ones is step 6: **fix the
first divergence, then re-diff.** Chasing the tenth difference when the first one
is shifting everything below it is usually wasted effort.

## The tools that drive the loop

The one constant across decomp projects is **objdiff** — the interactive diff
viewer. You point it at the project; it watches your source files and **rebuilds
automatically** when you save, showing your asm next to the target side by side
with mismatches highlighted and branch-target/label noise masked out, so you only
see real codegen differences. This is where you live while matching — and in this
academy, the diff view you've been using *is* objdiff.

Projects usually also ship a couple of small helper scripts — one to dump a
single target function's asm ("what am I trying to reproduce?"), another for a
normalized diff against your build. Names vary from repo to repo; the *roles* are
what matter, and objdiff covers both for you here.

## Build one unit, not the world

A typical inner loop rebuilds a single object and refreshes the report:

```text
rm   build/<GAME_ID>/src/main/<path>.o
ninja build/<GAME_ID>/src/main/<path>.o
ninja build/<GAME_ID>/report.json
```

`<GAME_ID>` is your project's disc ID (a different game has a different one —
check the top of your Makefile/build config). Then read `fuzzy_match_percent`, or
just watch objdiff update. Tight loop, real feedback, repeat.
