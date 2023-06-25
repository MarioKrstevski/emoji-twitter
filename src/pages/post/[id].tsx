import Head from "next/head";
import type {
  GetStaticProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { api } from "@/utils/api";
import LoadingSpinner, { LoadingPage } from "@/components/loading";

import PageLayout from "@/components/layout";
import Image from "next/image";
import { PostView } from "@/components/postview";
import { generateSSGHelper } from "@/server/helpers/ssgHelper";

const SinglePostPage: NextPage<{ id: string }> = ({ id }) => {
  const { isLoading, data } = api.posts.getById.useQuery({
    id,
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
        <title>
          {data.post.content} - {data.author.username}
        </title>
      </Head>
      <PageLayout>
        <PostView {...data} />
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();
  const id = context.params?.id;
  if (typeof id !== "string") {
    throw new Error("no id");
  }

  let post = await ssg.posts.getById.prefetch({ id });
  console.log({ post });
  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
    },
  };
};

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};
export default SinglePostPage;
