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

    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.2/font/bootstrap-icons.css">

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


    <script defer src="js/additional_functions.js"></script>

    <script defer src="js/session_protection.js"></script>
    <script defer src="js/event_creation_gui.js"></script>

</head>

<body>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container-fluid">
            <a class="navbar-brand" href="#">MR plan</a>
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
        <div
            class="d-flex  flex-column  shadow p-5 m-5 col-lg-6 col-sm-9 col-12 align-self-center  justify-content-center">
            <div class="d-flex ">
                <p id="title" class="fs-3 fw-bold pb-1">Plan new examination</p>
            </div>


            <form class="form d-flex flex-column" id="searchParamsForm">

                <div class="row mb-2">
                    <label for="examTypeSelect" class="col-sm-6 col-form-label">Examination protocol</label>
                    <div class="col-sm-6">
                        <select name="examType" id="examTypeSelect" class="form-select" required>
                            <option selected disabled value = "">Select examination protocol...</option>
                        </select>
                    </div>
                </div>

                <div class="accordion" id="accordionContainer">

                    <div class="accordion-item">

                        <h2 class="accordion-header " id="searchParamsHeader">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                data-bs-target="#searchParams">
                                Adjust search parameters
                            </button>
                        </h2>
                        <div class="accordion-collapse collapse" id="searchParams">
                            <div class="accordion-body">
                                <div class="row pb-2">
                                    <label class="col-sm-6 col-form-label" for="sourceCalendarSelect">
                                        Source calendar name</label>
                                    <div class="col-sm-6">
                                        <select name="sourceCalendar" id="sourceCalendarSelect" class="form-select" required>
                                            <option selected disabled value = "">Select source calendar...</option>
                                        </select>
                                    </div>

                                </div>

                                <div class="row pb-2">
                                    <label class="col-sm-6 col-form-label" for="maskingCalendarSelect">Masking calendar
                                        name</label>
                                    <div class="col-sm-6">
                                        <select name="maskingCalendar" id="maskingCalendarSelect" class="form-select" required>
                                            <option selected disabled value = "">Select masking calendar...</option>
                                        </select>
                                    </div>

                                </div>

                                <div class="row pb-2">
                                    <label class="col-sm-6 col-form-label" for="dateRangePicker">Search range</label>
                                    <div class="col-sm-6">
                                        <input name="date" id="dateRangePicker" class="form-control"></input>
                                    </div>
                                </div>

                                <div class="row">
                                    <label for="showCountBlock" class="col-sm-6 col-form-label">Number of
                                        results</label>

                                    <div class="col-sm-6 d-flex" id="showCountBlock">
                                        <div class="flex-fill pe-1">
                                            <input type="radio" class="btn-check" name="showCount" id="show3" value="3">
                                            <label class="btn btn-outline-primary w-100" for="show3">First 3</label>
                                        </div>

                                        <div class="flex-fill pe-1">
                                            <input type="radio" class="btn-check" name="showCount" id="show10" value = "10" checked>
                                            <label class="btn btn-outline-primary w-100" for="show10">First
                                                10</label>
                                        </div>

                                        <div class="flex-fill">
                                            <input type="radio" class="btn-check" name="showCount" id="showAll" value = "all">
                                            <label class="btn btn-outline-primary w-100" for="showAll">All</label>
                                        </div>
                                    </div>

                                </div>

                            </div>
                        </div>
                    </div>

                    <div class="py-2">
                        <button class="btn btn-outline-primary w-100" id="searchTimeWindowBtn" type="button">Search free time
                            windows</button>
                    </div>
                </div>
            </form>

        </div>

        <div id="modalContainer">

        </div>

    </container>

</body>
<script nonce="<?php echo $_SESSION['nonce']; ?>">
    var picker = Object();

    var protocols_path = "protocols/mr_protocols.csv";
    var protocols = Object();

    var default_mask_calendar_name = "MR előjegyzés maszk";
    var default_calendar_name = "MR előjegyzés";

    var protocol_select = Object();
    var calendar_select = Object();
    var mask_calendar_select = Object();

    var session_countdown = Object();

    var start_time = Object();
    var session_max_duration = moment.duration(30, "minutes");

    var search_params_form =Object();

    $(document).ready(function () {

        protocol_select = $("#examTypeSelect");
        calendar_select = $("#sourceCalendarSelect");
        mask_calendar_select = $("#maskingCalendarSelect");
        
        session_countdown = $("#sessionCountdown");

        search_params_form = $("#searchParamsForm");

        start_time = moment(<?php echo '"' . $_SESSION['AUTH_DATETIME'] . '"'; ?>);

        // read protocols from csv
        $.get(protocols_path, function (CSVdata) {
            protocols = $.csv.toObjects(CSVdata);


            $.each(protocols, function (index, protocol_info) {
                var opt = $("<option/>").html(protocol_info["protocol_name"]).attr("value", protocol_info["protocol_name"]);
                protocol_select.append(opt);
            })
        });

        // populate calendar selection
        $.ajax({
            type: "GET",
            url: 'php/get_calendar_names.php',
            dataType: "json",
            data: ({}),
            success: function (calendar_names) {
                var server_message = server_response_message_parser(calendar_names);
                if (server_message) logout_with_message(server_message);

                $.each(calendar_names, function (index, calendar_name) {
                    var calendar_opt = $("<option/>").html(calendar_name).attr("value", calendar_name);
                    calendar_select.append(calendar_opt);

                    var mask_opt = $("<option/>").html(calendar_name).attr("value", calendar_name);
                    mask_calendar_select.append(mask_opt);

                })

                if (calendar_names.includes(default_calendar_name)) {
                    calendar_select.val(default_calendar_name)
                }

                if (calendar_names.includes(default_mask_calendar_name)) {
                    mask_calendar_select.val(default_mask_calendar_name)
                }
            }
        });



        picker = new easepick.create({
            element: document.getElementById('dateRangePicker'),
            css: [
                'https://cdn.jsdelivr.net/npm/@easepick/bundle@1.2.1/dist/index.css',
            ],
            plugins: ['LockPlugin', 'AmpPlugin', 'RangePlugin'],

            LockPlugin: {
                minDate: new Date(),
                minDays: 1,
                maxDays: 30,
            },
            AmpPlugin: {
                resetButton: true,
                primaryMode: false
            }
        });

        picker.setStartDate(moment().add(1, 'days').format("YYYY-MM-DD"));
        picker.setEndDate(moment().add(14, 'days').format("YYYY-MM-DD"));

        $("#searchTimeWindowBtn").on("click",function(){
            if (! $(search_params_form)[0].checkValidity()) {    
                $(search_params_form)[0].reportValidity();
            }
            else{
                search_params_form.trigger("submit",true);
            }
        })

        search_params_form.on('submit',function(e){
            e.preventDefault();
            var values = {};
            $.each($(this).serializeArray(),function(index,field){
                // values[field.name] = parse_val(field.value==""?null:field.value);
                values[field.name] = field.value;
            })
            console.log(values);

            if(values["date"]){
                var dates = values["date"].split(' - ');
                var start_date = dates[0];
                var end_date =  dates[1];
            }
            else{
                var start_date = null;
                var end_date = null;
            }
            
        
            $.ajax({
                type: "GET",
                url: 'php/get_calendar_data.php',
                dataType: "json",
                data: ({ source_calendar: values["sourceCalendar"], mask_calendar: values["maskingCalendar"], start_date:start_date,end_date: end_date }),
                success: function (result) {
                    console.log(result);
                }
            })
        })

        setInterval(function () {

            var diff = moment.duration(session_max_duration - moment.duration((moment() - start_time), 'milliseconds'), "milliseconds");

            session_countdown.html("Session expiring in " + (diff.minutes() + "").padStart(2, "0") + ":" + (diff.seconds() + "").padStart(2, "0"));

        }, 1000);
    })
    $(document).ready(function () {
        startIncativityTimer();
        start_session_check_timer();
    });


</script>

</html>