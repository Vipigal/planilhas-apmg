"use client";

import { IconFileSpreadsheet, IconSettings, IconX } from "@tabler/icons-react";
import { ChangeEvent, useEffect, useState, useTransition } from "react";
import { ToastContainer, toast } from "react-toastify";
import Modal from "./Modal";
import { read, utils as xlsxUtils } from "xlsx";
import { Checkbox } from "./Checkbox";
import Loader from "./Loader";
import { HeaderSettings, SpreadSheet } from "@/app/conversor/page";

interface Props {
  handleSubmit: (spreadsheets: SpreadSheet[]) => Promise<void>;
}

export function FileInput({ handleSubmit }: Props) {
  const MAX_FILES = 10;
  const [fileLimit, setFileLimit] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [fileSettings, setFileSettings] = useState<File | null>(null);
  const [headerInfo, setHeaderInfo] = useState<HeaderSettings[] | null>(null);

  const [spreadsheets, setSpreadsheets] = useState<SpreadSheet[]>([]);

  const handleUploadFiles = (files: File[]) => {
    const uploaded = [...spreadsheets];
    let limitExceeded = false;
    files.some((file) => {
      if (uploaded.findIndex((f) => f.content.name === file.name) === -1) {
        uploaded.push({ content: file, headerSettings: null });
        if (uploaded.length === MAX_FILES) setFileLimit(true);
        if (uploaded.length > MAX_FILES) {
          setFileLimit(false);
          toast.error("O máximo de arquivos foi excedido!", {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
          limitExceeded = true;
          return true;
        }
      }
    });
    if (!limitExceeded) setSpreadsheets(uploaded);
  };

  const handleFileEvent = (e: ChangeEvent<HTMLInputElement>) => {
    const chosenFiles = Array.prototype.slice.call(e.target.files);
    handleUploadFiles(chosenFiles);
  };

  // useEffect(() => {
  //   console.log(uploadedFiles);
  // }, [uploadedFiles]);

  const onClick = () => {
    startTransition(async () => {
      await handleSubmit(spreadsheets);
      setSpreadsheets([]);
    });
  };

  const getHeaderInfo = async (file: File): Promise<string[] | null> => {
    //funcao custosa, evitar
    try {
      const fileBuffer = await file.arrayBuffer();
      const wb = read(fileBuffer, { sheetRows: 1 });

      const firstSheetName = wb.SheetNames[0];
      const worksheet = wb.Sheets[firstSheetName];
      const options = { header: 1 };
      const sheetData2 = xlsxUtils.sheet_to_json(worksheet, options);
      const header = sheetData2.shift();

      if (!Array.isArray(header))
        throw new Error("Falha na conversão do header array");

      return header as string[];
    } catch (e) {
      console.error(e); //toast
      return null;
    }
  };

  useEffect(() => {
    if (fileSettings) {
      const openedSpreadsheet = spreadsheets.find(
        (spreadsheet) => spreadsheet.content.name === fileSettings.name
      );
      const runSettings = async () => {
        const headers = await getHeaderInfo(fileSettings);
        const headerSettings: HeaderSettings[] | null =
          headers?.map((header) => ({ title: header, enabled: true })) || null;
        setHeaderInfo(headerSettings);
      };
      if (openedSpreadsheet && openedSpreadsheet.headerSettings) {
        setHeaderInfo(openedSpreadsheet.headerSettings);
      } else {
        runSettings();
      }
    }
  }, [fileSettings, spreadsheets]);

  return (
    <div className="flex flex-col gap-4">
      <Modal
        opened={fileSettings !== null}
        closeModal={() => {
          setFileSettings(null);
          setHeaderInfo(null);
        }}
        className="bg-white rounded-md backdrop-blur-md"
        onSubmit={() => {
          const newSpreadsheetData: SpreadSheet[] = spreadsheets.map(
            (spreadsheet) => {
              if (spreadsheet.content.name === fileSettings?.name) {
                return { ...spreadsheet, headerSettings: headerInfo };
              } else {
                return spreadsheet;
              }
            }
          );
          setSpreadsheets(newSpreadsheetData);
          setHeaderInfo(null);
        }}
      >
        <div className="flex flex-col w-full min-w-[60vw] max-h-[80vh] justify-center p-8 gap-2 ">
          <span className="font-bold text-xl">
            Selecione quais colunas deverão ser convertidas:
          </span>

          <hr className="w-full h-2" />
          <div className="flex flex-col gap-2 overflow-auto">
            {headerInfo ? (
              headerInfo.map((header, idx) => {
                return (
                  <div key={idx} className="flex gap-2">
                    <Checkbox
                      checked={header.enabled}
                      onCheckedChange={(e) => {
                        setHeaderInfo(
                          headerInfo.map((oldHeader) => {
                            if (oldHeader.title === header.title) {
                              return { ...header, enabled: Boolean(e) };
                            } else {
                              return oldHeader;
                            }
                          })
                        );
                      }}
                    />
                    <span>{header.title}</span>
                  </div>
                );
              })
            ) : (
              <div className="flex self-center justify-self-center ">
                <Loader />
              </div>
            )}
          </div>
        </div>
      </Modal>

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
      <form className="flex flex-col items-center gap-5">
        <label
          htmlFor="fileUpload"
          className={`${
            fileLimit
              ? "cursor-default text-red-800 no-underline"
              : "cursor-pointer underline hover:text-gray-300"
          } `}
        >
          {fileLimit ? "Máximo de arquivos selecionados" : "Escolher arquivos"}
        </label>
        <input
          id="fileUpload"
          className="hidden"
          type="file"
          name="files"
          multiple
          accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={(e) => {
            handleFileEvent(e);
          }}
          disabled={fileLimit}
          onClick={(e) => ((e.currentTarget.value as string | null) = null)} //lil hack para emitir evento ao adicionar mesmo arquivo
        />
        <button
          className="border border-white px-3 py-1 rounded-md hover:scale-105 transition-all ease-out"
          onClick={onClick}
          disabled={isPending}
        >
          ENVIAR
        </button>
      </form>
      <div className="flex flex-col gap-3 overflow-auto max-h-[15vh] p-4">
        {spreadsheets.map((spreadsheet, idx) => {
          return (
            <div key={idx} className="flex justify-between gap-2 items-center ">
              <div className="flex gap-1">
                <IconFileSpreadsheet color="green" />
                {spreadsheet.content.name.split(".")[0]}
              </div>
              <div className="flex gap-1">
                <IconSettings
                  color="gray"
                  className="cursor-pointer"
                  size={20}
                  onClick={() => {
                    setFileSettings(spreadsheet.content);
                  }}
                />
                <IconX
                  color="gray"
                  className="cursor-pointer"
                  size={20}
                  onClick={() => {
                    setFileLimit(false);
                    setSpreadsheets((prev) =>
                      prev.filter((_, index) => index !== idx)
                    );
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
