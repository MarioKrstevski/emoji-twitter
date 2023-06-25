import { User } from "@clerk/nextjs/dist/types/server";

export const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    profileImageUrl: user.profileImageUrl,
    // emailAddresses: JSON.parse(JSON.stringify(user.emailAddresses)),
  };
};
