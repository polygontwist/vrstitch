"use strict";

var spracheaktiv="DE";
var sprachen=[
	{"language":"DE",
	 "description":"deutsch",
	 "words":{//"id":"wort in Sprache"
		 "loading":"lade daten...",
		 "Quellen":"Quellen",
		 "Zählervon":"Zähler von",
		 "bis":"bis",
		 "Stichoptionen":"Stichoptionen",
		 "Zielordner":"Zielordner",
		 "select":"auswählen",
		 "Aktion":"Aktion",
		 "Berechnungstart":"Berechnung starten",
		 "Berechnungstop":"Berechnung stoppen"
		 
		}
	},
	{"language":"EN",
	 "description":"english",
	 "words":{
		 "loading":"loading...",
		 "Quellen":"Sources",
		 "Zählervon":"Counter from",
		 "bis":"to",
		 "Stichoptionen":"Optionen",
		 "Zielordner":"Destination folder",
		 "select":"select",
		 "Aktion":"Action",
		 "Berechnungstart":"Start calculation",
		 "Berechnungstop":"Stop calculation"
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

