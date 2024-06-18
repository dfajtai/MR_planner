<?php
require_once ('vendor/autoload.php');
require 'php/php_functions.php';


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

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.2/font/bootstrap-icons.css">

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/noUiSlider/15.7.1/nouislider.css"
        integrity="sha512-MKxcSu/LDtbIYHBNAWUQwfB3iVoG9xeMCm32QV5hZ/9lFaQZJVaXfz9aFa0IZExWzCpm7OWvp9zq9gVip/nLMg=="
        crossorigin="anonymous" referrerpolicy="no-referrer" />

    <link rel="stylesheet" href="css/my_styles.css">


    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.13.6/underscore-min.js"></script>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/2.11.8/umd/popper.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.min.js"></script>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.4/moment.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.4/moment-with-locales.min.js"></script>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-validate/1.20.0/jquery.validate.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-validate/1.20.0/additional-methods.min.js"></script>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/bootbox.js/6.0.0/bootbox.min.js"></script>

    <script src="https://cdn.jsdelivr.net/npm/@easepick/bundle@1.2.1/dist/index.umd.min.js"></script>


    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-csv/1.0.21/jquery.csv.min.js"
        integrity="sha512-Y8iWYJDo6HiTo5xtml1g4QqHtl/PO1w+dmUpQfQSOTqKNsMhExfyPN2ncNAe9JuJUSKzwK/b6oaNPop4MXzkwg=="
        crossorigin="anonymous" referrerpolicy="no-referrer"></script>

    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/wnumb/1.2.0/wNumb.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/noUiSlider/15.7.1/nouislider.min.js"></script>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/polyfills.umd.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js"></script>


    <script defer src="js/additional_functions.js"></script>

    <script defer src="js/session_protection.js"></script>
    <script defer src="js/search_time_window.js"></script>
    <script defer src="js/event_creation_modal.js"></script>
    <script defer src="js/event_creation.js"></script>
    <script defer src="js/schedule_printing.js"></script>

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
                        <div class="accordion-body">

                            <form class="form d-flex flex-column needs-validation" id="searchParamsForm">

                                <div class="row mb-2">
                                    <label for="examTypeSelect" class="col-sm-6 col-form-label">Examination
                                        protocol</label>
                                    <div class="col-sm-6">
                                        <select name="examType" id="examTypeSelect" class="form-select" required>
                                            <option selected disabled value="">Select examination protocol...</option>
                                        </select>
                                    </div>
                                </div>

                                <div class="accordion" id="accordionContainer">

                                    <div class="accordion-item">

                                        <h2 class="accordion-header " id="searchParamsHeader">
                                            <button class="accordion-button collapsed" type="button"
                                                data-bs-toggle="collapse" data-bs-target="#searchParams">
                                                Adjust search parameters
                                            </button>
                                        </h2>
                                        <div class="accordion-collapse collapse" id="searchParams">
                                            <div class="accordion-body nested-accordion">
                                                <div class="row pb-2">
                                                    <label class="col-sm-6 col-form-label" for="sourceCalendarSelect">
                                                        Source calendar name</label>
                                                    <div class="col-sm-6">
                                                        <select name="sourceCalendar" id="sourceCalendarSelect"
                                                            class="form-select" required>
                                                            <option selected disabled value="">Select source calendar...
                                                            </option>
                                                        </select>
                                                    </div>

                                                </div>

                                                <div class="row pb-2">
                                                    <label class="col-sm-6 col-form-label"
                                                        for="maskingCalendarSelect">Masking calendar
                                                        name</label>
                                                    <div class="col-sm-6">
                                                        <select name="maskingCalendar" id="maskingCalendarSelect"
                                                            class="form-select" required>
                                                            <option selected disabled value="">Select masking
                                                                calendar...</option>
                                                        </select>
                                                    </div>

                                                </div>

                                                <div class="row pb-2">
                                                    <label class="col-sm-6 col-form-label" for="dateRangePicker">Search
                                                        range</label>
                                                    <div class="col-sm-6">
                                                        <input name="date" id="dateRangePicker"
                                                            class="form-control"></input>
                                                    </div>
                                                </div>

                                                <div class="row">
                                                    <label for="showCountBlock" class="col-sm-6 col-form-label">Number
                                                        of
                                                        results</label>

                                                    <div class="col-sm-6 d-flex" id="showCountBlock">
                                                        <div class="flex-fill pe-1">
                                                            <input type="radio" class="btn-check" name="showCount"
                                                                id="show5" value="5" checked>
                                                            <label class="btn btn-outline-dark w-100" for="show5">First
                                                                5</label>
                                                        </div>

                                                        <div class="flex-fill pe-1">
                                                            <input type="radio" class="btn-check" name="showCount"
                                                                id="show10" value="10">
                                                            <label class="btn btn-outline-dark w-100" for="show10">First
                                                                10</label>
                                                        </div>

                                                        <div class="flex-fill">
                                                            <input type="radio" class="btn-check" name="showCount"
                                                                id="showAll" value="all">
                                                            <label class="btn btn-outline-dark w-100"
                                                                for="showAll">All</label>
                                                        </div>
                                                    </div>

                                                </div>

                                            </div>
                                        </div>
                                    </div>

                                    <div class="py-2">
                                        <button class="btn btn-outline-dark w-100" id="searchTimeWindowBtn"
                                            type="button">Search free time windows</button>
                                    </div>
                                </div>
                            </form>

                        </div>
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
                                    <label class="col-sm-6 col-form-label" for="printCalendarSelect">
                                        Source calendar name</label>
                                    <div class="col-sm-6">
                                        <select name="sourceCalendar" id="printCalendarSelect" class="form-select"
                                            required>
                                            <option selected disabled value="">Select source calendar...
                                            </option>
                                        </select>
                                    </div>


                                </div>
                                <div class="row pb-2">
                                    <label class="col-sm-6 col-form-label" for="printDateRangePicker">Print date
                                        range</label>
                                    <div class="col-sm-6">
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


    var protocols_path = "protocols/mr_protocols.csv";
    var protocols = [];

    var start_time = Object();
    var session_max_duration = moment.duration(30, "minutes");
    var session_countdown = Object();


    var available_calendars = [];

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
                handle_event_creation_gui();
                handle_schedule_printing_gui();
            },
        });

    });


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