---
id: 5fa4edab-3ef0-54dd-8691-eab97e5f9c49
slug: globals-array-rmw-scalar
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

Take an indexed read, glue it to an indexed write, and drop a small-data scalar
in the middle. That's all `tbl[i] = tbl[i] + g` is. The base and the scaled index
get built **once**. Then `lwzx` loads the element, the scalar global rides in on
an ordinary `@sda21` load, the two get added, and `stwx` writes the sum back
through the very same base and index.

What gives it away is that `lwzx` and `stwx` share both address operands. The
compiler worked out `&tbl` (`@ha`/`@l`) and `i * 4` (`slwi`) up front and parked
them in registers for the duration, so load and store land on the identical
element. The scalar shows up separately as a lone `lwz ...@sda21`. That's a
different global, reached the small-data way rather than through the array's
address pair.

Here's `advanceCell(k)`. It adds the int global `gStep` to element `k` of the int
array `gCells`, in place:

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

`r4` (base) and `r5` (index) get written once, then both `lwzx` and `stwx` read
them back; the `gStep` scalar arrives through its own `@sda21` load. Your target
does the same in-place update, just on a different array with a different scalar.
Match the reloc names, and check that the load and store hit the same element.

## Your task

The globals are declared for you: `gGrid` (`int[]`) and `gBonus` (`int`). Write
`addBonus` to reproduce the read-modify-write above.

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
