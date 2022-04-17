/**
 * Trasliteration Tool
 * @author Junaid P V ([[user:Junaidpv]])
 * @date 2010-05-19
 * License: GPLv3, CC-BY-SA 3.0
 */
/**
 * Define your own regular expression rules here. Or include predefined rules before this file.
 * They should be in associative arrays named 'rules' and 'memrules'
 * 'rules' table is for normal rewriting
 * 'memrules' table is for memorised rules
*/

// defining to store state info
var trasliteration_fields = {};
// memory for previus key sequence
var previous_sequence = {};
// temporary disabling of transliteration
var temp_disable = {};
/**
 * from: http://stackoverflow.com/questions/3053542/how-to-get-the-start-and-end-points-of-selection-in-text-area/3053640#3053640
 */
function GetCaretPosition(el) {
    var start = 0, end = 0, normalizedValue, range,
        textInputRange, len, endRange;

    if (typeof el.selectionStart == "number" && typeof el.selectionEnd == "number") {
        start = el.selectionStart;
        end = el.selectionEnd;
    } else {
        range = document.selection.createRange();
        if (range && range.parentElement() == el) {
            len = el.value.length;
            normalizedValue = el.value.replace(/\r\n/g, "\n");

            // Create a working TextRange that lives only in the input
            textInputRange = el.createTextRange();
            textInputRange.moveToBookmark(range.getBookmark());

            // Check if the start and end of the selection are at the very end
            // of the input, since moveStart/moveEnd doesn't return what we want
            // in those cases
            endRange = el.createTextRange();
            endRange.collapse(false);

            if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
                start = end = len;
            } else {
                start = -textInputRange.moveStart("character", -len);
                start += normalizedValue.slice(0, start).split("\n").length - 1;

                if (textInputRange.compareEndPoints("EndToEnd", endRange) > -1) {
                    end = len;
                } else {
                    end = -textInputRange.moveEnd("character", -len);
                    end += normalizedValue.slice(0, end).split("\n").length - 1;
                }
            }
        }
    }
    return {
        start: start,
        end: end
    };
}

/**
 * from: http://stackoverflow.com/questions/3274843/get-caret-position-in-textarea-ie
 */
function offsetToRangeCharacterMove(el, offset) {
    return offset - (el.value.slice(0, offset).split("\r\n").length - 1);
}
/**
 * IE part from: http://stackoverflow.com/questions/3274843/get-caret-position-in-textarea-ie
 */
function setCaretPosition (el, iCaretPos)
{
    if (document.selection) // IE
    {
			var startOffset = iCaretPos;
 			var endOffset = iCaretPos;

	var range = el.createTextRange();
	var startCharMove = offsetToRangeCharacterMove(el, startOffset);
	range.collapse(true);
	if (startOffset == endOffset) {
		range.move("character", startCharMove);
	} else {
		range.moveEnd("character", offsetToRangeCharacterMove(el, endOffset));
		range.moveStart("character", startCharMove);
	}
	range.select();
    }
    else if (el.selectionStart || el.selectionStart == '0') // Firefox
    {
        el.setSelectionRange(iCaretPos, iCaretPos);
    }
}

function getLastSixChars(str, caretPosition)
{
	if(caretPosition <= 6 ) return str.substring(0,caretPosition);
	else return str.substring(caretPosition-6,caretPosition);
}

function replaceTransStringAtCaret(control, oldStringLength, newString, selectionRange)
{
	var text = control.value;
	// firefox always scrolls to topmost position,
	// to scroll manually we keep original scroll postion.
	var scrollTop = 0;
	if(control.scrollTop || control.scrollTop=='0') { scrollTop = control.scrollTop; }
	var newCaretPosition;
	if(text.length  >= 1) {
		var firstStr = text.substring(0, selectionRange.start - oldStringLength + 1);
		var lastStr = text.substring(selectionRange.end, text.length);
		control.value = firstStr+newString+ lastStr;
		newCaretPosition = firstStr.length+newString.length;
		setCaretPosition(control,newCaretPosition);
	}
	else { 
		control.value = newString;
		newCaretPosition = newString.length;
		setCaretPosition(control,newCaretPosition);
	}
	// Manually scrolling in firefox, few tweeks or re-writing may require
	if (navigator.userAgent.indexOf("Firefox")!=-1) {
		var textLength = control.value.length;
		var cols = control.cols;
		if(newCaretPosition > (textLength-cols)) {
			//var height = parseInt(window.getComputedStyle(control,null).getPropertyValue('height'));
			var fontsize = parseInt(window.getComputedStyle(control,null).getPropertyValue('font-size'));
			//var lineheight = height/fontsize;
			control.scrollTop = scrollTop+fontsize;
		} else control.scrollTop = scrollTop;
	}
}

/**
 * This function will take a string to check against regular expression rules in the rules array.
 * It will return a two member array, having given string as first member and replacement string as
 * second member. If corresponding replacement could not be found then second string will be too given string
*/
function trans(lastpart,e)
{
	var len = lastpart.length;
	var i=0;
	var part1 = lastpart;
	var part2 = lastpart;
	var found = false;
  var toTrans;
  var key;
outerloop1:
	for(i=0; i< len; i++)
	{
		toTrans = lastpart.substring(i, len);
		for(key in memrules)
		{
			if((new RegExp(key)).test(toTrans) && (new RegExp(memrules[key][0])).test(previous_sequence[(e.currentTarget || e.srcElement).id ]))
			{
				part1 = toTrans;
				part2 = toTrans.replace(RegExp(key), memrules[key][1]);
				found = true;
				break outerloop1;
			}
		}
	}
	if(!found)
	{
	outerloop2:
		for(i=0; i< len; i++)
		{
			toTrans = lastpart.substring(i, len);
			for(key in rules)
			{
				if((new RegExp(key)).test(toTrans))
				{
					part1 = toTrans;
					part2 = toTrans.replace(RegExp(key), rules[key]);
					break outerloop2;
				}
			}
		}
	}
	var pair = new Array(part1, part2);
	return pair;
}
/**
 * from: http://www.javascripter.net/faq/settinga.htm
 */

/**
 * from: http://www.javascripter.net/faq/readinga.htm
 */


function enableTrasliteration(controlID, enable) {
	if(enable===undefined) { enable = true; }
	var cookieValue;
	if(enable) {
		trasliteration_fields[controlID] = true;
		temp_disable[controlID] = false;
		cookieValue = 1;
	}
	else {
		trasliteration_fields[controlID] = false;
		cookieValue = 0;
	}
	var checkbox = document.getElementById(controlID+'cb');
	if(checkbox) { checkbox.checked = enable; }

}

// event listener for trasliterattion textfield
// also listen for Ctrl+M combination to disable and enable trasliteration
function tiKeyPressed(event) {
	var e = event || window.event;
	var code = e.charCode || e.keyCode;
	var targetElement = (e.currentTarget || e.srcElement);
	if (code == 8 ) { previous_sequence[targetElement.id] = ''; return true; } // Backspace
    // If this keystroke is a function key of any kind, do not filter it
    if (e.charCode == 0 || e.which ==0 ) return true;       // Function key (Firefox and Opera), e.charCode for Firefox and e.which for Opera
    if (e.ctrlKey || e.altKey) // Ctrl or Alt held down
	{
		if (e.ctrlKey && (e.keyCode == 13 || e.which == 109)) // pressed Ctrl+M
		{
			enableTrasliteration(targetElement.id, !trasliteration_fields[targetElement.id]);
			return false;
		}
		return true;
	}
	if (code < 32) return true;             // ASCII control character
	if(trasliteration_fields[targetElement.id])
	{
		
		var c = String.fromCharCode(code);
		var selectionRange = GetCaretPosition(targetElement);
		var lastSevenChars = getLastSixChars(targetElement.value, selectionRange.start);
		var oldString = "";
    var newString = "";
		if(code ==62 && previous_sequence[targetElement.id ].substring(previous_sequence[targetElement.id ].length-1)=="<") 
		{
			oldString = "<>";
			newString = "";
			temp_disable[targetElement.id] = !temp_disable[targetElement.id];
		}
		else {
			if(!temp_disable[targetElement.id])
			{
				var transPair = trans(lastSevenChars+c, e);
				oldString = transPair[0];
				newString = transPair[1];
			}
			else 
			{
				oldString = c;
				newString = c;
			}
		}
		replaceTransStringAtCaret(targetElement, oldString.length, newString , selectionRange);
		previous_sequence[targetElement.id ] += c;
		if(previous_sequence[targetElement.id ].length > 6 ) previous_sequence[targetElement.id ] = previous_sequence[targetElement.id ].substring(previous_sequence[targetElement.id ].length-6);
		if(event.preventDefault) event.preventDefault();
		else if(event.cancelBubble) { event.cancelBubble = true; }
		return false;
	}
	return true;
}
/**
 * This is the function to which call during window load event for trasliterating textfields.
 * The funtion will accept any number of HTML tag IDs of textfields.
*/
function transliterate(id) {
	var len = arguments.length;
	for(var i=0;i<len; i++)
	{
		var element = document.getElementById(arguments[i]);
		if(element)
		{
			trasliteration_fields[arguments[i]] = true;
			previous_sequence[arguments[i]] = '';
			//element.onkeypress = tiKeyPressed;
			if (element.addEventListener){
				element.addEventListener('keypress', tiKeyPressed, false);
			} else if (element.attachEvent){  
				element.attachEvent("onkeypress", tiKeyPressed);  
			}  
		}
	}
}

function transOptionOnClick(event)
{
	var e = event || window.event;
	var checkbox =  (e.currentTarget || e.srcElement);
	if(checkbox.checked)
	{
		enableTrasliteration(checkbox.value,true);
	}
	else
	{
		enableTrasliteration(checkbox.value,false);
	}
}
// change this value to "after" or "before" to position transliteration option check box
var TO_POSITION = "after";
// check box message
var CHECKBOX_TEXT = "To Write Malayalam (Ctrl+M)";
// call this function to add checkbox to enable/disable transliteration
function addTransliterationOption()
{
	var len = arguments.length;
	for(var i=0;i<len; i++)
	{
		var element = document.getElementById(arguments[i]);
		if(element)
		{
			var checkbox = document.createElement('input');
			checkbox.id = arguments[i]+'cb';
			checkbox.type = 'checkbox';
			checkbox.value = arguments[i];
			checkbox.onclick = transOptionOnClick;
			checkbox.checked = true;
			var para = document.createElement('p');
			para.appendChild(checkbox);
			var text = document.createTextNode(CHECKBOX_TEXT);
			para.appendChild(text);
			if(TO_POSITION=="after") element.parentNode.insertBefore(para, element.nextSibling);
			else if(TO_POSITION=="before") element.parentNode.insertBefore(para, element);
		}
	}
}

/**
 * This functions is to synchronize state transliteration state to fields from cookies
 */
function translitStateSynWithCookie() {
	var len = arguments.length;
	for(var i=0;i<len; i++)
	{
		var element = document.getElementById(arguments[i]);
		if(element)
		{
			var state = readCookie("tr"+arguments[i]);
			var enable = true;
			if(parseInt(state) == 0) { enable=false; }
			enableTrasliteration(arguments[i],enable);
		}
	}
}