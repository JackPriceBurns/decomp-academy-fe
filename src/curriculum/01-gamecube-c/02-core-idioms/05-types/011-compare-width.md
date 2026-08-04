---
id: 897ddddb-37b5-5746-ad6e-02c97dad2fae
slug: types-compare-width
title: The Compare Opcode Follows the Type
difficulty: 4
concepts:
  - comparison
  - signed
  - unsigned
  - branch
symbol: func_8025f774
hints:
  - An unsigned operand feeding a branch compares with `cmplwi`, not `cmpwi`.
  - Change the parameter from `s16` to `u16`; that yields `clrlwi` then `cmplwi
    r0, 256`.
---

# `cmplwi` vs `cmpwi` is a type tell

Compares are gossip. The one a branch leans on will tell you, if you bother to
listen, exactly how its operand was typed. Picture a narrow signed parameter,
sixteen bits wide, getting tested against 100. It shows up as `cmpwi`, but only
after `extsh` has reached in and copied the sign bit across everything above it:

```asm
extsh  r0,r3       # sign-extend narrow signed value
cmpwi  r0,100      # signed compare
bne-   skip
bl     trigger
```

Retype that same value as unsigned and the story shifts. The compare grows an
`l` and turns into `cmplwi` (logical, that is), while the instruction feeding it
stops caring about sign and just rakes the top bits down to zero:

```asm
clrlwi r0,r3,16    # zero-extend narrow unsigned value
cmplwi r0,100      # unsigned compare
bne-   skip
bl     trigger
```

After that it comes down to the one letter and whichever extend set things up.
`clrlwi` clearing the high bits points at an unsigned value; `extsh` or `extsb`
smearing the sign downward points at a signed one. And `clrlwi` is generous: the
shift it uses spells out the original width. A `cmplwi` in your target therefore
leaves nothing ambiguous: the source was unsigned, width and all.

## Your task

`act` is a function. The starter below declares the parameter as **`s16 x`**,
which produces `extsh` + `cmpwi` (the signed compare). Change the parameter type
so the comparison emits `cmplwi` instead — the target assembly uses the logical
(unsigned) compare with the same 16-bit width.

<!-- starter -->
```c
void func_8025f774(s16 x) {

}
```

<!-- solution -->
```c
void func_8025f774(u16 x) {
    if (x == 256) {
        act();
    }
}
```

<!-- context -->
```c
void act(void);
```
