'use strict';

var constants = {
    MIN_USER_LENGTH : 5,
    MAX_USER_LENGTH : 25,
    MIN_PASS_LENGTH : 5,
    EMAIL_REGEX : /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
}

$(document).ready(function() {

    $("#login").click(function() {
        checkLoginForms();
    });
    $("#regbutton").click(function() {
        checkRegistrationForms();
    });
    $("#passwordinput").keypress(function(e) {
        if (e.which == 13) {
            checkLoginForms();
        }
    });


    $("#gotoregister").click(function() {
        $("#loginpanel").fadeOut(200, function() {
            $("#registerpanel").fadeIn(200);
        });
    });

    $("#closereg").click(function() {
        $("#registerpanel").fadeOut(200, function() {
            $("#loginpanel").fadeIn(200);
        });
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
    $("#registererror").empty().
        append("<p style='margin-left:10px; font-size:18px;'>Working... <i class='fa fa-spinner fa-spin' style='margin-left:5px'></i></p>");
    $.ajax({
        url : "/register/local",
        method : "POST",
        data : $("#signupform").serialize(),
        success : function(databack, status, xhr) {
            if (databack.exists) {
                showMessageInDiv("#registererror", databack.msg, "exists");
            } else {
                showMessageInDiv("#registererror", "Success! Logging in...", null);
                document.forms["logins"]["usrname"].value = document.forms["signup"]["r_usrname"].value;
                document.forms["logins"]["pswd"].value = document.forms["signup"]["r_pswd"].value;
                submitLogin();
            }
            document.getElementById("signupform").reset();
        },
        error : function(xhr, status, err) {
            showMessageInDiv("#registererror", "Registration isn't working right now", err);
        }
    });
}

function showMessageInDiv(div, message, err) {
    var html = "";
    $(div).show().empty();
    if (err) {
        html = "<p style='margin-left:10px;font-size:18px;color:#ff3300'>" + message + "<i class='fa fa-times-circle' style='margin-left:5px'></i></p>";
    } else {
        html = "<p style='margin-left:10px;font-size:18px;color:#009933'>" + message + "<i class='fa fa-check-circle' style='margin-left:5px'></i></p>";
    }
    $(html).hide().appendTo(div).fadeIn(300);
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

function checkLoginForms() {
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
    }
}

function checkRegistrationForms() {
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
}
