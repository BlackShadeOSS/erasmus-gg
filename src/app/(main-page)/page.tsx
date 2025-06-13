import NavBar from "@/components/NavBar";
import { LineShadowText } from "@/components/ui/line-shadow-text";

export default function Home() {
  return (
    <div className="relative">
      <NavBar />

      <main>
        <section className="h-screen flex flex-col items-center justify-center">
          <h1 className="text-7xl w-full font-bold text-center text-white">
            Ucz się z <br />
            <LineShadowText className="mx-2 italic">Vocenglish</LineShadowText>
          </h1>
        </section>

        <section className="bg-gray-100 text-gray-900 p-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-semibold mb-4">
              dalsza czesc strony etc etc.
            </h2>
            <p className="mb-4">
              BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA
              BLA BLA BLA BLA BLA BLA BLA BLA BLA
            </p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce ac
              justo ut eros ornare malesuada.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
