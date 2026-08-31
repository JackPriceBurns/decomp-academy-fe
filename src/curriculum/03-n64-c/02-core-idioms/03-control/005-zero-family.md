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
  - "`bgez` fires when x >= 0 and skips the first return — so the C's `if`
    tests the condition that FAILED: x < 0."
  - "Two exits, each returning one of the argument registers from a delay slot. Map them before writing."
---

# Four more ways to test against zero

Equality isn't the only cheap comparison against zero. MIPS gives *ordering*
tests their own branch quartet:

- **`blez`** — branch if `<= 0`
- **`bgtz`** — branch if `> 0`
- **`bltz`** — branch if `< 0`
- **`bgez`** — branch if `>= 0`

No compare instruction, no `at`, no constant — the sign test is fused
straight into the branch. Here's `if (x > 0) return a; return b;`:

```asm
 0:  blez  a0, 0x10       # x <= 0? take b instead
 4:  or    v0, a2, zero   # (delay slot) b, preloaded
 8:  jr    ra
 c:  or    v0, a1, zero   # x > 0: return a
10:  jr    ra
14:  nop
```

The C asks `> 0`; the branch is `blez` — its exact opposite, because the
branch's job is still to skip the "then". The four mnemonics pair off into
inverses: `blez` ↔ `bgtz`, `bltz` ↔ `bgez`. When you decode, find the
mnemonic's partner and that's what the C tests.

Worth noticing: all four are **signed** tests. "Is it negative" only makes
sense for a signed value, and these branches read bit 31 as a sign — which is
a quiet type hint about whatever register they examine.

The target picks between its second and third arguments based on a sign test
of the first. Invert the mnemonic, pair the exits with their slots, and write
the `if`.

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
