---
id: finale-build-a-bitmask
title: "Building a Bitmask in a Loop"
difficulty: 3
concepts:
  - finale
  - loops
  - control
  - bitwise
  - shift
symbol: mask_above
hints:
  - "`slw` (not `slwi`) shifts by a *register* — here the loop counter — because
    the bit position isn't a constant."
  - The `li 1` / `slw` / `or` trio only runs when the guard passes; trace which
    register feeds the `or` to see which bit gets set.
---

# A loop that sets one bit per element

Here the loop doesn't accumulate a *sum* — it accumulates a *bitmask*, setting
the bit at position `i` whenever element `i` passes a test. That weaves together
the loop skeleton, an `if` guard inside the body, and the bit-setting idiom from
the bitwise chapter: take `1`, shift it into position, OR it in.

The new wrinkle is that the shift amount is the loop counter, a runtime value.
That means **`slw` (shift-left-by-register), not `slwi`** — the constant-count
shift you've seen until now can't express a variable position.

Consider `mark_negatives(v, n)`, which returns a mask with bit `i` set for every
negative element:

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

The guard is an ordinary `cmpwi 0` whose `bge-` skips the set when the element
*isn't* negative. The bit-set itself is the familiar `1 << i` built with
`li 1` + `slw`, folded in with `or`.

Your `mask_above` builds its mask under a *different* test — read the compare and
its branch direction to find which elements get a bit. The `li 1` / `slw` / `or`
machinery is identical; only the condition steering the guard changes.

## Your task

Write `mask_above`, taking an `int*` and an `int` count, to reproduce the
assembly above.

<!-- starter -->
```c
#pragma optimization_level 1
u32 mask_above(int *a, int n) {
    int i;
    u32 m = 0;
    // set bit i when element i passes the test
    return m;
}
```

<!-- solution -->
```c
#pragma optimization_level 1
u32 mask_above(int *a, int n) {
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
