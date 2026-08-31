---
id: 6a3d66f1-88a1-494a-be96-059b91546ee4
slug: globals-statics
title: "Statics: The Global With No Name"
difficulty: 3
concepts:
  - globals
  - statics
  - bss
  - rmw
symbol: func_8028f598
hints:
  - "`[.bss]` means a file-local variable — declare it `static` yourself,
    above the function. Nothing is provided in context this time."
  - "The shape is the read-modify-write idiom, and the returned register holds the *updated* value. Check the `addiu`'s constant."
---

# When the diff says [.bss]

Every global so far has worn its name in the relocation. Now meet the one that
doesn't. Here's `countUp`, which bumps a counter and returns the new value —
but the counter is declared `static`:

```asm
lui    v1, %hi([.bss])
addiu  v1, v1, %lo([.bss])
lw     t6, 0(v1)
addiu  v0, t6, 1           # the new value, computed into v0…
sw     v0, 0(v1)           # …stored back, and returned as-is
jr     ra
nop
```

`static` at file scope means *file-local*: the variable exists in memory like
any global, but its name is private to the file that declares it, so the
relocation can't point at an exported symbol. The diff shows the section it
lives in instead — `[.bss]`, the zero-initialized data section — plus the
offset within it (0 here, folded invisibly into the addend). An initialized
static would point at `[.data]` the same way.

Two practical consequences:

- **You must define the variable yourself.** There's nothing to `extern` — a
  `static s32` declaration above your function creates it, and your compile
  will produce its own matching `[.bss]` relocation.
- The body is the read-modify-write idiom from earlier, with one nicety:
  the updated value is computed straight into `v0`, doing double duty as the
  store source *and* the return value. `bump-and-return` compiles this tightly
  whenever the C returns the freshly assigned variable.

The target is the same counter pattern with its own step amount. Name the
static whatever you like — the name never reaches the object file.

## Your task

Write `func_8028f598`, using a `static s32` you declare yourself, to reproduce the
target assembly.

<!-- solution -->
```c
static s32 sNextId;

s32 func_8028f598(void) {
    sNextId += 2;
    return sNextId;
}
```
