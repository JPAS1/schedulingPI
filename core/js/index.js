function appendProcessDivs(elem){
    $('#process-img-row').append( 
        `
            <div id="process-img-`+elem.id+`" data-toggle="tooltip" title="`+elem.descricao+`" data-time="`+elem.duracao+`" class="process-img-div">
                <label style="font-size: 9px;">`+elem.descricao+`</label>
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

function createMemory(memoryArr, inRed){
    var inRed = (typeof inRed !== 'undefined') ? inRed : [];
    $('#memory-table tbody tr td').remove()
    for(i=0; i < memoryArr.length; i++){
        if(inRed.indexOf(i) != -1)
         var color = 'red'
        else
            var color = memoryArr[i] ? 'black' : 'white'
        var line = '<td id="tdMemo-'+i+'" class="'+color+'"></td>'
        $('#memory-table tbody tr').append(line)
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
        case 'lt':
            var result = lt(arr)
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
    return {posi: 0, processTime: arr[0].duracao, remainingTime: 0}
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
    var duracao = arr[idx].duracao-quant <= 0 ? arr[idx].duracao : quant
    return {posi: 0, processTime: duracao, remainingTime: remainingTime}
}
function lt(arr){
    var randomNumbers = [];
    for(var i=0; i < arr.length; i++){
        for(var t=0; t <= arr[i].tokens; t++)
            randomNumbers.push(i)
    }
    var idx = Math.floor(Math.random() * randomNumbers.length);
    var result = randomNumbers[idx]
    processElements[result].tokens++
    var quant = $('#quantum').val()
    var remainingTime = arr[result].duracao-quant <= 0 ? 0 : arr[result].duracao-quant
    var duracao = arr[result].duracao-quant <= 0 ? arr[result].duracao : quant
    return {posi: result, processTime: duracao, remainingTime: remainingTime};
}

function memoryFF(arr, memory){
    var space = 0
    var posIni = 0
    for(var i=0; i <= arr.length; i++){
        if(arr[i] == 0){
            ++space
            posIni = posIni == 0 ? i : posIni
        }else{
            space = 0
            posIni = 0
        }
        if(memory == space)
            break;
    }
    return posIni
}
function memoryNF(arr, memory){
    var space = 0
    var posIni = 0
    var endLoop = false;
    for(var i=mainMemoryLastSearch; i <= arr.length; i++){
        if(arr[i] == 0){
            ++space
            posIni = posIni == 0 ? i : posIni
        }else{
            space = 0
            posIni = 0
        }
        if(memory == space){
            endLoop = true
            break;
        }
    }
    if(!endLoop){
        mainMemoryLastSearch = 0
        posIni = memoryNF(arr, memory)
    }else
        mainMemoryLastSearch = posIni+parseInt(memory)
    return posIni
}
function memoryBF(arr, memory){
    var space = 0
    var posIni = 0
    var posiLeng = 0
    var allPosi = []
    for(var i=0; i <= arr.length; i++){
        if(arr[i] == 0){
            ++space
            posIni = posIni == 0 ? i : posIni
        }else{
            if(posIni != 0 && space >= memory){
                allPosi[posiLeng].space = space
                ++posiLeng
            }
            space = 0
            posIni = 0
        }
        if(space >= memory){
            allPosi[posiLeng] = {posIni: posIni, space: space}
        }
    }
    var posIni = 0
    var minSpace = 0
    for(var i=0; i < allPosi.length; i++){
        if(i==0 || allPosi[i].space < minSpace){
            posIni = allPosi[i].posIni
            minSpace = allPosi[i].space
        }
    }
    return posIni
}
function memoryWF(arr, memory){
    var space = 0
    var posIni = 0
    var posiLeng = 0
    var allPosi = []
    for(var i=0; i <= arr.length; i++){
        if(arr[i] == 0){
            ++space
            posIni = posIni == 0 ? i : posIni
        }else{
            if(posIni != 0 && space >= memory){
                allPosi[posiLeng].space = space
                ++posiLeng
            }
            space = 0
            posIni = 0
        }
        if(space >= memory){
            allPosi[posiLeng] = {posIni: posIni, space: space}
        }
    }
    var posIni = 0
    var maxSpace = 0
    for(var i=0; i < allPosi.length; i++){
        if(i==0 || allPosi[i].space > maxSpace){
            posIni = allPosi[i].posIni
            maxSpace = allPosi[i].space
        }
    }
    return posIni
}

function setMemory(memory){
    var memoType = $('#memoryType').val()
    switch(memoType){
        case 'memoryFF':
        var iniPos = memoryFF(mainMemory, memory)
        break
        case 'memoryNF':
        var iniPos = memoryNF(mainMemory, memory)
        break
        case 'memoryBF':
        var iniPos = memoryBF(mainMemory, memory)
        break
        case 'memoryWF':
        var iniPos = memoryWF(mainMemory, memory)
        break
    }
    var newMemory = mainMemory.slice()
    var inRed = []
    for(var l=0; l < memory; l++){
        newMemory[iniPos+l] = 1
        inRed.push(iniPos+l)
    }
    createMemory(newMemory, inRed)
}

function cleanMemory(){
    createMemory(mainMemory)
}

function startLift(){
    if(processElements.length > 0){
        var obj = $("#lift-img-div")
        scheduling(processElements)
        var label = processElements[scheduleData['posi']].descricao
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
        setMemory(processElements[scheduleData['posi']].memory)
        var elem = processElements[scheduleData['posi']]
        var time = scheduleData['processTime']*100
        setTimeout(function(){
            $("#cpu-img").attr('src','img/cpu_off.png').css('max-height','250px')
            cleanMemory()
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
    var itemMemo = $('#modalItemMemory').val()
    var id = processElements.length+1
    if(id > 5){
        alert('Numero maximo de elementos adicionados!!!')
        return false;
    }else if(itemDesc == '' || itemPrio == '' || itemDura == ''){
        alert('Favor informar todos os parâmetros!!!')
        return false;
    }

    processElements.push({id:id, prioridade: itemPrio, duracao: itemDura, descricao: itemDesc, memory: itemMemo, tokens: 0})
    var elem = '<tr><td>'+itemDesc+'</td><td>'+itemPrio+'</td><td>'+itemDura+'</td><td>'+itemMemo+'Mb</td></tr>'
    $('#tableBody').append(elem)
    $('#modalItemDesc').val('')
    $('#modalItemPrio').val('')
    $('#modalItemDura').val('')
    $('#modalItemMemory').val('')
}

$(document).ready(function(){
    processElements=[]
    mainMemory=[1,1,0,1,1,1,0,0,0,0,1,0,0,1,0,0]
    mainMemoryLastSearch=0
    scheduleData={}
    createMemory(mainMemory)
    $('#addTableItem').on('click', addItem)
    $('#startButton').on('click',function(){
        $('#exampleModal').modal({
            backdrop: 'static',
            focus: true
        })
        $('#startButton').hide()
    })
    $('#start').on('click', startToProcess)
    $('[data-toggle="tooltip"]').tooltip()
})