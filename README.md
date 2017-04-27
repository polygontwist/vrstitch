Programm zum Zusammenfügen von 6 Einzelbilder zu einer Textur. 
Dies automatisiert für mehrerer Bilder, die später zu einem Video kovertiert werden können.
Dazu der passende VRML2 export eines Würfels, für die Verwendung als Basiskörper mit WebGl o.ä..

# Problem
Ich hatte beim Mappen einer Textur auf einen Würfel das Problem, das einige Ränder nicht sauber waren.
Deshalb entstand dieses Programm um eine Textur zu produzieren, die besser passt. Auch sollte der Platz auf der Textur so gut wie möglich ausgenutzt werden.

![Fehler](https://github.com/polygontwist/vrstitch/blob/master/work/fehlervrstitch.png)

# Idee
Wenn ich eine Textur generiere die etwas Spielraum läßt, sollten die Kanten sauber werden. Wenn nämlich zwei Vierecke nebeneinander liewgen, war das Ergebnis sauber.
Deshalb wird für jede Fläche des Würfels ein Texturbereich mit fortführenden Kanten generiert:

![Aufbau](https://github.com/polygontwist/vrstitch/blob/master/work/aufbau.png)

Die Flächen 1, 2 und 3 könnten auch direkt nebeneinander liegen, da sie angenzend sind. So sieht es aber schöner aus :-)

Die Orientierung der Flächen im 3D-Raum ist:

![3D-Würfel](https://github.com/polygontwist/vrstitch/blob/master/work/wuerfel.png)

1 ist links, 2 vorn, 3 rechts, 4 hinten, 5 unten und 6 oben.

Nach der Platzierung der einzelnen Flächen, werden Teilstücke (blau) an den anderen Flächen angefügt. 
Mit dem Parameter "Abstand" in den "Strichoptionen" kann eingestellt werden wie groß die Überlappungsflächen sein sollen.
Der gelbe Bereich wird wird dann automatisch aufgefüllt in dem die Randpixel verdoppelt werden.

# Ergebnis
Das Ergebnis sieht so aus:

![Ergebnis](https://github.com/polygontwist/vrstitch/blob/master/work/output_0000.png)
