"use strict";

var constants = {
    MIN_USER_LENGTH : 5,
    MAX_USER_LENGTH : 15,
    MIN_PASS_LENGTH : 5,
    PASS_REGEX : /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
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
            $("#errorlabel").text("Enter Your Email Address and Password to Continue.")
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

    $("#register").click(function() {
        $("#registerWindow").animate({
            left : "0%"
        }, 500);
        // $("#registerWindow").css("left", "0%");
        console.log($("#registerWindow").css("left"));

        $("#loginbox").animate({
            left : "-200%"
        }, 500);
    });

    $("#closereg").click(function() {
        $("#loginbox").animate({
            left : "0%"
        }, 500);

        $("#registerWindow").animate({
            left : "-200%"
        }, 500);
    });

});



function checkEmailInForm() {
    return document.forms["logins"]["usrname"].value.length >= constants.MIN_USER_LENGTH
        && document.forms["logins"]["usrname"].value.length < constants.MAX_USER_LENGTH;
}

function checkPasswordInForm() {
    return document.forms["logins"]["pswd"].value.length >= constants.MIN_PASS_LENGTH;
}

function submitLogin() {
    document.logins.submit();
}

function submitRegistration() {
    $.ajax({
        url : "/register",
        method : "POST",
        data : $("#signupform").serialize(),
        success : function(databack, status, xhr) {
            document.getElementById("signupform").reset();
        }
    });
}

function checkRegisterEmail(email) {
    return constants.PASS_REGEX.test(email);
}

function checkRegisterPassword(password) {
    return password.length >= constants.MIN_PASS_LENGTH;
}

function checkPasswordsMatch(pass1, pass2) {
    return pass1 === pass2;
}
