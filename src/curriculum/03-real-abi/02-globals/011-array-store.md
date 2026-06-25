---
id: globals-array-store
title: "Writing Into a Global Array"
difficulty: 4
concepts:
  - globals
  - array
  - addr16
  - stwx
  - scaled-index
  - chaining
symbol: setCell
hints:
  - Same @ha/@l base and same scaled index as the indexed *read*, but the final
    instruction is the indexed *store*.
  - "`stwx rS, rA, rB` stores rS at rA + rB - it is the store twin of `lwzx`."
---

# The indexed load, in reverse

Writing `tbl[i] = v` is the mirror of reading `tbl[i]`. You build the array's
base address with the same `@ha`/`@l` pair (arrays aren't small-data), scale the
index by the element size with `slwi`, and then — instead of an indexed *load* —
emit an indexed *store*. `stwx rS, rA, rB` stores `rS` at `rA + rB`, exactly the
addressing of `lwzx` with the data flowing the other way.

Nothing about the address machinery changes between read and write; only the
final opcode flips. `lwzx` ⟶ `stwx` is the same `lwz` ⟶ `stw` swap you saw for
scalars, just in the indexed form.

Consider `storeAt(n, x)`, which writes `x` into element `n` of the int array
`gBuffer`:

```asm
lis   r5, gBuffer@ha    # high half of &gBuffer
slwi  r0, r3, 2         # n * 4   (sizeof(int) == 4)
addi  r3, r5, gBuffer@l # r3 = &gBuffer  (add low half)
stwx  r4, r3, r0        # gBuffer[n] = x   (x is in r4)
blr
```

The `lis`/`slwi`/`addi` are identical to the indexed-read lesson — base address
plus scaled index — and the only new instruction is `stwx`, with the value to
store (`x`, in `r4`) as its first operand. The target assembly stores a different
argument into a different array; trace which register holds the value and which
holds the index.

## Your task

`extern int gGrid[];` is provided. Write `setCell`, taking an `int i` and an
`int v`, to reproduce the indexed store above.

<!-- starter -->
```c
void setCell(int i, int v) {
    // write v into element i of the global array
}
```

<!-- solution -->
```c
void setCell(int i, int v) {
    gGrid[i] = v;
}
```

<!-- context -->
```c
extern int gGrid[];
```
