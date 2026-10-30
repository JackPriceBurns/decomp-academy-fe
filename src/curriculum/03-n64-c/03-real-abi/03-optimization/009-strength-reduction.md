---
id: 4d50584d-404a-4664-936e-4155f6a7d3a6
slug: opt-strength-reduction
title: Multiply Replaced by Add
difficulty: 4
concepts:
  - optimizer
  - loops
  - strength-reduction
  - fingerprints
symbol: func_80354160
hints:
  - "The four seed values are consecutive multiples of one number. That number is the multiplier in your C."
  - "Count the trips using the lead counter's seed, step and exit value. Then multiply by four to get the element count."
---

# A multiply with no multiply instruction

Look at what happens when a loop body multiplies by the loop counter. Here is
`ramp3(p)`, which sets `p[i] = i * 3` for the first 8 words:

```asm
 0:  or     v1, a0, zero
 4:  or     a1, zero, zero    # 0×3
 8:  addiu  a2, zero, 3       # 1×3
 c:  addiu  a3, zero, 6       # 2×3
10:  addiu  t0, zero, 9       # 3×3
14:  addiu  v0, zero, 33      # the lead counter's exit value
18:  sw     t0, 12(v1)        # ── loop ──
1c:  addiu  t0, t0, 12
20:  sw     a2, 4(v1)
24:  sw     a3, 8(v1)
28:  sw     a1, 0(v1)
2c:  addiu  a1, a1, 12
30:  addiu  a3, a3, 12
34:  addiu  a2, a2, 12
38:  bne    t0, v0, 0x18
3c:  addiu  v1, v1, 16
40:  jr     ra
44:  nop
```

There is no `multu` anywhere. This is **strength reduction**. `i * 3` does not
need a multiply, because each trip's value is the *previous trip's value plus
3*. IDO replaces the multiply with a running counter. The loop is also unrolled
×4, so it keeps **four** counters, with seed (starting) values `0, 3, 6, 9`.
Each one steps by 12 (four iterations × 3) per trip.

Even the loop *bound* has been absorbed. No `i` exists to compare, so the exit
test checks the lead counter itself. It starts at 9 and steps by 12, and the
loop runs while it isn't 33. From seed to exit value is two trips, with four
elements each, so eight elements in total. Every constant in your C has been
turned into a different number in the assembly.

To reverse a shape like this, first read the seeds. They are consecutive
multiples of the real multiplier. Next, read a counter's step, which is
4 × multiplier. Then recover the count from how many steps it takes to reach
the exit value. Finally, write the plain loop with the multiply in it. The
compiler turns the constants into these numbers again for you.

The target uses the same template, but every number comes from different
constants. Work back from those numbers to the constants in the C.

## Your task

Write `func_80354160` to reproduce the target assembly.

<!-- solution -->
```c
void func_80354160(s32 *p) {
    s32 i;

    for (i = 0; i < 8; i++) {
        p[i] = i * 5;
    }
}
```
