---
id: finale-masked-guarded-sum
title: "A Masked, Guarded Accumulator"
difficulty: 2
concepts:
  - finale
  - loops
  - bitwise
  - mask
  - control
symbol: sum_low_bytes
hints:
  - "`clrlwi.` is a mask *and* a test in one — the trailing dot sets the condition
    register from the masked result, which the `beq-` then reads."
  - The conditional `add` is the only thing the branch skips; the index scaling,
    load, and counter increment happen every pass regardless.
---

# A loop body that masks, then guards

This combines three chapters at once: the **counted-loop skeleton**, a
**bitwise mask** to keep part of each element, and a **guard** that decides
whether to fold the masked value into the running total. The skeleton never
changes — `li` the counter and accumulator, branch to the test, body, `addi`,
`cmpw`/`blt+`. The interest is all in the body.

Watch for one MWCC efficiency: when you mask a value and immediately test it,
the compiler fuses both into a single recording instruction. **`clrlwi. rD, rA, n`
clears the top `n` bits *and* sets `cr0` from the result** — so the following
`beq-` reads that same masked value without a separate `cmpwi`.

Consider `sum_nibbles(p, len)`, which sums the low 4 bits of each element but
skips any element whose low nibble is zero:

```asm
body:
slwi    r0,r5,2       # i * 4
lwzx    r0,r3,r0      # load p[i]
clrlwi. r0,r0,28      # keep low 4 bits (clear top 28) AND test for zero
beq-    .skip         # nibble == 0 -> add nothing
add     r6,r6,r0      # else accumulate the masked value
.skip:
addi    r5,r5,1       # i++
test:
cmpw    r5,r4
blt+    body
```

The mask width is encoded in the `clrlwi` count: clearing 28 bits leaves the low
4. The dot makes it double as the guard's compare, and `beq-` skips the lone
`add` when the masked value is zero.

Your `sum_low_bytes` is the same loop, mask, and guard — but it keeps a
*different* number of low bits, so the `clrlwi.` count differs. Read that count
to recover the mask, and the rest of the body falls out.

## Your task

Write `sum_low_bytes`, taking a `u32*` and an `int` length, to reproduce the
assembly above.

<!-- starter -->
```c
#pragma optimization_level 1
u32 sum_low_bytes(u32 *a, int n) {
    int i;
    u32 s = 0;
    // mask each element, accumulate the nonzero ones
    return s;
}
```

<!-- solution -->
```c
#pragma optimization_level 1
u32 sum_low_bytes(u32 *a, int n) {
    int i;
    u32 s = 0;
    for (i = 0; i < n; i++) {
        u32 v = a[i] & 0xFF;
        if (v != 0) {
            s += v;
        }
    }
    return s;
}
```
