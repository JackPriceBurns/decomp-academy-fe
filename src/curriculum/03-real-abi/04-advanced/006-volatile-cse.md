---
id: advanced-volatile-cse
title: "Volatile Defeats CSE: Two Reads, Two Loads"
difficulty: 4
concepts:
  - volatile
  - cse
  - optimization
  - loads
symbol: twice_vol
hints:
  - volatile forbids common-subexpression elimination, so each source read
    becomes its own load.
  - Expect two `lwz` of g_counter then `add r3, r3, r0` — a plain int would load
    once and do `add r3, r0, r0`.
---

# When the optimizer is forbidden to remember

At `-O4,p` MWCC aggressively **CSEs** (common-subexpression eliminates) memory
reads: if you load the same global twice with nothing changing it in between,
it loads **once** and reuses the value. Consider a plain global `g_frame` summed
with itself:

```asm
lwz r0, g_frame@sda21(r2)   # ONE load...
add r3, r0, r0              # ...reused for both operands
blr
```

Mark `g_frame` **`volatile`** and the rule inverts. `volatile` means "every
access is observable — never fold, never cache, never reorder." The compiler
must issue a real load *every time* the source reads it:

```asm
lwz r3, g_frame@sda21(r2)   # first read
lwz r0, g_frame@sda21(r2)   # second read — not CSE'd
add r3, r3, r0
blr
```

This is the single most reliable fingerprint of `volatile`: **a value loaded
more times than the source seems to need, with no store in between.** If your
match keeps the CSE'd single load but the target shows the redundant reload, the
original variable was `volatile` — and vice versa. It matters far beyond
counting loads: `volatile` also blocks the reordering `,p` scheduling would
otherwise do, which is exactly what hardware-register code depends on.

## Your task

Write `twice_vol` using the provided `volatile int g_counter` to reproduce the
assembly above.

<!-- starter -->
```c
int twice_vol(void) {
    return 0;
}
```

<!-- solution -->
```c
int twice_vol(void) {
    return g_counter + g_counter;
}
```

<!-- context -->
```c
extern volatile int g_counter;
```
