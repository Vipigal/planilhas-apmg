import { FileInput } from "@/components/ui/FileInput";
import * as XLSX from "xlsx";

export default function Conversor() {
  const jsonData: any[] = [];
  const header: any[] = [];

  const uploadFiles = async (formdata: FormData) => {
    "use server";
    const files = formdata.getAll("files") as File[];

    // for(const file of files){
    const fileBuffer = await files[0].arrayBuffer();
    const wb = XLSX.read(fileBuffer);
    // }

    const prepositions = ["da", "de", "do", "dos", "das", "e"];
    const permitidas = ["APM", "MG"];

    const ws = wb.Sheets["Sheet1"];
    console.log(ws);
  };

  return (
    <div className="flex flex-col items-center gap-40 h-full">
      <div className="flex flex-col items-center gap-5 w-fit border mt-10 border-gray-500 p-10">
        <h1 className="text-xl">Como funciona:</h1>
        <div>
          <ul className="list-disc gap-2 flex flex-col">
            <li>
              Clique no botão abaixo e selecione as planilhas do excel que
              deseja converter (máximo 10 planilhas);
            </li>
            <li>
              Selecione, após o processamento das planilhas acabar, quais
              colunas deseja converter o conteúdo para minúsculas;
            </li>
            <li>
              Deixe o site aberto enquanto o processamento é feito e aguarde a
              conversão. As planilhas convertidas serão baixadas
              automaticamente.
            </li>
          </ul>
        </div>
      </div>
      <FileInput submitAction={uploadFiles} />
    </div>
  );
}
