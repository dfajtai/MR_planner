function show_event_creation_modal(container, time_windows, protocol_name, protocol_length) {
    if (time_windows.length == 0) {
        bootbox.alert({
        message: "There is no free time window matching the search parameters.",
        buttons: {
            ok: {
            label: "Ok",
            className: "btn-outline-dark",
            },
        },
        });
        return;
    }
    container.empty();
    var modal_id = "event_creation_modal";

    var modal_root = $("<div/>").addClass("modal fade").attr("id",modal_id).attr("tabindex","-1");
    var modal_dialog = $("<div/>").addClass("modal-dialog modal-xl");
    var modal_content = $("<div/>").addClass("modal-content");

    var modal_header= $("<div/>").addClass("modal-header");
    modal_header.append($("<h5/>").addClass("modal-title display-3 fs-3").html("Create event"));
    modal_header.append($("<button/>").addClass("btn-close").attr("data-bs-dismiss","modal").attr("aria-label","Close"));

    var modal_body = $("<div/>").addClass("modal-body");

    var modal_footer= $("<div/>").addClass("modal-footer");
    modal_footer.append($("<button/>").addClass("btn btn-outline-dark").attr("id","clear_form").attr("aria-label","Clear").html($("<i/>").addClass("fa fa-eraser me-2").attr("aria-hidden","true")).append("Clear"));
    modal_footer.append($("<button/>").addClass("btn btn-outline-dark").attr("data-bs-dismiss","modal").attr("aria-label","Close").html("Close"));


    modal_content.append(modal_header);
    modal_content.append(modal_body);
    modal_content.append(modal_footer);

    modal_dialog.html(modal_content);
    modal_root.html(modal_dialog);


    var form = $("<form/>").attr("id","event_creation_form").addClass("needs-validation").addClass("d-flex flex-column");
    modal_body.append(form);

    modal_footer.find('#clear_form').on('click',function(){
        $(form).reset();
    })


    // lets define the form....
    var form_content = $("<div/>").addClass("row m-2 p-2");

    // time window selection
    var time_window_block = $("<div/>").addClass("col-md-6 p-2 card");
    var time_windows_listbox_container = $("<div/>").attr("id","timeWindows").addClass("listbox-custom");
    var time_windows_listbox = $("<ul/>").addClass("list-group list-group-flush");

    $.each(time_windows, function(index,window){
        var start_date_string = moment(window[0]).format("YYYY.MM.DD");
        var end_date_string = moment(window[1]).format("YYYY.MM.DD");
        var start_string =  moment(window[0]).format("HH:mm");
        var end_string =   moment(window[1]).format("HH:mm");

        if(end_date_string!=start_date_string){
            var btn_text =start_date_string;
        }
        else{
            var btn_text = "["+start_date_string + "] " + start_string +" - "+end_string;
        }

        var time_window_element = $("<li/>").addClass("list-group-item p-1");
        var btn = $("<button/>").addClass("btn btn-outline-dark  time-window-control w-100").attr("type","button");
        btn.attr("date-index",index).html(btn_text);

        time_window_element.append(btn);

        time_windows_listbox.append(time_window_element);
    });





    time_windows_listbox_container.append(time_windows_listbox);

    time_window_block.append(time_windows_listbox_container);

    // adjusting further params
    var params_block = $("<div/>").addClass("col-md-6 p-2");

    form_content.append(time_window_block);
    form_content.append(params_block);
    form.append(form_content);

    var submit_btn = $("<button/>").addClass("btn btn-outline-dark").attr("id","addEventButton").attr("type","button").html("Create event");
    form.append(submit_btn);


    container.append(modal_root);

    var modal = container.find("#"+modal_id);
    modal.modal('show');

    modal.on("hide.bs.modal",function(){

    });
}
