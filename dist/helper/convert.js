export const createNameFromEmail = (email) => {
    if (!email)
        return `user${Math.floor(Math.random() * 9000)}`;
    const local = email.split('@')[0];
    return `${local}${Math.floor(Math.random() * 9000)}`;
};
//# sourceMappingURL=convert.js.map