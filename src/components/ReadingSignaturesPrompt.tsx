import { IconArrowRight, IconBook2 } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Logo } from "@/components/ui/Logo";
import { Modal } from "@/components/ui/Modal";
import { lessonPath } from "@/lib/seo";

type Props = {
  course: string;
  firstLesson: string;
  onClose: () => void;
};

export function ReadingSignaturesPrompt({ course, firstLesson, onClose }: Props) {
  return (
    <Modal onClose={onClose} labelledBy="reading-signatures-prompt-title">
      <div className="mb-5 flex flex-col items-center gap-3 text-center">
        <Logo size={36} />
        <div>
          <h2
            id="reading-signatures-prompt-title"
            className="text-lg font-bold text-content-bright"
          >
            A quick course update
          </h2>
          <p className="mt-1.5 text-sm text-content-muted">
            We&apos;ve added a short{" "}
            <strong className="text-content-primary">Reading Signatures</strong> chapter and removed
            the starter function from every exercise that follows it.
          </p>
        </div>
      </div>

      <div className="mb-5 rounded-lg border border-accent/25 bg-accent/[0.07] px-4 py-3 text-sm text-content-muted">
        <div className="flex gap-2.5">
          <IconBook2 size={18} className="mt-0.5 shrink-0 text-accent" />
          <p>
            You have progress beyond that point, so we highly recommend completing the new chapter
            before jumping back ahead. It teaches you how to work out a function&apos;s arguments
            and return type from the target assembly.
          </p>
        </div>
      </div>

      <ButtonLink href={lessonPath(course, firstLesson)} onClick={onClose} className="w-full">
        Start Reading Signatures <IconArrowRight size={15} />
      </ButtonLink>

      <Button variant="ghost" onClick={onClose} className="mt-2 w-full">
        Continue anyway
      </Button>
    </Modal>
  );
}
