var chars = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];

var obj = {};
obj.timestamp = new Date().getTime();
obj.states = [];

for(var n = 0 ; n < 3 ; n++){
    obj.states[n] = {};
    obj.states[n].state = [];
    obj.states[n].condition = 1;
    obj.states[n].total = [0,0,0];
}

for(var i = 0 ; i < 3 ; i++){
    loop();
    loop2(1);
    loop2(2);
}


function loop2(n){
    for(var k = 0 ; k < 36 ; k++){
        var kk = ranNum(1,3);
        //alert(kk)
        if( kk == 1 ){
            obj.states[n].state[k] = [kk];
        }else{
            obj.states[n].state[k] = [kk, 0, 0, 0, 0, 0, 0, ""];
        }
    }

    for(var j = 0 ; j < 36 ; j++){
        var b = strMixed(10);
        if(obj.states[n].state[j].length != 1){
            loopArr(obj.states[n].state[j],[5,10],[100,300]); 
            obj.states[n].state[j][7] = b;
        }
    }
    loopArr(obj.states[n].total,[5,10]); 
}

function loop(){
    for(var j = 0 ; j < 50 ; j++){
        var jj = ranNum(1,3);
        if( jj == 1 ){
            obj.states[0].state[j] = [jj];
        }else{
            obj.states[0].state[j] = [jj, 0, 0, 0];
        }
    }

    for(var j = 0 ; j < 50 ; j++){
        if(obj.states[0].state[j].length != 1){
            loopArr(obj.states[0].state[j],[5,10],[0,2]); 
        }
    }
    loopArr(obj.states[0].total,[5,10]); 
}


function ranNum(a,b){
    return parseInt(Math.random()*(a-b-1))+b;
}


function strMixed(n) {
     var res = "";
     for(var i = 0; i < n ; i ++) {
         var id = (Math.random()*25+"").split(/\./)[0];
         res += chars[id];
     }
     return res;
}


function loopArr(arr,arg1,arg2){
    if(arr.length<=4){
        arr[arr.length-3] += ranNum(arg1[0],arg1[1]);
        arr[arr.length-2] += ranNum(arg1[0],arg1[1]);
        arr[arr.length-1] += ranNum(arg1[0],arg1[1]);
    }else{
        arr[1] += ranNum(arg1[0],arg1[1]);
        arr[2] += ranNum(arg1[0],arg1[1]);
        arr[3] += ranNum(arg1[0],arg1[1]);
        arr[4] += ranNum(arg2[0],arg2[1]);
        arr[5] += ranNum(arg2[0],arg2[1]);
        arr[6] += ranNum(arg2[0],arg2[1]);
    }
}