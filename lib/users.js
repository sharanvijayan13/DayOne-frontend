const users = [];

export const findUserByEmail = (email) =>
  users.find((user) => user.email === email);

export const createUser = (email, hashedPassword) => {
  const newUser = {
    id: Date.now().toString(),
    email,
    password: hashedPassword,
  };
  users.push(newUser);
  return newUser;
};
