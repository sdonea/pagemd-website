import { DisclosureRow } from "@usva-ui/react/patterns/disclosure-row";
import { RevealGroup } from "@usva-ui/react/motion/reveal";

/* Shared by /faq and the home page's preview, so the two are formatted the
   same by construction.

   Two things DisclosureRow leaves to the caller and both pages had wrong:

   1. Its panel is a bare `overflow-hidden` div with no padding, while its
      button is `px-4 py-3`. Dropping a <p> straight in put the answer flush
      against the row's left edge with the question indented above it. The
      answer is padded to line up with the question text: 1rem of button
      padding, a 0.875rem chevron, and the 1rem gap between them.
   2. Each row already draws its own `rounded-xl border` card, so wrapping the
      set in a Card with `divide-y` drew a second border around and between
      them. They stack with a gap instead. */
const ANSWER_INDENT = "calc(1rem + 0.875rem + 1rem)";

export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  return (
    <RevealGroup className="grid gap-3">
      {items.map((item) => (
        <DisclosureRow
          key={item.q}
          summary={<span className="font-semibold">{item.q}</span>}
          buttonLabel={item.q}
        >
          <p
            className="text-muted pr-4 pb-4 text-[0.95rem] leading-7"
            style={{ paddingLeft: ANSWER_INDENT }}
          >
            {item.a}
          </p>
        </DisclosureRow>
      ))}
    </RevealGroup>
  );
}
