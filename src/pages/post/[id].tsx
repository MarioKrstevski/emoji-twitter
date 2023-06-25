import Head from "next/head";
import { type NextPage } from "next";

const SinglePostPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Post</title>
      </Head>
      <main className="flex h-screen justify-center ">
        <div>Post view</div>
      </main>
    </>
  );
};
export default SinglePostPage;
