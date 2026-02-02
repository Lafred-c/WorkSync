import type {ButtonHTMLAttributes, ReactNode} from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  className?: string;
  textOnly?: boolean;
};

function Button({
  children,
  className = "",
  textOnly = false,
  ...props
}: ButtonProps) {
  const baseClass = textOnly ? "text-button" : "button";
  const cssClasses = `${baseClass} ${className}`.trim();

  return (
    <button className={cssClasses} {...props}>
      {children}
    </button>
  );
}

export {Button};
