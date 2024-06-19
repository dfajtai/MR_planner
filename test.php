<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flexdatalist with Bootstrap and Validation</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/css/bootstrap.min.css" rel="stylesheet">
    <!-- Flexdatalist CSS -->
    <link rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/jquery-flexdatalist/2.3.0/jquery.flexdatalist.css">
    <style>
        /* Ensure your custom styles cannot be overridden */
        .form-control.flexdatalist.flexdatalist-set {
            position: relative !important;
        }

        /* Position invalid-feedback absolutely */
        .invalid-feedback-absolute {
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            z-index: 1050;
            /* Ensure it appears above other elements */
        }

        .form-group {
            position: relative;
        }
    </style>


    <!-- Bootstrap Bundle with Popper -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/js/bootstrap.bundle.min.js"></script>
    <!-- jQuery -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <!-- Flexdatalist JS -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-flexdatalist/2.3.0/jquery.flexdatalist.min.js"></script>
    <!-- jQuery Validate -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-validate/1.20.0/jquery.validate.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-validate/1.20.0/additional-methods.min.js"></script>
</head>

<body>
    <div class="container mt-5">
        <form id="myForm" class="needs-validation" novalidate>
            <div class="mb-3 form-group">
                <label for="flexdatalistInput" class="form-label">Choose an option</label>
                <input type="text" class="form-control flexdatalist flexdatalist-set" id="flexdatalistInput"
                    name="flexdatalistInput" required>
                <div class="invalid-feedback invalid-feedback-absolute">
                    Please choose a valid option.
                </div>
            </div>
            <button type="submit" class="btn btn-primary">Submit</button>
        </form>
    </div>



    <script>
        $(document).ready(function () {
            // Initialize Flexdatalist
            var options = ['Option 1', 'Option 2', 'Option 3'];
            $('#flexdatalistInput').flexdatalist({
                minLength: 0,
                selectionRequired: true,
                data: options
            });



            // Custom submit handler to check validity
            $('#myForm').on('submit', function (event) {
                if (!this.checkValidity()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                this.classList.add('was-validated');
            });

            // Adjust Flexdatalist generated DOM element
            $('#flexdatalistInput').on('flexdatalist:afterposition', function () {
                var flexdatalistDropdown = $(this).siblings('.flexdatalist-multiple');
                flexdatalistDropdown.css({
                    position: 'absolute',
                    top: 'auto',
                    left: 'auto',
                    zIndex: 1050, // Bootstrap's modal z-index for reference
                    visibility: 'visible'
                });
            });
        });
    </script>
</body>

</html>