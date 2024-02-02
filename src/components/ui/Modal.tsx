import { ReactNode, useEffect, useRef } from "react";
import { Button } from "./Button";

interface Props {
  opened: boolean;
  closeModal: () => void;
  onSubmit: () => void;
  children: ReactNode;
  className?: string;
}

function Modal({ opened, closeModal, children, className, onSubmit }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (opened) {
      ref.current?.showModal();
    } else {
      ref.current?.close();
    }
  }, [opened]);

  return (
    <dialog ref={ref} onCancel={closeModal} className={className}>
      {children}
      <div className="flex gap-2 justify-between w-full p-2">
        <Button
          onClick={() => {
            onSubmit();
            closeModal();
          }}
          variant={"outline"}
          className="w-full border-green-600 text-green-600 hover:bg-gray-100"
        >
          Salvar e Fechar
        </Button>

        <Button
          onClick={closeModal}
          variant={"outline"}
          color="red"
          className="w-full border-red-600 text-red-600 hover:bg-gray-100"
        >
          Cancelar
        </Button>
      </div>
    </dialog>
  );
}

export default Modal;
