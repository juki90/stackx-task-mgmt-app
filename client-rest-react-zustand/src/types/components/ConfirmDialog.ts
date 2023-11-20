export interface IConfirmDialog {
    title: string;
    isModalOpen: boolean;
    description: string;
    errorMessage?: string;
    handleConfirm: () => Promise<void>;
    handleCloseModal: () => void;
}
