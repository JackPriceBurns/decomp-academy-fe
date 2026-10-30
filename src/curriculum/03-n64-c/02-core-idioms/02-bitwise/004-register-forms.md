---
id: 4a546af5-ff69-43d9-a17f-4ec00177279a
slug: bitwise-register-forms
title: Bitwise Between Registers
difficulty: 1
concepts:
  - bitwise
  - registers
symbol: func_802951a8
hints:
  - "Decode it like an arithmetic chain. Track what `t6` holds, then apply the second operator. The mnemonics name the C operators directly."
  - "Put parentheses around the first pair. The operations happen in order, from top to bottom."
---

# and, or, xor: the forms without i

Each immediate form has a register form for when both operands are runtime
values: `and`, `or` and `xor`. They do the same operations, without a
constant. They chain together like the arithmetic you decoded in the last
chapter. The intermediate value goes into `t6`, and the result goes into
`v0`. Here is `(p | q) & r`:

```asm
or   t6, a0, a1    # t6 = p | q
and  v0, t6, a2    # v0 = (p | q) & r
jr   ra
nop
```

Margin math works exactly as before. Only the operators have changed. Line
one combines the bits of the first two arguments. Line two filters that result
through the third argument. The grouping follows the data flow: whatever goes
into the temporary register first is the pair inside the parentheses.

You have already seen one use of a register form. `or` with `zero` is the
standard way to copy a register, because OR-ing with zero changes nothing.
There is no separate copy instruction. It is this same `or`, with `zero` as
one operand. So not every `or` you meet is bit logic in the C. When one
operand is `zero`, read it as `=` instead of `|`. If you are unsure, the
tooltip will confirm it.

A note on writing good C: bitwise operators in C have precedence rules that
often lead to mistakes, and `+` and `-` do not have this problem. So add
parentheses to compound expressions like the one below, even where the
compiler does not need them. Matching comes first, but also write C that a
reviewer would accept.

## Your task

Write `func_802951a8` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_802951a8(s32 a, s32 b, s32 c) {
    return (a & b) ^ c;
}
```
