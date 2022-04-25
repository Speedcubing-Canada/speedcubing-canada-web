export interface LinkProps {
  to: string;
  children?: React.ReactNode;
}

export const Link = ({ to, children, ...rest }: LinkProps) => (
  <a href={to} target="_blank" rel="noopener noreferrer" {...rest}>
    {children}
  </a>
);
