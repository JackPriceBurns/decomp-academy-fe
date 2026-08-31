---
id: 4d50584d-404a-4664-936e-4155f6a7d3a6
slug: opt-strength-reduction
title: Multiply, Demoted to Add
difficulty: 4
concepts:
  - optimizer
  - loops
  - strength-reduction
  - fingerprints
symbol: func_80354160
hints:
  - "The four seed values are consecutive multiples of something. That something is the multiplier in your C."
  - "Count trips from the lead counter — seed, step, exit value — then multiply by four for the element count."
---

# The multiply that isn't there

Watch what happens when a loop body multiplies by the loop counter. Here's
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

There is no `multu` anywhere. This is **strength reduction**: `i * 3` never
needs a multiplier when each trip's value is just *last trip's value plus 3*.
IDO replaces the multiply with a running counter — and because the loop is
also unrolled ×4, it keeps **four** counters, seeded `0, 3, 6, 9`, each
stepping by 12 (four iterations × 3) per trip.

Even the loop *bound* got absorbed: no `i` exists to compare, so the exit test
watches the lead counter itself. It starts at 9, steps by 12, and the loop
runs while it isn't 33 — seed to exit is two trips, four elements each, eight
elements total. Every constant in your C has been cooked into a different
number in the assembly.

To reverse a shape like this: read the seeds (consecutive multiples of the
real multiplier), read a counter's step (4 × multiplier), and recover the
count from how many steps reach the exit value. Then write the naive loop with
the multiply — the compiler re-cooks the constants for you.

The target is the same template with every number cooked from different
ingredients. Uncook them.

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
