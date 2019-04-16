function appendProcessDivs(elem){
    $('#process-img-row').append( 
        `
            <div id="process-img-`+elem.id+`" data-time="`+elem.duracao+`" class="process-img-div">
                <label>`+elem.id+`: `+elem.duracao+`</label>
                <img class="process-img" src="img/process.png">
            </div>
        `)
}

function createProcess(processArr){
    for(i=0; i < processArr.length; i++){
        appendProcessDivs(processArr[i])
        $("#process-img-"+processArr[i].id).css('left', function(){
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
        var obj = $("#process-img-"+processArr[i].id)
        obj.css('left', '10%')
        moveForward(obj, 'top', 200)
        setTimeout(function(){sendProcessToStock(processArr, ++i)}, 3000) 
    }else{
        setTimeout(startLift, 2000);
    }
    
}

function randomizer(init, last){
    return Math.floor((Math.random() * last) + init);
}

function scheduling(arr){
    var rand = randomizer(0, 2)
    switch(rand){
        case 0:
        var method = 'https://app-javapi.herokuapp.com/value'
        break
        case 1:
        var method = 'https://app-javapi.herokuapp.com/value'
        break
    }

    $('.nav-link').addClass('disabled')
    $('#navItem_'+rand).removeClass('disabled').addClass('active')

    $.ajax({
        type: 'GET',
        async: false,
        url: method
    }).done(function(msg){
        arrayToProcess = msg.duracao
    }).fail(function(){
        arrayToProcess = (rand==0) ? 0 : sjf(arr)
    });
}

function sjf(arr){
    var result = 0
    var minVal = 0
    for(var i=0; i < arr.length; i++){
        if(i==0 || arr[i].duracao < minVal){
            result = i
            minVal = arr[i].duracao
        }
    }
    return result;
}

function startLift(){
    if(processElements.length > 0){
        var obj = $("#lift-img-div")
        scheduling(processElements)
        var label = processElements[arrayToProcess].id+': '+processElements[arrayToProcess].duracao
        $("#lift-img-div label").text(label).show()
        $("#lift-img").attr('src','img/process_half_right.png')
        moveForward(obj, 'left', 850, comeBackLift)
    }
}

function comeBackLift(obj){
    var maxLeft = obj.css('left').replace(/[^-\d\.]/g, '')*1
    if(maxLeft < 850)
        setTimeout(function(){comeBackLift(obj)}, 1000)
    else{
        $("#lift-img-div label").hide()
        $("#lift-img").attr('src','img/process_empty_left.png')
        $("#cpu-img").attr('src','img/cpu_on.gif').css('max-height','270px')
        var elem = processElements[arrayToProcess]
        var time = elem.value*100
        setTimeout(function(){
            $("#cpu-img").attr('src','img/cpu_off.png').css('max-height','250px')
            moveBack(obj, 'left', 55, nextLift)
            var img = $('#process-img-'+elem.id).css('left', 915).css('top','650')
            moveForward(img, 'top', 400, function(){moveBack(img, 'left', 750+(processElements.length*-55))})
        }, time)
    }
}

function nextLift(){
    processElements.splice(arrayToProcess, 1)
    startLift()
}

function startToProcess(){
    $('#exampleModal').modal('hide')
    sendProcessToStock(processElements)
}

function addItem(){
    var itemDesc = $('#modalItemDesc').val()
    var itemPrio = $('#modalItemPrio').val()
    var itemDura = $('#modalItemDura').val()
    var id = processElements.length
    if(id > 6){
        alert('Numero maximo de elementos adicionados!!!')
        return false;
    }else if(itemDesc == '' || itemPrio == '' || itemDura == ''){
        alert('Favor informar todos os parâmetros!!!')
        return false;
    }
        
    processElements.push({id:id, prioridade: itemPrio, duracao: itemDura, descricao: itemDesc})
    var elem = '<tr><td>'+itemDesc+'</td><td>'+itemPrio+'</td><td>'+itemDura+'</td></tr>'
    $('#tableBody').append(elem)
    $('#modalItemDesc').val('')
    $('#modalItemPrio').val('')
    $('#modalItemDura').val('')
}

$(document).ready(function(){
    processElements=[]
    arrayToProcess = 0
    $('#exampleModal').modal({
        backdrop: 'static',
        focus: true
    })
    $('#addTableItem').on('click', addItem)
    $('#start').on('click',startToProcess)
})