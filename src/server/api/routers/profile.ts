import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { clerkClient } from "@clerk/nextjs";
import { TRPCError } from "@trpc/server";
import { filterUserForClient } from "@/server/helpers/filterUserForClient";
// import { createClerkClient } from "@clerk/nextjs/dist/types/server";

export const profileRouter = createTRPCRouter({
  getUserByUsername: publicProcedure
    .input(
      z.object({
        username: z.string(),
      })
    )
    .query(async ({ input }) => {
      const [user] = await clerkClient.users.getUserList({
        username: [input.username],
      });
      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "User not found",
        });
      }
      // console.log(user);
      const filteredUser = filterUserForClient(user);
      console.log(filteredUser);
      // we do this because we have a Array for addresses
      return JSON.parse(JSON.stringify(filteredUser));
    }),
});
