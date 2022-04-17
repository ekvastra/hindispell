var mode = 'full';
var selectedWord;
Array.prototype.unique = function(){
    var a = this.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i] === a[j])
                a.splice(j, 1);
        }
    }

    return a;
};
function initApp()
{
	wordList = wordList.sort();
	makeWordIndex();
	var query = getQueryParams(document.location.search);
	if(typeof query.lang!="undefined")
	{
		lang=query.lang;
	}
	else
	{
		lang = "unicode";
	}
	if(query.mode!="mini")
	{
		mode=query.mode;
	}
	else
	{
		mode = "full";
	}
	document.getElementById("language").value=lang;
	
	// document.getElementById("wordCount").innerHTML="Chanakya : "+wordListChanakya.length+", Unicode : "+wordListUnicode.length;
	document.getElementById("wordCount").innerHTML="Unicode : "+wordListUnicode.length;
	document.getElementById("version").innerHTML='Version : '+version;
	initLanguage();
	initDatabase();
}
var lang="unicode";
var mouseX;
var mouseY;
var wordListObj=null;
var wordListObjParent = null;
var wordIndex = Array();

function getQueryParams(qs) {
    qs = qs.split("+").join(" ");

    var params = {}, tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;

    while (tokens = re.exec(qs)) {
        params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
    }

    return params;
}


String.prototype.trim=function(){return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');};
function callAjax(url,parm,fun)
{
	$.post(url,parm,fun);
}
function makeWordIndex()
{
	var oldChar = '';
	var start=0;
	var end =0;
	for(var i=0;i<wordList.length;i++)
	{
		var ch = wordList[i].charAt(0);
		
		if(ch!=oldChar)
		{
			var temp = Array();
			temp.char=oldChar;
			temp.start=start;
			temp.end=end;
			wordIndex[wordIndex.length]=temp;
			oldChar=ch;
			start = i;
		}
		end=i;
		
	}
}

if (!Array.prototype.indexOf) 
{
  Array.prototype.indexOf = function (obj, fromIndex) 
  {
    if (fromIndex === null) 
	{
        fromIndex = 0;
    } else if (fromIndex < 0) 
	{
        fromIndex = Math.max(0, this.length + fromIndex);
    }
    for (var i = fromIndex, j = this.length; i < j; i++) 
	{
        if (this[i] === obj)
            return i;
    }
    return -1;
  };
}
function editrOnMouseUp(e)
{
	var event = window.event?window.event:e;
	
	mouseX = event.pageX;
	mouseY = event.pageY;
	removePriviusWordList();
}
function removePriviusWordList()
{
	if(wordListObjParent!==null)
	{
	    var anchor = document.getElementById("mainbody"); 
		anchor.removeChild(wordListObjParent);
		wordListObjParent=null;
		selectedWord=null;
	}
}
function displayWordList(word,obj)
{
	selectedWord = word;
	/* jsharma check if we have already created this element once then reuse */
	wordListObjParent=document.createElement('div');
	wordListObjParent.id="wordListSuggestion";
	wordListObjParent.className="wordListSuggestionPerent";
	wordListObjParent.style.top = (mouseY+10)+"px";
	wordListObjParent.style.left = (mouseX+10)+"px";
	
	
	wordListObj = document.createElement('div');
	wordListObj.className="wordListSuggestion";
	wordListObj.innerHTML=word;
	addEditMenu(word);
	wordListObjParent.appendChild(wordListObj);
	
	var anchor = document.getElementById("mainbody"); 
	anchor.appendChild(wordListObjParent);
	
	updateWordList(word,obj);
	if(typeof downloadFileName!="undefined")
	{
		addListMenu(word);
	}
	transliterate("editWord");
}
function matchChar(ch1,ch2)
{
	for(var i=0;i<wordConvrtion.length;i++)
	{
		if(ch1==wordConvrtion[i][0]){ch1=wordConvrtion[i][1];}
		if(ch2==wordConvrtion[i][0]){ch2=wordConvrtion[i][1];}
	}
	
	if(ch1==ch2)
	{
		return true;
	}
	return false;
}
function filterArray(list,word,position)
{
	var temp = Array();
	var j=0;
	for(var i=0;i<list.length;i++)
	{
		if(matchChar(list[i].charAt(position),word.charAt(position)))
		{
			temp[j]=list[i];
			j++;
		}
	}
	return temp;
}
function filterReverceArray(list,word,position)
{
	var temp = Array();
	var j=0;
	for(var i=0;i<list.length;i++)
	{
		if(matchChar(list[i].charAt(list[i].length-position),word.charAt(word.length-position))==true)
		{
			temp[j]=list[i];
			j++;
		}
	}
	return temp;
}
var selectedWordObject=null;
function left2right(word,temp,check)
{
	if(check==true)
	{
		var oldTmp;
		for(var i=0;i<word.length;i++)
		{
			oldTmp=filterArray(temp,word,i);
			if(oldTmp.length>0)
			{
				temp = oldTmp;
			}
			else
			{
				break;
			}
		}
	}
	return temp;
}
function right2left(word,temp,check)
{
	if(check==true)
	{
		var oldTmp;
		for(var i=1;i<=word.length;i++)
		{
			oldTmp=filterReverceArray(temp,word,i);
			if(oldTmp.length>0)
			{
				temp = oldTmp;
			}
			else
			{
				break;
			}
		}
	}
	return temp;
}

function updateWordList(word,sourceobj)
{
	word = word.trim();
	var temp = wordList;
	selectedWordObject=sourceobj;
	var left = document.getElementById("leftCheck").checked;
	var right = document.getElementById("rightCheck").checked;
	if(left==false && right==false)
	{
		left=true;
		right=true;
	}
	
	
	var position=getWordPosition(word[0]);
	if (position === null) return;
	temp = temp.slice(position.start,position.end);
	
	temp = left2right(word,temp,left);
	temp = right2left(word,temp,right);
	
	
	var temp1 = right2left(word,wordList,right);
	temp1 = left2right(word,temp1,left);
	temp = temp.concat(temp1).unique(); 
	
	wordListObj.innerHTML="";
  var obj;
	if(temp.length<1000)
	{
		for(var i=0;i<temp.length;i++)
		{
			obj = document.createElement('div');
			obj.innerHTML=temp[i];
			obj.className="wordListItem";
			obj.onclick = function(e) 
				{
					selectedWordObject.innerHTML = e.target.innerHTML;
					selectedWordObject.className="";
					selectedWordObject.onclick=null;
					selectedWordObject=null;
					removePriviusWordList();
				};
			wordListObj.appendChild(obj);
		}
	}
	else
	{
		obj = document.createElement('div');
		obj.innerHTML="Many record selected";
		wordListObj.appendChild(obj);
	}
}
function getWordPosition(ch)
{
	for(var i=1;i<wordIndex.length;i++)
	{
		if(wordIndex[i].char==ch)
		{
			return wordIndex[i];
		}
	}
	return null;
}
var waitScreenObj=null;
function addWordFromKeyboard(e,word)
{
	var ctrlPressed=0;
	var altPressed=0;
	var shiftPressed=0;

	if (parseInt(navigator.appVersion)>3) 
	{

		var evt = e ? e:window.event;

		if (document.layers && navigator.appName=="Netscape"&& parseInt(navigator.appVersion)==4) 
		{
			// NETSCAPE 4 CODE
			var mString =(e.modifiers+32).toString(2).substring(3,6);
			shiftPressed=(mString.charAt(0)=="1");
			ctrlPressed =(mString.charAt(1)=="1");
			altPressed  =(mString.charAt(2)=="1");
			self.status="modifiers="+e.modifiers+" ("+mString+")";
		}
		else 
		{
			// NEWER BROWSERS [CROSS-PLATFORM]
			shiftPressed=evt.shiftKey;
			altPressed  =evt.altKey;
			ctrlPressed =evt.ctrlKey;
			self.status="" + "shiftKey="+shiftPressed +", altKey=" +altPressed +", ctrlKey=" +ctrlPressed; 
		}
		//alert(ctrlPressed);
		if(ctrlPressed==true && evt.keyCode==69 && selectedWord!=null)
		{
			//alert(evt.keyCode);
			
			addListInDb(selectedWord);
		}
		
		if(ctrlPressed==true)
		{
			document.getElementById("leftCheck").checked=false;
			if(evt.keyCode==67)
			{
				copyText();
			}
			if(evt.keyCode==86)
			{
				pasteText();
			}
		}
		if(shiftPressed==true)
		{
			document.getElementById("rightCheck").checked=false;
		}
		
	}
	
}
function onKeyUpBody(e)
{
	var ctrlPressed=0;
	var altPressed=0;
	var shiftPressed=0;

	if (parseInt(navigator.appVersion)>3) 
	{

		var evt = e ? e:window.event;

		if (document.layers && navigator.appName=="Netscape"&& parseInt(navigator.appVersion)==4) 
		{
			// NETSCAPE 4 CODE
			var mString =(e.modifiers+32).toString(2).substring(3,6);
			shiftPressed=(mString.charAt(0)=="1");
			ctrlPressed =(mString.charAt(1)=="1");
			altPressed  =(mString.charAt(2)=="1");
			self.status="modifiers="+e.modifiers+" ("+mString+")";
		}
		else 
		{
			// NEWER BROWSERS [CROSS-PLATFORM]
			shiftPressed=evt.shiftKey;
			altPressed  =evt.altKey;
			ctrlPressed =evt.ctrlKey;
			self.status=""	+  "shiftKey="+shiftPressed +", altKey="  +altPressed 	+", ctrlKey=" +ctrlPressed;
		}
		
		if(ctrlPressed==false)
		{
			document.getElementById("leftCheck").checked=true;
		}
		if(shiftPressed==false)
		{
			document.getElementById("rightCheck").checked=true;
		}
		
	}
}

function addListInDb(word)
{
	callAjax("insertword.php?word="+word+"&lang="+document.getElementById("language").value,"",
	function(resp)
	{
		alert(resp);
		removePriviusWordList();
	});
}
function addEditMenu(word)
{
	var obj = document.createElement("div");
	obj.className = "editToListOption";
	obj.innerHTML='<input type="text" style="width:140px;" id="editWord" value="'+word+'" /><input type="button" value="Set" onclick="updateExitText()" />';
	wordListObjParent.appendChild(obj);
}
function updateExitText()
{
	var er = document.getElementById("editWord");
	selectedWordObject.innerHTML = er.value;
	selectedWordObject.className="";
	selectedWordObject.onclick=null;
	selectedWordObject=null;
	removePriviusWordList();
}
function addListMenu(word)
{
	var obj = document.createElement("div");
	obj.className = "addToListOption";
	obj.innerHTML="Add to list";
	obj.onclick=function(e)
	{
		addListInDb(word);
	};
	wordListObjParent.appendChild(obj);
}
function addWaitScreen()
{
	waitScreenObj = document.createElement('div');
	waitScreenObj.style.width=document.body.clientWidth+"px";
	waitScreenObj.style.height=document.body.clientHeight+"px";
	waitScreenObj.id="waitScreen";
	waitScreenObj.style.position="absolute";
	waitScreenObj.style.top=0;
	waitScreenObj.style.left=0;
	waitScreenObj.style.zIndex=100;
	waitScreenObj.style.cursor="wait";
	document.body.appendChild(waitScreenObj);
}
function removeWaitScreen()
{
	document.body.removeChild(waitScreenObj);
}
var spChar = Array();
spChar[0]='-';
spChar[1]=',';
spChar[2]='"';
spChar[3]='\'';
spChar[4]='।';
spChar[5]='—';
spChar[6]='Ð';
spChar[7]='?';
spChar[8]=':';
spChar[9]='(';
spChar[10]=')';
spChar[11]='[';
spChar[12]=']';
var chSign = Array();
var pChSign = Array();
function priChekc(text)
{
	text = text.split(' ');
  var i;
  var ch;
	for(i=0;i<text.length;i++)
	{
		ch = text[i][text[i].length-1];
		var chx = spChar.indexOf(ch);
		var pch = text[i][0];
		var pchx = spChar.indexOf(pch);
		if(chx!=-1)
		{
			chSign[i]=spChar[chx];
			text[i]=text[i].substr(0,text[i].length-1);
			
		}
		else
		{
			chSign[i]=' ';
			
		}
		
		if(pchx!=-1)
		{
			pChSign[i]=spChar[pchx];
			text[i]=text[i].substr(1,text[i].length);
		}
		else
		{
			pChSign[i]='';
		}
	}
	for(i=0;i<text.length;i++)
	{
		ch = text[i].split("-");
		if(ch.length>1)
		{
			text[i]=ch[0];
			text.splice(i+1, 0, ch[1]);
			chSign.splice(i, 0, "-");
			pChSign.splice(i+1, 0, "");
		}
	}
	return text;
}
function checkSpell()
{
	removeTextFormating();
	var obj = document.getElementById("editor");
	var text = obj.innerHTML;

	var out='';
	text = text.replace(/<br>/g," <br> ");
	text= priChekc(text);
	addWaitScreen();
	var d = new Date();
	var n = d.getTime(); 
	for(var i=0;i<text.length;i++)
	{
		var word = text[i];	
		word1 = word.trim();
		var status=false;
		if(wordList.indexOf(word1)>-1)
		{
			status=true;
		}
		if(parseInt(word1)>=0 || parseInt(word1)<0)
		{
			status = true;
		}
		if(status==false)
		{
			var wd =  word.replace(/\'/g,"\\\'");
			out=out+pChSign[i]+'<span  onclick="displayWordList('+"'"+wd+"'"+',this)" class="invalidWord">'+word+'</span>'+chSign[i]+" ";
		}
		else
		{
			out= out+pChSign[i]+word+chSign[i]+" ";
		}
	}
	obj.innerHTML=out;
	removeWaitScreen();
}
function initLanguage()
{
		if(lang=="unicode")
		{
			wordList = wordListUnicode;
			wordConvrtion = wordConvrtionUnicode;
			// jsharma document.getElementById("editor").className = "editorUnicode";
		}
		else 
		{
			wordList = wordListChanakya;
			wordConvrtion = wordConvrtionChanakya;
			//jsharma document.getElementById("editor").className = "editorChanakya";
		}
}
function changeLanguage(obj)
{
	lang = obj.value;
	initLanguage();
}
function clearApplication()
{
	document.getElementById("editor").innerHTML="";
	document.getElementById("checkSpellButton").disabled=false;
	document.getElementById("language").disabled=false;
}
 function RemoveContent () 
 {
	var srcObj = document.getElementById ("editor");
  var rangeObj;
   
	if (document.createRange) {     // all browsers, except IE before version 9
		rangeObj = document.createRange ();
		rangeObj.selectNodeContents (srcObj);
	}
	else {      // Internet Explorer before version 9
		rangeObj = document.body.createTextRange ();
		rangeObj.moveToElementText (srcObj);
		rangeObj.select ();
		rangeObj.execCommand ('copy');
	}
}
function copyToClipboard( text )
{
	var copyDiv = document.createElement('div');
	copyDiv.contentEditable = true;
	document.body.appendChild(copyDiv);
	copyDiv.innerHTML = text;
	copyDiv.unselectable = "off";
	copyDiv.focus();
	document.execCommand('SelectAll');
	document.execCommand("Copy", false, null);
	document.body.removeChild(copyDiv);
}
function removeTextFormating()
{
	var obj = document.getElementById("editor");
	var text = obj.innerHTML;
	text = text.replace(/<br\s*\/?>/mg,"#####");
	obj.innerHTML = text;
	text = obj.textContent||obj.innerText;
	text = text.replace(/#####/g, '<br>');
	obj.innerHTML=text;
}
function pasteText()
{

}
function copyText()
{

}
function clearFormat()
{
	removeTextFormating();
}
function initDatabase()
{
	
}