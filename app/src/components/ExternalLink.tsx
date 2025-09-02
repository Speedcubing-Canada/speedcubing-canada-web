import { forwardRef } from "react";

export interface LinkProps {
  to: string;
  children?: React.ReactNode;
}

export const ExternalLink = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ to, children, ...rest }, ref) => (
    <a ref={ref} href={to} target="_blank" rel="noopener noreferrer" {...rest}>
      {children}
    </a>
  ),
);

ExternalLink.displayName = "Link";
