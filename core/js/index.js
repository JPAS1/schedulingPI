function inicializeProcess(){
    return [{name: "a1", value: 12},
            {name: "a2", value: 1},
            {name: "a3", value: 45},
            {name: "a4", value: 11}]
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

function move(obj){
    var inter = setInterval(function(){frame(obj)}, 30)
    function frame(obj){
        var top = obj.css('top').replace(/[^-\d\.]/g, '')*1+1
        if(top > 200)
            clearInterval(inter)
        else
            obj.css('top', top)
    }
}

function sendProcessToStock(processArr, i){
    i = (typeof i !== 'undefined') ? i : 0;
    if(i < processArr.length){
        var obj = $("#process-img-"+processArr[i].name)
        obj.css('left', '10%')
        move(obj)
        setTimeout(function(){sendProcessToStock(processArr, ++i)}, 3000) 
    }
}


$(document).ready(function(){
    processElements = inicializeProcess()
    createProcess(processElements)
    setTimeout(function(){sendProcessToStock(processElements)}, 3000)
})