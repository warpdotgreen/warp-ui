import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="bg-zinc-950 text-zinc-300 min-h-screen px-16 py-8">
      <p>Oops, the dev did not have time to develop this page yet. Please use the link below to navigate something that might be working (or not).</p>
      <Link href="/bridge" className="underline hover:text-zinc-100">Charles</Link>
    </div>
  );
}
