---
id: a18121c0-0151-47ba-9645-dc53296ac733
slug: bitwise-nor-not
title: "nor: The Instruction Behind ~"
difficulty: 2
concepts:
  - bitwise
  - registers
  - fingerprints
symbol: func_80060484
hints:
  - "`nor` computes ~(rs | rt). When neither operand is `zero`, the OR inside
    is between two real values, and the ~ applies to the whole result."
  - "The one instruction becomes two operators in the C. You do not need a second line."
---

# There is no NOT instruction

C's `~x` flips every bit. MIPS has no instruction for it, so the compiler uses
the `zero` register, as it has done before. It uses **`nor`** (NOT-OR), which
ORs the two operands and then inverts all 32 bits of the result. Here is a
plain `~x`:

```asm
nor  v0, a0, zero   # ~(x | 0) = ~x
jr   ra
nop
```

OR-ing with `zero` changes nothing, so only the inversion is left. Read
`nor rd, rs, zero` as `rd = ~rs`. Remember it alongside `or rd, rs, zero`.
That one is "the copy", and this one is "the NOT". Both are idioms that use
the zero register. Some disassemblers print it as `not` to make it clearer.
Ours shows the real `nor`, so learn that spelling.

`nor` is also a full three-operand instruction, and IDO makes use of that.
When the C inverts the *result of an OR*, the compiler does not need an `or`
followed by a `nor` with zero. A single `nor` does both jobs: it ORs the two
values and inverts the result. One instruction covers two C operators.

So when you meet a `nor` whose second operand *isn't* `zero`, it is more than
the NOT idiom. Read the OR that is built into it, then put the whole thing
inside `~`. The target below has exactly that shape.

## Your task

Write `func_80060484` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_80060484(s32 a, s32 b) {
    return ~(a | b);
}
```
