import Image from "next/image";
import Link from "next/link";
import monke from "@/lib/monke.gif";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center px-4">
      <div className="text-center space-y-8 max-w-2xl">
        {/* 404 Number */}
        <h1 className="text-8xl sm:text-9xl font-bold text-neutral-200">404</h1>

        {/* Monkey GIF */}
        <div className="flex justify-center">
          <div className="relative w-48 h-48 sm:w-64 sm:h-64">
            <Image
              src={monke}
              alt="Lost monkey"
              fill
              className="object-cover"
              unoptimized
              priority
            />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-3">
          <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-100">
            Strona nie znaleziona
          </h2>
          <p className="text-base sm:text-lg text-neutral-400">
            Strona, której szukasz, nie istnieje
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Link
            href="/"
            className="px-6 py-3 bg-amber-200 hover:bg-amber-300 text-neutral-900 rounded-lg font-medium transition-colors duration-200"
          >
            Strona główna
          </Link>

          <Link
            href="/dashboard"
            className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 rounded-lg font-medium transition-colors duration-200"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
