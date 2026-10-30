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
  - "The operand order of `subu` is what matters here. Which global is on the left?"
---

# Match each pair by its symbol name

An expression that uses two globals needs two `%hi`/`%lo` pairs, and the
scheduler mixes them together. Here is `sumPair`, which returns
`gLeft + gRight`:

```asm
lui   t6, %hi(gLeft)
lui   t7, %hi(gRight)       # both uppers first…
lw    t7, %lo(gRight)(t7)   # …then the loads. gRight completes first!
lw    t6, %lo(gLeft)(t6)
addu  v0, t6, t7
jr    ra
nop
```

Both `lui`s come first, then both loads, and the *second* global's load comes
before the first one's. The scheduler puts loads as early as it can so that
their delays overlap. The source order survives only in the operands of the
final `addu`. This is why the machinery lesson told you to match pairs **by
symbol name**. In real listings, the four lines that build the addresses appear
in whatever order suits the pipeline best.

So, to read an expression that uses more than one global:

1. Group each `%lo` with its `%hi` by name, and ignore the line order.
2. Note which *register* each global's value ends up in.
3. Read the arithmetic on those registers to rebuild the expression.

The target combines two globals with an operation where the order matters.
Step 3 gives you the answer.

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
