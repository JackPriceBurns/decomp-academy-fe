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
symbol: func_801c18bc
hints:
  - Same @ha/@l base and same scaled index as the indexed *read*, but the final
    instruction is the indexed *store*.
  - "`stwx rS, rA, rB` stores rS at rA + rB - it is the store twin of `lwzx`."
---

# The indexed load, in reverse

Flip `tbl[i]` around and you have `tbl[i] = v`. The setup doesn't change. Build
the base from the `@ha`/`@l` pair, because an array still won't fit in small-data,
and scale `i` by the element size with `slwi`. Only the tail differs. Where the
read ended with an indexed *load*, the write ends with an indexed *store*. `stwx
rS, rA, rB` puts `rS` at `rA + rB` — the same addressing `lwzx` uses, just with
the data going the other way.

None of the address machinery changes when you switch from reading to writing.
Only the last opcode does. Trading `lwzx` for `stwx` is the scalar `lwz`-to-`stw`
swap again, this time in indexed form.

Take `storeAt(n, x)`, which writes `x` into element `n` of the int array
`gBuffer`:

```asm
lis   r5, gBuffer@ha    # high half of &gBuffer
slwi  r0, r3, 2         # n * 4   (sizeof(int) == 4)
addi  r3, r5, gBuffer@l # r3 = &gBuffer  (add low half)
stwx  r4, r3, r0        # gBuffer[n] = x   (x is in r4)
blr
```

That `lis`/`slwi`/`addi` trio is identical to the indexed-read lesson, base plus
scaled index. The only new instruction is `stwx`, and its first operand is the
value being stored — `x` in `r4`. Your target writes a different argument into a
different array. The work is just spotting which register holds the value and
which holds the index.

## Your task

`extern int gGrid[];` is provided. Write `func_801c18bc` to reproduce the indexed
store above.

<!-- solution -->
```c
void func_801c18bc(int i, int v) {
    gGrid[i] = v;
}
```

<!-- context -->
```c
extern int gGrid[];
```
