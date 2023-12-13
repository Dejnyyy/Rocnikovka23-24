import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";

import { api } from "~/utils/api";
//planetscale
import { PrismaClient } from '@prisma/client';
import Header from './components/Header';
import HamburgerMenu from "./components/HamburgerMenu";
/*const prisma = new PrismaClient()

async function main() {
  // ... you will write your Prisma Client queries here
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
*/
//planetscale*

export default function Home() {
  const hello = api.post.hello.useQuery({ text: "from tRPC" });
  const { data: sessionData } = useSession();

  return (
    <>
      <Head>
        <title>HearMe</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className=" flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#481b48] to-[#000000]">      
      {sessionData && <HamburgerMenu />}
      {sessionData && <div className="text-white font-mono font-semibold mb-5 text-lg">Hello, <span className="underline cursor-pointer">{sessionData.user?.name}</span>   welcome to My App</div>}
      <AuthShowcase />
      </main>
    </>
  );
}

function AuthShowcase() {
  const { data: sessionData } = useSession();

  const { data: secretMessage } = api.post.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined }
  );

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-white">
        {sessionData && 
        <div>
          {/*<span>Logged in as {sessionData.user?.name}</span>*/}
          <Image
            className="rounded-2xl  m-auto"
            src={sessionData.user?.image ?? ""}
            alt={"pfp of user" + sessionData.user?.name}
            width={250}
            height={250}
          />
        </div>
        }
        {secretMessage && <span> - {secretMessage}</span>}
      </p>
      <button
        className="rounded-full bg-purple-800 px-10 py-3 font-mono font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={sessionData ? () => void signOut() : () => void signIn("spotify")}
      >
        {sessionData ? "Sign out" : "Sign in via Spotify"}
      </button>
    </div>
  );
}
