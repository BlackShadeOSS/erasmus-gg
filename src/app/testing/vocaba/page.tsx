import Vocaba from "@/components/vocaba/vocaba";

export default function VocabaPage() {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <p>Vocaba test</p>
            <Vocaba width={100} height={100}></Vocaba>
        </div>
    );
}
