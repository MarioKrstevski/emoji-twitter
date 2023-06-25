import Head from "next/head";
import type {
  GetStaticProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { api } from "@/utils/api";
import LoadingSpinner from "@/components/loading";
import { appRouter } from "@/server/api/root";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { prisma } from "@/server/db";
import superjson from "superjson";
import PageLayout from "@/components/layout";
import Image from "next/image";

type PageProps = InferGetServerSidePropsType<typeof getStaticProps>;

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { isLoading, data } = api.profile.getUserByUsername.useQuery({
    username,
  });

  if (isLoading) {
    console.log("never should be called");
    return <LoadingSpinner />;
  }

  if (!data) {
    return <div>404</div>;
  }
  return (
    <>
      <Head>
        <title>{username}'s Profile</title>
      </Head>
      <PageLayout>
        <div className="bg-slate relative h-36 border-slate-400">
          <Image
            className="absolute bottom-0 left-0 -mb-[28px] ml-4 rounded-full border-4 border-black bg-black"
            src={data.profileImageUrl}
            alt={data.username + "s Profile Pic"}
            width={128}
            height={128}
          />
        </div>
        <div className="h-[64px]"></div>
        <div className="p-4 text-2xl font-bold">@{data.username}</div>
        <div className="border-slate w-full border-b"></div>
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: {
      prisma,
      userId: null,
    },
    transformer: superjson,
  });

  const slug = context.params?.slug;

  if (typeof slug !== "string") {
    throw new Error("no slug");
  }
  const username = slug.replace("@", "");

  ssg.profile.getUserByUsername.prefetch({ username });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username,
    },
  };
};

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};
export default ProfilePage;
