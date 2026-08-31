---
id: c5b4566d-1911-4938-86a0-2d0f6c74dec7
slug: globals-capstone
title: "Capstone: Global State Like a Real Game"
difficulty: 4
concepts:
  - globals
  - hi-lo
  - rmw
  - capstone
symbol: func_8016d158
hints:
  - "Two completed addresses (`lui` + `addiu` each), two read-modify-writes woven together. Untangle them by tracking which pointer register each `lw`/`sw` goes through."
  - "One update subtracts the argument and its new value is returned; the other adds a constant and is discarded. Write the returned one as the first statement."
---

# Two updates, one pass

Real game functions rarely touch one global at a time. A hit lands: health
drops, a counter ticks, something gets returned to the caller — three ideas,
one short function. The compiler weaves their instructions together, and your
job is to unweave them. Here's `logEvent(code)`, which appends to a global
event list: it stores `code` at index `gEventCount` of the array `gEvents`,
increments `gEventCount`, and returns the new count:

```asm
lui    a1, %hi(gEventCount)
addiu  a1, a1, %lo(gEventCount)  # full address: used three times below
lw     v1, 0(a1)                 # count
lui    at, %hi(gEvents)
sll    t6, v1, 2                 # count * 4
addu   at, at, t6
sw     a0, %lo(gEvents)(at)      # gEvents[count] = code
addiu  v0, v1, 1
sw     v0, 0(a1)                 # gEventCount = count + 1 (and v0 returns)
jr     ra
nop
```

Every idiom in this chapter is on screen: a completed address reused for a
read-modify-write, an indexed array store with the index joining the `%hi`
half, and the bump-and-return double duty in `v0`. Notice how the *array*
access threads through the middle of the *counter* update — instruction order
tracks the pipeline, not your statements. The `sw`s tell you *what* got
updated; they don't promise to appear in statement order, so expect to reason
about (or simply try) which C ordering the compiler was fed.

The target fuses two global updates the same way. Sort every memory op by
which address it goes through, decide what each update does, and mind which
one's new value survives into `v0`.

## Your task

`extern s32 gHealth;` and `extern s32 gHits;` are declared for you. Write
`func_8016d158` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_8016d158(s32 dmg) {
    gHealth -= dmg;
    gHits += 1;
    return gHealth;
}
```

<!-- context -->
```c
extern s32 gHealth;
extern s32 gHits;
```
