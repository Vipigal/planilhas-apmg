"use client";

import { FileInput } from "@/components/ui/FileInput";
import Loader from "@/components/ui/Loader";
import { useState } from "react";
import { ToastContainer } from "react-toastify";
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
    newFileName: string,
    headers: HeaderSettings[] | null
  ) => {
    const prepositions = new Set(["da", "de", "do", "dos", "das", "e"]);
    const permitidas = new Set(["APM", "MG"]);
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
        if (prepositions.has(word)) {
          return word;
        }
        // Verifica se a palavra é uma sigla permitida
        else if (permitidas.has(word.toUpperCase())) {
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
      if (!cellRange.startsWith("!") && cellRange.replace(/\D+/g, "") !== "1") {
        const cell = worksheet[cellRange];
        // Verifica se a célula contém texto
        if (cell.t === "s") {
          const columnName = cellRange.match(/[A-Z]+/)?.[0];
          // Verifica se há uma configuração para a coluna atual
          if (columnName) {
            const headerIndex = columnName.charCodeAt(0) - 65; // Convertendo a letra da coluna para um índice (A -> 0, B -> 1, etc.)
            const headerSetting = headers && headers[headerIndex];
            if ((headerSetting && headerSetting.enabled) || !headerSetting) {
              // Converte o texto da célula se a configuração estiver habilitada
              cell.v = converterCelula(cell);
            }
          }
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
          `planilha-convertida-${index}`,
        spreadsheet.headerSettings
      );
      index++;
    }
    //limpar array
    spreadsheets = [];
    setIsUploadLoading(false);
  };

  return (
    <div className="flex flex-col items-center gap-40 h-full">
      <ToastContainer />
      <div className="flex flex-col items-center gap-5 w-fit max-w-[70vw] border mt-10 border-gray-500 p-10">
        <h1 className="text-xl">Como funciona:</h1>
        <div>
          <ul className="list-disc gap-2 flex flex-col leading-7">
            <li>
              Clique no botão abaixo e selecione as planilhas do excel que
              deseja converter (máximo 10 planilhas);
            </li>
            <li>
              Selecione, após o processamento inicial das planilhas, quais
              colunas deseja converter o conteúdo para minúsculo;
            </li>
            <li>
              Deixe o site aberto enquanto o processamento é feito e aguarde a
              conversão. As planilhas convertidas serão baixadas
              automaticamente.{" "}
              <strong>
                (Talvez seja necessario permitir o download de multiplos
                arquivos no Browser!)
              </strong>
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
