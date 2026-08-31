---
id: 45341372-8695-4637-9cde-b70ca059e3e9
slug: globals-two-globals
title: Two Globals, Interleaved
difficulty: 3
concepts:
  - globals
  - hi-lo
  - scheduling
symbol: func_8014d04c
hints:
  - "Pair each `%lo` with its `%hi` by symbol name, then read the final arithmetic to see how the two values combine."
  - "`subu`'s operand order is the whole puzzle: which global is on the left?"
---

# Match the pairs by name, not by position

An expression over two globals needs two `%hi`/`%lo` pairs — and the scheduler
shuffles them together. Here's `sumPair`, which returns `gLeft + gRight`:

```asm
lui   t6, %hi(gLeft)
lui   t7, %hi(gRight)       # both uppers first…
lw    t7, %lo(gRight)(t7)   # …then the loads — gRight completes first!
lw    t6, %lo(gLeft)(t6)
addu  v0, t6, t7
jr    ra
nop
```

Both `lui`s are issued up front, then both loads — and the *second* global's
load lands before the first's. The scheduler is stacking loads early so their
latencies overlap; source order survives only in the final `addu`'s operands.
This is why the machinery lesson told you to match pairs **by symbol name**:
in real listings the four address-building lines arrive in whatever order the
pipeline likes best.

So the reading recipe for multi-global expressions:

1. Group each `%lo` with its `%hi` by name — ignore line order.
2. Note which *register* each global's value ends up in.
3. Read the arithmetic over those registers to reconstruct the expression.

The target combines two globals where the operation makes order matter. Step 3
is where the answer lives.

## Your task

`extern s32 gHome;` and `extern s32 gAway;` are declared for you. Write
`func_8014d04c` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_8014d04c(void) {
    return gHome - gAway;
}
```

<!-- context -->
```c
extern s32 gHome;
extern s32 gAway;
```
