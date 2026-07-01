type Props = { data: object | object[] };

export function JsonLd({ data }: Props) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
