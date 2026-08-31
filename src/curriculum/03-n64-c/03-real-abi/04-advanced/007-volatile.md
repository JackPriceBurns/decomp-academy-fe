---
id: 38f8dfe5-e1d4-48cb-af9d-00add73e5028
slug: adv-volatile
title: "volatile: Every Access Is Real"
difficulty: 3
concepts:
  - volatile
  - globals
  - cse
  - hardware
symbol: func_8023e37c
hints:
  - "Two loads through one address, then a subtraction. The operand order of the `subu` says which read comes first in your C."
  - "The extern is already declared `vu32` — you don't add the keyword anywhere; just mention the global twice."
---

# The keyword that forbids cleverness

Last chapter you watched CSE collapse repeated subexpressions. Here's where
that's *illegal*. Compare two functions that each mention a global twice.
First `twoPlain()`, returning `gCount + gCount` where `gCount` is a plain
`u32`:

```asm
lui    v1, %hi(gCount)
lw     v1, %lo(gCount)(v1)
addu   v0, v1, v1        # ONE load, used twice — CSE as usual
jr     ra
nop
```

Now `twoReads()`, identical C — but `gTick` is declared **`vu32`**, a
*volatile* `u32`:

```asm
lui    v1, %hi(gTick)
addiu  v1, v1, %lo(gTick)
lw     t6, 0(v1)         # first read
lw     t7, 0(v1)         # second read — really
addu   v0, t6, t7
jr     ra
nop
```

`volatile` tells the compiler the value can change between accesses by means
it can't see — a hardware timer ticking, another piece of the system writing.
So every read in the source must become a load in the machine, in source
order, no caching, no merging. The address gets completed once (`lui` +
`addiu`, since it's used twice), but the *data* is fetched fresh each time.

Why this matters on this console: hardware registers — video, audio,
controllers — are memory-mapped, and reading them twice can genuinely return
two different values. Game code declares them with volatile typedefs like
`vu32`, and the assembly wears the consequences openly. When you see repeated
loads through one address that CSE "should" have collapsed, that's not the
optimizer slacking. That's a `volatile` in the declaration — and your C must
access the global exactly as many times as the target loads it.

The target reads its volatile global twice and combines the reads with a
different operation. Mind which read lands on which side.

## Your task

`extern vu32 gTimer;` is declared for you. Write `func_8023e37c` to reproduce the
target assembly.

<!-- solution -->
```c
s32 func_8023e37c(void) {
    return gTimer - gTimer;
}
```

<!-- context -->
```c
extern vu32 gTimer;
```
