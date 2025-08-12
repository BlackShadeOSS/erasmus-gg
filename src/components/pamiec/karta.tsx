'use client'

let licznik:number = -1;

export default function Karta({id, slowko, jezyk}: {id:number| null, slowko: string, jezyk: "ang" | "pol"}) {

    const nazwaKlasy: string = "karta " + jezyk;

  
  licznik ++;
  return (
    <div className={nazwaKlasy} key={licznik}>
        {slowko}
    </div>
  )
}
