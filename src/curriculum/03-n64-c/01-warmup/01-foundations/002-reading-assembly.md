---
id: ec2713f1-e160-445d-b965-1a4e889a90cc
slug: foundations-reading-assembly
title: How to Read MIPS Assembly
difficulty: 1
concepts:
  - assembly
  - registers
  - delay-slots
  - mental-model
concept: true
---

# Reading a line of assembly

Assembly is the code the machine runs, tidied up just enough that it isn't
completely unreadable to a human. On this site it'll look like this:

```asm
0:   addiu  v0, zero, 7
4:   jr     ra
8:   nop
```

Three lines, three instructions — assembly is **one instruction per line**, and
it runs top to bottom.

## The numbers down the left are addresses

The first thing to notice: the numbers on the left don't count up 1, 2, 3. They
jump by 4, and they're written in hex. That's because they aren't line numbers at
all — each one is the **address** of its instruction, where that instruction sits
in memory. Every MIPS instruction is exactly 4 bytes, hence the even spacing.
It'll matter in later lessons; for now you can ignore the exact values and just
know that's what they are.

## Mnemonic and operands

Every instruction is a **mnemonic** followed by zero or more **operands**.

- The **mnemonic** is *what the instruction does* — load a value, add, subtract,
  branch, return, and so on.
- The **operands** are the *arguments* it acts on.

Take the first line, `addiu v0, zero, 7`. The mnemonic is `addiu` — **add
immediate** (an "immediate" is a constant written straight into the
instruction). The operands are `v0`, `zero`, and `7`, and by MIPS convention the
**destination comes first**: this line computes `zero + 7` and puts the result
in `v0`.

Adding seven to… `zero`? That's not a value — it's a register, and a very
special one: it *always reads as 0*. So `zero + 7` is just `7`, and this
instruction drops the constant `7` into `v0`. That's genuinely how MIPS loads a
constant — there's no dedicated "load a number" instruction, you add the number
to the register that's always nothing. (Some tools print this pattern with the
shorthand `li`, "load immediate"; on this site you'll always see the real
instruction.)

## The registers have names, not just numbers

`v0` and `zero` are **registers** — the small, fast slots inside the processor
where it keeps the values it's actively working with. MIPS has 32 of them, and
unlike some CPUs they go by *names* that tell you each register's job:

- **`zero`** — always reads as 0. Writes to it vanish. The hardware's free
  constant — you just watched it do real work.
- **`v0`, `v1`** — function return **v**alues.
- **`a0`–`a3`** — the first four function **a**rguments.
- **`t0`–`t9`** — **t**emporaries, scratch space the compiler burns freely.
- **`s0`–`s7`** — **s**aved registers; a function must put these back the way it
  found them.
- **`at`** — the **a**ssembler **t**emporary, scratch the compiler leans on when
  an operation needs a helper value.
- **`sp`** — the **s**tack **p**ointer; **`ra`** — the **r**eturn **a**ddress,
  where a function goes back to; plus a few you'll rarely meet (`k0`/`k1` belong
  to the kernel, `gp` and `fp` sit idle in this game's code).

Floating-point values live apart from all of these, in their own bank of
registers `$f0`–`$f31` on the FPU — later chapters visit them.

## The return, and the line after it

`jr ra` is the **return**: "**j**ump to the address in **r**egister `ra`" — and
`ra` is where the caller's address is waiting. Nearly every function you
decompile ends with one.

But look at the listing again: `jr ra` *isn't* the last line. There's a `nop`
after it. That's the single most MIPS thing you'll learn today:

**The instruction after every jump or branch always executes.** The CPU has
already fetched it by the time the jump takes effect, so it runs, jump or no
jump. That slot in the shadow of a branch is called the **delay slot**. When the
compiler has something useful to do there, it parks real work in it; when it
doesn't, it fills the slot with `nop` — "no operation", an instruction that does
nothing.

So read `jr ra` and the line after it **as a pair**: "return, and on the way
out, do this." In the listing above the answer to "do what?" is: nothing. Later
you'll see delay slots carrying real instructions, and knowing to look there is
half of reading MIPS.

## One more shape to file away

When an instruction touches memory you'll see an operand like `0(a0)` — that's
**offset(base)** form, meaning "the address in `a0`, plus 0". `lw v0, 4(a0)`
reads the word at `a0 + 4` into `v0`. Nothing to do with it yet; just recognize
the shape when it appears.

## You don't have to memorize any of this

There are a lot of mnemonics, and you'll meet them a few at a time — but you
don't need to keep them all in your head. **Hover any instruction in the diff**
and a tooltip explains what it does, with that line's own registers and values
filled in. Lean on it as much as you like; the common ones will stick on their
own soon enough.

---

This is a simplification — there's more to MIPS than three instructions, and
you'll pick the rest up exactly when a lesson needs it. But it's enough to read
your first target. Let's go match your very first C function.
