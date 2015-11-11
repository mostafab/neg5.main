"use strict";

$(document).ready(function() {
    $("#login").click(function() {
        if (checkEmailInForm()) {
            submitLogin();
        } else {
            console.log("Invalid email");
            $("h1").text("Not Valid Email.");
        }
    });
    $("#regbutton").click(function() {
        /**
        * Get the information the user entered and check that against the
        * rules set
        */
        var name = document.forms["signup"]["r_name"].value;
        var email = document.forms["signup"]["r_usrname"].value;
        var password = document.forms["signup"]["r_pswd"].value;
        var passwordCopy = document.forms["signup"]["r_pswd_2"].value;
        $("li").css({"color" : "black"});
        var problem = false;
        if (name.length < 5 || name.length > 15) {
            $("#l_name").css({"color" : "red"});
            problem = true;
        }
        if (!checkRegisterEmail(email)) {
            $("#l_email").css({"color" : "red"});
            problem = true;
        }
        if (!checkRegisterPassword(password)) {
            $("#l_password").css({"color" : "red"});
            problem = true;
        }
        if (!checkPasswordsMatch(password, passwordCopy)) {
            $("#l_match").css({"color" : "red"});
            problem = true;
        }
        if (!problem) {
            submitRegistration();
        }

    });

});

function checkEmailInForm() {
    return document.forms["logins"]["usrname"].value.length != 0;
}

function submitLogin() {
    document.logins.submit();
}

function submitRegistration() {
    document.signup.submit();
}

function checkRegisterEmail(email) {
    var regex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return regex.test(email);
}

function checkRegisterPassword(password) {
    return password.length >= 5;
}

function checkPasswordsMatch(pass1, pass2) {
    return pass1 === pass2;
}
