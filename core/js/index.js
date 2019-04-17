function appendProcessDivs(elem){
    $('#process-img-row').append( 
        `
            <div id="process-img-`+elem.id+`" data-toggle="tooltip" title="`+elem.descricao+`" data-time="`+elem.duracao+`" class="process-img-div">
                <label>P: `+elem.id+`</label>
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
        moveForward(obj, 'top', 500)
        setTimeout(function(){sendProcessToStock(processArr, ++i)}, 3000) 
    }else{
        setTimeout(startLift, 2000);
    }
    
}

function scheduling(arr){
    var rand = $('#schedulingType').val()
    switch(rand){
        case 'fcfs':
        var result = fcfs(arr)
        break
        case 'sjf':
        var result = sjf(arr)
        break
        case 'priority':
        var result = priority(arr)
        break
        case 'rr':
        var result = rr(arr)
        break
    }
    scheduleData = result

    // $.ajax({
    //     type: 'GET',
    //     async: false,
    //     url: method
    // }).done(function(msg){
    //     arrayToProcess = msg.duracao
    // }).fail(function(){
    //     arrayToProcess = (rand==0) ? 0 : sjf(arr)
    // });
}

function fcfs(arr){
    return {posi: 0, processTime: 0, remainingTime: 0}
}
function priority(arr){
    var result = 0
    var maxVal = 0
    var durat = 0
    for(var i=0; i < arr.length; i++){
        if(i==0 || arr[i].prioridade > maxVal){
            result = i
            maxVal = arr[i].prioridade
            durat = arr[i].duracao
        }
    }
    return {posi: result, processTime: durat, remainingTime: 0};
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
    return {posi: result, processTime: minVal, remainingTime: 0};
}
function rr(arr){
    var quant = $('#quantum').val()
    var remainingTime = arr[0].duracao-quant <= 0 ? 0 : arr[0].duracao-quant
    return {posi: 0, processTime: arr[0].duracao, remainingTime: remainingTime}
}

function startLift(){
    if(processElements.length > 0){
        var obj = $("#lift-img-div")
        scheduling(processElements)
        var label = 'P: '+processElements[scheduleData['posi']].id
        $("#lift-img-div label").text(label).show().css('left', '60px')
        obj.attr('title',processElements[scheduleData['posi']].descricao)
        $("#lift-img").attr('src','img/process_full_right.png')
        moveForward(obj, 'left', 950, comeBackLift)
    }
}

function comeBackLift(obj){
    var maxLeft = obj.css('left').replace(/[^-\d\.]/g, '')*1
    if(maxLeft < 850)
        setTimeout(function(){comeBackLift(obj)}, 1000)
    else{
        if(scheduleData['remainingTime'] > 0){
            $("#lift-img").attr('src','img/process_half_left.png')
            $("#lift-img-div label").css('left', '4px')
        }else{
            $("#lift-img-div label").hide()
            $("#lift-img-div").attr('title','')
            $("#lift-img").attr('src','img/process_empty_left.png')
        }
        $("#cpu-img").attr('src','img/cpu_on.gif').css('max-height','270px')
        var elem = processElements[scheduleData['posi']]
        var time = scheduleData['processTime']*100
        setTimeout(function(){
            $("#cpu-img").attr('src','img/cpu_off.png').css('max-height','250px')
            moveBack(obj, 'left', 55, nextLift)
            if(scheduleData['remainingTime'] == 0){
                var img = $('#process-img-'+elem.id).css('left', 995).css('top','660')
                moveForward(img, 'top', 650, function(){moveBack(img, 'left', 650+(processElements.length*-55))})
            }
        }, time)
    }
}

function nextLift(){
    if(scheduleData['remainingTime'] > 0){
        processElements[scheduleData['posi']].duracao = scheduleData['remainingTime']
        processElements.push(processElements[scheduleData['posi']])
    }
    processElements.splice(scheduleData['posi'], 1)
    startLift()
}

function startToProcess(){
    if(processElements.length == 0){
        alert('Adicione ao menos um processo.')
        return false;
    }else if($('#quantum').val()<=0){
        alert('Informe um Quantum positivo.')
        return false;
    }
    $('#exampleModal').modal('hide')
    createProcess(processElements)
    sendProcessToStock(processElements)
}

function addItem(){
    var itemDesc = $('#modalItemDesc').val()
    var itemPrio = $('#modalItemPrio').val()
    var itemDura = $('#modalItemDura').val()
    var id = processElements.length+1
    if(id > 5){
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
    scheduleData={}
    $('#exampleModal').modal({
        backdrop: 'static',
        focus: true
    })
    $('#addTableItem').on('click', addItem)
    $('#start').on('click',startToProcess)
    $('[data-toggle="tooltip"]').tooltip()
})