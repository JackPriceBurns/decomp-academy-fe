---
id: 11b290c7-0700-4f13-b8bb-0325045644a9
slug: control-zero-family
title: "blez, bgtz, bltz, bgez: Sign Tests"
difficulty: 2
concepts:
  - control-flow
  - branches
  - compare
symbol: func_8006ca40
hints:
  - "`bgez` jumps when x >= 0 and skips the first return, so the C's `if`
    tests the condition that FAILED: x < 0."
  - "Two exits, each returning one of the argument registers from a delay slot. Map them before writing."
---

# Four more ways to test against zero

Equality isn't the only cheap comparison against zero. MIPS also has four
branches for *ordering* tests:

- **`blez`**: branch if `<= 0`
- **`bgtz`**: branch if `> 0`
- **`bltz`**: branch if `< 0`
- **`bgez`**: branch if `>= 0`

There is no compare instruction, no `at` and no constant. The sign test is
built into the branch itself. Here is `if (x > 0) return a; return b;`:

```asm
 0:  blez  a0, 0x10       # x <= 0? take b instead
 4:  or    v0, a2, zero   # (delay slot) b, preloaded
 8:  jr    ra
 c:  or    v0, a1, zero   # x > 0: return a
10:  jr    ra
14:  nop
```

The C tests `> 0`, and the branch is `blez`, its exact opposite. This is
because the branch's job is still to skip the "then" body. The four mnemonics
form two pairs of opposites: `blez` ↔ `bgtz`, `bltz` ↔ `bgez`. When you
decode, find the mnemonic's partner. That partner is what the C tests.

Note that all four are **signed** tests. "Is it negative" only makes sense for
a signed value, and these branches treat bit 31 as a sign bit. That is a small
hint about the type of the register they test.

The target chooses between two values with a sign test on an argument. Invert
the mnemonic, pair the exits with their slots, and write the `if`.

## Your task

Write `func_8006ca40` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_8006ca40(s32 x, s32 a, s32 b) {
    if (x < 0) {
        return a;
    }
    return b;
}
```
