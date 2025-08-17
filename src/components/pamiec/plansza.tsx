'use client'
import { ReactElement } from "react";
import "@/app/(games)/pamiec/styles.css"
import { Root } from "react-dom/client";

//TODO remove all debug comments at the end
//TODO get all todo comments done

///TODO mieszany tryb wszyśćko
const listaSlowek = [//powinno byc pobierane ze słownika, i zależne od wybreanego zawodu
    //w db - id, category_id, term_en, term_pl, definition_en, definition_pl, difficulty_level
   {
        pol: "język programowania",
        ang: "programming language"
    },//ported to db
    {
        pol: "testy jednostkowe",
        ang: "unit tests"
    },
    {
        pol: "klawiatura",
        ang: "keyboard"
    },
    {
        pol: "kabel",
        ang: "cable"
    },
    {
        pol: "gra",
        ang: "game"
    },
    {
        pol: "konflikt",
        ang: "conflict"
    },
    {
        pol: "algorytm",
        ang: "algorithm"
    },
    {
        pol: "zmienna",
        ang: "variable"
    },
    {
        pol: "pętla",
        ang: "loop"
    },
    {
        pol: "warunki",
        ang: "conditions"
    },
    {
        pol: "funkcja",
        ang: "function"
    },
    {
        pol: "klasa",
        ang: "class"
    },
    {
        pol: "obiekt",
        ang: "object"
    },
    {
        pol: "interfejs",
        ang: "interface"
    },
    {
        pol: "biblioteka",
        ang: "library"
    },
    {
        pol: "stała",
        ang: "constant"
    },
    {
        pol: "debugowanie",
        ang: "debugging"
    },
    {
        pol: "komunikacja",
        ang: "communication"
    },
    {
        pol: "protokół",
        ang: "protocol"
    },
    {
        pol: "serwer",
        ang: "server"
    },
    {
        pol: "klient",
        ang: "client"
    },
    {
        pol: "baza danych",
        ang: "database"
    },
    {
        pol: "struktura danych",
        ang: "data structure"
    }
];

//global var
const terazOdkryte: HTMLElement[] = [];
let liczbaUsunietychKart = 0;//
let proby:number = 7;// proby = ilosckart/2 +1
// let punktyUzytkownika:number = 0; //powinno być pobierane jeśli cos takiego ma być
// let punkty:number = 0;
let licznik:number = 0;//zlicza karty
let licznikPar: number = -1;
const jezyk = {
    ang:"ang",
    pol:"pol"
};
let planszaRoot: Root;
let iloscKart: number;

//TODO comments on functions

//!Theres css in styles.css file too!
const rozmiarKartyCSS:string = "min-w-fit m-2 w-1/3 sm:m-4 sm:w-1/5 md:m-3 md:w-1/3 lg:w-1/5 2xl:w-1/8 aspect-square";
const flipCardCSS:string = "  bg-transparent   ";
const kartaCSS: string = " inline-flex items-center justify-center select-none rounded-2xl  ease-in-out text-white border-white/5 backdrop-blur-[25px] bg-origin-border shadow-sm not-disabled:hover:bg-white/90 not-disabled:hover:text-black not-disabled:hover:shadow-button transition-all duration-200 focus-visible:ring-4 focus-visible:ring-white/30 focus-visible:outline-hidden focus-visible:bg-white/90 focus-visible:text-black after:absolute  after:top-[-2px] after:left-[-2px] after:rounded-[1rem] after:bg-repeat after:pointer-events-none text-base font-semibold cursor-pointer rounded-lg ";
// const rozmiarKartyCSS:string = " m-0 w-[498px] h-[498px] sm:m-10 sm:w-6px sm:h-6px ";
// const rozmiarKartyCSS:string = " sm:w-1/8 sm:h-1/8";
// const kartaCSS: string = "inline-flex items-center justify-center select-none rounded-2xl m-8 ease-in-out text-white border-white/5 backdrop-blur-[25px] bg-origin-border  shadow-sm not-disabled:hover:bg-white/90 not-disabled:hover:text-black not-disabled:hover:shadow-button transition-all duration-200 focus-visible:ring-4 focus-visible:ring-white/30 focus-visible:outline-hidden focus-visible:bg-white/90 focus-visible:text-black after:absolute  after:top-[-2px] after:left-[-2px] after:rounded-[1rem] after:bg-repeat after:pointer-events-none text-base h-12 gap-0 font-semibold size-1/8 max-w-1/4 cursor-pointer max-w-full rounded-lg min-w-fit ";//old
const nazwaKlasyKartyPol: string = "karta pol " + kartaCSS + rozmiarKartyCSS;
const nazwaKlasyKartyAng: string = "karta ang " + kartaCSS + rozmiarKartyCSS;
//TODO adjust card size
//w-300px h-300px bg-red when this is set it makes a rectangle instaed of a square
function stworzKarte(id: number, slowko:string, nazwaKlasy:string, jezyk:string = "null", idPary:number = -1) {
    licznik ++;
    return (
        <div key={id} data-para={idPary} data-odkryta={false} className={flipCardCSS + nazwaKlasy + " flip-card"} onClick={odkryjKarte} data-jezyk={jezyk}>
            <div className="flip-card-inner">
                 <div className={"flip-card-front " + " select-none rounded-2xl ease-in-out border-white/5 backdrop-blur-[25px] bg-origin-border bg-[linear-gradient(104deg,rgba(253,253,253,0.05)_5%,rgba(240,240,228,0.1)_100%)] shadow-sm not-disabled:hover:bg-white/90 not-disabled:hover:text-black not-disabled:hover:shadow-button transition-all duration-200 after:absolute  after:top-[-2px] after:left-[-2px] after:rounded-[1rem] font-semibold   cursor-pointer rounded-lg min-w-fit"}>
                 </div>

                <div className="flip-card-back  tekstKarty bg-green-900" >
                <p className="w-fit h-fit">{slowko}</p>
                </div>

            </div>
        </div>
    )
}


/**
 * 
 * inkrementuje licznik globalny!
 * @param slowka 
 * @returns dwie nowe karty
 */
function stworzPareKart(slowka:{pol:string, ang:string}) {

    licznikPar ++;
    return [
        stworzKarte(licznik, slowka.pol, nazwaKlasyKartyPol, jezyk.pol, licznikPar),
        stworzKarte(licznik, slowka.ang, nazwaKlasyKartyAng, jezyk.ang, licznikPar)
    ]
}

function losujMiejscaKart(karty: any[], sila:number = 1) {
    for (let i = 0; i < (karty.length*sila); i++) {
        let losowyElement = losowaLiczbaCalkowita(0, karty.length-1);
        let losowaPozycja = losowaLiczbaCalkowita(0, karty.length-1);

        while (losowyElement == losowaPozycja) {
            losowyElement = losowaLiczbaCalkowita(0, karty.length-1);
            losowaPozycja = losowaLiczbaCalkowita(0, karty.length-1);
        }

        const temp: ReactElement = karty[losowaPozycja];
        karty[losowaPozycja] = karty[losowyElement];
        karty[losowyElement] = temp;

    }
}

function losowaLiczbaCalkowita(min:number, max:number) {//inclusive
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // The maximum is inclusive and the minimum is inclusive
}
//TODO
// function sprawdzOdkryteKarty() {

// }

/**
 * Uruchamiane przy kliknięciu karty
 * @param e 
 * @returns idPary karty
 */
//onclick
let ostatniaKarta: any; //ostatnia odwrócona karta
function odkryjKarte(e: any) {
    if (e.ctrlKey) {
       koniecGry(false)//debug; 
    }
    const element = e.target;

    if (ostatniaKarta && ostatniaKarta.parentElement.parentElement == element.parentElement.parentElement) {
        // console.log("! ta sama karta pod rząd");
        // if (terazOdkryte[0] && terazOdkryte[1]) {
        //     console.log("cosik?");
            
        // } else {
        //     console.log("pusta");
            
        // }debug

        if (terazOdkryte[0] || terazOdkryte[1]) {
            return -2;
        }
        
    }

    ostatniaKarta = element;

    // const jezykKarty = element.getAttribute("data-jezyk");
    const idPary:string = element.parentElement.parentElement.getAttribute("data-para");
    const kartaOdkryta: boolean = element.getAttribute("data-odkryta") == "true" ? true : false;
    const rot180 = "rotateY(180deg)";
    const rot0 = "rotateY(0deg)";

    if (element == terazOdkryte[0]) {
        return -1;
    }

    if (idPary == null) {
        console.log("couldnt get id Pary");
        
        return -1;
    }
    console.log("id Pary tej KARTY:", idPary);
    
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
            
        transform.transform = rot0;//odwracanie
            
        } else {
        transform.transform = rot180;//odwracanie
        }
        }


        if (terazOdkryte.length == 2) {

            console.log("wait");

            setTimeout(()=>{
                 

        // let idPary_teraz: string = idPary;
        const idPary_teraz: string = idPary;
        const idPary_poprzednie: string | null = terazOdkryte[0]!.parentElement!.parentElement!.getAttribute("data-para");
        
        
        if (idPary_teraz != null && idPary_teraz == idPary_poprzednie) {//są parą
            console.log("REMOVE FROM FIELD");
            console.log("ids : " );
            console.log(idPary_teraz);
            console.log(idPary_poprzednie);
            // const kartaEl = terazOdkryte[0]!.parentElement!.parentElement;

            terazOdkryte[0]!.parentElement!.parentElement!.style.visibility = "hidden";
            terazOdkryte[1]!.parentElement!.parentElement!.style.visibility = "hidden";
            liczbaUsunietychKart += 2;
            let zostalo = (document.getElementById("zostaloKart")?.innerText) as unknown as number;
            zostalo -= 2;
            if (document.getElementById("zostaloKart") != undefined) {
                document.getElementById("zostaloKart")!.innerText = (zostalo) as unknown as string;

            }
            
               while (terazOdkryte.length > 0) {
                terazOdkryte!.pop()!.setAttribute("data-odkryta", "false");
            }
            
            if (liczbaUsunietychKart == licznik) {
                koniecGry();
                return 0;
            }
        
        } else {
            console.log("odwracam");
            terazOdkryte[1]!.parentElement!.style.transform = rot0;
            terazOdkryte[0]!.parentElement!.style.transform = rot0;
            proby --;// one func

            if (proby <= 0) {
                koniecGry(false);
                return 0;
            }


            document.getElementById("zostaloProb")!.innerText = (proby) as unknown as string;         //

            while (terazOdkryte.length > 0) {
                terazOdkryte!.pop()!.setAttribute("data-odkryta", "false");

            }

        }
            
        },1000)//timeout braces
            
        }
    }

    if (liczbaUsunietychKart == licznik) {
        console.log("koniecGry()");
        koniecGry();
        return 0;
    }

    sprawdzStanPlanszy();
    return idPary;
}

function sprawdzStanPlanszy() {

}

export default function Plansza({ szerokosc, wysokosc, root}: {szerokosc: number, wysokosc: number, root:Root}) {
const karty: any[] = [];
planszaRoot = root;
const szerokoscCSS: string = "w-full";//w-screen
iloscKart = szerokosc * wysokosc;//docelowa ilość kart
proby = (Math.ceil(iloscKart/2)) + 1;


let losowaParaSlowek: number = losowaLiczbaCalkowita(0, listaSlowek.length-1);
const listaUżytychPar: number[] = [];
while (licznik < iloscKart) {//nie ma znaczenia czy tworzymy pojedyńczo czy podwójną funkcją

    if (listaSlowek.length*2 >= iloscKart) {//mamy wystarczająco słówek
        while (listaUżytychPar.includes(losowaParaSlowek)) {//nie powtarzamy ich
            losowaParaSlowek = losowaLiczbaCalkowita(0, listaSlowek.length-1)
        }
    }

    const noweKarty = stworzPareKart(listaSlowek[losowaParaSlowek]);
    listaUżytychPar.push(losowaParaSlowek);
    losowaParaSlowek = losowaLiczbaCalkowita(0, listaSlowek.length-1);
    karty.push(noweKarty[0]);
    karty.push(noweKarty[1]);
    if (licznik == 0) {
        break;
    }
}


listaUżytychPar.sort((a,b)=>{
    return a-b
});

console.log("licznik:" + licznik);
console.log("karrty length:" + karty.length);

losujMiejscaKart(karty);

  return (
   <div id="plansza" key={"plansza"} className={"flex flex-wrap items-center justify-center mb-10 md:text-base text-2xl " + szerokoscCSS}>
    <p className="text-center w-full">Kliknij na kartę aby ją odsłonić</p>
    <p className="text-center w-full">Zostało kart: <span id="zostaloKart">{iloscKart}</span></p>
    <p className="text-center w-full">Zostało prób: <span id="zostaloProb">{proby}</span></p>

    {karty}
   </div>
  )
}

function koniecGry(wygrana: boolean = true) {
    const buttonCSS:string = `mt-4 max-w-fit m-auto bg-green-200 border border-green-900 rounded-[6px] shadow-sm 
           box-border text-black text-[16px] font-bold
            p-3 px-4 hover:bg-transparent hover:text-green-200 hover:border-green-200
           active:opacity-50`;
    if (wygrana) {
        const wygranaHTML:string = `<p>Gratulacje!</p>
                    <p>Udało się tobie odkryć poprawnie wszystkie karty.</p>
                                    <p>Odkryte karty:</p>
                                    <p id="wynikiOdkryteKarty">${liczbaUsunietychKart}/${iloscKart}</p>
                                    <a href="/pamiec"><button class="${buttonCSS}">Zagraj jeszcze raz
        </button></a>
        <a href="/login"><button class="${buttonCSS}">Strona głowna</button></a>
        `;//TODO jak sie by nie włączało dobrze to odpoczątku włączyc i display none

        //TODO failsafe jak nie załaduje słówek
        document.getElementById("wynikiPojemnik")!.innerHTML = wygranaHTML;
    } else {
        const przegranaHTML = `<p>Nie udało się!</p>
            <p>Odkryte karty:</p>
            <p id="wynikiOdkryteKarty">${liczbaUsunietychKart}/${iloscKart}</p>
            <p>Spróbuj jeszcze raz, możesz następnym razem wybrać mnijeszą trudność.</p>
            <a href="/pamiec"><button class="${buttonCSS}">Zagraj jeszcze raz</button></a>
            <a href="/login"><button class="${buttonCSS}">Strona głowna</button></a>
        `;
        document.getElementById("wynikiPojemnik")!.innerHTML = przegranaHTML;
    }

        planszaRoot.unmount();
}
