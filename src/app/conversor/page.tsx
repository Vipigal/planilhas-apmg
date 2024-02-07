"use client";

import { FileInput } from "@/components/ui/FileInput";
import Loader from "@/components/ui/Loader";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
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

  const handleSubmitFiles = async (spreadsheets: SpreadSheet[]) => {
    try {
      setIsUploadLoading(true);
      for (const spreadsheet of spreadsheets) {
        const file = spreadsheet.content;

        const formData = new FormData();

        formData.append("file", file);
        if (spreadsheet.headerSettings) {
          formData.append(
            "settings",
            JSON.stringify(spreadsheet.headerSettings)
          );
        }

        fetch(`/api/convertFile`, {
          method: "POST",
          body: formData,
        })
          .then(async (res) => {
            if (res.ok) {
              const blob = await res.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${file.name.trim().concat(`_convertido`)}.xlsx`;
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
            } else {
              throw new Error("Erro na conversão");
            }
          })
          .catch((err) => {
            throw err;
          });
      }
      //limpar array
      spreadsheets = [];
      setIsUploadLoading(false);
    } catch (err) {
      toast.error(`Erro na conversão: ${(err as Error).message}`, {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col items-center gap-28 h-full">
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="flex flex-col items-center gap-3 w-fit max-w-[70vw] border border-gray-500 p-10 backdrop-blur-3xl">
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
