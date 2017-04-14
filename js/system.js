"use strict";

var vrstich_app=function(){
	var Programmeinstellungen={//als Einstellungen gespeichert
		windowsize:{x:0,y:0,width:0,height:0},
		showDevTool:true
	};
	
	var zielNode;
	
	var programmdaten={
		quellen:[],
		stitchoptionen:undefined,
		inputziel:undefined,
		progressbar:undefined,
		iscalc:false,
		startbutt:undefined,
		calcpos:0,
		getfiles:[],
		canvas:undefined,
		
		zielsize:{width:0,height:0},
		imageoverlap:10 //px
	}
	
	
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
	
	var color_rgb=function(r,g,b){
		var crgb={"r":0,"g":0,"b":0};
		
		
		var setColors=function(r,g,b){
			var tmp;
			if(typeof r ==="number"){crgb.r=r;}
			if(typeof g ==="number"){crgb.g=g;}
			if(typeof b ==="number"){crgb.b=b;}
			
			if(typeof r ==="string"){ 
				if(r.indexOf("#")==0 && r.length==7){	
					crgb.b=parseInt("0x"+r.substr(5,2));
					crgb.g=parseInt("0x"+r.substr(3,2));
					crgb.r=parseInt("0x"+r.substr(1,2));
				}
				if(r.indexOf("#")==0 && r.length==4){
					crgb.b=parseInt("0x"+r.substr(3,1)+r.substr(3,1));
					crgb.g=parseInt("0x"+r.substr(2,1)+r.substr(2,1));
					crgb.r=parseInt("0x"+r.substr(1,1)+r.substr(1,1));
				}
				if(r.indexOf("rgb(")==0){
					tmp=r.substr(r.indexOf("rgb(")+4);
					tmp.split(')').join('');
					tmp=tmp.split(',');
					crgb.r=parseInt(tmp[0]);
					crgb.g=parseInt(tmp[1]);
					crgb.b=parseInt(tmp[2]);
				}
			}
			
		}
		
		this.r=function(){return crgb.r;}
		this.g=function(){return crgb.g;}
		this.b=function(){return crgb.b;}
		
		this.getColorStr=function(){
			return "rgb("+crgb.r+","+crgb.g+","+crgb.b+")";
		}
		this.getRGB=function(){
			return {"r":crgb.r,"g":crgb.g,"b":crgb.b};
		}
		
		setColors(r,g,b);
	}
	
	var colormix=function(c1,c2,pos,retyp){//c1/c1->(.r .g .b) pos 0..100 typ="rgbstring"||"objekt"
		if(pos<0)pos=0;
		if(pos>100)pos=100;
		pos=pos/100;
		//(Math.round( ( tranf1[i]+(tranf2[i) - tranf1[i])*framepos)*100 )/100) +einheit
		
		var reR= Math.round(c1.r+(c2.r-c1.r)*pos);
		var reG= Math.round(c1.g+(c2.g-c1.g)*pos);
		var reB= Math.round(c1.b+(c2.b-c1.b)*pos);
		
		if(retyp=="rgbstring")
			return "rgb("+reR+","+reG+","+reB+")";
		else
			return {"r":reR,"g":reG,"b":reB};
		
	}
	
	var generatenummer=function(nummer,nlength){
		var re=""+nummer;
		while(re.length<nlength){
			re="0"+re;
		}
		return re;
	}
	
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
	var InputDateiStream=function(ziel,id,changefunc){
		var data={
			"countFrom":0,
			"countTo":0,
			"name":[],
			"pfad":"",
			"counterzeichen":0,
			"id":id,
			"ladestatus":"", //"load","ready","ERR"
			"nativeImage":undefined
		};
		
		var AB=new AppBridge();
		
		var inputFile,inpFileButt,inpText,inputFrom,inputTo;
			
		var create=function(){
			var set,span;
			
			var set=cE(ziel,"p");
			span=cE(set,"span");
			span.innerHTML=data.id;
			
			inputFile=cE(set,"input",undefined,"hiddenbutton");
			inputFile.accept="image/*";
			inputFile.type="file";
			
			inpFileButt=cE(set,"input",undefined,"inputfilebutt");
			inpFileButt.type="button";
			inpFileButt.value=getWort("dateiselect");
			
			inpText=cE(set,"span",undefined,"inputlabelfile");
			if(data.name.length==2)
				inpText.innerHTML=data.name[0]+generatenummer(data.countFrom,data.counterzeichen)+data.name[1];
				else
				inpText.innerHTML=getWort("nichtsgewaehlt");
			
			//
			
			span=cE(set,"span");
			span.innerHTML=getWort("Zähler von");
			
			inputFrom=cE(set,"input");
			inputFrom.type="number";
			inputFrom.min="0";
			inputFrom.value=data.countFrom;
			
			span=cE(set,"span");
			span.innerHTML=getWort("bis");
			
			inputTo=cE(set,"input");
			inputTo.type="number";
			inputTo.min="0";
			inputTo.value=data.countTo;
			
			//set=cE(ziel,"p");
		
			//Events
			inpFileButt.addEventListener("click",function(){inputFile.click();});
			inputFile.addEventListener("change",changeDatei);
			inputFrom.addEventListener("change",changeFrom);
			inputTo.addEventListener("change",changeTo);
			
			
		}
		
			
		
		//API
		this.getData=function(){return data;}
		
		this.loadFileNr=function(nr){
			var fnum=data.countFrom + nr;
			var surl=data.pfad+data.name[0]+generatenummer(fnum,data.counterzeichen)+data.name[1];
			data.ladestatus="load";			
			AB.DataIO("getImage",fileloaded,{"url":surl});
		}
		
		this.showfirstPic=function(){
			showDatei();
		}
		
		//--func--
		var showDatei=function(){
			//zeige erstes Bild an
			var fnum=data.countFrom;
			var surl=data.pfad+data.name[0]+generatenummer(fnum,data.counterzeichen)+data.name[1];
			data.ladestatus="load";			
			AB.DataIO("getImage",firstfileloaded,{"url":surl});
			
		}
		
		var setSetting=function(){
			var property;
			var set=Programmeinstellungen['IDS_'+data.id];
			if(set!=undefined){				
				for( property in set ) {
					data[property]=set[property];
				}
			}
		}
		var saveSetting=function(){
			Programmeinstellungen['IDS_'+data.id]={
				"countFrom":data.countFrom,
				"countTo":data.countTo,
				"name":data.name,
				"pfad":data.pfad,
				"counterzeichen":data.counterzeichen
			};
			//savig...
			AB.DataIO(	"setoptionen", 
						function(data){
							if(data.status!=200)console.log(data);
						},
						Programmeinstellungen
					 );
		}
		
		var fileloaded=function(e){
			data.nativeImage=e.img;			
			if(!e.img.isEmpty())
				data.ladestatus="ready";
				else
				data.ladestatus="ERR";
			
			checkLadecyclus();
		}
		
		var firstfileloaded=function(e){
			if(e.img==undefined)return;
			
			data.nativeImage=e.img;	
			drawpreviewImage(data.id,data.nativeImage);
		}
		
		//inner Func
		var changeDatei=function(e){
			var file=e.target.files[0];//.path .name .size .type			
			
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
				
				inpText.innerHTML=data.name[0]+generatenummer(data.countFrom,data.counterzeichen)+data.name[1];
				
				saveSetting();
				showDatei();
			}
			
			if(changefunc!=undefined)changefunc();
		}
		var changeFrom=function(e){
			data.countFrom=parseInt(this.value);
			saveSetting();
			if(changefunc!=undefined)changefunc();
		}
		
		var changeTo=function(e){
			data.countTo=parseInt(this.value);
			saveSetting();
			if(changefunc!=undefined)changefunc();
		}
		
		
		/*var imageLoaded=function(e){
			console.log("geladen",e);
			data.ladestatus="ready";
			checkLadecyclus();
		}
		var imageErr=function(e){
			data.ladestatus="ERR";
			console.log("loaderror",e);
			checkLadecyclus();
		}*/
		
		
		
		setSetting();
		create();
	}

	var InputOrdner=function(ziel,changefunc){
		var data={
			"pfad":""
		}
		
		var AB=new AppBridge();
		
		//API
		this.getData=function(){return data;}
		
		
		//Elemente
		var input,input2,spaninfo;
		
		//innerfunc
		var create=function(){
			input=cE(ziel,"input",undefined,"hiddenbutton");
			input.type="file";
			input.webkitdirectory="webkitdirectory";
			
			input2=cE(ziel,"input",undefined,"inputfilebutt");
			input2.type="button";
			input2.value=getWort("select");
			
			spaninfo=cE(ziel,"span",undefined,"inputlabelpath");
			spaninfo.innerHTML=data.pfad;
			
			//Events
			input.addEventListener("change",changeDatei);
			input2.addEventListener("click",clickinpb);
		}
		
		var setSetting=function(){
			var property;
			var set=Programmeinstellungen['outputOrdner'];
			if(set!=undefined){				
				for( property in set ) {
					data[property]=set[property];
				}
			}
		}
		var saveSetting=function(){
			Programmeinstellungen['outputOrdner']={
				"pfad":data.pfad
			};
			//savig...
			AB.DataIO(	"setoptionen", 
						function(data){
							if(data.status!=200)console.log(data);
						},
						Programmeinstellungen
					 );
		}
		
		
		var changeDatei=function(e){
			if(e.target.files.length>0){
				var file=e.target.files[0];//.path .name .size .type			
				data.pfad=file.path;
				spaninfo.innerHTML=data.pfad;
			}
			
			saveSetting();
			
			if(changefunc!=undefined)changefunc();
		}
		var clickinpb=function(e){
			input.click();
		}
		
		setSetting();
		create();
	}
	
	var stitchOptionenInputs=function(ziel){
		var data={
			"abstand":10
		}
		var inputN;
		var AB=new AppBridge();
		
		var setSetting=function(){
			var property;
			var set=Programmeinstellungen['stitchOption'];
			if(set!=undefined){				
				for( property in set ) {
					data[property]=set[property];
				}
			}
			
			programmdaten.imageoverlap=data.abstand;
		}
		var saveSetting=function(){
			Programmeinstellungen['stitchOption']={
				"abstand":data.abstand
			};
			//savig...
			AB.DataIO(	"setoptionen", 
						function(data){
							if(data.status!=200)console.log(data);
						},
						Programmeinstellungen
					 );
			programmdaten.imageoverlap=data.abstand;
		}
		
		
		var create=function(){
			var p,span;
			p=cE(ziel,"p");
			span=cE(p,"span");
			span.innerHTML=getWort("Abstand");
			
			inputN=cE(p,"input");
			inputN.type="number";
			inputN.min="0";			
			inputN.value=data.abstand;
			
			inputN.addEventListener("change",changeInput);
		}
		
		var changeInput=function(e){
			data.abstand=parseInt(this.value);
			saveSetting();
		}
		
		setSetting();
		create();
	}
	
	var Progressbar=function(ziel,optionen){
		if(ziel==undefined)return;
		
		//[ ...text... ]
		var base	=cE(ziel,"div",undefined,"progressbar");
		var balken	=cE(base,"div",undefined,"progressbarbalken");
		var stext	=cE(base,"span",undefined,"progressbartext");
		
		var value=0;
		var boptionen=optionen;
		var _this=this;
		
		
		//--API--
		this.set=function(i,s){//0...100%
			var f1,f2,posA,posE,pos;
			
			if(i>100)i=100;
			if(i<0)i=0;
			value=i;
			
			balken.style.width=value+"%";
			if(s!=undefined){
				if(s.indexOf('$v')>-1){
					s=s.split('$v').join(value+" %");
				}
				if(s.length==0)s=value+" %";
				stext.innerHTML=s;
			}
			
			if(boptionen!=undefined){
				if(boptionen!=undefined){
					if(typeof boptionen.bgcolor ==="string")	base.style.backgroundColor=boptionen.color;
					if(typeof boptionen.color ==="string")		balken.style.backgroundColor=boptionen.color;
					if(typeof boptionen.textcolor ==="string")	stext.style.color=boptionen.color;
				}
				if(Object.prototype.toString.call( boptionen.color ) === '[object Array]'){
					balken.style.backgroundColor=calcArrayColorStr(boptionen.color,value);
				}
				if(Object.prototype.toString.call( boptionen.textcolor ) === '[object Array]'){
					stext.style.color=calcArrayColorStr(boptionen.textcolor,value);
				}
			}
			
		}
		this.get=function(){return value;}
		
		var calcArrayColorStr=function(liste,i){
			var j,farbe="";
			var f1,f2,posA,posE,pos;
			
			var pliste=Math.floor((liste.length-1)/100*i);
			if(pliste<0)pliste=0;
			if(pliste>liste.length-1)pliste=liste.length-1;
			
			var crgb=liste[pliste];
			if(pliste<liste.length-1)
				{
					f1=liste[pliste];	
					f2=liste[pliste+1];
					posA=100/(liste.length-1)*pliste;
					posE=100/(liste.length-1)*(pliste+1);
					pos=100/(posE-posA)*(i-posA);
					
					farbe=colormix(f1.getRGB(),f2.getRGB(), pos, "rgbstring");					
				}
				else
				{
					//console.log("*",pliste);
					farbe=crgb.getColorStr();
				}
			return farbe;
		}
		
		
		//--setup--
		/*if(boptionen!=undefined){
			if(typeof boptionen.bgcolor ==="string")	base.style.color=boptionen.color;
			if(typeof boptionen.color ==="string")		balken.style.color=boptionen.color;
			if(typeof boptionen.textcolor ==="string")	stext.style.color=boptionen.color;
		}
		console.log(typeof boptionen.acolor);
		console.log(typeof boptionen.c1);
		console.log( Object.prototype.toString.call( boptionen.c2 ) === '[object Array]'  );
		*/
		_this.set(0);
	}
	
	//--Programm--
	var optionenLoaded=function(datjson){//create
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
		
		var i,nodeset,h1,input,span,p,ids,table,tr,td,tabhelper,trhelper,tdhelper;
		
		
		//Quellen
		nodeset=cE(zielNode,"div",undefined,"nodeset");
		h1=cE(nodeset,"h1");
		h1.innerHTML=getWort("Quellen");
		//[Pfad zu ersten Datei] [Anzahl Bilder/vonbis]
		
		programmdaten.quellen.push(new InputDateiStream(nodeset,"1",checkstartAvailable));//Anzhahl auf rest verteilen?
		programmdaten.quellen.push(new InputDateiStream(nodeset,"2",checkstartAvailable));
		programmdaten.quellen.push(new InputDateiStream(nodeset,"3",checkstartAvailable));
		programmdaten.quellen.push(new InputDateiStream(nodeset,"4",checkstartAvailable));
		programmdaten.quellen.push(new InputDateiStream(nodeset,"5",checkstartAvailable));
		programmdaten.quellen.push(new InputDateiStream(nodeset,"6",checkstartAvailable));
		
		
		tabhelper=cE(nodeset,"table",undefined,"vtab");
		trhelper=cE(tabhelper,"tr");
		tdhelper=cE(trhelper,"td",undefined,"noborder");
		p=cE(tdhelper,"span");
		p.innerHTML=getWort("Verteilung")+':';
		
		/*	Verteilung
			[1][2][3]
			[4][5][6]
		*/
		table=cE(tdhelper,"table",undefined,"vtab");
		tr=cE(table,"tr");
		td=cE(tr,"td");		td.innerHTML="1";
		td=cE(tr,"td");		td.innerHTML="2";
		td=cE(tr,"td");		td.innerHTML="3";
		tr=cE(table,"tr");
		td=cE(tr,"td");		td.innerHTML="4";
		td=cE(tr,"td");		td.innerHTML="5";
		td=cE(tr,"td");		td.innerHTML="6";
		
		
		tdhelper=cE(trhelper,"td",undefined,"noborder");
		p=cE(tdhelper,"span");
		p.innerHTML=getWort("geometrie")+':';
		/*	Würfel
			   [6]
			[1][2][3][4]
			   [5]
		*/
		table=cE(tdhelper,"table",undefined,"vtab");
		tr=cE(table,"tr");
		td=cE(tr,"td",undefined,"noborder");
		td=cE(tr,"td");		td.innerHTML="6";
		td=cE(tr,"td",undefined,"noborder");
		td=cE(tr,"td",undefined,"noborder");
		
		tr=cE(table,"tr");
		td=cE(tr,"td");		td.innerHTML="1";
		td=cE(tr,"td");		td.innerHTML="2";	
		td=cE(tr,"td");		td.innerHTML="3";
		td=cE(tr,"td");		td.innerHTML="4";
		
		tr=cE(table,"tr");
		td=cE(tr,"td",undefined,"noborder");
		td=cE(tr,"td");		td.innerHTML="5";
		td=cE(tr,"td",undefined,"noborder");
		td=cE(tr,"td",undefined,"noborder");
		
		
		//Zielordner
		nodeset=cE(zielNode,"div",undefined,"nodeset");
		h1=cE(nodeset,"h1");
		h1.innerHTML=getWort("Zielordner");
		
		programmdaten.inputziel=new InputOrdner(nodeset,checkstartAvailable);
		
		
		//Optionen
		nodeset=cE(zielNode,"div",undefined,"nodeset");
		h1=cE(nodeset,"h1");
		h1.innerHTML=getWort("Stichoptionen");
		
		programmdaten.stitchoptionen=new stitchOptionenInputs(nodeset);
		
		
		
		//Action
		nodeset=cE(zielNode,"div",undefined,"nodeset");
		h1=cE(nodeset,"h1");
		h1.innerHTML=getWort("Aktion");
		
		input=cE(nodeset,"input");
		input.type="button";
		input.disabled="disabled";
		input.value=getWort("Berechnungstart");
		input.addEventListener("click",
			function(e){
					if(programmdaten.iscalc===true){
						programmdaten.iscalc=false;
						if(programmdaten.calcpos>0)
							input.value=getWort("Berechnungweiter");
						else
							input.value=getWort("Berechnungstart");
						
					}
					else{
						input.value=getWort("Berechnungpause");
						programmdaten.progressbar.set(0,"");
						programmdaten.iscalc=true;
						ladecyclus();
					}
				}
			);
		programmdaten.startbutt=input;
		
		programmdaten.progressbar
			=new Progressbar(nodeset,{
					color:[	
							new color_rgb("#dd2f2f"),
							new color_rgb("#f1e90a"),
							new color_rgb("#23bc3b")
						  ]
					});
		programmdaten.progressbar.set(0,"");
		
		programmdaten.canvas=cE(nodeset,"canvas",undefined,"calccanvas");
		
		for(i=0;i<programmdaten.quellen.length;i++){
			programmdaten.quellen[i].showfirstPic();
		}
		
		
		checkstartAvailable();	
	}
	
	var checkstartAvailable=function(){
		var i;
		var aktivieren=true;
		
		for(i=0;i<programmdaten.quellen.length;i++){
			if( (programmdaten.quellen[i].getData()).pfad=="")aktivieren=false;
		}
		
		if( (programmdaten.inputziel.getData()).pfad=="" )aktivieren=false;
		
		if(aktivieren)
			programmdaten.startbutt.disabled="";
	}
	
	
	var ladecyclus=function(){
		var i;
		for(i=0;i<programmdaten.quellen.length;i++){
			programmdaten.quellen[i].loadFileNr(programmdaten.calcpos);
		}
	}
	
	var setOutputCanvas=function(size){
		if(programmdaten.canvas==undefined)return;
		
		var b=size.width*3	+programmdaten.imageoverlap*6;//+überhanng*6
		var h=size.height*2	+programmdaten.imageoverlap*4//+überhanng*4	
		if(b!=programmdaten.canvas.width){
			programmdaten.canvas.width=b;	
			programmdaten.canvas.height=h;	
		}	
	}
	
	var drawBitmapTo=function(id,bitmap,px,py,size){
		var tempcanvas,tempcanvascc,pix,xx,yy,dpos,cc,size,imgd,bb,hh,ol,ow,oh;
		tempcanvas=document.createElement("canvas");
		tempcanvas.width=size.width;
		tempcanvas.height=size.height;
		tempcanvascc=tempcanvas.getContext("2d");
		imgd=tempcanvascc.getImageData(0,0,tempcanvas.width,tempcanvas.height);
		
		pix=imgd.data;//r,g,b,a
			
		for(yy=0;yy<tempcanvas.height;yy++)
		for(xx=0;xx<tempcanvas.width;xx++){
			dpos=(xx*4)+(yy)*tempcanvas.width*4;
			pix[dpos+0]=bitmap[dpos+2];//r g b a  b g r a
			pix[dpos+1]=bitmap[dpos+1];
			pix[dpos+2]=bitmap[dpos+0];
			pix[dpos+3]=bitmap[dpos+3];
		}
		tempcanvascc.putImageData(imgd,0,0);
		
		cc=programmdaten.canvas.getContext("2d");
		cc.putImageData(imgd, 
						programmdaten.imageoverlap+px*(programmdaten.imageoverlap*2+size.width) , 
						programmdaten.imageoverlap+py*(programmdaten.imageoverlap*2+size.height) 
						);
		
		//Einzelausschnitte verteilen....
		/*	Verteilung
			  5     5     5
			4[1]2 1[2]3 2[3]4
			  6     6     6
			  5     2     4
			3[4]1 1[5]3 1[6]3
			  6     4     2
		*/
		
		ol=programmdaten.imageoverlap;
		ow=size.width;
		oh=size.height;
		if(id=="1"){			
			bb=programmdaten.imageoverlap;
			hh=size.height;
			//rechts  tempcanvas//qxy//qbh cc//zxy r
			drawCutImg(tempcanvas,	ow-bb,0,	bb,hh,	cc,ol*2+ow,ol,	0);			
			//links
			drawCutImg(tempcanvas,	0,0,	bb,hh, 		cc,ol+ow,ol*3+oh,	0);
						
			bb=size.width;
			hh=programmdaten.imageoverlap;
			//unten		
			drawCutImg(tempcanvas,	0,oh-hh,	bb,hh,	cc,ow+2*ol,ol*2+oh, -90);
			//oben
			drawCutImg(tempcanvas,	0,0,	bb,hh,  	cc,ol*3+ow, ol*4+oh*2, 90);
		}		
		if(id=="2"){
			bb=programmdaten.imageoverlap;
			hh=size.height;
			//rechts
			drawCutImg(tempcanvas,	ow-bb,0,	bb,hh,  cc,ol*4+ow*2,ol, 0);			
			//links
			drawCutImg(tempcanvas,	0,0,	bb,hh,  	cc, ol+ow,ol,	0);
			
			bb=size.width;
			hh=programmdaten.imageoverlap;
			//unten		
			drawCutImg(tempcanvas,	0,oh-hh,	bb,hh,	 cc, ow+3*ol,ol*2+oh, 0);
			//oben
			drawCutImg(tempcanvas,	0,0,	bb,hh,  	cc, ol*5+ow*2, ol*3+oh*2, 0);
		}			
		if(id=="3"){
			bb=programmdaten.imageoverlap;
			hh=size.height;
			//rechts
			drawCutImg(tempcanvas,	ow-bb,0,	bb,hh,  cc,0,ol*3+oh, 0);			
			//links
			drawCutImg(tempcanvas,	0,0,	bb,hh,  	cc, ol*3+ow*2,ol,	0);
			
			bb=size.width;
			hh=programmdaten.imageoverlap;
			//unten		
			drawCutImg(tempcanvas,	0,oh-hh,	bb,hh,	 cc, ol*3+oh,ol*3+ow*2, 90);
			//oben
			drawCutImg(tempcanvas,	0,0,	bb,hh,  	cc, ol*2+oh, ow*3+ol*5, -90);
		}		
		if(id=="4"){
			bb=programmdaten.imageoverlap;
			hh=size.height;
			//rechts
			drawCutImg(tempcanvas,	ow-bb,0,	bb,hh,  cc,0,ol, 0);			
			//links
			drawCutImg(tempcanvas,	0,0,	bb,hh,  	cc, ol*5+ow*3,ol,	0);
			
			bb=size.width;
			hh=programmdaten.imageoverlap;
			//unten		
			drawCutImg(tempcanvas,	0,oh-hh,	bb,hh,	 cc, 3*ol+ow,3*ol+2*oh, 180);
			//oben
			drawCutImg(tempcanvas,	0,0,	bb,hh,  	cc, 5*ol+2*ow, 2*ol+oh, 180);
		}		
		if(id=="5"){
			bb=programmdaten.imageoverlap;
			hh=size.height;
			//rechts
			drawCutImg(tempcanvas,	ow-bb,0,	bb,hh,  cc,ol,ol*5+ow*2, -90);			
			//links
			drawCutImg(tempcanvas,	0,0,	bb,hh,  	cc, ol+oh,ol,	90);
			
			bb=size.width;
			hh=programmdaten.imageoverlap;
			//unten		
			drawCutImg(tempcanvas,	0,oh-hh,	bb,hh,	 cc, ol,ol*3+oh*2, 180);
			//oben
			drawCutImg(tempcanvas,	0,0,	bb,hh,  	cc, 3*ol+ow,ol+oh, 0);
		}
		if(id=="6"){
			bb=programmdaten.imageoverlap;
			hh=size.height;
			//rechts
			drawCutImg(tempcanvas,	ow-bb,0,	bb,hh,  cc,0,ol*5+ow*2, 90);			
			//links
			drawCutImg(tempcanvas,	0,0,	bb,hh,  	cc, -oh,ol,	-90);
			
			bb=size.width;
			hh=programmdaten.imageoverlap;
			//unten		
			drawCutImg(tempcanvas,	0,oh-hh,	bb,hh,	 cc, ol*3+ow,0, 0);
			//oben
			drawCutImg(tempcanvas,	0,0,	bb,hh,  	cc, ol,ol*2+oh, 180);
			
			//eckenfiller
			//TODO
			drawEckenfiller(cc,0,0,ol,ol,"r|o");
		}
		
	}
	
	var drawEckenfiller=function(cc,x,y,b,h ,richtung){
		//richtung "u|l" "o|r" "r|u" "l|u" "r|o" "l|o" "u|l" "u|r"
		//         von|langeseite
		var r=richtung.split('|');
		var stepx=1,stepy=1,xa=0,ya=0;
		
		if(r[0]=="r"){}//stepx=-1;xa=b;
		if(r[0]=="l"){}
		if(r[0]=="o"){}
		if(r[0]=="u"){}//stepy=-1;ya=h;
		
		if(r[1]=="r"){}
		if(r[1]=="l"){}
		if(r[1]=="o"){}
		if(r[1]=="u"){}
		
		
	}
	
	var drawCutImg=function(quelle,qx,qy,qb,qh,  ccziel,zx,zy,r){
			ccziel.save();
			if(r==-90){
				ccziel.translate(0,qb);
				zx=-(zx+qh);
			}
			if(r==90){	
				ccziel.translate(0,0);
				zy=-(zy+qh);
			}
			if(r==180){
				zx=-(zx+qb);
				zy=-(zy+qh);
			}
			
			
			ccziel.rotate(r*Math.PI/180);
			ccziel.translate(zx,zy);
			
			ccziel.drawImage(quelle,
							qx,qy,	//qxy
							qb,qh, 	//qbh
							0,0,   	//x,y
							qb,qh 	//bh
						);						
			ccziel.restore();
		
	}
	
	
	var drawpreviewImage=function(id,nativeImage){
		var bitmap,tempcanvascc,pix,xx,yy,dpos,cc,size,
				px=0,py=0;
		
		if(id=="1"){px=0;py=0;}
		if(id=="2"){px=1;py=0;}
		if(id=="3"){px=2;py=0;}
		if(id=="4"){px=0;py=1;}
		if(id=="5"){px=1;py=1;}
		if(id=="6"){px=2;py=1;}
		
		size=nativeImage.getSize();//.width .height
		setOutputCanvas(size);
		
		bitmap=nativeImage.getBitmap();//r,g,b,a 1440000 600x600
		drawBitmapTo(id,bitmap,px,py,size);
	}
	
	var checkLadecyclus=function(){
		var i,d,geladen=true,maxfiles=0;
		for(i=0;i<programmdaten.quellen.length;i++){
			d=programmdaten.quellen[i].getData();
			if(maxfiles<d.countTo-d.countFrom)
				maxfiles=d.countTo-d.countFrom;
			
			if(d.ladestatus!="ready"){
				geladen=false;
			}			
		}

		if(geladen){
			var bitmap,tempcanvas,tempcanvascc,imgd,pix,xx,yy,dpos,cc,nimg,size,
				px,py;
			
			if(maxfiles>0)
				programmdaten.progressbar.set(Math.floor(100/maxfiles*programmdaten.calcpos),"");
			
			
			//draw on Canvas
			
			//erstes Bild holen, für Gesammtgröße
			d=programmdaten.quellen[0].getData();
			nimg=d.nativeImage;
			size=nimg.getSize();//.width .height
			
			//Größe des Canvas setzen
			setOutputCanvas(size);
			
			//alle zeichnen
			px=0;
			py=0;
			for(i=0;i<programmdaten.quellen.length;i++){
				d=programmdaten.quellen[i].getData();
				d.ladestatus="";
				nimg=d.nativeImage;
				size=nimg.getSize();
				
				bitmap=nimg.getBitmap();//r,g,b,a 1440000 600x600
				
				drawBitmapTo(d.id,bitmap,px,py,size);
				
				//d.id "1"..."o","u"
				//next zielpos
				px++;
				if(px==3){
					px=0;
					py++;
				}
			}
			
			
			
			//canvas speichern
			
			
			//nächstes Bilderserie (Frame)
			if(programmdaten.calcpos<maxfiles){
				programmdaten.calcpos++;				
				if(programmdaten.iscalc===true)setTimeout(ladecyclus,50);
			}
			else{
				programmdaten.progressbar.set(100,"");
				programmdaten.iscalc=false;
				programmdaten.calcpos=0;
				programmdaten.startbutt.value=getWort("Berechnungstart");
				//programmdaten.calcpos=0;
			}
		}
		
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
