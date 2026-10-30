import Link from "next/link";

export default function Home() {

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold text-[#4040d3]">
        SWA     </h1>

      <p className="mt-4 text-lg text-[#9292df]">
        Mechine test
      </p>

      <Link
        href="/product"
        className="mt-6 rounded-lg bg-[#5a5a91] px-6 py-3 text-white hover:bg-[#5252b6]"
      >
        Get Started
      </Link>
    </main>
  );
}