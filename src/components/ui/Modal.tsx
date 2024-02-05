import { ReactNode, useEffect, useRef, useState } from "react";
import { Button } from "./Button";
import { TailSpin } from "react-loader-spinner";

interface Props {
  opened: boolean;
  closeModal: () => void;
  onSubmit: () => void;
  children: ReactNode;
  className?: string;
}

function Modal({ opened, closeModal, children, className, onSubmit }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (opened) {
      ref.current?.showModal();
    } else {
      ref.current?.close();
    }
  }, [opened]);

  return (
    <dialog ref={ref} onCancel={closeModal} className={className}>
      {isLoading ? (
        <div className="w-full min-w-[60vw] max-h-[80vh] flex items-center justify-center p-8 gap-2 overflow-auto">
          <TailSpin
            visible={true}
            height="80"
            width="80"
            color="#000000"
            ariaLabel="tail-spin-loading"
            radius="1"
          />
        </div>
      ) : (
        children
      )}
      <div className="flex gap-2 justify-between w-full p-2">
        <Button
          onClick={closeModal}
          variant={"outline"}
          color="red"
          className="w-full border-red-600 text-red-600 hover:bg-gray-100"
        >
          Cancelar
        </Button>

        <Button
          onClick={() => {
            setIsLoading(true);
            setTimeout(() => {
              onSubmit();
              closeModal();
              setIsLoading(false);
            }, 250);
          }}
          variant={"outline"}
          className="w-full border-green-600 text-green-600 hover:bg-gray-100"
        >
          Salvar e Fechar
        </Button>
      </div>
    </dialog>
  );
}

export default Modal;
