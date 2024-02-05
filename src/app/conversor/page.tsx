"use client";

import { FileInput } from "@/components/ui/FileInput";
import Loader from "@/components/ui/Loader";
import { useState } from "react";
import * as XLSX from "xlsx";

export interface HeaderSettings {
  title: string;
  enabled: boolean;
}

export interface SpreadSheet {
  content: File;
  headerSettings: HeaderSettings[] | null;
}

export default function Conversor() {
  const [isUploadLoading, setIsUploadLoading] = useState(false);

  const converterArquivo = async (workbook: XLSX.WorkBook) => {
    const prepositions = ["da", "de", "do", "dos", "das", "e"];
    const permitidas = ["APM", "MG"];
    const sheetNames = workbook.SheetNames;

    const worksheet = workbook.Sheets[sheetNames[0]];
    console.log(worksheet);
  };

  const handleSubmitFiles = async (spreadsheets: SpreadSheet[]) => {
    setIsUploadLoading(true);
    for (const spreadsheet of spreadsheets) {
      const file = spreadsheet.content;
      const fileBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(fileBuffer);
      await converterArquivo(workbook);
    }
    //limpar array
    spreadsheets = [];
    setIsUploadLoading(false);
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
      {isUploadLoading ? (
        <Loader />
      ) : (
        <FileInput handleSubmit={handleSubmitFiles} />
      )}
    </div>
  );
}
