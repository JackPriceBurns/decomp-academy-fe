---
id: d85928ca-ca24-4888-8921-121cb15839c4
slug: loops-exact-count
title: "Fixed Counts: The Unroll With No Remainder"
difficulty: 3
concepts:
  - loops
  - unrolling
  - arrays
  - fingerprints
symbol: func_802164a0
hints:
  - "The loaded constant is the loop limit — divide it by the number of element-ops per trip to sanity-check it against your `for` bound."
  - "Four loads folding into one accumulator, two trips, upper bound 8. Write the plain counted `for` over `p[i]`."
---

# When n is known, the scaffolding vanishes

All that guard/remainder machinery existed because the compiler couldn't
know `n`. Write a loop with a **constant** trip count that divides by 4 and
watch the unroll turn pristine. Here's `clear16(p)`, which zeroes exactly
16 words:

```c
void clear16(s32 *p) {
    s32 i;
    for (i = 0; i < 16; i++) {
        p[i] = 0;
    }
}
```

```asm
 0:  or    v1, a0, zero    # cursor = p
 4:  addiu a0, zero, 16    # the loop bound, as a real register value
 8:  or    v0, zero, zero  # i = 0
 c:  addiu v0, v0, 4       # ── loop: i += 4 (four elements per trip!)
10:  sw    zero, 4(v1)     # p[i+1] = 0
14:  sw    zero, 8(v1)     # p[i+2] = 0
18:  sw    zero, 12(v1)    # p[i+3] = 0
1c:  addiu v1, v1, 16      # cursor += 16 bytes
20:  bne   v0, a0, 0xc     # i != 16 yet?
24:  sw    zero, -16(v1)   # (slot) p[i+0] = 0
28:  jr    ra
2c:  nop
```

No guard — sixteen is famously greater than zero. No `andi`, no remainder
loop, no dead `sll`. Just the ×4 body and a counter stepping by 4 toward
the constant. Two details worth pocketing:

- **The bound lives in a register** (`addiu a0, zero, 16`) so the back-edge
  can be a cheap `bne`. A materialized round number near a loop is usually
  the `for` bound, not data.
- **The counter strides by 4** — divide the bound by the stride to get the
  trip count, then multiply by the ops-per-trip to recover your element
  count. Here: 16/4 = 4 trips × 4 stores = 16 elements… conveniently, the C
  bound itself.

Careful on that last step, because it's where people misread these loops:
your `for` bound is the number of *elements*, not the number of trips. The
target sums a fixed run of words into a total — count its element-ops per
trip, read its bound register, and do the little division before you write
the C.

## Your task

Write `func_802164a0` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_802164a0(s32 *p) {
    s32 t = 0;
    s32 i;
    for (i = 0; i < 8; i++) {
        t += p[i];
    }
    return t;
}
```
