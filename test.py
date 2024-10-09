import math
import random
# Otwieramy plik do zapisu
with open("macierze.txt", "w") as file:
    for ile_pytan in range(10, 200):
        # Tworzymy pustą macierz 7x7 dla każdego 'ile_pytan': poziomy jako wiersze, streak jako kolumny
        macierz = [[0 for _ in range(7)] for _ in range(7)]  # Macierz 7x7

        # Słownik do zliczania wystąpień każdego miejsca
        wystapienia_miejsc = {}

        # Pętla wypełniająca macierz
        for lvl in range(1, 8):  # lvl od 1 do 7
            for streak in range(lvl):  # streak od 0 do lvl-1
                if lvl == 1:
                    miejsce = 3
                elif lvl == 7:
                    miejsce = ile_pytan - 1
                else: 
                    wspolczynnik = ((lvl / 7) + (streak / 6)) / 2
                    miejsce = wspolczynnik * ile_pytan
                    miejsce = math.floor(miejsce)  # Zaokrąglenie w dół
                    miejsce += random.randint(-3,3)
                    if miejsce < 4: 
                        miejsce = 4
                    if miejsce >= ile_pytan: 
                        miejsce = ile_pytan - 1
                
                # Zapisujemy wartość 'miejsce' w odpowiednim polu macierzy
                macierz[lvl-1][streak] = miejsce  # Indeksujemy lvl-1, aby dopasować indeksy

                # Zliczamy wystąpienia wartości 'miejsce'
                if miejsce in wystapienia_miejsc:
                    wystapienia_miejsc[miejsce] += 1
                else:
                    wystapienia_miejsc[miejsce] = 1

        # Zapisujemy macierz do pliku
        file.write(f"Macierz dla liczby pytań = {ile_pytan}:\n")
        file.write("Streak:  0  1  2  3  4  5  6\n")  # Nagłówek streak

        # Zapisujemy każdy wiersz macierzy, czyli poziomy (lvl)
        for lvl_index, row in enumerate(macierz):
            file.write(f"lvl {lvl_index+1}: " + "  ".join(map(str, row)) + "\n")
        
        # Zapisujemy liczbę wystąpień każdego miejsca
        file.write("Wystąpienia każdego miejsca:\n")
        for miejsce, count in sorted(wystapienia_miejsc.items()):
            file.write(f"Miejsce {miejsce}: {count} razy\n")
        
        file.write("\n")  # Dodajemy pustą linię między macierzami

print("Macierze i wystąpienia miejsc zostały zapisane do pliku 'macierze.txt'")
