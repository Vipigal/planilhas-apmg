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

  const isLetter = (char: string): boolean => {
    return char.length === 1 && /[a-zA-Z]/.test(char);
  };

  const converterArquivo = async (
    workbook: XLSX.WorkBook,
    newFileName: string
  ) => {
    const prepositions = ["da", "de", "do", "dos", "das", "e"];
    const permitidas = ["APM", "MG"];
    const sheetNames = workbook.SheetNames;

    const worksheet = workbook.Sheets[sheetNames[0]];
    // const data = XLSX.utils.sheet_to_json(worksheet);
    // Função para aplicar as regras de conversão em uma célula
    const converterCelula = (cell: XLSX.CellObject): string => {
      let value = cell.v?.toString().toLowerCase().trim();

      // Verifica se a célula está vazia
      if (!value) return "";

      // Divide o valor em palavras
      const words = value.split(/\s+/);

      // Aplica as regras para cada palavra
      const convertedWords = words.map((word, index) => {
        // Verifica se a palavra é uma preposição em português
        if (prepositions.includes(word)) {
          return word;
        }
        // Verifica se a palavra é uma sigla permitida
        else if (permitidas.includes(word.toUpperCase())) {
          return word.toUpperCase();
        }
        // Mantém a primeira letra maiúscula para as demais palavras buscando comecar com uma letra sempre
        else {
          let indexLetra = 0;
          while (
            indexLetra < word.length &&
            !isLetter(word.charAt(indexLetra))
          ) {
            indexLetra++;
          }
          if (indexLetra < word.length) {
            return (
              word.substring(0, indexLetra) +
              word[indexLetra].toUpperCase() +
              word.substring(indexLetra + 1)
            );
          }
          return word.charAt(0).toUpperCase() + word.slice(1);
        }
      });

      // Junta as palavras de volta em uma string
      return convertedWords.join(" ");
    };

    // Percorre todas as células da planilha
    for (const cellRange in worksheet) {
      if (!cellRange.startsWith("!")) {
        const cell = worksheet[cellRange];
        // Verifica se a célula contém texto
        if (cell.t === "s") {
          // Converte o texto da célula
          cell.v = converterCelula(cell);
        }
      }
    }

    // Salva o novo workbook em um arquivo
    XLSX.writeFile(workbook, `${newFileName}.xlsx`);
  };

  const handleSubmitFiles = async (spreadsheets: SpreadSheet[]) => {
    setIsUploadLoading(true);
    let index = 0;
    for (const spreadsheet of spreadsheets) {
      const file = spreadsheet.content;
      const fileBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(fileBuffer);
      await converterArquivo(
        workbook,
        `${file.name.split(`.`)[0].trim().concat(`_convertido`)}` ||
          `planilha-convertida-${index}`
      );
      index++;
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
