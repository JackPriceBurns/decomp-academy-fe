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
    is between two real values — and the ~ wraps the whole thing."
  - "One instruction, two operators in the C. Don't reach for a second line."
---

# There is no NOT instruction

C's `~x` flips every bit. MIPS has no instruction for it — and by now you can
guess the compiler's move: lean on `zero`. The instruction it leans with is
**`nor`** — NOT-OR: OR the two operands, then invert all 32 bits of the
result. Here's plain `~x`:

```asm
nor  v0, a0, zero   # ~(x | 0) = ~x
jr   ra
nop
```

OR-ing with `zero` changes nothing, so all that's left is the inversion:
`nor rd, rs, zero` reads as `rd = ~rs`. File it next to `or rd, rs, zero` as
"the copy" — this is "the NOT", one more zero-register idiom for your
collection. Some disassemblers print it as a friendly `not`; ours shows you
the real `nor`, so learn the raw spelling.

But `nor` isn't only a crutch for NOT — it's a real three-operand instruction,
and IDO exploits that. When the C inverts the *result of an OR*, the compiler
doesn't need an `or` followed by a `nor`-with-zero. The `nor` does both jobs
in one go: OR the two values, invert, done. One instruction, two C operators.

So when you meet a `nor` whose second operand *isn't* `zero`, don't read it as
a copy-shaped NOT — read the OR that's built into it, then wrap the whole
thing in `~`. The target below is exactly that shape.

## Your task

Write `func_80060484` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_80060484(s32 a, s32 b) {
    return ~(a | b);
}
```
