'use strict';

(function ($) {

    var constants = {
        MIN_USER_LENGTH: 5,
        MAX_USER_LENGTH: 25,
        MIN_PASS_LENGTH: 5,
        EMAIL_REGEX: /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    };

    var entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': '&quot;',
        "'": '&#39;',
        "/": '&#x2F;'
    };

    function escapeHtml(string) {
        return String(string).replace(/[&<>"'\/]/g, function (s) {
            return entityMap[s];
        });
    }

    $(document).ready(function () {

        $("#confirmname").click(function () {
            if (!checkNameRequirements()) {
                console.log("checks out");
                changeNameAJAX();
            }
        });

        $("#confirmpass").click(function () {
            if (!checkPasswordRequirements()) {
                console.log("success");
                changePassAJAX();
            }
        });
    });

    function checkNameRequirements() {
        $("input").css("border-width", '0');
        var problem = false;
        if ($("#namein").val().length < constants.MIN_USER_LENGTH || $("#namein").val().length > constants.MAX_USER_LENGTH) {
            addRedBorder("#namein");
            problem = true;
        }
        if (!constants.EMAIL_REGEX.test($("#emailin").val())) {
            addRedBorder("#emailin");
            problem = true;
        }
        return problem;
    }

    function checkPasswordRequirements() {
        $("input").css("border-width", '0');
        var problem = false;
        if ($("#oldpassin").val().length < constants.MIN_PASS_LENGTH) {
            addRedBorder("#oldpassin");
            problem = true;
        }
        if ($("#newpassin1").val().length < constants.MIN_PASS_LENGTH) {
            addRedBorder("#newpassin1");
            problem = true;
        }
        if ($("#newpassin2").val().length < constants.MIN_PASS_LENGTH) {
            addRedBorder("#newpassin2");
            problem = true;
        }
        if ($("#newpassin1").val() !== $("#newpassin2").val()) {
            addRedBorder("#newpassin1");
            addRedBorder("#newpassin2");
            problem = true;
        }
        return problem;
    }

    function addRedBorder(input) {
        $(input).css("border-color", "rgba(220, 20, 0, .7)");
        $(input).css("border-width", "5px");
    }

    function showMessageInDiv(div, message, err) {
        var html = "";
        $(div).empty();
        if (err) {
            html = "<p style='margin-left:10px;font-size:18px;color:#ff3300'>" + message + "<i class='fa fa-times-circle' style='margin-left:5px'></i></p>";
        } else {
            html = "<p style='margin-left:10px;font-size:18px;color:#009933'>" + message + "<i class='fa fa-check-circle' style='margin-left:5px'></i></p>";
        }
        $(html).hide().appendTo(div).fadeIn(300);
    }

    function changeNameAJAX() {
        var html = "<p style='margin-left:10px; font-size:18px;'>Updating... <i class='fa fa-spinner fa-spin'></i></p>";
        $("#updatenamemsg").empty().append(html);
        $.ajax({
            url: "/auth/local/edit",
            type: "POST",
            data: $("#editaccountgeneral").serialize(),
            success: function success(databack, status, xhr) {
                showMessageInDiv("#updatenamemsg", "Edited account successfully", null);
            },
            error: function error(xhr, status, err) {
                if (err == "Forbidden") {
                    showMessageInDiv("#updatenamemsg", "Someone else is already using that email", err);
                } else if (err == "Internal Server Error") {
                    showMessageInDiv("#updatenamemsg", "Couldn't update right now. Please try again later.", err);
                } else {
                    showMessageInDiv("#updatenamemsg", "You're not logged in!", err);
                }
                console.log(err);
            }
        });
    }

    function changePassAJAX() {
        var html = "<p style='margin-left:10px; font-size:18px;'>Updating... <i class='fa fa-spinner fa-spin'></i></p>";
        $("#updatepassmsg").empty().append(html);
        $.ajax({
            url: "/auth/local/pass",
            type: "POST",
            data: $("#editpassform").serialize(),
            success: function success(databack, status, xhr) {
                showMessageInDiv("#updatepassmsg", "Password change success!", null);
            },
            error: function error(xhr, status, err) {
                if (err == "Unauthorized") {
                    showMessageInDiv("#updatepassmsg", "You're not logged in!", err);
                } else if (err == "Forbidden") {
                    showMessageInDiv("#updatepassmsg", "That's not your password!", err);
                } else {
                    showMessageInDiv("#updatepassmsg", "Couldn't update right now. Please try again later.", err);
                }
            }
        });
    }
})(jQuery);