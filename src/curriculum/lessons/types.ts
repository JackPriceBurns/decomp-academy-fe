import { LessonSource } from "@/lib/lessons/types";

export const types: LessonSource[] = [
  {
    id: "types-load-u8",
    chapter: "types",
    order: 1,
    title: "Loading a Byte",
    difficulty: 1,
    concepts: ["loads", "unsigned", "zero-extension"],
    brief: `
# Width is encoded in the load

A register is 32 bits wide, but memory comes in bytes, halfwords, and words. The
*type* you read through decides which load instruction MWCC emits. Reading a
**\`u8\`** uses **\`lbz\`** — *load byte and zero* — which fetches one byte and clears
the upper 24 bits:

\`\`\`asm
lbz  r3, 0(r3)   # r3 = (u32) p[0], high 24 bits = 0
blr
\`\`\`

The "z" in \`lbz\` is the whole story: an unsigned byte is **zero-extended**, so no
extra instruction is needed to clean up the register. The pointer arrives in
\`r3\`; the loaded value lands right back in \`r3\` ready to return.

One flag to plant early: the GameCube is **big-endian**. Multi-byte values are
stored most-significant byte first, so the byte at offset 0 of a word is its
*high* byte — the opposite of x86. It doesn't matter for a lone \`u8\`, but it will
the moment you read fields out of a struct, so keep it in mind.

## Your task

Write \`load_u8\` to match the target assembly above.
`,
    symbol: "load_u8",
    starter: `u8 load_u8(u8* p) {
    return 0;
}
`,
    solution: `u8 load_u8(u8* p) {
    return p[0];
}
`,
    hints: [
      "An unsigned byte load is `lbz` — load byte and zero.",
      "`p[0]` on a `u8*` compiles to a single `lbz r3, 0(r3)`.",
    ],
  },
  {
    id: "types-load-u16",
    chapter: "types",
    order: 2,
    title: "Loading a Halfword",
    difficulty: 1,
    concepts: ["loads", "unsigned", "zero-extension"],
    brief: `
# Halfwords load with \`lhz\`

A **\`u16\`** is two bytes — a *halfword*. Reading one uses **\`lhz\`** — *load
halfword and zero* — the 16-bit sibling of \`lbz\`. It clears the top 16 bits:

\`\`\`asm
lhz  r3, 0(r3)   # r3 = (u32) p[0], high 16 bits = 0
blr
\`\`\`

Just like the byte case, *unsigned* means *zero-extended*, so \`lhz\` does the
whole job in one instruction. Memorize the family: \`lbz\` for unsigned bytes,
\`lhz\` for unsigned halfwords, \`lwz\` for full words.

## Your task

Write \`load_u16\` to match the target assembly above.
`,
    symbol: "load_u16",
    starter: `u16 load_u16(u16* p) {
    return 0;
}
`,
    solution: `u16 load_u16(u16* p) {
    return p[0];
}
`,
    hints: [
      "An unsigned halfword load is `lhz`.",
      "`p[0]` on a `u16*` compiles to a single `lhz r3, 0(r3)`.",
    ],
  },
  {
    id: "types-load-signed",
    chapter: "types",
    order: 3,
    title: "Signed Loads Sign-Extend",
    difficulty: 2,
    concepts: ["loads", "signed", "sign-extension"],
    brief: `
# When the high bits must be filled with the sign

Reading a **signed** narrow value into a 32-bit register can't just zero the top
bits — a negative \`s8\` like \`-1\` (\`0xFF\`) must become \`0xFFFFFFFF\`. PowerPC has
a dedicated **\`lha\`** (*load halfword algebraic*) that sign-extends a halfword as
it loads:

\`\`\`asm
lha  r3, 0(r3)   # r3 = (s32) p[0], sign-extended
blr
\`\`\`

Bytes are the odd one out: there is **no** "load byte algebraic". A signed byte
that needs widening loads with \`lbz\` and is then fixed up with a separate
**\`extsb\`** (*extend sign byte*). You'll see that pair when an \`s8\` is widened to
an \`int\`:

\`\`\`asm
lbz   r3, 0(r3)
extsb r3, r3     # sign-extend the byte to 32 bits
blr
\`\`\`

## Your task

Write \`load_s16\`, taking an \`s16*\` and returning \`p[0]\` widened to \`int\`. Because
the result is used as a 32-bit \`int\`, the load must sign-extend.
`,
    symbol: "load_s16",
    starter: `int load_s16(s16* p) {
    return 0;
}
`,
    solution: `int load_s16(s16* p) {
    return p[0];
}
`,
    hints: [
      "A signed halfword load that widens to int is `lha`, not `lhz`.",
      "`return p[0];` on an `s16*` compiles to a single `lha r3, 0(r3)`.",
    ],
  },
  {
    id: "types-store-byte",
    chapter: "types",
    order: 4,
    title: "Storing a Byte Truncates",
    difficulty: 2,
    concepts: ["stores", "truncation"],
    brief: `
# \`stb\` writes only the low 8 bits

Storing is simpler than loading: there is no signed/unsigned distinction, only
*width*. Writing through a **\`u8*\`** uses **\`stb\`** (*store byte*), which copies
only the **low 8 bits** of the source register to memory:

\`\`\`asm
stb  r4, 0(r3)   # p[0] = (u8) v   (high bits of r4 ignored)
blr
\`\`\`

The pointer \`p\` is in \`r3\`, the value \`v\` is in \`r4\`. \`stb\` silently **truncates**
— whatever sits in the upper 24 bits of \`r4\` is discarded. That truncation is
"free": the compiler doesn't mask the value first, it just narrows the store.

## Your task

Write \`store_u8\` so it compiles to the \`stb\` above.
`,
    symbol: "store_u8",
    starter: `void store_u8(u8* p, u8 v) {
}
`,
    solution: `void store_u8(u8* p, u8 v) {
    p[0] = v;
}
`,
    hints: [
      "Writing one byte uses `stb` (store byte).",
      "`p[0] = v;` compiles to `stb r4, 0(r3)` — only the low 8 bits are written.",
    ],
  },
  {
    id: "types-store-half",
    chapter: "types",
    order: 5,
    title: "Storing a Halfword",
    difficulty: 2,
    concepts: ["stores", "truncation"],
    brief: `
# \`sth\` is the 16-bit store

The halfword store is **\`sth\`** (*store halfword*), writing the **low 16 bits**
of a register:

\`\`\`asm
sth  r4, 0(r3)   # p[0] = (u16) v
blr
\`\`\`

The store family mirrors the load family by width: \`stb\` for bytes, \`sth\` for
halfwords, \`stw\` for words. None of them care about sign — they all just truncate
to their width and copy. If you later read the value back signed, the *load* is
where sign-extension happens, never the store.

## Your task

Write \`store_u16\` so it compiles to the \`sth\` above.
`,
    symbol: "store_u16",
    starter: `void store_u16(u16* p, u16 v) {
}
`,
    solution: `void store_u16(u16* p, u16 v) {
    p[0] = v;
}
`,
    hints: [
      "Writing one halfword uses `sth` (store halfword).",
      "`p[0] = v;` compiles to `sth r4, 0(r3)`.",
    ],
  },
  {
    id: "types-u8-not-char",
    chapter: "types",
    order: 6,
    title: "u8, Not char (The Spurious extsb)",
    difficulty: 3,
    concepts: ["signed", "char", "sign-extension", "matching-idiom"],
    brief: `
# A common byte-matching mix-up: char vs u8

In MWCC's world, a plain **\`char\` is signed**. That one fact bites constantly.
Whenever a \`char\` value is *promoted* — passed to a function, used in arithmetic,
returned as \`int\` — the compiler must sign-extend it first with an **\`extsb\`**.
A **\`u8\`** never sign-extends, because it is already unsigned.

Watch what happens when a byte is loaded and handed to a function that takes an
\`int\`. With \`char\`, an extra \`extsb\` appears:

\`\`\`asm
lbz   r3, 0(r4)
extsb r3, r3      # <-- spurious: char promotes to signed int
bl    scale
stb   r3, 0(r31)
\`\`\`

With **\`u8\`**, the loaded byte feeds the call directly — the \`extsb\` is **gone**:

\`\`\`asm
lbz   r3, 0(r4)
bl    scale       # no extsb: u8 is already zero-extended
stb   r3, 0(r31)
\`\`\`

The trailing \`stb\` needs no cleanup either way: a *store* only ever copies the
low 8 bits, so writing \`scale\`'s \`int\` result back through a byte pointer
truncates for free — don't reach for \`& 0xFF\`, which would add a \`clrlwi\` the
target doesn't have.

If your output has one stray \`extsb\` the target doesn't, the cause is almost
always a \`char\` that should have been a \`u8\`. That's the key takeaway of this
chapter: **for a raw byte, prefer \`u8\` over \`char\`.**

## Your task

Here \`scale\` takes an \`int\`. Write \`relay\` so it loads \`s[0]\`, passes it to
\`scale\`, and stores the result to \`d[0]\` — **with no \`extsb\`**. Choose your
pointer types carefully.
`,
    symbol: "relay",
    context: `int scale(int x);`,
    starter: `void relay(char* d, char* s) {
    d[0] = scale(s[0]);
}
`,
    solution: `void relay(u8* d, u8* s) {
    d[0] = scale(s[0]);
}
`,
    hints: [
      "`char` is signed in MWCC, so promoting it to `int` for the call inserts an `extsb`.",
      "Switch both pointers from `char*` to `u8*`; an unsigned byte needs no sign-extend, and the `extsb` disappears.",
    ],
  },
  {
    id: "types-widen-zero-vs-sign",
    chapter: "types",
    order: 7,
    title: "Widening: Zero vs Sign Extend",
    difficulty: 2,
    concepts: ["widening", "sign-extension", "zero-extension"],
    brief: `
# Same value, two ways to fill the top bits

Widening a narrow *value already in a register* (not a fresh load) shows the
sign/unsigned split clearly. A **\`u8 → u32\`** widen zero-extends with a
rotate-mask, printed as **\`clrlwi\`** (clear left word immediate) — here clearing
the top 24 bits:

\`\`\`asm
clrlwi r3, r3, 24   # keep low 8 bits, zero the rest
blr
\`\`\`

A signed **\`s8 → s32\`** widen instead sign-extends with **\`extsb\`**:

\`\`\`asm
extsb r3, r3        # replicate bit 7 into the top 24 bits
blr
\`\`\`

\`clrlwi r3, r3, 24\` and \`extsb r3, r3\` differ only in whether the high bits become
zeros or copies of the sign bit — exactly the unsigned-vs-signed choice. (For
this lesson we widen the *unsigned* case.)

\`clrlwi\` is just a readable spelling of an \`rlwinm\` rotate-mask: \`clrlwi r3, r3,
24\` is the same instruction as \`rlwinm r3, r3, 0, 24, 31\`. Some disassemblers
print the raw \`rlwinm\` form, so treat the two as identical when reading a diff.

## Your task

Write \`widen_u8\`, taking a \`u8 x\` and returning it as a \`u32\`. The unsigned widen
should emit a single \`clrlwi\`.
`,
    symbol: "widen_u8",
    starter: `u32 widen_u8(u8 x) {
    return 0;
}
`,
    solution: `u32 widen_u8(u8 x) {
    return x;
}
`,
    hints: [
      "Widening an unsigned byte to a word zero-extends — a mask, not a sign-extend.",
      "`return x;` compiles to `clrlwi r3, r3, 24` (keep the low 8 bits).",
    ],
  },
  {
    id: "types-truncate-mask",
    chapter: "types",
    order: 8,
    title: "Truncating With a Mask",
    difficulty: 3,
    concepts: ["truncation", "masking", "rlwinm"],
    brief: `
# \`& 0xFF\` is the same as keeping the low byte

When you narrow a wide value *without* storing it — e.g. returning the low byte
of an \`int\` — the compiler can't lean on a narrow store. Instead it masks the
register. \`x & 0xFF\` keeps the low 8 bits and clears the rest, which is again the
\`clrlwi\` rotate-mask:

\`\`\`asm
clrlwi r3, r3, 24   # x & 0xFF
blr
\`\`\`

This is the *register-resident* twin of the truncating store from earlier: \`stb\`
truncates on its way to memory, while \`& 0xFF\` truncates a value staying in a
register. Recognizing the mask width from the shift amount is a core reading
skill — the shift is just how many high bits get cleared:

\`\`\`text
clrlwi r3, r3, 24   = x & 0xFF     (keep low 8 bits)
clrlwi r3, r3, 16   = x & 0xFFFF   (keep low 16 bits)
\`\`\`

## Your task

Write \`low_byte\` to reproduce the \`clrlwi\` assembly above.
`,
    symbol: "low_byte",
    starter: `u8 low_byte(int x) {
    return 0;
}
`,
    solution: `u8 low_byte(int x) {
    return x & 0xFF;
}
`,
    hints: [
      "Keeping the low 8 bits of a register is a rotate-mask.",
      "`x & 0xFF` compiles to `clrlwi r3, r3, 24`.",
    ],
  },
  {
    id: "types-explicit-cast",
    chapter: "types",
    order: 9,
    title: "Casts That Sign-Extend",
    difficulty: 3,
    concepts: ["casts", "sign-extension", "extsb", "extsh"],
    brief: `
# An explicit cast can be a whole instruction

A cast isn't always free. Casting a wide signed value *down* to a signed narrow
type and back up forces the value through that narrow range, which means
sign-extending from the cast width. \`(s8)x\` keeps the low byte but re-spreads its
sign bit, exactly **\`extsb\`**:

\`\`\`asm
extsb r3, r3        # (s8) x, then widened back to int
blr
\`\`\`

The halfword cast \`(s16)x\` is the same idea one size up — **\`extsh\`** (*extend
sign halfword*):

\`\`\`asm
extsh r3, r3        # (s16) x
blr
\`\`\`

So a lone \`extsb\` or \`extsh\` in the disassembly often comes straight from an
explicit narrowing cast in the source, not from a load.

## Your task

Write \`as_s8\` so it compiles to the single \`extsb\` above.
`,
    symbol: "as_s8",
    starter: `int as_s8(int x) {
    return 0;
}
`,
    solution: `int as_s8(int x) {
    return (s8)x;
}
`,
    hints: [
      "Casting to a signed byte and back re-spreads the sign bit.",
      "`(s8)x` compiles to a single `extsb r3, r3`.",
    ],
  },
  {
    id: "types-cast-between-signed",
    chapter: "types",
    order: 10,
    title: "Casting Between Signed Widths",
    difficulty: 3,
    concepts: ["casts", "signed", "sign-extension"],
    brief: `
# Widening a signed type keeps its sign

Converting between two *signed* widths follows the value's own sign. Promoting an
**\`s8\`** to an **\`s16\`** must preserve negativity, so the byte is sign-extended —
and since the byte is the narrower type, that's an **\`extsb\`** (the halfword
result still carries the correct sign in its low 16 bits):

\`\`\`asm
extsb r3, r3        # s8 -> s16, sign preserved
blr
\`\`\`

The rule generalizes: when the *source* is signed, a widening conversion
sign-extends from the source width. When the source is unsigned, the same
conversion would zero-extend (a \`clrlwi\`) instead — a \`u8 → u16\` widen keeps the
low 8 bits and clears the rest:

\`\`\`asm
clrlwi r3, r3, 24   # u8 -> u16, zero-extended (no sign to preserve)
blr
\`\`\`

The signedness of the value you start from is what picks \`extsb\`/\`extsh\` versus a
mask.

## Your task

Write \`s8_to_s16\`, taking an \`s8 x\` and returning it as an \`s16\`. The signed
widen should emit a single \`extsb\`.
`,
    symbol: "s8_to_s16",
    starter: `s16 s8_to_s16(s8 x) {
    return 0;
}
`,
    solution: `s16 s8_to_s16(s8 x) {
    return x;
}
`,
    hints: [
      "Widening a signed byte preserves its sign, so it sign-extends.",
      "`return x;` compiles to `extsb r3, r3`.",
    ],
  },
  {
    id: "types-compare-width",
    chapter: "types",
    order: 11,
    title: "The Compare Opcode Follows the Type",
    difficulty: 4,
    concepts: ["comparison", "signed", "unsigned", "branch"],
    brief: `
# \`cmplwi\` vs \`cmpwi\` is a type tell

When a value feeds a *branch*, the comparison opcode reveals its declared type.
An **unsigned** operand (like a \`u16\`) compares with **\`cmplwi\`** — *compare
**l**ogical word immediate* — after being zero-extended to clear the high bits:

\`\`\`asm
clrlwi r0, r3, 16   # zero-extend the u16
cmplwi r0, 256      # unsigned compare
bne-   skip
bl     act
\`\`\`

A **signed narrow** operand of the same width (an \`s16\`) compares with
**\`cmpwi\`** — the signed compare — preceded by a sign-extend. (A plain 32-bit
\`int\` is already full-width, so it gets the \`cmpwi\` with *no* extend.)

\`\`\`asm
extsh  r0, r3       # sign-extend the s16
cmpwi  r0, 256      # signed compare
bne-   skip
bl     act
\`\`\`

The difference is one letter — \`cmpl**w**i\` vs \`cmp**w**i\` — and the preceding
\`clrlwi\` vs \`extsh\`. If the target uses \`cmplwi\`, your operand must be unsigned;
match the local or field to the field's actual width and sign.

## Your task

\`act\` is a function. The starter below declares the parameter as **\`s16 x\`**,
which produces \`extsh\` + \`cmpwi\` (the signed compare). Change the parameter to
the type that makes the comparison emit \`cmplwi\` — the target uses the *logical*
(unsigned) compare, so pick the type whose zero-extend feeds it.
`,
    symbol: "maybe_act",
    context: `void act(void);`,
    starter: `void maybe_act(s16 x) {
    if (x == 256) {
        act();
    }
}
`,
    solution: `void maybe_act(u16 x) {
    if (x == 256) {
        act();
    }
}
`,
    hints: [
      "An unsigned operand feeding a branch compares with `cmplwi`, not `cmpwi`.",
      "Change the parameter from `s16` to `u16`; that yields `clrlwi` then `cmplwi r0, 256`.",
    ],
  },
  {
    id: "types-counter-increment",
    chapter: "types",
    order: 12,
    title: "Bumping a Byte Counter",
    difficulty: 4,
    concepts: ["loads", "stores", "read-modify-write", "u8"],
    brief: `
# Read, modify, write — all at byte width

A byte counter ticking up is a complete read-modify-write at narrow width, and it
ties this chapter together. \`(*p)++\` on a \`u8*\` loads the byte, adds one, and
stores it back:

\`\`\`asm
lbz   r4, 0(r3)   # load the current count (zero-extended, no extsb)
addi  r0, r4, 1   # increment
stb   r0, 0(r3)   # truncate back to a byte and store
blr
\`\`\`

Three details to absorb: the load is \`lbz\` (unsigned byte, zero-extended), the
arithmetic is a plain \`addi\` in a 32-bit register, and the store is \`stb\`, which
truncates the sum back into one byte — so \`255 + 1\` correctly wraps to \`0\`.
Here the byte is loaded, incremented, and stored straight back — it never escapes
into a wider signed context — so even a \`char*\` counter would compile to this
exact sequence with no \`extsb\`. But the moment a \`char\` value *is* widened to
\`int\` (passed to a function, used in 32-bit arithmetic), that spurious \`extsb\`
appears (you saw it in the u8-vs-char lesson). The habit stands: **\`u8\` for a raw
byte.**

## Your task

Write \`bump\` to match the target. Expect exactly \`lbz\` / \`addi\` / \`stb\` with no \`extsb\`.
`,
    symbol: "bump",
    starter: `void bump(u8* p) {
}
`,
    solution: `void bump(u8* p) {
    p[0]++;
}
`,
    hints: [
      "Read-modify-write a byte: load with `lbz`, add with `addi`, store with `stb`.",
      "`p[0]++;` on a `u8*` gives `lbz` / `addi` / `stb` and no `extsb`.",
    ],
  },
];
