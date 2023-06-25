import { z } from "zod";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { clerkClient } from "@clerk/nextjs";
import { TRPCError } from "@trpc/server";
import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis";
import { filterUserForClient } from "@/server/helpers/filterUserForClient";
import { Post } from "@prisma/client";
// import { createClerkClient } from "@clerk/nextjs/dist/types/server";

// Create a new ratelimiter, that allows 3 requests per 1 minute
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
  /**
   * Optional prefix for the keys used in redis. This is useful if you want to share a redis
   * instance with other applications and want to avoid key collisions. The default prefix is
   * "@upstash/ratelimit"
   */
  prefix: "@upstash/ratelimit",
});

const addUserDataToPosts = async (posts: Post[]) => {
  const users = (
    await clerkClient.users.getUserList({
      userId: posts.map((post) => post.authorId),
      limit: 50,
    })
  ).map(filterUserForClient);
  return posts.map((post) => {
    const author = users.find((user) => user.id === post.authorId);

    if (!author || !author.emailAddresses || !author.username) {
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
        username: author.username,
      },
    };
  });
};
export const postsRouter = createTRPCRouter({
  getProfileByUserId: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.post
        .findMany({
          where: {
            authorId: input.userId,
          },
          take: 50,
          orderBy: [{ createdAt: "desc" }],
        })
        .then(addUserDataToPosts);
    }),
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 50,
      orderBy: [
        {
          createdAt: "desc",
        },
      ],
      // where: { authorId: "" },
    });
    return addUserDataToPosts(posts);
  }),
  create: privateProcedure
    .input(
      z.object({
        content: z.string().emoji("Only emojis are allowed!").min(1).max(280),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;

      const { success } = await ratelimit.limit(authorId);

      if (!success) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
      }

      const post = await ctx.prisma.post.create({
        data: {
          authorId,
          content: input.content,
        },
      });

      return post;
    }),
});
