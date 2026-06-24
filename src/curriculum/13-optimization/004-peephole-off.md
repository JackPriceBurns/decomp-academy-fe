---
id: optimization-peephole-off
title: "#pragma peephole off: Unfusing the Merge"
difficulty: 4
concepts:
  - peephole
  - pragma
  - dot-form
symbol: pick2
hints:
  - "The body is exactly the `pick` body — `int y = x & 0xFF; return y ? a + y :
    b;`."
  - "The pragma, not the C, changes the output: the mask stays plain and the
    compare is emitted separately."
  - Leave the `#pragma peephole off`/`reset` lines exactly as given.
---

# When the target *kept* its separate compare

Sometimes the retail object was compiled with the peephole pass disabled for a
region, so the dot-merge from the last lesson **never happened**. You will see
a plain (non-dot) instruction followed by an explicit `cmpwi ...,0`. No C
rewrite reproduces that — the only lever is the same pragma the original author
used:

```c
#pragma peephole off
/* ...function... */
#pragma peephole reset
```

With the pragma in force, the very same body that merged before now keeps the
compare split out:

```asm
clrlwi  r0, r3, 24    # mask — NOT the dot form
cmpwi   r0, 0         # explicit compare the peephole would have absorbed
beq-    L
add     r3, r4, r0
```

Side by side, the only difference is the dot-merge:

```asm
# peephole ON (lesson 3)   # peephole OFF (this lesson)
clrlwi. r0, r3, 24         clrlwi  r0, r3, 24
                           cmpwi   r0, 0
beq-    L                  beq-    L
```

The `.` is gone and a whole `cmpwi` reappears. This is the canonical
`peephole off` signature. In real decomp you bracket a function (or a run of
them) and pair every `off` with a `reset`.

> The `#pragma peephole off` / `reset` lines are part of **both** the starter and
> the solution here, so you can focus on the body. They apply to the reference
> target too — that's how the target acquired its un-merged shape.

## Your task

Fill in the body of `pick2` (same logic as `pick`) so that, with peephole
disabled, you match the un-merged `clrlwi` + `cmpwi` + `beq-` sequence.

<!-- starter -->
```c
#pragma peephole off
int pick2(int x, int a, int b) {
    return 0;
}
#pragma peephole reset
```

<!-- solution -->
```c
#pragma peephole off
int pick2(int x, int a, int b) {
    int y = x & 0xFF;
    return y ? a + y : b;
}
#pragma peephole reset
```
