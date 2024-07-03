<?php
require_once ('vendor/autoload.php');
require_once 'php/php_functions.php';


session_start();
if (!isset($_SESSION['ews_token'])) {
    header('Location: index.php?' . myUrlEncode($_SERVER["QUERY_STRING"]));
    exit();
} ?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>MR elojegyzes</title>


    <link rel="stylesheet" href="libs/css/font-awesome-all.min.css">
    <link rel="stylesheet" href="libs/css/bootstrap.min.css">
    <link rel="stylesheet" href="libs/css/bootstrap-icons.css">

    <link rel="stylesheet" href="libs/css/jquery.flexdatalist.css" />
    <link rel="stylesheet" href="libs/css/nouislider.css" />
    <link rel="stylesheet" href="libs/css/jquery.timepicker.min.css" />

    <link rel="stylesheet" href="css/my_styles.css">


    <script src="libs/js/jquery-3.7.1.min.js"></script>
    <script src="libs/js/underscore-min.js"></script>

    <!-- <script src="libs/js/popper.min.js"></script>
    <script src="libs/js/bootstrap.min.js"></script> -->

    <script src="libs/js/bootstrap.bundle.min.js"></script>

    <script src="libs/js/moment.min.js"></script>
    <script src="libs/js/moment-with-locales.min.js"></script>


    <script src="libs/js/jquery.flexdatalist.min.js"></script>
    <script src="libs/js/jquery.validate.min.js"></script>
    <script src="libs/js/jquery.validate.additional-methods.min.js"></script>

    <script src="libs/js/bootbox.min.js"></script>

    <script src="libs/js/index.umd.min.js"></script>


    <script src="libs/js/jquery.csv.min.js"></script>

    <script src="libs/js/wNumb.min.js"></script>
    <script src="libs/js/nouislider.min.js"></script>
    <script src="libs/js/jquery.timepicker.min.js"></script>

    <script src="libs/js/jspdf.umd.min.js"></script>
    <script src="libs/js/polyfills.umd.js"></script>
    <script src="libs/js/jspdf.plugin.autotable.min.js"></script>

    <script defer src="js/config.js"></script>

    <!-- FONT -->
    <!-- <script defer src="libs/my_fonts/Crimson-Roman-normal.js"></script> -->

    <!-- CORE -->
    <script defer src="js/core/additional_functions.js"></script>
    <script defer src="js/core/session_protection.js"></script>
    <script defer src="js/core/mr_calendar_event.js"></script>
    <script defer src="js/core/search_time_window.js"></script>
    <script defer src="js/core/mr_event_creator.js"></script>
    <script defer src="js/core/mr_timing_slot_browser.js"></script>
    <script defer src="js/core/mr_schedule_printer.js"></script>
    <script defer src="js/core/mr_event_browser.js"></script>
    <script defer src="js/core/mr_event_editor.js"></script>


    <!-- GUI -->
    <script defer src="js/gui/time_input.js"></script>


</head>

<body>

    <!-- Loading Overlay -->
    <div class="d-flex justify-content-center loading-overlay d-none">
        <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    </div>


    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container-fluid">
            <a class="navbar-brand" href="#">MR examination planner</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown"
                aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse justify-content-end" id="navbarNavDropdown">
                <ul class="navbar-nav">
                    <li class="nav-item me-3">
                        <a class="nav-link" id="sessionCountdown"></a>
                    </li>

                    <li class="nav-item me-3">
                        <a class="nav-link active" href="php/logout.php">Logout</a>
                    </li>

                </ul>
            </div>
        </div>

    </nav>



    <container class="d-flex flex-column align-items-center justify-content-center" id="main_container">
        <div class="d-flex  flex-column  p-2 m-2 col-lg-6 col-sm-9 col-12 align-self-center  justify-content-center">
            <div class="accordion accordion-flush" id="main_accordion">

                <div class="accordion-item shadow">
                    <h2 class="accordion-header" id="plan_content_header">
                        <button class="accordion-button" type="button" data-bs-toggle="collapse"
                            data-bs-target="#plan_content">
                            <div class="d-flex align-items-center">
                                <p id="title" class="fs-3 fw-bold pb-0 mb-0">Plan new examination</p>
                            </div>
                            <span class="badge rounded-pill bg-success ms-auto">Development finished</span>

                        </button>
                    </h2>
                    <div class="accordion-collapse collapse show" id="plan_content" data-bs-parent="#main_accordion">
                        <div class="accordion-body" id="main_window_search_container"> </div>
                    </div>
                </div>

                <div class="accordion-item shadow">
                    <h2 class="accordion-header" id="event_search_header">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                            data-bs-target="#event_search_content">
                            <div class="d-flex align-items-center">
                                <p id="title" class="fs-3 fw-bold pb-0 mb-0">Search booked examination</p>
                            </div>
                            <span class="badge rounded-pill bg-warning ms-auto">Needs review</span>

                        </button>
                    </h2>
                    <div class="accordion-collapse collapse" id="event_search_content" data-bs-parent="#main_accordion">
                        <div class="accordion-body" id="event_browser_container"> </div>
                    </div>
                </div>


                <div class="accordion-item shadow">
                    <h2 class="accordion-header" id="print_schedule_header">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                            data-bs-target="#print_schedule_content">
                            <div class="d-flex align-items-center">
                                <p id="title" class="fs-3 fw-bold pb-0 mb-0">Print daily schedule</p>
                            </div>
                            <span class="badge rounded-pill bg-success ms-auto">Development finished</span>

                        </button>
                    </h2>
                    <div class="accordion-collapse collapse" id="print_schedule_content"
                        data-bs-parent="#main_accordion">
                        <div class="accordion-body" id="schedule_print_container">
                            <!-- TODO kivenni -->
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </container>
    <div id="modal_container"> </div>
    <div id="table_container" class="d-none"> </div>

    </container>

</body>
<script nonce="<?php echo $_SESSION['nonce']; ?>">
    function is_loading(val) {
        if (val) $(".loading-overlay").removeClass("d-none");
        else $(".loading-overlay").addClass("d-none")
    }

    is_loading(true);

    $(document).ready(function () {
        // read protocols from csv

        $.get(protocols_path, function (CSVdata) {
            protocols = $.csv.toObjects(CSVdata);

            // populate calendar selection
            $.ajax({
                type: "GET",
                url: "php/get_calendar_names.php",
                dataType: "json",
                data: {},
                success: function (calendar_names) {


                    available_calendars = calendar_names;

                    // cerate
                    var event_creator = null;
                    CORE.window_browser = new MR_timing_slot_browser($(main_window_search_container), function (results) {
                        var success = results.success;
                        var search_params = results.search_params;
                        var contingent = results.contingent;
                        var windows = results.windows;
                        var events = results.events;
                        var masks = results.masks;

                        if (windows.length > 0) {
                            event_creator = new MR_event_creator(search_params, contingent);
                            event_creator.create_gui(windows);
                            event_creator.show_gui_as_modal($(modal_container));
                        }
                        else {
                            bootbox.alert({
                                message: "There is no free time window matching the search parameters.",
                                buttons: {
                                    ok: {
                                        label: "Ok",
                                        className: "btn-outline-dark",
                                    },
                                },
                            });
                        }
                    });

                    CORE.window_browser.create_gui();

                    // search & edit
                    CORE.event_browser = new MR_event_browser($(event_browser_container));
                    CORE.event_browser.create_gui();

                    // print

                    CORE.schedule_printer = new MR_schedule_printer($(schedule_print_container));
                    CORE.schedule_printer.create_gui();

                    is_loading(false);

                },
            });

        });
    })

    $(document).ready(function () {
        session_countdown = $("#sessionCountdown");
        start_time = moment(<?php echo '"' . $_SESSION['AUTH_DATETIME'] . '"'; ?>);

        startIncativityTimer();
        start_session_check_timer();

        setInterval(function () {
            var diff = moment.duration(session_max_duration - moment.duration((moment() - start_time), 'milliseconds'), "milliseconds");
            session_countdown.html("Session expiring in " + (diff.minutes() + "").padStart(2, "0") + ":" + (diff.seconds() + "").padStart(2, "0"));
        }, 1000);
    });


</script>

</html>