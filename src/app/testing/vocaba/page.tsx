import Vocaba from "@/components/vocaba/vocaba";

export default function VocabaPage() {
  return (
    <html lang="en">
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Vocaba</title>
    </head>
    <body>
        <p>Vocaba test</p>
        <Vocaba width={100} height={100}></Vocaba>
    </body>
    </html>
  );
}