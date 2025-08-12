'use client'
import Plansza from "@/components/pamiec/plansza";
import { createRoot } from 'react-dom/client';
import { ReactElement } from "react";
import "./styles.css";
import { log } from "node:console";

//globals
let planszaPojemnikNode:any;
let planszaEl:any;
let listaSlowek: any;
let pobranoSlowka: boolean = false;
let zapytSkon: boolean = false;

// async function zapytanieApi(url: string, opts?: RequestInit) {
//         const res = await fetch(url, {
//             ...opts,
//             headers: { "Content-Type": "application/json" },

//         });

//         const json = await res.json();
//         return { ok: res.ok, json };

//     }
// //

// try {
//     // const v = await zapytanieApi("/api/user/vocabulary");
//     const v = await zapytanieApi("https://erasmus-gg.vercel.app/api/user/vocabulary");

//     if (v.ok) {console.log("ok")} else {
//     console.log("not ok");
    
//  }
// } catch (error) {
//   console.log("Error");
    
// }
 //TODO api not loaded use the default or smth

 

enum Trudnosc {
    latwa = 1,
    normalna,
    trudna,
    ekspert
}

let trudnosci: {
    key: number,
    nazwa: string,
    rozmiarPlanszy: { // x * y
        x:number, //szerokosc
        y:number // wysokosc
    },
    
}[] = [];


function zapytanieFetch(method:string, url:string, data:any = null) {
    return fetch(url, {
        method: method,
        cache: "no-cache",
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: data ? JSON.stringify(data) : undefined
    });
}

function zacznijGre(e: any) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const formJson = Object.fromEntries(formData.entries());
    let a = (formJson.trudnosc) as string;
    let numTrudnosc = parseInt(a);
    document.getElementById("gameSetUp")!.style.display = "none";
    rysujPlansze(numTrudnosc);
}

function rysujPlansze(trudnosc: number) {
    let nazwaTrudnosci:string = Trudnosc[trudnosc];
    let idTrudnosci = trudnosc;
    let wysokoscPlanszy = trudnosci[idTrudnosci].rozmiarPlanszy.y;
    let szerokoscPlanszy = trudnosci[idTrudnosci].rozmiarPlanszy.x;
    rysujxyKart(wysokoscPlanszy, szerokoscPlanszy);
    
}

/**
 * Rysuje 'karty' w prostokącie
 * @param x - szerosokc
 * @param y - wysokosc
 */

function rysujxyKart(x: number, y: number) {

    // let karty: {
    //     id:string,
    //     html:ReactElement,
    // }[] = [];


    // for (let i = 0; i < x; i++) {
    //     for (let j = 0; j < y; j++) {
    //         // const element = array[j];
    //         // karty.push(Plansza());
    //         let a: ReactElement = <div>amongus {i} and {j}</div>;
    //         // console.log(a);
           
    // document.getElementById("planszaPojemnik")!.innerHTML += a;

    // let iSt:string = i as unknown as string;
    // let jSt:string = j as unknown as string;
    // let id:string = iSt.toString() + jSt.toString();

    //         karty.push({
    //             id: id,
    //             html: <div id={id}>amongus {i} and {j}</div>});
            
    //     }        


    // }

// let planszaPojemnikNode:any = document.getElementById('planszaPojemnik');
// let planszaEl:any = createRoot(planszaPojemnikNode);
planszaPojemnikNode = document.getElementById('planszaPojemnik');
planszaEl = createRoot(planszaPojemnikNode);
   
            planszaEl.render(<Plansza
            szerokosc={x}
            wysokosc={y}
            root={planszaEl}
            />);
//TODO wyświetl próby
            
    
}

export default function pamiec() {
    
    for (let i = 1; i <= Trudnosc.ekspert; i++) {

        let nazwa = Trudnosc[i];

        if (i == Trudnosc.latwa) {
            nazwa = "łatwa";
        }

        trudnosci[i] = {
            key: i,
            nazwa: nazwa,
            rozmiarPlanszy: {
            x: Math.floor((i*5) - (2*i)),
            y: Math.floor((i*5)/(2*i)),
    }
        }
    }

    const listaTrudnosci: ReactElement[] = trudnosci.map((trudnosc, count) => {
        return <option className="bg-transparent" key={count} value={trudnosc.key} >{trudnosc.nazwa}</option>//is this alright???
    });

    //  zapytanieFetch("GET", "https://localhost:3000/api/user/vocabulary")
    // .then(response => response.json())
    // .then(voc => {console.dir(voc)})
    // .catch(error => console.error('Error fetching users:', error));


    return (
       <div className="flex flex-col items-center justify-center min-h-screen p-10">
            <h1 className="text-4xl font-bold text-green-300 mb-10">Pamięć</h1>
            <main id="gameSetUp" className="md:text-base text-2xl">
                <p className="flex flex-col items-center justify-center">Sprawdź swoją pamięć i zdolności językowe!</p>

                <p className="flex flex-col items-center justify-center">Zaleca się rozgrywkę na komputerze.</p>

                <form id="startForm" className="flex flex-col justify-center sm:hidden flex" method="post" onSubmit={zacznijGre}>
                    <h3 className="text-center mt-5">Wybierz trudność:</h3>
                    <select className="text-center max-w-fit m-auto bg-green-900 " name="trudnosc" id="trudnoscSelect">
                        {listaTrudnosci}
                    </select>
                    <button className="mt-4 max-w-fit m-auto bg-green-200 border border-green-900 rounded-[6px] shadow-sm 
           box-border text-black text-[16px] font-bold
            p-3 px-4 hover:bg-transparent hover:text-green-200 hover:border-green-200
           active:opacity-50" type="submit">start</button>
                </form>

                <h3 className="text-green-200 text-center">Jak grać?</h3>
                <p className="2xl:mx-80 sm:mx-36 mx-10 ">Kliknij kartę aby ją odsłonić. Odkryj drugą kartę, jeśli pasują (słówko po angielsku do słówka po polsku) karty znikają z pola. Jeśli nie pasują, zapamiętaj ich pozycję i ich zawartość. Karty zostaną ponownie zakryte i możesz próbować dalej. Gra kończy się gdy pole zostanie oczyszczone z kart lub gdy wszystkie próby zostaną wykorzystane.</p>

                <form id="startForm" className="flex flex-col justify-center hidden sm:flex " method="post" onSubmit={zacznijGre}>
                    <h3 className="text-center mt-5">Wybierz trudność:</h3>
                    <select className="text-center max-w-fit m-auto bg-green-900 " name="trudnosc" id="trudnoscSelect">
                        {listaTrudnosci}
                    </select>
                    <button className="mt-4 max-w-fit m-auto bg-green-200 border border-green-900 rounded-[6px] shadow-sm 
           box-border text-black text-[16px] font-bold
            p-3 px-4 hover:bg-transparent hover:text-green-200 hover:border-green-200
           active:opacity-50" type="submit">start</button>
                </form>

            </main>
            <div id="planszaPojemnik" className="w-screen"></div>
            <div id="wynikiPojemnik" className="flex flex-col items-center justify-center"></div>
        </div>

        
    );
}

