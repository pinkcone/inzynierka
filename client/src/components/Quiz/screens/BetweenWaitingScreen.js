import React, { useState, useEffect } from 'react';
import styles from '../../../styles/StartWaitingScreen.module.css';

const StartWaitingScreen = () => {
    const texts = [
        "Cóż za szybkość!",
        "Ale z Ciebie struś pędziwiatr!",
        "Nieźle to wygląda!",
        "Czekamy na resztę ekipy!",
        "Fantastyczna energia!",
        "Brawo za refleks!",
        "Zawodnik pierwszej klasy!",
        "Czy to Flash? Nie, to Ty!",
        "Rakieta gotowa do startu!",
        "Błyskawica nie ma z Tobą szans!",
        "Turbo włączone!",
        "Nie do zatrzymania!",
        "Czy ktoś włączył tryb hiperprędkości?!",
        "Od Ciebie nawet internet by się uczył szybkości!",
        "Spokojnie, to nie wyścigi... ale gdyby były, wygrałbyś!",
        "Wow, odpowiedź zanim pytanie zdążyło dobrze się wyświetlić!",
        "Matrix? Nie, to po prostu Twoja prędkość!",
        "Czy to ptak? Czy to samolot? Nie, to Ty klikający odpowiedź!",
        "Zastanawiam się, czy masz myszkę na turbo!",
        "Flash wymięka przy Twojej szybkości klikania!",
        "To ptak? To samolot? Nie, to geniusz quizowy na turbo!",
        "Twoje palce to mistrzowie sprintu po klawiaturze i ekranie!",
        "Gdyby była olimpiada w quizach, zgarnąłbyś złoto w każdej kategorii!",
        "To ptak? Nie, to odpowiedź w czasie rzeczywistym!",
        "Następnym razem poczekaj, aż pytanie zdąży się skończyć wyświetlać!",
        "Przy Twoim tempie pytania ledwo pojawiają się na ekranie!",
        "Odpowiadasz szybciej, niż komputer zdąży pomyśleć!",
        "Czy myszka właśnie zapłonęła? Bo chyba się przegrzewa od klikania!",
        "Twoja odpowiedź pojawiła się, zanim timer zdążył ruszyć!",
        "Czekaj, czy pytanie zdążyło się w ogóle załadować?",
        "Prędkość światła? To Ty, jeśli chodzi o quizowe odpowiedzi!",
        "Twoja odpowiedź pojawiła się szybciej, niż ekran zdążył mrugnąć!"
    ];

    const [randomText, setRandomText] = useState("");

    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * texts.length);
        setRandomText(texts[randomIndex]);
    }, []);

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h2>{randomText}</h2>
                <h6>Oczekiwanie na innych użytkowników!</h6>

                <div className={styles.dots}>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    );
};

export default StartWaitingScreen;
