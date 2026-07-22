---
id: c7062f9e-aaff-518c-b779-889896d4785d
slug: globals-array-store
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

Flip `tbl[i]` around and you have `tbl[i] = v`. The setup doesn't budge. Build the
base from the `@ha`/`@l` pair, because an array still won't fit in small-data, and
scale `i` by the element size with `slwi`. Only the tail differs. Where the read
finished on an indexed *load*, the write finishes on an indexed *store*. `stwx
rS, rA, rB` drops `rS` at `rA + rB`, the identical addressing `lwzx` uses, just
with the data heading the other way.

None of the address machinery shifts when you go from reading to writing. Only the
last opcode does. Trading `lwzx` for `stwx` is just the scalar `lwz`-to-`stw` swap
again, this time wearing its indexed form.

Take `storeAt(n, x)`, which writes `x` into element `n` of the int array
`gBuffer`:

```asm
lis   r5, gBuffer@ha    # high half of &gBuffer
slwi  r0, r3, 2         # n * 4   (sizeof(int) == 4)
addi  r3, r5, gBuffer@l # r3 = &gBuffer  (add low half)
stwx  r4, r3, r0        # gBuffer[n] = x   (x is in r4)
blr
```

That `lis`/`slwi`/`addi` trio is word-for-word the indexed-read lesson, base plus
scaled index. The one newcomer is `stwx`, and it carries the value being stored,
`x` over in `r4`, as its first operand. Your target writes a different argument
into a different array. The work is just spotting which register holds the value
and which holds the index.

## Your task

`extern int gGrid[];` is provided. Write `setCell` to reproduce the indexed store above.

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
