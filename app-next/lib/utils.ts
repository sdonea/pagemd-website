/* shadcn registry components import `cn` from `@/lib/utils`. usva ships the same
   clsx + tailwind-merge helper on its own entry, deliberately outside the client
   chunk, so this re-exports that rather than adding a second implementation. */
export { cn } from "@usva-ui/react/cn";
