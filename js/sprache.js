"use strict";

var spracheaktiv="DE";
var sprachen=[
	{"language":"DE",
	 "description":"deutsch",
	 "words":{//"id":"wort in Sprache"
		 "loading":"lade daten...",
		 "Quellen":"Quellen",
		 "Zählervon":"Zähler von",
		 "bis":" bis",
		 "Stichoptionen":"Stitchoptionen",
		 "Zielordner":"Zielordner",
		 "dateiselect":"Datei auswählen",
		 "nichtsgewaehlt":"nichts gewählt",
		 "select":"auswählen",
		 "Aktion":"Aktion",
		 "Verteilung":"Verteilung",
		 "geometrie":"Würfel Geometrie",
		 "Abstand":"Abstand",
		 "Berechnungstart":"Berechnung starten",
		 "Berechnungweiter":"Berechnung fortsetzen",
		 "Berechnungpause":"Berechnung pausieren"
		 
		}
	},
	{"language":"EN",
	 "description":"english",
	 "words":{
		 "loading":"loading...",
		 "Quellen":"sources",
		 "Zählervon":"counter from",
		 "bis":" to",
		 "Stichoptionen":"optionen",
		 "Zielordner":"destination folder",
		 "dateiselect":"select File",
		  "nichtsgewaehlt":"nothing selected",
		 "select":"select",
		 "Aktion":"Action",
		 "Verteilung":"spread",
		 "geometrie":"cube geometry",
		 "Abstand":"distance",
		 "Berechnungstart":"start calculation",
		 "Berechnungweiter":"continue the calculation",
		  "Berechnungpause":"pause calculation"
	 }
	}
];


var getWort=function(s){
	var i,spra;
	for(i=0;i<sprachen.length;i++){
		spra=sprachen[i];
		if(spra.language==spracheaktiv){
			if(spra.words[s]!=undefined)
				return spra.words[s];		//gefunden Übersetzung zurückgeben
		}
	}	
	return s; //nicht gefunden, Eingabe zurückgeben
};

