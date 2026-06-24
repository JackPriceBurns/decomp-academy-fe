---
id: globals-write-int
title: Writing a Global
difficulty: 2
concepts:
  - globals
  - sda
  - sda21
  - store
symbol: setScore
hints:
  - Writing a global is a single store relative to r13.
  - "`gScore = v;` compiles to `stw r3, gScore@sda21(r13)` — relocation
    R_PPC_EMB_SDA21."
---

# Storing through the same r13 window

Writing a global is the mirror image of reading one. The value is already in a
register (here the argument `v` in `r3`), and a single **`stw`** stores it at the
same `@sda21` offset from `r13`:

```asm
stw   r3, g@sda21(r13)   # g = v
blr
```
```
R_PPC_EMB_SDA21   g
```

Same relocation (`R_PPC_EMB_SDA21`), same base register — only the opcode flips
from load (`lwz`) to store (`stw`). No address has to be materialized first;
that's the whole point of the SDA. A bare `stw rX, sym@sda21(r13)` with no
preceding address computation is the signature of a direct global write.

## Your task

`extern int gScore;` is provided. Write `setScore`, taking an `int v`, so it
compiles to the `stw` above (no return value).

<!-- starter -->
```c
void setScore(int v) {
    // hint: which opcode does a write use?
}
```

<!-- solution -->
```c
void setScore(int v) {
    gScore = v;
}
```

<!-- context -->
```c
extern int gScore;
```
