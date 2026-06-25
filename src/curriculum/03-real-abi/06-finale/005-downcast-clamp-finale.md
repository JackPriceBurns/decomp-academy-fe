---
id: finale-real-downcast-clamp-finale
title: "★ 64-bit Globals, Downcast, Clamp"
difficulty: 5
concepts:
  - finale
  - globals
  - sda21
  - 64-bit
  - carry
  - downcast
  - clamp
symbol: netBalance
hints:
  - Only the low halves are loaded (`symbol+0x4`) and only `addc` runs — the
    downcast to `u32` makes the high words and the `adde` dead, so the optimizer
    drops them.
  - The bound is too big for a 16-bit immediate, so it is built with `lis`+`addi`
    and the compare is `cmplw` against that register.
  - "The cap is the `bgtlr-` form: compare the low word against the bound, return
    it early when over, `mr` it through otherwise."
---

# The finale: every chapter folded into one return

This is the capstone of the tier. A `u64` sum of two globals, narrowed to a
`u32`, then clamped — and the optimizer prunes the whole thing down to its
essentials. Four chapters meet in one function body:

- **globals** — both operands are `u64` `@sda21` globals, so each is a pair of
  words reached through `symbol` (high) and `symbol+0x4` (low).
- **64-bit** — adding two `u64`s is the `addc`/`adde` carry chain.
- **downcast** — taking `(u32)` of the sum keeps only the **low** half.
- **optimization** — because the high half is discarded, the `adde` (and the
  high-word loads) are dead code and get deleted; only the `addc` survives.

That last point is the punchline. You write a full 64-bit add, but the cast means
the high result is never used, so `-O4` removes the `adde` entirely — leaving a
lone `addc` on two low words, which *looks* like a 32-bit add until you notice the
`+0x4` relocations proving the operands are 64-bit pairs. Consider
`elapsedClamped`, summing two `u64` tick globals, narrowing, and capping at
60000:

```asm
lwz    r4,gTicksA@sda21+0x4(r13) # only the low half of gTicksA
lis    r3,1                     # build the 60000 bound...
lwz    r0,gTicksB@sda21+0x4(r13) # only the low half of gTicksB
addi   r3,r3,-5536              # ...= 1<<16 - 5536 = 60000
addc   r4,r4,r0                # low-word add (the adde is gone — high half is dead)
cmplwi r4,60000                # unsigned compare against the cap
bgtlr-                         # over -> return the cap in r3
mr     r3,r4                   # under -> pass the low sum through
blr
```

No high-half loads, no `adde`, no `stfd` — the downcast collapsed the 64-bit add
to its low word. The `+0x4` relocations are the only surviving evidence that the
globals are `u64`. The bound here fit a path where it could be built with a
single `lis`/`addi`, and the clamp is the familiar speculative-return `bgtlr-`.

Your `netBalance` is the same shape, but its cap is a **larger** constant (so the
constant build and the compare opcode differ) and it sums two **different** `u64`
globals. Read the `+0x4` relocations to confirm the operands are 64-bit, the
`lis`/`addi` for the bound, and the `bgtlr-` for the clamp direction.

## Your task

The `u64` globals `gBytesIn` and `gBytesOut` are declared for you. Write
`netBalance`, returning a `u32`, to reproduce the assembly above. Recover the
clamp bound from the `lis`/`addi` pair and the cast from the fact that only the
low halves are touched.

<!-- starter -->
```c
u32 netBalance(void) {
    return 0;
}
```

<!-- solution -->
```c
u32 netBalance(void) {
    u64 total = gBytesIn + gBytesOut;
    u32 low = (u32)total;
    if (low > 1000000) return 1000000;
    return low;
}
```

<!-- context -->
```c
extern u64 gBytesIn;
extern u64 gBytesOut;
```
