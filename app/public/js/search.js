"use strict";

(function ($) {

    var progressBarClasses = 'progress-bar progress-bar-striped progress-bar-warning active';

    $(document).ready(function () {

        function getTournaments() {
            $.ajax({
                url: "/search/submit",
                type: "GET",
                data: $("#search-tournaments").serialize(),
                success: function success(databack, status, xhr) {
                    $("#results-body").empty();
                    $(databack).hide().appendTo("#results-body").fadeIn(300);
                    // $("#results-body").empty().append(databack);
                    $("#search-submit").text("Search");
                },
                error: function error(xhr, status, err) {
                    $("#search-submit").text("Something went wrong!");
                },
                complete: function complete(xhr, status) {
                    $("#search-submit").prop("disabled", false);
                }
            });
        }

        function downloadJSON(anchor) {
            var progressBar = $(".progress-indicator");
            progressBar.addClass(progressBarClasses);
            $.ajax({
                url: $(anchor).attr("href"),
                type: "GET",
                success: function success(databack, status, xhr) {
                    if (window.navigator.msSaveOrOpenBlob) {
                        var fileData = [JSON.stringify(databack, null, 4)];
                        var blobObject = new Blob(fileData);
                        $(anchor).click(function () {
                            window.navigator.msSaveOrOpenBlob(blobObject, $(anchor).attr("data-link"));
                        });
                    } else {
                        var type = xhr.getResponseHeader('Content-Type');
                        var blob = new Blob([JSON.stringify(databack, null, 4)], { type: type });
                        var URL = window.URL || window.webkitURL;
                        var downloadUrl = URL.createObjectURL(blob);
                        var tempAnchor = document.createElement("a");
                        // safari doesn't support this yet
                        if (typeof tempAnchor.download === 'undefined') {
                            window.location = downloadUrl;
                        } else {
                            tempAnchor.href = downloadUrl;
                            tempAnchor.download = $(anchor).attr("data-link") + $(anchor).attr("data-extension");
                            document.body.appendChild(tempAnchor);
                            tempAnchor.click();
                            setTimeout(function () {
                                document.body.removeChild(tempAnchor);
                                window.URL.revokeObjectURL(downloadUrl);
                            }, 100);
                        }
                    }
                },
                complete: function complete() {
                    setTimeout(function () {
                        progressBar.removeClass(progressBarClasses);
                    }, 500);
                }
            });
        }

        $("#search-submit").click(function () {
            var empty = 0;
            $("#search-tournaments").find("input").each(function () {
                if ($(this).val().trim().length === 0) {
                    empty++;
                }
            });
            if (empty !== 2) {
                $(this).text("Searching..").prop("disabled", true);
                getTournaments();
            }
        });

        $("body").on("click", ".download-json", function (e) {
            e.preventDefault();
            downloadJSON($(this));
        });
    });
})(jQuery);