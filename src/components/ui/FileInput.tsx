"use client";

import { ChangeEvent, useState } from "react";

interface Props {
  submitAction: (formdata: FormData) => Promise<void>;
}

export function FileInput({ submitAction }: Props) {
  const MAX_FILES = 10;
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [fileLimit, setFileLimit] = useState(false);

  const handleUploadFiles = (files: File[]) => {
    const uploaded = [...uploadedFiles];
    let limitExceeded = false;
    files.some((file) => {
      if (!uploaded.find((f) => f.name === file.name)) {
        uploaded.push(file);
        if (uploaded.length === MAX_FILES) setFileLimit(true);
        if (uploaded.length > MAX_FILES) {
          setFileLimit(false);
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

  return (
    <div>
      <form action={submitAction} className="flex flex-col items-center gap-5">
        <label
          htmlFor="fileUpload"
          className="cursor-pointer underline hover:text-gray-300"
        >
          Escolher arquivos
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
        />
        <button type="submit" className="border border-white px-2 rounded-md">
          enviar
        </button>
      </form>
      <div>
        {uploadedFiles.map((file, idx) => {
          return <div key={idx}>{file.name}</div>;
        })}
      </div>
    </div>
  );
}
