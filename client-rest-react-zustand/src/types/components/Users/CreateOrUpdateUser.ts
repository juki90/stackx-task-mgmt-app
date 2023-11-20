import type { User } from '@/types/models';

export interface ICreateOrUpdateUser {
    user?: User | null | undefined;
    isModalOpen?: boolean;
    handleCloseModal: () => void;
}
