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
  - "Every case computes into the same register, then a `b` jumps to the shared exit. Read each case's one instruction and translate it to a statement."
  - "One case doubles the argument with a shift — that's the multiply-by-2 spelling. An add-of-itself would have compiled to `addu` instead."
---

# break means "meet me at the exit"

Cases that `return` end in `jr ra`. Cases that **`break`** instead all funnel
to one shared exit — and the jump table shape bends to match. Here's
`apply(mode, x)`, which computes a result `r` from `x` differently per mode
and returns it through one exit:

```asm
 0:  sltiu  at, a0, 6
 4:  beqz   at, 0x50
 8:  or     v1, zero, zero       # r = 0 — doubles as the default
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
4c:  or     v1, a1, zero         # case 5 sits right above the exit — no b
50:  or     v0, v1, zero         # the shared exit: return r
54:  jr     ra
58:  nop
```

The dispatcher is identical to last lesson. What changed is downstream:

- **Each case is `b` to the exit, with its work in the slot.** One statement
  per case, one instruction per statement, the `break` compiled into the `b`.
- **`r` has a register**, `v1`, that every case writes. Its zero-init in the
  dispatcher's slot serves double duty as the default path's value.
- **The last case drops the `b`** — it sits immediately above the exit, so
  falling off its one instruction *is* arriving. Don't mistake that for a
  missing `break` in the C; it's just layout.
- Case 3 reads `addu v1, a1, a1` — the argument added to itself. Case 2 is a
  shift. IDO keeps the spelling you choose for these, so the diff tells you
  which C to write.

The target has the same skeleton: six cases, each one small statement
computing into the result register. Decode them one delay slot at a time.

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
