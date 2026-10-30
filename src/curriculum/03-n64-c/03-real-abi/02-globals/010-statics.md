---
id: 6a3d66f1-88a1-494a-be96-059b91546ee4
slug: globals-statics
title: "Statics: Globals Without a Symbol Name"
difficulty: 3
concepts:
  - globals
  - statics
  - bss
  - rmw
symbol: func_8028f598
hints:
  - "`[.bss]` means a file-local variable. Declare it `static` yourself, above the function. Nothing is provided in context this time."
  - "The pattern is the read-modify-write idiom, and the returned register holds the *updated* value. Check the constant in the `addiu`."
---

# When the diff says [.bss]

Every global so far has shown its name in the relocation. This one does not.
Here is `countUp`, which increments a counter and returns the new value. The
counter is declared `static`:

```asm
lui    v1, %hi([.bss])
addiu  v1, v1, %lo([.bss])
lw     t6, 0(v1)
addiu  v0, t6, 1           # the new value, computed into v0…
sw     v0, 0(v1)           # …stored back, and returned as-is
jr     ra
nop
```

`static` at file scope means *file-local*. The variable exists in memory like
any global, but its name is private to the file that declares it, so the
relocation can't point at an exported symbol. Instead, the diff shows the
section the variable is in: `[.bss]`, the zero-initialized data section. It also
includes the offset within that section (0 here, so nothing extra appears in the
addend). An initialized static would point at `[.data]` in the same way.

This has two practical effects:

- **You must define the variable yourself.** There is nothing to `extern`. A
  `static s32` declaration above your function creates it, and your compile
  will produce its own matching `[.bss]` relocation.
- The body is the read-modify-write idiom from earlier, with one small
  improvement. The updated value is computed straight into `v0`, so the same
  register is both the store source *and* the return value. The
  `bump-and-return` pattern compiles to this short form whenever the C returns
  the variable it has just assigned.

The target uses the same counter pattern with its own step amount. You can give
the static any name you like, because the name never reaches the object file.

## Your task

Write `func_8028f598`, using a `static s32` you declare yourself, to reproduce
the target assembly.

<!-- solution -->
```c
static s32 sNextId;

s32 func_8028f598(void) {
    sNextId += 2;
    return sNextId;
}
```
