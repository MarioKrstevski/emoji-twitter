import { createServerSideHelpers } from "@trpc/react-query/server";
import { prisma } from "@/server/db";
import superjson from "superjson";
import { appRouter } from "@/server/api/root";

export const generateSSGHelper = () => {
  return createServerSideHelpers({
    router: appRouter,
    ctx: {
      prisma,
      userId: null,
    },
    transformer: superjson,
  });
};
