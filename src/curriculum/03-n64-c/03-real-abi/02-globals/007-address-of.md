---
id: 9a41cc10-8bd9-4d7e-9c14-9c5d60341bd9
slug: globals-address-of
title: Taking the Address of a Global
difficulty: 2
concepts:
  - globals
  - hi-lo
  - pointers
  - arrays
symbol: func_80290730
hints:
  - "There is a `lui` + `addiu` and no load anywhere, so the function returns an address instead of a value."
  - "The global is an array. In C, an array's bare name already gives its address, so you don't need `&`."
---

# lui + addiu, and nothing else

Sometimes a function returns *where* a global is stored instead of what it
holds. You met this pattern in the read-modify-write lesson as one step of a
larger function. In this lesson it is the whole function. This is `whereTimer`,
which returns `&gTimer`:

```asm
lui    v0, %hi(gTimer)
addiu  v0, v0, %lo(gTimer)   # the completed address is the result
jr     ra
nop
```

There is no `lw` and no `sw`. The `addiu` completes the address in `v0`, and
that address is the return value. Whenever a `%hi`/`%lo` pair ends in `addiu`
and nothing reads memory afterward, the C is working with pointers: `&global`, a
pointer being returned, or an address passed as an argument.

One rule of C matters for this lesson's target: for an **array** global, you
don't write `&`. When you use an array's name as a value, it *decays* to the
address of its first element. `gBuffer` and `&gBuffer[0]` mean the same thing,
and both compile to exactly this pair. The assembly can't tell you which form
the original programmer used. The usual choice is the bare name.

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
