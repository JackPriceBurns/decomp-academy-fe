---
id: 45326a20-13d7-4202-88ee-da21ed88d258
slug: adv-switch-actions
title: Cases That Do Work
difficulty: 3
concepts:
  - switch
  - jump-table
  - control-flow
symbol: func_8014c9a8
hints:
  - "Every case writes its result into the same register, and then a `b` jumps to the shared exit. Read each case's one instruction and turn it into a C statement."
  - "One case doubles the argument with a shift. That is how multiplying by 2 compiles. Adding the argument to itself would have compiled to `addu` instead."
---

# A break jumps to one shared exit

Cases that `return` end in `jr ra`. Cases that **`break`** instead all jump to
one shared exit, and the jump table code changes to match. Here is
`apply(mode, x)`. It computes a result `r` from `x` in a different way for each
mode, and returns it through one exit:

```asm
 0:  sltiu  at, a0, 6
 4:  beqz   at, 0x50
 8:  or     v1, zero, zero       # r = 0, which is also the default
 c:  sll    t6, a0, 2
10:  lui    at, %hi(.rodata)
14:  addu   at, at, t6
18:  lw     t6, %lo(.rodata)(at)
1c:  jr     t6
20:  nop
24:  b      0x50                 # case 0:
28:  addiu  v1, a1, -1
2c:  b      0x50                 # case 1:
30:  ori    v1, a1, 0x8
34:  b      0x50                 # case 2:
38:  sll    v1, a1, 2
3c:  b      0x50                 # case 3:
40:  addu   v1, a1, a1
44:  b      0x50                 # case 4:
48:  addiu  v1, zero, 100
4c:  or     v1, a1, zero         # case 5 sits right above the exit: no b
50:  or     v0, v1, zero         # the shared exit: return r
54:  jr     ra
58:  nop
```

The dispatcher is the same as in the last lesson. The changes come after it:

- **Each case is a `b` to the exit, with its work in the delay slot.** There
  is one statement per case and one instruction per statement. The `break`
  compiles to the `b`.
- **`r` lives in a register**, `v1`, and every case writes to it. It is set to
  zero in the dispatcher's delay slot, and that zero is also the value on the
  default path.
- **The last case has no `b`.** It sits directly above the exit, so after its
  one instruction the code is already at the exit. This does not mean the C
  is missing a `break`. It is only how the code is laid out.
- Case 3 is `addu v1, a1, a1`, which adds the argument to itself. Case 2 is a
  shift. IDO keeps the form you write for these, so the diff tells you which
  C to write.

The target has the same structure: six cases, and each one is a small
statement that writes the result register. Decode them one delay slot at a
time.

## Your task

Write `func_8014c9a8` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_8014c9a8(s32 t, s32 v) {
    s32 r = 0;

    switch (t) {
    case 0:
        r = v + 3;
        break;
    case 1:
        r = v * 2;
        break;
    case 2:
        r = -v;
        break;
    case 3:
        r = v >> 1;
        break;
    case 4:
        r = v & 15;
        break;
    case 5:
        r = 77;
        break;
    }
    return r;
}
```
