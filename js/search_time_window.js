

function search_free_time_windows(events, masks, count, searched_length){
    var free_windows = [];

    var searched_length = parseInt(searched_length);
    var count = parse_val(count);
    if(!count) count = 999999;
    
    $.each(masks, function(mask_index, mask){
        var timezone = " " + mask["timezone"].match("[-+][0-9]+:[0-9]+")[0].replace(":","");

        var mask_start = new Date(mask["start"]);
        var mask_end = new Date(mask["end"]);

        var mask_start_string = mask_start.toLocaleString("hu-HU",{timeZone:'Europe/Budapest'});
        var mask_end_string = mask_end.toLocaleString("hu-HU",{timeZone:'Europe/Budapest'});

        var window_length =  moment(mask_end).diff(moment(mask_start),"minutes");
        if(window_length<searched_length){
            return true;
        }

        var window_array = new Array(window_length).fill(0);
        $.each(events, function(event_index,event){
            var event_start = new Date(event["start"]);
            var event_end = new Date(event["end"]);

            var event_start_index = moment(event_start).diff(moment(mask_start),"minutes");
            var event_end_index = moment(event_end).diff(moment(mask_start),"minutes");
            
            var relaxed_start_index = Math.max(0,event_start_index);
            var relaxed_end_index = Math.min(window_array.length,event_end_index);
            for (let index = relaxed_start_index; index < relaxed_end_index; index++) {
                window_array[index] = 1;                
            }
        })

        var blocks = []; // start and end index of a block
        var block_start = 0; // assume open start
        var block_end = block_start;
        for (let index = 1; index < window_array.length; index++) {
            const pre_element = window_array[index-1];
            const this_element = window_array[index];
            // 0->1 == free time is over
            if(pre_element==0 && this_element==1){
                block_end = index-1;
                if((block_end-block_start)>=searched_length-1){
                    blocks.push([block_start,block_end]);
                }
                continue;
            }
            // 1->0 == free time starting
            if(pre_element==1 && this_element==0){
                block_start = index;
                continue;
            }
            block_end = index;
        }
        // if the end is open...
        if((block_end-block_start)>=searched_length-1){
            blocks.push([block_start,block_end]);
        }

        $.each(blocks, function(block_index,block){
            var window_start =new Date(moment(mask_start).add(block[0],"minutes"));
            var window_end = new Date(moment(mask_start).add(block[1]+1,"minutes"));

            free_windows.push([window_start,window_end]);
            if(free_windows.length>=count){
                return false;
            }
        })
        if(free_windows.length>=count){
            return false;
        }
    });

    return free_windows;
}