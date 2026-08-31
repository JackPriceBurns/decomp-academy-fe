---
id: 9a41cc10-8bd9-4d7e-9c14-9c5d60341bd9
slug: globals-address-of
title: "No Memory Op at All: Taking an Address"
difficulty: 2
concepts:
  - globals
  - hi-lo
  - pointers
  - arrays
symbol: func_80290730
hints:
  - "`lui` + `addiu` and no load anywhere: the function returns an address,
    not a value."
  - "The global is an array — and in C, an array's bare name already *is* its address. No `&` needed."
---

# lui + addiu, and nothing else

Sometimes a function hands out *where* a global lives rather than what it
holds. You met this shape in the read-modify-write lesson as a step along the
way; here it's the entire function. Here's `whereTimer`, which returns
`&gTimer`:

```asm
lui    v0, %hi(gTimer)
addiu  v0, v0, %lo(gTimer)   # the completed address is the result
jr     ra
nop
```

No `lw`, no `sw` — the `addiu` completes the address in `v0` and that *is* the
return value. Whenever a `%hi`/`%lo` pair ends in `addiu` with nothing reading
memory afterward, the C is dealing in pointers: `&global`, a pointer being
returned, an address passed as an argument.

One C wrinkle makes this lesson's target interesting: for an **array** global,
you don't write `&`. An array's name, used as a value, *decays* to the address
of its first element — `gBuffer` and `&gBuffer[0]` mean the same thing, and
both compile to exactly this pair. The assembly can't tell you which spelling
the original programmer used; the idiomatic choice is the bare name.

## Your task

`extern u8 gBuffer[64];` is declared for you. Write `func_80290730` to reproduce
the target assembly.

<!-- solution -->
```c
u8 *func_80290730(void) {
    return gBuffer;
}
```

<!-- context -->
```c
extern u8 gBuffer[64];
```
