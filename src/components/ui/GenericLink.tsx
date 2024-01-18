import Link from "next/link";
import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface Props {
  children?: ReactNode;
  href: string;
  className?: string;
}

export default function GenericLink({ children, href, className }: Props) {
  const customClassName = twMerge(
    "bg-white text-black p-10 hover:bg-gray-200 inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium",
    className
  );
  return (
    <Link className={customClassName} href={href}>
      {children}
    </Link>
  );
}
