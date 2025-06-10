import { LineShadowText } from "@/components/ui/line-shadow-text";

export default function Home() {
  return (
    <main>
      <div></div>
      <h1 className="text-8xl w-full font-bold text-center my-10">
        Ucz się
        <LineShadowText className="mx-4 italic text-yellow-200 ">
          efektywniej
        </LineShadowText>
      </h1>
    </main>
  );
}
