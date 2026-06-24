---
id: gauntlet-const-0
title: Return 0 (0x0)
difficulty: 1
concepts:
  - immediates
  - li
symbol: get
hints:
  - This value fits in a single immediate.
  - Just `return 0;`.
---

# Materializing a constant

A value that fits in signed 16 bits loads in one **`li`**. A wider value is
built from halves: **`lis`** (load immediate *shifted* — the high 16 bits),
then **`addi`** to add the low half (MWCC uses `addi`, not `ori`, for an
`int`). If the low 16 bits are all zero, the lone `lis` is enough.

This constant fits in a single `li`.

## Your task
Write `get` to match the target.

<!-- starter -->
```c
int get(void) {
    // your code here
    return 0;
}
```

<!-- solution -->
```c
int get(void) {
    return 0;
}
```
