---
id: 60eb8707-e456-5e06-9271-e4ffdcd7446b
slug: globals-write-int
title: Writing a Global
difficulty: 2
concepts:
  - globals
  - sda
  - sda21
  - store
symbol: func_8003ae1c
hints:
  - Writing a global is a single store relative to r13.
  - "`gScore = v;` compiles to `stw r3, gScore@sda21(r13)` — relocation
    R_PPC_EMB_SDA21."
---

# Storing through the same r13 window

Writing a global runs reading one in reverse. The value already sits in a register
(the argument `v`, here in `r3`), so the compiler emits one `stw` to the same
`@sda21` offset off `r13`.

```asm
stw   r3, g@sda21(r13)   # g = v
blr
```
```
R_PPC_EMB_SDA21   g
```

The relocation is unchanged (`R_PPC_EMB_SDA21`), the base register unchanged. Only
the opcode swaps: `lwz` becomes `stw`. Nothing computes an address first — that's
the SDA earning its keep. A lone `stw rX, sym@sda21(r13)` with no address
arithmetic ahead is what a direct global write looks like.

## Your task

`extern int gScore;` is provided. Write `func_8003ae1c` so it compiles to the `stw`
above (no return value).

<!-- solution -->
```c
void func_8003ae1c(int v) {
    gScore = v;
}
```

<!-- context -->
```c
extern int gScore;
```
