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
  - "The loaded constant is the loop limit. Divide it by the number of element operations per trip as a check against your `for` bound."
  - "Four loads combine into one accumulator, over two trips, with an upper bound of 8. Write the plain counted `for` over `p[i]`."
---

# When n is known, the extra code goes away

The guard and remainder code existed only because the compiler couldn't know
`n`. If you write a loop with a **constant** trip count that divides by 4,
the unroll becomes much cleaner. Here is `clear16(p)`, which sets exactly 16
words to zero:

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
 c:  addiu v0, v0, 4       # ── loop: i += 4 (four elements per trip)
10:  sw    zero, 4(v1)     # p[i+1] = 0
14:  sw    zero, 8(v1)     # p[i+2] = 0
18:  sw    zero, 12(v1)    # p[i+3] = 0
1c:  addiu v1, v1, 16      # cursor += 16 bytes
20:  bne   v0, a0, 0xc     # i != 16 yet?
24:  sw    zero, -16(v1)   # (slot) p[i+0] = 0
28:  jr    ra
2c:  nop
```

There is no guard, because 16 is greater than zero. There is no `andi`, no
remainder loop and no dead `sll`. There is only the ×4 body and a counter
that steps by 4 toward the constant. Two details to remember:

- **The bound is kept in a register** (`addiu a0, zero, 16`), so the
  back-edge can be a cheap `bne`. A round number loaded into a register near
  a loop is usually the `for` bound, and not data.
- **The counter steps by 4.** Divide the bound by the step to get the number
  of trips. Then multiply by the number of operations per trip to get the
  element count. Here, 16/4 = 4 trips, and 4 trips × 4 stores = 16 elements,
  which is the C bound itself.

Be careful with that last step, because it is where people often misread
these loops. Your `for` bound is the number of *elements*, not the number of
trips. The target adds a fixed number of words into a total. Count its
element operations per trip, read its bound register, and do the division
before you write the C.

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
