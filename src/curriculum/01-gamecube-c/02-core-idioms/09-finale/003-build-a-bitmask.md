---
id: f3d7ae2a-a174-5cd0-8f6e-a9ff74c244d7
slug: finale-build-a-bitmask
title: "Building a Bitmask in a Loop"
difficulty: 3
concepts:
  - finale
  - loops
  - control
  - bitwise
  - shift
symbol: func_800f5eb8
hints:
  - "`slw` (not `slwi`) shifts by a *register* — here the loop counter — because
    the bit position isn't a constant."
  - The `li 1` / `slw` / `or` trio only runs when the guard passes; trace which
    register feeds the `or` to see which bit gets set.
---

# A loop that sets one bit per element

No running total this time. The loop builds a bitmask, flipping bit `i` on when
element `i` passes its test. Three familiar things stacked: the loop skeleton, an
`if` guard in the body, and the bit-set trick where you grab `1`, walk it into
position, and OR it home.

The shift is the new part. Its distance is the loop counter, a value unknown until
runtime. `slwi` carries its constant baked in, so it can't encode "shift by
whatever `i` is." That's where `slw` earns its keep, reading the count from a
register.

Take `mark_negatives(v, n)`. It returns a mask with bit `i` lit for every negative
element:

```asm
body:
slwi  r0,r5,2     # i * 4
lwzx  r0,r3,r0    # load v[i]
cmpwi r0,0        # compare against zero
bge-  .skip       # not negative -> leave the mask alone
li    r0,1        # start with bit 0
slw   r0,r0,r5    # shift it up to position i  (slw: variable count)
or    r6,r6,r0    # set that bit in the running mask
.skip:
addi  r5,r5,1
test:
cmpw  r5,r4
blt+  body
```

Nothing exotic in the guard: `cmpwi 0`, and `bge-` skips the set when the element
isn't negative. The set itself is `1 << i` again: `li 1`, `slw`, then `or` to fold
the new bit into the mask.

`func_800f5eb8` runs the same machinery under a different test. Read its compare,
watch which way the branch leans, and you'll see which elements earn a bit. The
`li 1` / `slw` / `or` trio doesn't move. The guard condition is the only thing that
changes, and it changes the whole function.

## Your task

Write `func_800f5eb8`, taking an `int*` and an `int` count, to reproduce the
assembly above.

<!-- starter -->
```c
#pragma optimization_level 1
// define func_800f5eb8 to match the target
```

<!-- solution -->
```c
#pragma optimization_level 1
u32 func_800f5eb8(int *a, int n) {
    int i;
    u32 m = 0;
    for (i = 0; i < n; i++) {
        if (a[i] > 0) {
            m |= 1 << i;
        }
    }
    return m;
}
```
