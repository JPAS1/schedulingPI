function inicializeProcess(){
    return [{name: "a1", value: 12},
            {name: "a2", value: 1},
            {name: "a3", value: 45},
            {name: "a4", value: 11},
            {name: "a5", value: 69}]
}

function appendProcessDivs(elem){
    $('#process-img-row').append( 
        `
            <div id="process-img-`+elem.name+`" class="process-img-div">
                <label>`+elem.name+`(`+elem.value+`)</label>
                <img class="process-img" src="img/process.png">
            </div>
        `)
}

function createProcess(processArr){
    for(i=0; i < processArr.length; i++){
        appendProcessDivs(processArr[i])
        $("#process-img-"+processArr[i].name).css('left', function(){
            return ($(this).parent('div').width()/10)+(i*60)+'px'
        }) 
    }
}

function moveForward(obj, dir, until, callback){
    var inter = setInterval(function(){frame(obj)}, 30)
    function frame(obj){
        var top = obj.css(dir).replace(/[^-\d\.]/g, '')*1
        if(top > until){
            clearInterval(inter)
            if(callback) 
                callback(obj)
        }else
            obj.css(dir, top+2)
    }
}

function moveBack(obj, dir, until, callback){
    var inter = setInterval(function(){frame(obj)}, 30)
    function frame(obj){
        var top = obj.css(dir).replace(/[^-\d\.]/g, '')*1
        if(top < until){
            clearInterval(inter)
            if(callback) 
                callback(obj)
        }else
            obj.css(dir, top-2)
    }
}

function sendProcessToStock(processArr, i){
    var i = (typeof i !== 'undefined') ? i : 0;
    if(i < processArr.length){
        var obj = $("#process-img-"+processArr[i].name)
        obj.css('left', '10%')
        moveForward(obj, 'top', 200)
        setTimeout(function(){sendProcessToStock(processArr, ++i)}, 3000) 
    }else{
        setTimeout(startLift, 2000);
    }
    
}

function scheduling(arr){
    $.ajax({
        type: 'GET',
        async: false,
        url: 'http://api-pi.herokuapp.com/fifo'
    }).done(function(msg){
        arrayToProcess = msg.value
    });
}

function startLift(){
    if(processElements.length > 0){
        var obj = $("#lift-img-div")
        scheduling(processElements)
        console.log('arrayToProcess', arrayToProcess)
        var label = processElements[arrayToProcess].name+'('+processElements[arrayToProcess].value+")"
        $("#lift-img-div label").text(label).show()
        $("#lift-img").attr('src','img/process_half_right.png')
        moveForward(obj, 'left', 850, comeBackLift)
    }
}

function comeBackLift(obj){
    var maxLeft = obj.css('left').replace(/[^-\d\.]/g, '')*1
    if(maxLeft < 850)
        setTimeout(function(){comeBackLift(obj)}, 3000)
    else{
        $("#lift-img-div label").hide()
        $("#lift-img").attr('src','img/process_empty_left.png')
        moveBack(obj, 'left', 55, nextLift)
    }
}

function nextLift(){
    processElements.splice(arrayToProcess, 1)
    startLift()
}


$(document).ready(function(){
    processElements = inicializeProcess()
    arrayToProcess = 0
    createProcess(processElements)
    setTimeout(function(){sendProcessToStock(processElements)}, 3000)
})