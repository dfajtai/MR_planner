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

    <script src="libs/js/jspdf.umd.min.js"></script>
    <script src="libs/js/polyfills.umd.js"></script>
    <script src="libs/js/jspdf.plugin.autotable.min.js"></script>

    <script defer src="js/config.js"></script>

    <!-- CORE -->
    <script defer src="js/core/additional_functions.js"></script>
    <script defer src="js/core/session_protection.js"></script>
    <script defer src="js/core/event_parsing.js"></script>
    <script defer src="js/core/search_time_window.js"></script>

    <!-- OPERATION -->
    <script defer src="js/operation/event_creation.js"></script>
    <script defer src="js/operation/event_editing.js"></script>
    <script defer src="js/operation/schedule_printing.js"></script>


    <!-- GUI -->
    <script defer src="js/gui/event_search_gui.js"></script>
    <script defer src="js/gui/schedule_print_gui.js"></script>
    <script defer src="js/gui/free_window_searching_gui.js"></script>

    <!-- MODALS -->
    <script defer src="js/modals/event_creation_modal.js"></script>
    <script defer src="js/modals/event_modify_modal.js"></script>




</head>

<body>
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
        <div class="d-flex  flex-column  p-5 m-5 col-lg-6 col-sm-9 col-12 align-self-center  justify-content-center">
            <div class="accordion accordion-flush" id="main_accordion">

                <div class="accordion-item shadow">
                    <h2 class="accordion-header" id="plan_content_header">
                        <button class="accordion-button" type="button" data-bs-toggle="collapse"
                            data-bs-target="#plan_content">
                            <div class="d-flex align-items-center">
                                <p id="title" class="fs-3 fw-bold pb-0 mb-0">Plan new examination</p>
                            </div>
                            <!-- <span class="badge ms-auto">New</span> -->

                        </button>
                    </h2>
                    <div class="accordion-collapse collapse show" id="plan_content" data-bs-parent="#main_accordion">
                        <div class="accordion-body" id="planning_form_container"> </div>
                    </div>
                </div>

                <div class="accordion-item shadow">
                    <h2 class="accordion-header" id="print_schedule_header">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                            data-bs-target="#print_schedule_content">
                            <div class="d-flex align-items-center">
                                <p id="title" class="fs-3 fw-bold pb-0 mb-0">Print daily schedule</p>
                            </div>
                            <!-- <span class="badge ms-auto">New</span> -->

                        </button>
                    </h2>
                    <div class="accordion-collapse collapse" id="print_schedule_content"
                        data-bs-parent="#main_accordion">
                        <div class="accordion-body">
                            <form class="form d-flex flex-column needs-validation" id="printParamsForm">
                                <div class="row pb-2">
                                    <label class="col-sm-3 col-form-label" for="printCalendarSelect">
                                        Source calendar name</label>
                                    <div class="col-sm-9">
                                        <select name="sourceCalendar" id="printCalendarSelect" class="form-select"
                                            required>
                                            <option selected disabled value="">Select source calendar...
                                            </option>
                                        </select>
                                    </div>


                                </div>
                                <div class="row pb-2">
                                    <label class="col-sm-3 col-form-label" for="printDateRangePicker">Print date
                                        range</label>
                                    <div class="col-sm-9">
                                        <input name="date" id="printDateRangePicker" class="form-control"></input>
                                    </div>
                                </div>

                                <div class="py-2">
                                    <button class="btn btn-outline-dark w-100" id="printScheduleBtn" type="button">Print
                                        schedules</button>
                                </div>

                            </form>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    </container>
    <div id="modalContainer"> </div>
    <div id="tableContainer" class="d-none"> </div>

    </container>

</body>
<script nonce="<?php echo $_SESSION['nonce']; ?>">

    $(document).ready(function () {
        var main_free_window_search = null;

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

                    main_free_window_search = new free_window_searching_gui($("#planning_form_container"));
                    main_free_window_search.create_gui();
                    // handle_event_creation_gui();
                    // handle_schedule_printing_gui();
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