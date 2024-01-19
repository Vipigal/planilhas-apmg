"use client";

import { IconFileSpreadsheet, IconX } from "@tabler/icons-react";
import { ChangeEvent, useState, useTransition } from "react";
import { ToastContainer } from "react-toastify";

interface Props {
  submitAction: (files: File[]) => Promise<void>;
  actionForm: (formdata: FormData) => Promise<void>;
}

export function FileInput({ submitAction, actionForm }: Props) {
  const MAX_FILES = 10;
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [fileLimit, setFileLimit] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleUploadFiles = (files: File[]) => {
    const uploaded = [...uploadedFiles];
    let limitExceeded = false;
    files.some((file) => {
      if (uploaded.findIndex((f) => f.name === file.name) === -1) {
        uploaded.push(file);
        if (uploaded.length === MAX_FILES) setFileLimit(true);
        if (uploaded.length > MAX_FILES) {
          setFileLimit(false);
          // toast.error("O máximo de arquivos foi excedido!", {
          //   position: "top-center",
          //   autoClose: 2000,
          //   hideProgressBar: true,
          //   closeOnClick: true,
          //   pauseOnHover: true,
          //   draggable: true,
          //   progress: undefined,
          //   theme: "light",
          // });
          limitExceeded = true;
          return true;
        }
      }
    });
    if (!limitExceeded) setUploadedFiles(uploaded);
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
      const formData = new FormData();
      for (const file of uploadedFiles) {
        formData.append("files", file);
      }
      await actionForm(formData);
    });
  };

  return (
    <div className="flex flex-col gap-4">
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
          className="border border-white px-3 py-1 rounded-md"
          onClick={onClick}
          disabled={isPending}
        >
          ENVIAR
        </button>
      </form>
      <div className="flex flex-col gap-3 overflow-auto">
        {uploadedFiles.map((file, idx) => {
          return (
            <div key={idx} className="flex justify-between gap-2 items-center ">
              <div className="flex gap-1">
                <IconFileSpreadsheet color="green" />
                {file.name.split(".")[0]}
              </div>
              <IconX
                color="gray"
                className="cursor-pointer"
                size={20}
                onClick={() => {
                  setFileLimit(false);
                  setUploadedFiles((prev) =>
                    prev.filter((_, index) => index !== idx)
                  );
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
