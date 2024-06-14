<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Scrollable Listbox with Bootstrap 5</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.min.js"></script>
    <style>
        .listbox-custom {
            max-height: 200px;
            overflow-y: auto;
        }
        .list-group-item {
            border: none; /* Remove border */
        }
    </style>
</head>
<body>
    <!-- Button trigger modal -->
    <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
        Open Modal
    </button>

    <!-- Modal -->
    <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Scrollable Listbox in Modal with Buttons</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="card">
                        <div class="listbox-custom">
                            <ul class="list-group list-group-flush">
                                <li class="list-group-item">
                                    Option 1
                                    <button class="btn btn-primary float-end">Action</button>
                                </li>
                                <li class="list-group-item">
                                    Option 2
                                    <button class="btn btn-primary float-end">Action</button>
                                </li>
                                <li class="list-group-item">
                                    Option 3
                                    <button class="btn btn-primary float-end">Action</button>
                                </li>
                                <li class="list-group-item">
                                    Option 4
                                    <button class="btn btn-primary float-end">Action</button>
                                </li>
                                <li class="list-group-item">
                                    Option 5
                                    <button class="btn btn-primary float-end">Action</button>
                                </li>
                                <li class="list-group-item">
                                    Option 6
                                    <button class="btn btn-primary float-end">Action</button>
                                </li>
                                <li class="list-group-item">
                                    Option 7
                                    <button class="btn btn-primary float-end">Action</button>
                                </li>
                                <li class="list-group-item">
                                    Option 8
                                    <button class="btn btn-primary float-end">Action</button>
                                </li>
                                <li class="list-group-item">
                                    Option 9
                                    <button class="btn btn-primary float-end">Action</button>
                                </li>
                                <li class="list-group-item">
                                    Option 10
                                    <button class="btn btn-primary float-end">Action</button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary">Save changes</button>
                </div>
            </div>
        </div>
    </div>

</body>
</html>