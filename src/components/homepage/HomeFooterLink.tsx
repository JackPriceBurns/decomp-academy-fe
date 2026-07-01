import Link from "next/link";

type Props = {
  href: string;
  external?: boolean;
  children: React.ReactNode;
};

export function HomeFooterLink({ href, external, children }: Props) {
  const className = "text-content-muted transition hover:text-content";
  return (
    <li className="text-sm">
      {external ? (
        <a href={href} target="_blank" rel="noreferrer" className={className}>
          {children}
        </a>
      ) : (
        <Link href={href} className={className}>
          {children}
        </Link>
      )}
    </li>
  );
}
