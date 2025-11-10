export const createNameFromEmail = (email:string) => {
  if (!email) return `user${Math.floor(Math.random() * 9000)}`;
  const local = email.split('@')[0];
  return `${local}${Math.floor(Math.random() * 9000)}`;
};
