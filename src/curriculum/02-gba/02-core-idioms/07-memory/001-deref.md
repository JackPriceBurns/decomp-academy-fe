---
id: 9ec07a48-b919-4e5a-9128-6266b7c3bcab
slug: gba-memory-deref
title: Reading Through a Pointer
difficulty: 1
concepts:
  - pointers
  - loads
  - addressing
symbol: func_081f536c
hints:
  - "Every `ldr rD, [rB, #0]` in the listing is one `*` in the C. Count them and you know how many of the arguments are addresses."
  - Two `s32 *` parameters in, an `s32` out, and the order of the registers in the `sub` is the order the C wrote them.
---

# The register holds an address

A pointer parameter arrives exactly like every other argument: `r0`, `r1`,
`r2`, `r3`, one register each. What changes is what the register means. An
`s32` argument arrives with the value already in the register. A pointer
arrives with an *address*, and the value lives out in memory at that address.
Reaching it costs an instruction.

That instruction is `ldr`:

```asm
0        ldr       r0, [r0, #0]
2        add       r0, #7
4        bx        lr
```

The brackets are the dereference. `ldr r0, [r0, #0]` reads the 32-bit word at
the address in `r0` and writes it back into `r0` — the address is gone,
replaced by the thing it pointed at. From there the `add` treats it like any
other value. The `#0` is a byte offset added to the base before the load, and
a plain `*p` has nothing to skip, so it is zero.

Nothing else marks a register as holding a pointer. There is no separate
pointer register bank and no tag; the only evidence is that something loaded
through it. Here the address is the second argument:

```asm
0        ldr       r1, [r1, #0]
2        add       r0, r1
4        bx        lr
```

`r0` goes straight into the arithmetic, so the first argument is a value.
`r1` appears inside brackets first, so the second one is an address. That
asymmetry is the whole signature, and reading it off the brackets is the habit
to build now.

Your target reaches into memory before it does any arithmetic. The brackets
tell you which arguments are addresses.

## Your task

Write `func_081f536c` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_081f536c(s32 *a, s32 *b) {
    return *a - *b;
}
```
