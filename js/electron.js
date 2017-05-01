"use strict";

// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.


const electron = require('electron');
const {remote} = electron;
const {dialog, BrowserWindow} = remote;
const fs = require('fs');
const nativeImage = require('electron').nativeImage;

var path = require('path');
path.join(__dirname, 'templates');

var app = require('electron').remote; 
var oProgrammWin;


var basepathDATA=""; //Speicherort für Programmdaten, C:\Users\andreas\Documents 

var ProgrammOrdner="VRStich";
var DateinameOptionen="optionen.json";

var AppBridge=function(){//temporärres Objekt für DatiIO, etc.
		
	var refunction=undefined;
	var zurl="";
	var _this=this;
	
	var readFile=function(filepath){
		
		
		if(fs.existsSync(filepath)){
			fs.readFile(
				filepath, 
				'utf-8', 
				function (err, data) {
					var redata={
							"status":200,
							"msg":"OK",
							"dat":""
							};
					//console.log(filepath,data);
					if(err){
					  //alert("An error ocurred reading the file :" + err.message);
					  console.log("!!Error",err.message);
					  redata={	"status":404,
								"msg":"notfound",
								"dat":err.message
							};
					}
					else{
						redata.dat=data;
					}
					
					if(refunction!=undefined)refunction(redata);					
				}
			);
		}
		else{
			var dataRE={	"status":404,
							"msg":"filenotexist",
							"dat":{}
						};
			console.log("ERROR:filenotexist",filepath);
			if(refunction!=undefined)refunction(dataRE);
		}
		
	};
	
	
	//system (loadDataAPP)<->elektron 
	this.DataIO=function(aktion, auswertfunc,datenJSON){
		//console.log("DataIO",aktion,getorpost,daten,fs);
		
		if(basepathDATA=="")return;
		
		refunction=auswertfunc;
		
		if(aktion=="getImage"){			
			var img = nativeImage.createFromPath(datenJSON.url);
			
			if (typeof img.getBitmap === 'function'){	
				var dataRE={"status":200,"msg":"OK","img":img};
				if(refunction!=undefined)refunction(dataRE);
			}
			else{
				var imgstr=img.toDataURL();
					var helperimg=new Image;
					helperimg.onload = function(){
						var dataRE={"status":200,"msg":"OK","img":helperimg};
						if(refunction!=undefined)refunction(dataRE);					  
					};
					helperimg.src=imgstr;
			}
			
			/*
			build:
				getNativeHandle()
				getSize()
				isEmpty()
				isTemplateImage()
				setTemplateImage()
				toDataURL()
				toJpeg()
				toPng()
				
				
			test:	
				getNativeHandle()
				getSize()
				isEmpty()
				isTemplateImage()
				setTemplateImage()
				toDataURL()
				toJpeg()
				toPng()				
				
				NativeImage()
				crop()
				getAspectRatio()
				getBitmap()
				resize()
				toBitmap()
				toJPEG()
				toPNG()
			*/
			
			
			
			
			
			
		}
		else
		if(aktion=="getfile"){
			if(datenJSON.url!=undefined)
				readFile(datenJSON.url);
		}
		else
		if(aktion=="getoptionen"){
			readFile(basepathDATA+DateinameOptionen);
		}
		else
		if(aktion=="setoptionen"){			
			fs.writeFile(
				basepathDATA+DateinameOptionen, 
				JSON.stringify(datenJSON),
				'utf-8',
				function(err) {
					var dataRE={"status":200,"msg":"OK"};
					if(err){
						console.log(">>",err);
						data.status=404;
						data.msg="notwrite";
					}
					if(refunction!=undefined)refunction(dataRE);
				}
			);
		}
		else
			alert("load\n"+aktion+'\n'+daten);
	}

	this.Message=function(s,data){
		if(s=="showDevTool"){
			var win=remote.getCurrentWindow();
			if(data===true)				
					win.webContents.openDevTools();
					else
					win.webContents.closeDevTools();			
		};			
	};
	
}


var theAppWindowObjekt=function(){
	
	
	var ini=function(){
		var win=remote.getCurrentWindow();
		
		var userdokumente=app.app.getPath('documents');// C:\Users\andreas\Documents 
		
		if(!fs.existsSync(userdokumente+"/"+ProgrammOrdner)){			
			fs.mkdirSync(userdokumente+"/"+ProgrammOrdner);		//create dir if not
		}
		
		basepathDATA=userdokumente+"/"+ProgrammOrdner+"/";
		basepathDATA=path.normalize(basepathDATA);

		
		setWindowsizepositionAtStart();//SetWindowSize
		
		
		win.on('move',EventResize);//OK
		//http://electron.atom.io/docs/api/web-contents/
		window.addEventListener('resize',EventResize );
		
	}
	
	var setWindowsizepositionAtStart=function(){
		var r,optionen,
			win=remote.getCurrentWindow();
			
		if(fs.existsSync(basepathDATA+DateinameOptionen)){
			r=fs.readFileSync(basepathDATA+DateinameOptionen,'utf-8',"a");
			if(r!=""){
				optionen=JSON.parse(r);
				if(optionen.windowsize!=undefined){
					win.setPosition(optionen.windowsize.x,optionen.windowsize.y);
					if(optionen.windowsize.width>0 && optionen.windowsize.height>0)
						win.setSize(optionen.windowsize.width,optionen.windowsize.height);
				}
			}
		}
		else{
			console.log("keine Optionsdatei gefunden.");
		}
		
	}
	
	
	var EventResize=function(event){
		var win=remote.getCurrentWindow();
		var bereich=win.getBounds();// x: 279, y: 84, width: 1250, height: 640
		if(typeof(oProgramm_app)!="undefined")
			if(oProgramm_app!=undefined){
				oProgramm_app.Message("resize",bereich);
			}
		
	}
	
/*	var win=remote.getCurrentWindow();
		win.webContents.openDevTools();
*/
	
	ini();
}



window.addEventListener('load', function (event) {
		oProgrammWin=new theAppWindowObjekt();
	});