"use strict";

var constants = {
    MIN_USER_LENGTH : 5,
    MAX_USER_LENGTH : 15,
    MIN_PASS_LENGTH : 5,
    EMAIL_REGEX : /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
}

$(document).ready(function() {
    $("#login").click(function() {
        var message = "";
        if (checkEmailInForm()) {
            if (checkPasswordInForm()) {
                submitLogin();
            } else {
                message += "Please enter a valid password. "
            }
        } else {
            message += "Please enter a valid email "
            if (!checkPasswordInForm()) {
                message += "and password."
            }
        }
        if (message.length != 0) {
            $("#errorlabel").text(message);
        } else {
            $("#errorlabel").text("Welcome to Neg 5, a Quizbowl tournament management system. Login to continue.")
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
        $(".list-group-item").css({"color" : "white"});
        var problem = false;
        if (name.length < constants.MIN_USER_LENGTH
                || name.length > constants.MAX_USER_LENGTH) {
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

    $("#gotoregister").click(function() {
        $("#registerpanel").fadeIn(600);
    });

    $("#closereg").click(function() {
        $("#registerpanel").fadeOut(600);
    });

});

function checkEmailInForm() {
    return document.forms["logins"]["usrname"].value.length >= constants.MIN_USER_LENGTH;
}

function checkPasswordInForm() {
    return document.forms["logins"]["pswd"].value.length >= constants.MIN_PASS_LENGTH;
}

function submitLogin() {
    document.logins.submit();
}

function submitRegistration() {
    $.ajax({
        url : "/register/local",
        method : "POST",
        data : $("#signupform").serialize(),
        success : function(databack, status, xhr) {
            $("#registererror").text(databack);
            document.getElementById("signupform").reset();
        }
    });
}

function checkRegisterEmail(email) {
    return constants.EMAIL_REGEX.test(email);
}

function checkRegisterPassword(password) {
    return password.length >= constants.MIN_PASS_LENGTH;
}

function checkPasswordsMatch(pass1, pass2) {
    return pass1 === pass2;
}
