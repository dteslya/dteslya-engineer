var onloadCallbackCaptcha = function (sitekey) {
    grecaptcha.render('div-recaptcha');
};

function showComments() {
    // load recaptcha script (delete if not using recaptcha)
    var script = document.createElement('script');
    script.setAttribute('src', 'https://www.google.com/recaptcha/api.js?onload=onloadCallbackCaptcha&render=explicit');
    document.head.appendChild(script);
}

function checkForm(form) {

    if (typeof (grecaptcha) === "undefined") {
        form.warningComment.style.display = 'block';
        form.warningComment.innerText = "There was a problem loading the reCaptcha so it is not possible to submit a comment at the moment";
        return false;
    }
    else if (grecaptcha.getResponse() == "") {
        form.warningComment.style.display = 'block';
        form.warningComment.innerText = "Please confirm you are not a robot :)";
        return false;
    }
    else if (form.yourname.value == "") {
        form.warningComment.style.display = 'block';
        form.warningComment.innerText = "Please type your name";
        return false;
    }
    else if (form.yourcomment.value == "") {
        form.warningComment.style.display = 'block';
        form.warningComment.innerText = "Please type a comment";
        return false;
    }
    else {
        form.submitButton.disabled = true;
        form.warningComment.style.display = 'none';
        form.warningComment.innerText = "";
        form.submitButton.innerText = "Sending...";
        return true;
    }

}