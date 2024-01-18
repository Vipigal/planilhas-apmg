import GenericLink from "@/components/ui/GenericLink";

export default function Home() {
  return (
    <div className="h-full flex justify-center items-center">
      <GenericLink href={"/conversor"}>
        Conversor Maiúsculas para Minúsculas
      </GenericLink>
    </div>
  );
}
