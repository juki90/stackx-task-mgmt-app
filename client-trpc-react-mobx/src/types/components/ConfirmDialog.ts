export interface IConfirmDialog {
    title: string;
    isDialogOpen: boolean;
    description: string;
    errorMessage?: string;
    handleConfirm: () => Promise<void | unknown>;
    handleCloseDialog: (() => void) | undefined;
}
