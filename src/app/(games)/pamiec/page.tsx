"use client";
import Plansza from "@/components/pamiec/plansza";
import { createRoot } from "react-dom/client";
import { ButtonHTMLAttributes, ReactElement } from "react";
import "./styles.css";
import AuthNavBar from "@/components/AuthNavBar";
import Footer from "@/components/Footer";

//globals
let planszaPojemnikNode: any;
let planszaEl: any;
//TODO api not loaded use the default or smth

enum Trudnosc {
    latwa = 1,
    normalna,
    trudna,
    ekspert,
}

const trudnosci: {
    key: number;
    nazwa: string;
    rozmiarPlanszy: {
        // x * y
        x: number; //szerokosc
        y: number; // wysokosc
    };
}[] = [];

//TODO seperate file
function zapytanieFetch(
    method: string,
    url: string,
    cookie: boolean = true,
    data: any = null
) {
    if (cookie) {
        //TODO failsafe if used with document not loaded??
        return fetch(url, {
            method: method,
            credentials: "include",
            cache: "no-cache",
            headers: {
                // 'Cookie': `auth-token=${authCookie}`,
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: data ? JSON.stringify(data) : undefined,
        });
    } else {
        return fetch(url, {
            method: method,
            cache: "no-cache",
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: data ? JSON.stringify(data) : undefined,
        });
    }
}

async function pobierzSlowka(param: string = "") {
    const url: string = "/api/user/vocabulary" + param;
    return zapytanieFetch("GET", url);
}

function zacznijGre(e: any) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const formJson = Object.fromEntries(formData.entries());
    const a = formJson.trudnosc as string;
    const numTrudnosc = parseInt(a);
    document.getElementById("gameSetUp")!.style.display = "none";
    rysujPlansze(numTrudnosc);
}

function rysujPlansze(trudnosc: number) {
    const idTrudnosci = trudnosc;
    const wysokoscPlanszy = trudnosci[idTrudnosci].rozmiarPlanszy.y;
    const szerokoscPlanszy = trudnosci[idTrudnosci].rozmiarPlanszy.x;
    rysujxyKart(wysokoscPlanszy, szerokoscPlanszy);
}

/**
 * Rysuje 'karty' w prostokącie
 * @param x - szerosokc
 * @param y - wysokosc
 */

function rysujxyKart(x: number, y: number) {
    planszaPojemnikNode = document.getElementById("planszaPojemnik");

    planszaEl = createRoot(planszaPojemnikNode);
    planszaEl.render(
        <Plansza
            szerokosc={x}
            wysokosc={y}
            root={planszaEl}
            pobranaListaSlowek={pobraneSlowka}
        />
    );
}

const isClient = () => typeof window !== "undefined";

let czekaNaSlowka = true;
let authCookie: string;
const pobraneSlowka: { pol: string; ang: string }[] = [];

export default function pamiec() {
    //?is it better to pass this to the func or let it get it itself?
    if (isClient()) {
        //TODO WAIT FOR THIS TO LOAD

        if (czekaNaSlowka) {
            pobierzSlowka()
                .then((res) => {
                    return res.json();
                })
                .then((a) => {
                    if (pobraneSlowka.length > 0) {
                        return;
                    }

                    a.items.forEach((slowko: any) => {
                        pobraneSlowka.push({
                            pol: slowko.term_pl,
                            ang: slowko.term_en,
                        });
                    });
                })
                .finally(() => {
                    if (pobraneSlowka.length <= 0) {
                        czekaNaSlowka = true;
                    } else {
                        czekaNaSlowka = false;
                        (
                            document.getElementById(
                                "start"
                            )! as HTMLButtonElement
                        ).disabled = false;
                        document.getElementById("startInfo")!.innerText = "";
                    }
                })
                .catch((error)=>{
        console.log("Error fetching: " + error);
        console.log(document.getElementById("LogInPlease"));
        
        if (document.getElementById("LogInPlease")) {
            document.getElementById("LogInPlease")!.style.display = "inline-block";
        }
    });
        }
        
    }
    

    for (let i = 1; i <= Trudnosc.ekspert; i++) {
        let nazwa = Trudnosc[i];

        if (i == Trudnosc.latwa) {
            nazwa = "łatwa";
        }

        trudnosci[i] = {
            key: i,
            nazwa: nazwa,
            rozmiarPlanszy: {
                x: Math.floor(i * 5 - 2 * i),
                y: Math.floor((i * 5) / (2 * i)),
            },
        };
    }

    const listaTrudnosci: ReactElement[] = trudnosci.map((trudnosc, count) => {
        return (
            <option className="bg-transparent" key={count} value={trudnosc.key}>
                {trudnosc.nazwa}
            </option>
        );
    });

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-10">
            <AuthNavBar showBackToLogin={false} showDashboard={true} />
            <h1 className="text-4xl font-bold text-amber-200 mb-10 mt-16">
                Pamięć
            </h1>
            <main id="gameSetUp" className="md:text-base text-2xl">
                <p className="flex flex-col items-center justify-center">
                    Sprawdź swoją pamięć i zdolności językowe!
                </p>

                <p className="flex flex-col items-center justify-center">
                    Zaleca się rozgrywkę na komputerze.
                </p>

                <form
                    id="startForm"
                    className="flex flex-col justify-center mb-10"
                    method="post"
                    onSubmit={zacznijGre}
                >
                    <h3 className="text-center mt-5">Wybierz trudność:</h3>
                    <select
                        className="text-center max-w-fit m-auto bg-green-900 "
                        name="trudnosc"
                        id="trudnoscSelect"
                    >
                        {listaTrudnosci}
                    </select>
                    <button
                        id="start"
                        disabled={czekaNaSlowka}
                        className="disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 mt-4 max-w-fit m-auto bg-amber-200 border border-amber-900 rounded-[6px] shadow-sm 
           t-4 max-w-fit m-auto bg-amber-200 border border-amber-700 rounded-[6px] shadow-sm 
           box-border text-black text-[16px] font-bold
            p-3 px-4 hover:bg-transparent hover:text-amber-200 hover:border-amber-200
           active:opacity-50"
                        type="submit"
                    >
                        start
                    </button>
                    <p className="text-center" id="startInfo">
                        Ładuję dane... Proszę czekać.
                    </p>
                </form>

                <h3 className="text-green-200 text-center">Jak grać?</h3>
                <p className="2xl:mx-80 sm:mx-36 mx-10 ">
                    Kliknij kartę aby ją odsłonić. Odkryj drugą kartę, jeśli
                    pasują (słówko po angielsku do słówka po polsku) karty
                    znikają z pola. Jeśli nie pasują, zapamiętaj ich pozycję i
                    ich zawartość. Karty zostaną ponownie zakryte i możesz
                    próbować dalej. Gra kończy się gdy pole zostanie oczyszczone
                    z kart lub gdy wszystkie próby zostaną wykorzystane.
                </p>
            </main>
            <div id="planszaPojemnik" className="w-screen"></div>
            <div
                id="wynikiPojemnik"
                className="flex flex-col items-center justify-center"
            ></div>
        </div>

        

    );
}
