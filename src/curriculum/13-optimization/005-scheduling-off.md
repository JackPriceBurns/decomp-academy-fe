---
id: optimization-scheduling-off
title: "#pragma scheduling off: Freezing the Order"
difficulty: 4
concepts:
  - scheduling
  - pragma
  - ordering
symbol: combine3
hints:
  - "Same body as the very first lesson: two sums, then multiply them."
  - The pragma forces source order, so each `add` follows its own pair of loads.
  - Keep the `#pragma scheduling off`/`reset` lines untouched.
---

# Putting the instructions back in source order

The other half of the SFA pragma pair is **`scheduling off`**. It tells MWCC to
emit instructions in (essentially) source order instead of reordering them to
hide latency. When a target was built this way, the scheduled "loads-first"
shape you saw earlier **does not appear** — the loads sit right next to the work
that consumes them.

Same two-sums-times body as lesson 1, but with scheduling disabled:

```asm
lwz   r4, 0(r3)
lwz   r0, 4(r3)
add   r5, r4, r0    # a computed immediately after its loads
lwz   r4, 8(r3)
lwz   r0, 12(r3)
add   r0, r4, r0    # b computed immediately after its loads
mullw r3, r5, r0
```

The four loads are *not* batched; each pair sits with its `add`. That ordering —
and the different register coloring it produces — is the fingerprint of
`scheduling off`. As with peephole, you bracket the region and always pair
`off` with `reset`. The two pragmas are frequently used together around a whole
function in real decomp.

> The `#pragma scheduling off` / `reset` lines are supplied in both the starter
> and the solution, and apply to the target, so concentrate on the body.

## Your task

Write the body of `combine3(int *p)` returning `(p[0]+p[1]) * (p[2]+p[3])`.
With scheduling off, it must match the un-batched, source-order load layout.

<!-- starter -->
```c
#pragma scheduling off
int combine3(int *p) {
    return 0;
}
#pragma scheduling reset
```

<!-- solution -->
```c
#pragma scheduling off
int combine3(int *p) {
    int a = p[0] + p[1];
    int b = p[2] + p[3];
    return a * b;
}
#pragma scheduling reset
```
