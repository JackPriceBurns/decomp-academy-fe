---
id: 6dbf376a-5973-533a-a6b0-0bd69dbc5119
slug: int64-downcast-chain
title: "Chaining: A Downcast Prunes the Chain"
difficulty: 4
concepts:
  - 64-bit
  - types
  - detection
  - chaining
  - downcast
symbol: func_8036fcdc
hints:
  - The return type is `u32`, so only the low word matters — every high-word instruction in the chain is dropped.
  - What survives is the low half of each operation; the leading carrying instruction (`addc`/`subfc`) still betrays that the operands were 64-bit.
  - Three `u64` parameters but a `u32` result; combine the first two arithmetically, then the third bitwise, and the cast keeps the low word.
---

# What a downcast leaves behind

Cast a wide chain down to `u32` and half the assembly simply vanishes. You saw
the hint of this on a single op: a `u64 + u64` truncated to `u32` still emits an
`addc` for a carry nobody reads. Across a chain it goes further. Only the
low-word instruction of each step survives; every high-word partner is cut, so a
three-operation expression can collapse to two instructions.

Here is `low_combo(p, q, r)`. It subtracts two 64-bit values, ORs in a third, and
returns only the low 32 bits:

```asm
subfc  r4, r6, r4     # (p - q) low word -- carry recorded, never read
or     r3, r8, r4     # ( ... | r) low word, delivered straight to r3
blr
```

A full-width version would borrow into a `subfe` and OR the high words as well.
Here, nothing of the sort. The `u32` return makes every high-word instruction
dead code, so MWCC never emits it, and you are left with `subfc` then `or` and
nothing else. That `subfc` is the tell. A genuine 32-bit subtract compiles to a
bare `subf`, so the carrying form proves the operands were 64-bit even though
only the bottom 32 bits escape to `r3`.

Your target wears the same shape — a different arithmetic op then a different
bitwise op, truncated to `u32`. Read each surviving low-word instruction back to
its C operator, since the cast already pruned the high half and whatever reaches
`r3` is the whole answer.

## Your task

Write `func_8036fcdc` to reproduce the assembly above.

<!-- solution -->
```c
u32 func_8036fcdc(u64 a, u64 b, u64 c) {
    return (u32)((a + b) & c);
}
```
