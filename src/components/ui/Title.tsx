import { ReactNode } from "react";

interface Props {
  content?: string;
  children?: ReactNode;
}

export default function Title({ content, children }: Props) {
  return <h1 className="font-bold text-6xl">{children || content}</h1>;
}
