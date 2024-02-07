import { HeaderSettings } from "@/app/conversor/page";
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

const isLetter = (char: string): boolean => {
  return char.length === 1 && /[a-zA-Z]/.test(char);
};

const converterArquivo = async (
  file: File,
  newFileName: string,
  headers: HeaderSettings[] | null
) => {
  try {
    const fileBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(fileBuffer);

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
    const wbBlob = new Blob([XLSX.write(workbook, { type: "buffer" })], {
      type: "application/octet-stream",
    });
    return wbBlob;
  } catch (e) {
    throw e;
  }
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const settings = formData.get("settings");
    let headerSetting: HeaderSettings[] | null = null;
    if (settings && typeof settings === "string") {
      headerSetting = JSON.parse(settings) as HeaderSettings[];
    }
    console.log(headerSetting);
    if (!file) throw new Error("Could not retrieve file");
    const newFileName = `${file.name
      .split(`.`)[0]
      .trim()
      .concat(`_convertido`)}`;
    const wb = await converterArquivo(file, newFileName, headerSetting);

    return new Response(wb, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="${newFileName}.xlsx"`,
      },
    });
  } catch (err) {
    return NextResponse.json(`Error: ${(err as Error).message}`, {
      status: 500,
    });
  }
}
