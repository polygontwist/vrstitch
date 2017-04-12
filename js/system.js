"use strict";

var vrstich_app=function(){
	var Programmeinstellungen={//als Einstellungen gespeichert
		windowsize:{x:0,y:0,width:0,height:0}
	};
	
	var zielNode;
	
	var o_quellen=[];
	
	//--basic--
	var gE=function(id){if(id=="")return undefined; else return document.getElementById(id);}
	var cE=function(z,e,id,cn){
		var newNode=document.createElement(e);
		if(id!=undefined && id!="")newNode.id=id;
		if(cn!=undefined && cn!="")newNode.className=cn;
		if(z)z.appendChild(newNode);
		return newNode;
	}
	var istClass=function(htmlNode,Classe){
		if(htmlNode!=undefined && htmlNode.className){
			var i,aClass=htmlNode.className.split(' ');
			for(i=0;i<aClass.length;i++){
					if(aClass[i]==Classe)return true;
			}	
		}		
		return false;
	}
	var addClass=function(htmlNode,Classe){	
		var newClass;
		if(htmlNode!=undefined){
			newClass=htmlNode.className;
			if(newClass==undefined || newClass=="")newClass=Classe;
			else
			if(!istClass(htmlNode,Classe))newClass+=' '+Classe;			
			htmlNode.className=newClass;
		}			
	}

	var subClass=function(htmlNode,Classe){
		var aClass,i;
		if(htmlNode!=undefined && htmlNode.className!=undefined){
			aClass=htmlNode.className.split(" ");	
			var newClass="";
			for(i=0;i<aClass.length;i++){
				if(aClass[i]!=Classe){
					if(newClass!="")newClass+=" ";
					newClass+=aClass[i];
					}
			}
			htmlNode.className=newClass;
		}
	}
	var delClass=function(htmlNode){
		if(htmlNode!=undefined) htmlNode.className="";		
	}
	var getClasses=function(htmlNode){return htmlNode.className;}
	
	//helper 
	var isAppBridge=function(){
		if(typeof(AppBridge)!="undefined")return true;
		return false;
	}
	
	var AppBrComIO=function(befehl,refunc,daten){
		if(isAppBridge){
			var AB=new AppBridge();
			AB.DataIO(befehl, refunc,daten);			
		}
	}
	var AppBrComSys=function(befehl,daten){
		if(isAppBridge){
			var AB=new AppBridge();
			AB.Message(befehl,daten);
		}
	}
	
	
	
	//--API---
	
	this.ini=function(zielid){
		zielNode=gE(zielid);
		zielNode.innerHTML="load ini...";		
		
		AppBrComIO("getoptionen",optionenLoaded,undefined);
	}
	
	this.Message=function(s,data){
		//console.log(s,data);
		if(s=="resize"){
			Programmeinstellungen.windowsize=data;
			AppBrComIO("setoptionen", 
						function(data){
							if(data.status!=200)console.log(data);
						},
						Programmeinstellungen);
		}
	}
	
	//--Elemente--
	var InputDateiStream=function(ziel){
		var data={
			"inputfiles":undefined,
			"countFrom":0,
			"countTo":0,
			"name":"",
			"pfad":"",
			"counterzeichen":0
		}
		
		var span;
		var set=cE(ziel,"p");
		var input=cE(set,"input");
		input.accept="image/*";
		input.type="file";
		
		
		span=cE(set,"label");
		span.innerHTML=getWort("Zähler von");
		
		var inputFrom=cE(set,"input");
		inputFrom.type="number";
		inputFrom.min="0";
			
		span=cE(set,"label");
		span.innerHTML=getWort("bis");
		
		var inputTo=cE(set,"input");
		inputTo.type="number";
		inputTo.min="0";
		
		//API
		this.getData=function(){return data;}
		
		//inner Func
		var changeDatei=function(e){
			data.inputfiles=e.target.files;
			
			var file=data.inputfiles[0];//.path .name .size .type			
			
			var temp=file.name.split('.')[0];			
			if(temp.indexOf("_")>0){
				
				//Bereich
				var couternum=temp.split('_')[1];
				data.counterzeichen=couternum.length;
				data.countFrom=parseInt(couternum);
				
				if(data.countTo<data.countFrom)data.countTo=data.countFrom;
								
				inputFrom.value=data.countFrom;
				inputTo.value  =data.countTo;
				
				//Pfad
				temp=file.path;
				data.pfad=temp.split(file.name)[0];	

				//Namsplit name(zähler)endung
				data.name=file.name.split(couternum);
			}
			
			console.log(data,e);
		}
		var changeFrom=function(e){
			data.countFrom=parseInt(this.value);
			console.log(data,e);
		}
		
		var changeTo=function(e){
			data.countTo=parseInt(this.value);
			console.log(data,e);
		}
		
		
		//Events
		input.addEventListener("change",changeDatei);
		inputFrom.addEventListener("change",changeFrom);
		inputTo.addEventListener("change",changeTo);
		
		
	}

	
	//--Programm--
	var optionenLoaded=function(datjson){
		var i,indat,property;
		if(datjson.status==200){
			indat=JSON.parse(datjson.dat);
			//gespeicherte Propertys anfügen/ersetzen
			for( property in indat ) {
					Programmeinstellungen[property]=indat[property];
			}
			console.log("setProgrammeinstellungen",Programmeinstellungen);
		}
		else
			console.log(datjson);//es gibt noch keine Optionen, ignorieren
		
		
		if(Programmeinstellungen.showDevTool===true){
			AppBrComSys("showDevTool",true);
		}
		
		CreateProgramm();
	}
	
	var CreateProgramm=function(){
		zielNode.innerHTML="";
		
		var i,nodeset,h1,input;
		
		
		//Quellen
		nodeset=cE(zielNode,"div",undefined,"nodeset");
		h1=cE(nodeset,"h1");
		h1.innerHTML=getWort("Quellen");
		//[Pfad zu ersten Datei] [Anzahl Bilder/vonbis]
		
		o_quellen.push(new InputDateiStream(nodeset));
		o_quellen.push(new InputDateiStream(nodeset));
		o_quellen.push(new InputDateiStream(nodeset));
		o_quellen.push(new InputDateiStream(nodeset));
		o_quellen.push(new InputDateiStream(nodeset));
		o_quellen.push(new InputDateiStream(nodeset));
		
		//Optionen
		nodeset=cE(zielNode,"div",undefined,"nodeset");
		h1=cE(nodeset,"h1");
		h1.innerHTML=getWort("Stichoptionen");
		
		
		
	}
	
	
	
	
}


//Maincontainer
document.write("<div id='myapplication'></div>");

var oProgramm_app;
//Start nach dem Laden
window.addEventListener('load', function (event) {
		oProgramm_app=new vrstich_app();
		oProgramm_app.ini("myapplication");
	});
