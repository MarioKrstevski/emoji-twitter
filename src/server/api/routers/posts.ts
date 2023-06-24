import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { clerkClient } from "@clerk/nextjs";
import type { User } from "@clerk/nextjs/dist/types/server";
import { TRPCError } from "@trpc/server";
// import { createClerkClient } from "@clerk/nextjs/dist/types/server";

const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    profileImageUrl: user.profileImageUrl,
    emailAddresses: user.emailAddresses,
  };
};
export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 50,
      // where: { authorId: "" },
    });
    const users = (
      await clerkClient.users.getUserList({
        userId: posts.map((post) => post.authorId),
        limit: 50,
      })
    ).map(filterUserForClient);
    return posts.map((post) => {
      const author = users.find((user) => user.id === post.authorId);

      if (!author || !author.emailAddresses) {
        throw new TRPCError({
          message: "Author for post not found",
          code: "INTERNAL_SERVER_ERROR",
        });
      }

      return {
        post,
        author: {
          ...author,
          emailAddresses: author.emailAddresses,
        },
      };
    });
  }),
});
