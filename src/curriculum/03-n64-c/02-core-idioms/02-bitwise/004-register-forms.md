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
  - "Decode like an arithmetic chain — track what `t6` holds, then apply the second operator. The mnemonics name the C operators directly."
  - "Parenthesize the first pair; evaluation runs top to bottom."
---

# and, or, xor — no i

Every immediate form has a register form, for when both operands are runtime
values: `and`, `or`, `xor`. Same verbs, no constant. And these chain exactly
like the arithmetic you decoded last chapter — intermediate into `t6`, result
into `v0`. Here's `(p | q) & r`:

```asm
or   t6, a0, a1    # t6 = p | q
and  v0, t6, a2    # v0 = (p | q) & r
jr   ra
nop
```

Margin math works verbatim; only the operators changed. Line one merges the
first two arguments' bits, line two filters through the third. Grouping
follows the data flow: whatever lands in the temporary first is the
parenthesized pair.

One register-form footnote you already half know: `or` with `zero` is the
canonical register copy — OR-ing with nothing changes nothing. That's not a
special instruction, just this one with a clever operand. It means not every
`or` you meet is C-level bit logic — when one operand is `zero`, read it as
`=`, not `|`. The tooltip agrees if you're ever unsure.

A note on good output: unlike `+` and `-`, bitwise operators in C come with
sharp precedence pitfalls, so parenthesize compounds like the one below even
where the compiler wouldn't strictly need it. Match first, but write C a
reviewer would wave through.

## Your task

Write `func_802951a8` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_802951a8(s32 a, s32 b, s32 c) {
    return (a & b) ^ c;
}
```
