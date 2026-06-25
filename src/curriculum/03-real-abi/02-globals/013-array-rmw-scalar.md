---
id: globals-array-rmw-scalar
title: "Read-Modify-Write an Array Element"
difficulty: 5
concepts:
  - globals
  - array
  - addr16
  - sda21
  - lwzx
  - stwx
  - chaining
symbol: addBonus
hints:
  - The base address (@ha/@l) and the scaled index are computed *once* and reused
    by both the lwzx and the stwx - that shared base is the giveaway it's the same
    element.
  - An @sda21 scalar load slots into the middle; it feeds the add between the
    element load and the element store.
---

# One element, loaded and stored, plus a scalar global

This is the indexed read and the indexed write fused into a single
read-modify-write, with a small-data scalar mixed in. The pattern `tbl[i] =
tbl[i] + g` builds the array base and scaled index **once**, loads the element
with `lwzx`, adds the scalar global (an ordinary `@sda21` load), and stores the
sum back with `stwx` — reusing the very same base and index registers.

The tell is that the `lwzx` and the `stwx` share both address operands. The
compiler computed `&tbl` (`@ha`/`@l`) and `i * 4` (`slwi`) up front and held them
in registers across the whole operation, so the load and the store address the
identical element. Meanwhile a lone `lwz ...@sda21` appears for the scalar — a
different global reached the small-data way, not through the array's address
pair.

Consider `advanceCell(k)`, which adds the int global `gStep` to element `k` of
the int array `gCells`, in place:

```asm
lis   r4, gCells@ha     # high half of &gCells
slwi  r5, r3, 2         # k * 4   (held in r5 for both accesses)
addi  r4, r4, gCells@l  # r4 = &gCells   (held for both accesses)
lwz   r3, gStep@sda21(r13) # read the scalar global gStep
lwzx  r0, r4, r5        # r0 = gCells[k]
add   r0, r3, r0        # gCells[k] + gStep
stwx  r0, r4, r5        # gCells[k] = sum   (same base r4, same index r5)
blr
```

Notice `r4` (base) and `r5` (index) are written once and read by both `lwzx` and
`stwx`; the `gStep` scalar comes in through its own `@sda21` load. The target
assembly does the same in-place update on a different array with a different
scalar — match the reloc names and confirm the load and store hit the same
element.

## Your task

The globals are declared for you: `gGrid` (`int[]`) and `gBonus` (`int`). Write
`addBonus`, taking an `int i`, to reproduce the read-modify-write above.

<!-- starter -->
```c
void addBonus(int i) {
    // add the scalar global to element i of the array, in place
}
```

<!-- solution -->
```c
void addBonus(int i) {
    gGrid[i] = gGrid[i] + gBonus;
}
```

<!-- context -->
```c
extern int gGrid[];
extern int gBonus;
```
