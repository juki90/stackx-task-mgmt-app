export const ROLE_NAMES = {
    USER: 'user',
    ADMIN: 'admin'
};

export const USER = {
    SELECTABLE_FIELDS: {
        id: true,
        firstName: true,
        lastName: true,
        fullName: true,
        password: false,
        createdById: true,
        roleId: true,
        email: true,
        deletedAt: true,
        createdAt: true,
        updatedAt: true
    }
};

export const ROLE = {
    SELECTABLE_FIELDS: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true
    },
    NAMES: {
        USER: 'user',
        ADMIN: 'admin'
    }
};

export const TASK = {
    SELECTABLE_FIELDS: {
        id: true,
        title: true,
        description: true,
        usersStatus: true,
        status: true
    },
    STATUS: {
        DONE: 1,
        PENDING: 0,
        CANCELLED: -1
    }
};
