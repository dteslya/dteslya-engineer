/* This file extends Axiom theme JS
   More info here: https://www.axiomtheme.com/docs/extending/
*/

function changeValue(elementName, newValue){
    document.getElementsByName(elementName)[0].value=newValue;
    window.location.hash = "#comment-form";
  };
