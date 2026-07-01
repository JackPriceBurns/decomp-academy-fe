import { IconBrandGithub } from "@tabler/icons-react";
import { Logo } from "@/components/ui/Logo";
import { HomeFooterCol } from "./HomeFooterCol";
import { HomeFooterLink } from "./HomeFooterLink";

type Props = {
  startHref: string;
};

export function Footer({ startHref }: Props) {
  return (
    <footer className="border-t border-line bg-bg-soft/40">
      <div className="mx-auto max-w-5xl px-5 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              <Logo size={24} />
              <span className="font-bold tracking-tight text-content-primary">Decomp Academy</span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-content-muted">
              Learn matching decompilation of retro games — turn the original assembly back into
              byte-matching C, graded live by the real compilers.
            </p>
            <div className="mt-4 flex flex-col gap-1.5">
              <a
                href="https://github.com/JackPriceBurns/decomp-academy-fe"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-content-muted transition hover:text-content"
              >
                <IconBrandGithub size={15} /> Frontend on GitHub
              </a>
              <a
                href="https://github.com/JackPriceBurns/decomp-academy-be"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-content-muted transition hover:text-content"
              >
                <IconBrandGithub size={15} /> Backend on GitHub
              </a>
            </div>
          </div>

          <HomeFooterCol title="Learn">
            <HomeFooterLink href={startHref}>Start training</HomeFooterLink>
            <HomeFooterLink href="/playground">Playground</HomeFooterLink>
            <HomeFooterLink href="/glossary">Glossary</HomeFooterLink>
            <HomeFooterLink href="/#curriculum">Curriculum</HomeFooterLink>
          </HomeFooterCol>

          <HomeFooterCol
            title="Decomp projects"
            note="Lessons draw on real functions from open-source retro-game decompilations:"
          >
            <HomeFooterLink href="https://github.com/zcanann/SFA-Decomp" external>
              Star Fox Adventures
            </HomeFooterLink>

            <HomeFooterLink href="https://github.com/projectPiki/pikmin2" external>
              Pikmin 2
            </HomeFooterLink>

            <HomeFooterLink href="https://github.com/PrimeDecomp/prime" external>
              Metroid Prime
            </HomeFooterLink>

            <HomeFooterLink href="https://github.com/macabeus/kl-eod-decomp" external>
              Klonoa: Empire of Dreams
            </HomeFooterLink>
          </HomeFooterCol>

          <HomeFooterCol title="Community">
            <HomeFooterLink href="https://decomp.me" external>
              decomp.me
            </HomeFooterLink>

            <HomeFooterLink href="https://decomp.dev" external>
              decomp.dev
            </HomeFooterLink>

            <HomeFooterLink href="https://wiki.decomp.dev" external>
              Decomp wiki
            </HomeFooterLink>
          </HomeFooterCol>
        </div>

        <div className="mt-10 border-t border-line/60 pt-5 text-2xs leading-relaxed text-content-ghost">
          Not affiliated with Nintendo, Rare, Retro Studios, or Bandai Namco. Star Fox Adventures,
          Pikmin, Metroid Prime, and Klonoa are trademarks of their respective owners. Linked
          decompilation projects are independent and community-run.
        </div>
      </div>
    </footer>
  );
}
