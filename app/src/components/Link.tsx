import { forwardRef } from "react";

export interface LinkProps {
  to: string;
  children?: React.ReactNode;
}

export const Link = forwardRef(
  (
    { to, children, ...rest }: LinkProps,
    ref: React.ForwardedRef<HTMLAnchorElement>,
  ) => (
    <a ref={ref} href={to} target="_blank" rel="noopener noreferrer" {...rest}>
      {children}
    </a>
  ),
);
