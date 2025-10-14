"use client";
import { ReactElement, useEffect, useState } from "react";
import "@/app/(games)/pamiec/styles.css";
import { Root } from "react-dom/client";
import { useReportProgress } from "@/hooks/useReportProgress";
import { button } from "motion/react-client";

let listaSlowek: { pol: string; ang: string }[] = [];

//global var
const terazOdkryte: HTMLElement[] = [];
let startTime: number = 0;
let liczbaUsunietychKart = 0; //
let proby: number = -1; // proby = ilosckart/2 +1
let licznik: number = 0; //zlicza karty
let licznikPar: number = -1;
const jezyk = {
    ang: "ang",
    pol: "pol",
};
let planszaRoot: Root;
let iloscKart: number;

const rozmiarKartyCSS: string = " min-w-fit m-2 w-1/3 sm:m-4 sm:w-1/5 md:m-3 md:w-1/3 lg:w-1/5 2xl:w-1/8 aspect-square";
const flipCardCSS: string = " bg-transparent ";
const kartaCSS: string =
    " inline-flex items-center justify-center select-none rounded-2xl  ease-in-out text-white border-white/5 backdrop-blur-[25px] bg-origin-border shadow-sm not-disabled:hover:bg-white/90 not-disabled:hover:text-black not-disabled:hover:shadow-button transition-all duration-200 focus-visible:ring-4 focus-visible:ring-white/30 focus-visible:outline-hidden focus-visible:bg-white/90 focus-visible:text-black after:absolute  after:top-[-2px] after:left-[-2px] after:rounded-[1rem] after:bg-repeat after:pointer-events-none text-base font-semibold cursor-pointer rounded-lg ";

const nazwaKlasyKartyPol: string = "karta pol " + kartaCSS + rozmiarKartyCSS;
const nazwaKlasyKartyAng: string = "karta ang " + kartaCSS + rozmiarKartyCSS;
//TODO adjust card size
function stworzKarte(
    id: number,
    slowko: string,
    nazwaKlasy: string,
    jezyk: string = "null",
    idPary: number = -1,
    idwLiscie: number
) {
    licznik++;
    return (
        <div
            
            key={id}
            data-id-w-liscie={idwLiscie}
            data-para={idPary}
            data-odkryta={false}
            className={flipCardCSS + nazwaKlasy + " flip-card"}
            onClick={odkryjKarte}
            data-jezyk={jezyk}
        >
            <div className="flip-card-inner">
                <div
                    className={
                        "flip-card-front " +
                        "bg-neutral-800 select-none rounded-2xl ease-in-out border-white/5 backdrop-blur-[25px] bg-origin-border shadow-sm not-disabled:hover:bg-white/90 not-disabled:hover:text-black not-disabled:hover:shadow-button transition-all duration-200 after:absolute  after:top-[-2px] after:left-[-2px] after:rounded-[1rem] font-semibold   cursor-pointer rounded-lg min-w-fit"
                    }
                ></div>

                <div className="flex flex-col flip-card-back  text-black tekstKarty bg-amber-200">
                    <p className="w-[100%] h-fit text-black">{slowko}</p>
                    <div className="w-[100%] h-fit text-black">({jezyk})</div>
                </div>
            </div>
        </div>
    );
}

/**
 *
 * inkrementuje licznik globalny!
 * @param slowka
 * @returns dwie nowe karty
 */
function stworzPareKart(slowka: { pol: string; ang: string }, idwLiscie = -1) {
    licznikPar++;
    
    return [
        stworzKarte(
            licznik,
            slowka.pol,
            nazwaKlasyKartyPol,
            jezyk.pol,
            licznikPar,
            idwLiscie
        ),
        stworzKarte(
            licznik,
            slowka.ang,
            nazwaKlasyKartyAng,
            jezyk.ang,
            licznikPar,
            idwLiscie
        ),
    ];
}

function losujMiejscaKart(karty: any[], sila: number = 3) {
    for (let i = 0; i < karty.length * sila; i++) {
        let losowyElement = losowaLiczbaCalkowita(0, karty.length - 1);
        let losowaPozycja = losowaLiczbaCalkowita(0, karty.length - 1);

        while (losowyElement == losowaPozycja) {
            losowyElement = losowaLiczbaCalkowita(0, karty.length - 1);
            losowaPozycja = losowaLiczbaCalkowita(0, karty.length - 1);
        }

        const temp: ReactElement = karty[losowaPozycja];
        karty[losowaPozycja] = karty[losowyElement];
        karty[losowyElement] = temp;
    }
}

function losowaLiczbaCalkowita(min: number, max: number) {
    //inclusive
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // The maximum is inclusive and the minimum is inclusive
}

function sprawdzJezykKarty(karta: any) {
    return karta.getAttribute("data-jezyk");
}

function usunPareKart(karta1: any, karta2: any) {
    karta1.parentElement!.parentElement!.style.visibility = "hidden";
    karta2.parentElement!.parentElement!.style.visibility = "hidden";
    liczbaUsunietychKart += 2;
    let zostalo = document.getElementById("zostaloKart")
        ?.innerText as unknown as number;
    zostalo -= 2;
    if (document.getElementById("zostaloKart") != undefined) {
        document.getElementById("zostaloKart")!.innerText =
            zostalo as unknown as string;
    }

    while (terazOdkryte.length > 0) {
        terazOdkryte!.pop()!.setAttribute("data-odkryta", "false");
    }

    if (liczbaUsunietychKart == licznik) {
        koniecGry();
        return 0;
    }
}

//onclick
let ostatniaKarta: any; //ostatnia odwrócona karta
function odkryjKarte(e: any) {
    //!first we chech aganinst the pair id
    // if (e.ctrlKey) {
    //     koniecGry(false); //debug;
    // }
    const element = e.target;

    if (
        ostatniaKarta &&
        ostatniaKarta.parentElement.parentElement ==
            element.parentElement.parentElement
    ) {
        //ta sama pod rząd
        if (terazOdkryte[0] || terazOdkryte[1]) {
            return -2;
        }
    }

    ostatniaKarta = element;

    const jezykKarty: string =
        element.parentElement.parentElement.getAttribute("data-jezyk");
    const idPary: string =
        element.parentElement.parentElement.getAttribute("data-para");
    const idWliscieTeraz: string =
        element.parentElement.parentElement.getAttribute("data-id-w-liscie");
    const kartaOdkryta: boolean =
        element.getAttribute("data-odkryta") == "true" ? true : false;
    const rot180 = "rotateY(180deg)";
    const rot0 = "rotateY(0deg)";

    if (element == terazOdkryte[0]) {
        return -1;
    }

    if (idPary == null) {
        console.log("couldnt get id Pary");

        return -1;
    }

    if (!kartaOdkryta) {
        terazOdkryte.push(element);
        element.setAttribute("data-odkryta", "true");
    } else {
        return -1;
    }

    if (terazOdkryte.length > 2) {
        // terazOdkryte[0].parentElement.style.transfrom = "rotateY(0deg)";
    } else {
        if (element.classList[0].includes("flip-card")) {
            const transform = element.parentElement.style;

            if (transform.transform == rot180) {
                transform.transform = rot0; //odwracanie
            } else {
                transform.transform = rot180; //odwracanie
            }
        }

        if (terazOdkryte.length == 2) {
            setTimeout(() => {
                console.log("CHEKNING CARDS....");
                
                const idPary_teraz: string = idPary;
                const idPary_poprzednie: string | null = terazOdkryte[0]!.parentElement!.parentElement!.getAttribute("data-para");
                const idWlisciePoprzednie: string | null = terazOdkryte[0]!.parentElement!.parentElement!.getAttribute("data-id-w-liscie");

                if (idPary_teraz != null && idPary_teraz == idPary_poprzednie) {
                    //są parą
                    usunPareKart(element, terazOdkryte[0]);
                } else if (
                    powtarzamySlowka && jezykKarty != terazOdkryte[0]!.parentElement!.parentElement!.getAttribute("data-jezyk") && idWliscieTeraz == idWlisciePoprzednie) {
                    //zatwierdzanie par między różnymi parami

                    usunPareKart(element, terazOdkryte[0]);
                } else {
                    terazOdkryte[1]!.parentElement!.style.transform = rot0;
                    terazOdkryte[0]!.parentElement!.style.transform = rot0;
                    proby--; // one func

                    if (proby <= 0) {
                        koniecGry(false);
                        return 0;
                    }

                    document.getElementById("zostaloProb")!.innerText =
                        proby as unknown as string;
                    while (terazOdkryte.length > 0) {
                        terazOdkryte!
                            .pop()!
                            .setAttribute("data-odkryta", "false");
                    }
                }
            }, 1000);
        }
    }

    if (liczbaUsunietychKart == licznik) {
        koniecGry();
        return 0;
    }

    sprawdzStanPlanszy();
    return idPary;
}

function sprawdzStanPlanszy() {}

const powtarzamySlowka: boolean = false;
const graSkonczonaState: {
    value: boolean
    setValue: any
  } = {
    value: false,
    setValue: ()=>{}

  };

  let graSkonczona = false;
const globalKarty: any = [];

export default function Plansza({
    szerokosc,
    wysokosc,
    root,
    pobranaListaSlowek,
}: {
    szerokosc: number;
    wysokosc: number;
    root: Root;
    pobranaListaSlowek: { pol: string; ang: string }[];
}) {
    const [sprwadzStanGry, setStanGry] = useState(false);
//    const [graSkonczona, setGraState] = useState(false);
//     graSkonczonaState.value = graSkonczona;
//     graSkonczonaState.setValue = useState;
if (startTime == 0) {
    startTime = Date.now();

}
    const karty: any[] = [];
    planszaRoot = root;
    const szerokoscCSS: string = "w-full"; //w-screen
    iloscKart = szerokosc * wysokosc; //docelowa ilość kart

    if (proby == -1) {
        proby = Math.ceil(iloscKart / 2) + 1;
    }
    listaSlowek = pobranaListaSlowek;
    let losowaParaSlowek: number = losowaLiczbaCalkowita(
        0,
        listaSlowek.length - 1
    );

    
    const listaUżytychPar: number[] = [];

    while (licznik < iloscKart) {
        //nie ma znaczenia czy tworzymy pojedyńczo czy podwójną funkcją

        if (listaSlowek.length * 2 >= iloscKart) {
            //mamy wystarczająco słówek
            while (listaUżytychPar.includes(losowaParaSlowek)) {
                //nie powtarzamy ich
                losowaParaSlowek = losowaLiczbaCalkowita(0, listaSlowek.length - 1);
            }
        }

            const noweKarty = stworzPareKart(
                listaSlowek[losowaParaSlowek],
                losowaParaSlowek
            );

            listaUżytychPar.push(losowaParaSlowek);
            losowaParaSlowek = losowaLiczbaCalkowita(0, listaSlowek.length - 1);
            karty.push(noweKarty[0]);
            karty.push(noweKarty[1]);
            
            if (licznik == 0) {
                break;
            }

        listaUżytychPar.sort((a, b) => {
            return a - b;
        });

        losujMiejscaKart(karty);
    }

    karty.forEach(element => {
        globalKarty.push(element);
    });

    losujMiejscaKart(globalKarty);
        const { report } = useReportProgress();

        useEffect(() => {
           
           
                 console.log("use effect ran");
            console.log("graSkonczona: " + graSkonczona);
            console.log('ilosc kart:', iloscKart);
            console.log('Liczba kart:', globalKarty?.length);

            if (graSkonczona) {
            console.log("should send the report");
            
             const totalTimeSpent = Math.floor((Date.now() - startTime) / 1000);
            report({
                content_type: "game",
                content_id: "69641b89-217c-423c-ada8-5e24eafe0c3c",
                progress: {
                    completed: true,
                    score: liczbaUsunietychKart,//ile odkryli
                    attempts: iloscKart,//na ile kart
                    time_spent: totalTimeSpent,
                },
            }).catch((e) => console.error("Final progress report error", e));
        }
        
           
    }, [sprwadzStanGry, report]);

        return (
           <div 
           onClick={(e) => {

            if (liczbaUsunietychKart > globalKarty.length/2 || proby <= 1) {
                    console.log("wait in html");

                setTimeout(() => {
                console.log("waited");
                                    
            setStanGry(!sprwadzStanGry)

                }, 2000);
                
            }
        
        }}
           id="plansza" key={"plansza"} className={"flex flex-wrap items-center justify-center mb-10 md:text-base text-2xl " + szerokoscCSS}>
    <p className="text-center w-full">Kliknij na kartę aby ją odsłonić</p>
    <p className="text-center w-full">Zostało kart: <span id="zostaloKart">{iloscKart}</span></p>
    <p className="text-center w-full">Zostało prób: <span id="zostaloProb">{proby}</span></p>
             {/* {karty} */}
             {globalKarty}
   </div>
        )
}



function koniecGry(wygrana: boolean = true) {
    document.getElementById("plansza")!.style.display = "none";
    graSkonczona = true;
    console.log("koniec gry ----------------------------------------");
    
    const buttonCSS: string = `mt-4 max-w-fit m-auto bg-amber-200 border border-amber-700 rounded-[6px] shadow-sm 
           box-border text-black text-[16px] font-bold
            p-3 px-4 hover:bg-transparent hover:text-amber-200 hover:border-amber-200
           active:opacity-50`;
    const koniecGryHTML = `<a href="/pamiec"><button class="${buttonCSS}">Zagraj jeszcze raz</button></a>
        <a href="/dashboard"><button class="${buttonCSS}">Panel ucznia</button></a>`;
    
        const odkryteKartyProcent = Math.floor((liczbaUsunietychKart / iloscKart)*100);

    if (wygrana) {
        const wygranaHTML: string = `<p>Gratulacje!</p>
                    <p>Udało się tobie odkryć poprawnie wszystkie karty.</p>
                                    <p>Odkryte karty:</p>
                                    <p id="wynikiOdkryteKarty">${liczbaUsunietychKart}/${iloscKart}</p>
                                    <p id="wynikiOdkryteKartyProcent">${odkryteKartyProcent}%</p>
                                    `;
        document.getElementById("wynikiPojemnik")!.innerHTML = wygranaHTML;
    } else {
        const przegranaHTML = `<p>Nie udało się!</p>
            <p>Odkryte karty:</p>
            <p id="wynikiOdkryteKarty">${liczbaUsunietychKart}/${iloscKart}</p>
                                    <p id="wynikiOdkryteKartyProcent">${odkryteKartyProcent}%</p>

            <p className='text-center'>Spróbuj jeszcze raz, możesz następnym razem wybrać niższą trudność.</p>
           `;
        document.getElementById("wynikiPojemnik")!.innerHTML = przegranaHTML;
    }
    document.getElementById("wynikiPojemnik")!.innerHTML += koniecGryHTML;
    // planszaRoot.render(<button></button>)
    // planszaRoot.unmount();//debug comment
}
