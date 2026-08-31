---
id: f3ede802-19ad-490d-9a3e-530539eab776
slug: adv-enums
title: Enums Are Just Numbers
difficulty: 3
concepts:
  - enums
  - conditionals
  - control-flow
symbol: func_800fb7a0
hints:
  - "Match each immediate in the target to its position in the `State` list — declaration order is the numbering."
  - "The value copied in the branch's delay slot is what comes back when the test fails. One `if`, two returns."
---

# The names dissolve at compile time

C lets you give states honest names, and game code leans on that
heavily — `ST_IDLE`, `ST_RUN`, and friends instead of bare numbers. But an
`enum` is just an `int` costume: enumerators number off `0, 1, 2, …` in
declaration order, and by the time IDO is done, only the numbers remain.
Given this type:

```c
typedef enum { ST_IDLE, ST_RUN, ST_PAUSE, ST_DONE } State;
```

here's `isDone(s)`, which returns whether `s == ST_DONE`:

```asm
xori   v0, a0, 0x3    # XOR with 3 — zero only when s IS 3
sltiu  v0, v0, 1      # unsigned < 1: turns "zero" into 1, anything else 0
jr     ra
nop
```

`ST_DONE` compiled to a bare `3` — fourth name, counting from zero. And note
the idiom around it: an equality used as a *value* (not a branch) becomes
`xori` + `sltiu`, manufacturing the 0-or-1 without any jump. File that pair
away; it's everywhere in state-heavy code.

When the comparison instead steers an `if`, you get the branches you know —
`beq`/`bne` against a small immediate. Either way, **your matching job gains
a translation step**: see a magic number, look it up in the enum the lesson
provides, and write the *name* in your C. The compiled bytes are identical —
`3` and `ST_DONE` are the same thing to the machine — but real decomp always
restores the names, and so do we.

The target (using the same `State` type, declared for you) checks its
argument against one state and maybe hands back a different one. Translate
every immediate you see into its name before writing the function.

## Your task

Write `func_800fb7a0` to reproduce the target assembly.

<!-- solution -->
```c
State func_800fb7a0(State s) {
    if (s == ST_RUN) {
        return ST_PAUSE;
    }
    return s;
}
```

<!-- context -->
```c
typedef enum { ST_IDLE, ST_RUN, ST_PAUSE, ST_DONE } State;
```
