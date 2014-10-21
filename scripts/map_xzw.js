(function() {
	/**
 * 
 * @authors xiazw (xiazw@ifeng.com)
 * @date    2014-10-17 10:47:54
 * @version $1.0$
 */
var $ = jQuery;
var Params = {
	baseName:   ["alabama", "alaska", "arizona", "arkansas", "california", "colorado", "connecticut", "delaware", "florida", "georgia", "hawaii", "idaho", "illinois", "indiana", "iowa", "kansas", "kentucky", "louisiana", "maine", "maryland", "massachusetts", "michigan", "minnesota", "mississippi", "missouri", "montana", "nebraska", "nevada", "newhampshire", "newjersey", "newmexico", "new ork", "northcarolina", "northdakota", "ohio", "oklahoma", "oregon", "pennsylvania", "rhode island", "south carolina", "southdakota", "tennessee", "texas", "utah", "vermont", "virginia", "washington", "westvirginia", "wisconsin", "wyoming", "dc"],
	baseNameCN: ["亚拉巴马州", "阿拉斯加州", "亚利桑那州", "阿肯色州", "加利福尼亚州", "科罗拉多州", "康涅狄格州", "特拉华州", "佛罗里达州", "佐治亚州", "夏威夷州", "爱达荷州", "伊利诺伊州", "印第安纳州", "艾奥瓦州", "堪萨斯州", "肯塔基州", "路易斯安那州", "缅因州", "马里兰州", "马萨诸塞州", "密歇根州", "明尼苏达州", "密西西比州", "密苏里州", "蒙大拿州", "内布拉斯加州", "内华达州", "新罕布什尔州", "新泽西州", "新墨西哥州", "纽约州", "北卡罗来纳州", "北达科他州", "俄亥俄州", "俄克拉何马州", "俄勒冈州", "宾夕法尼亚州", "罗得岛州", "南卡罗来纳州", "南达科他州", "田纳西州", "德克萨斯州", "犹他州", "佛蒙特州", "弗吉尼亚州", "华盛顿州", "西弗吉尼亚州", "威斯康星州", "怀俄明州", "哥伦比亚特区"],
	zyStateId:  [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49], // 众议院参加选举州的州id
	cyStateId:  [0,1,3,5,7,9,10,11,12,14,15,16,17,18,20,21,22,23,25,26,28,29,30,32,35,35,36,38,39,39,40,41,42,45,47,49],
	zzStateId:  [0,1,2,3,4,5,6,8,9,10,11,12,14,15,18,19,20,21,22,26,27,28,30,31,34,35,36,37,38,39,40,41,42,44,48,49],
	zySeats:    [7,1,9,4,53,7,5,1,27,14,2,2,18,9,4,4,6,6,2,8,9,14,8,4,8,1,3,4,2,12,3,27,13,1,16,5,5,18,2,7,1,9,36,4,1,11,10,3,8,1], // 参选州总席位
	zyTime:     [],
	cyTime: 	[],
	zzTime: 	[]
}
var winStatus = ["icon-R","icon-D","icon-O",""];
var voteStatus = ["未开始","进行中","已结束"];
var str = "" ; 
var winStr = "" ; // 输赢字符串
var voteStr = "" ; //计票字符串
var pieceStr = ""; //数据条字符串
var status = "" ; //开票状态
var time = 0 ; //开票时间
var num = 0 ; //票数总和
var numD = 0 ; //民主党占比
var numR = 0 ; //共和党占比
var numO = 0 ; //其他党占比
var per = [] ; //占比数组
var flag = null ; //状态标示 民主党0 / 共和党1 / 其他党2 / 不显示为3
var iconStr = "" ; //图标字符串
var total = []; //总票数存储数组
var numL,numR = null; //总票数选择器元素
var title = []; //选情列表title
var id = [];
var seat = "";

function perNum(arr,a,b,c){   //百分比数据
	num = arr[a] + arr[b] + arr[c] ;
	numD = arr[a] == 0 ? 0 :  parseInt(arr[a] * 100 / num) ;
	numR = arr[b] == 0 ? 0 :  parseInt(arr[b] * 100/ num) ;
	numO = arr[c] == 0 ? 0 :  100 - numR ;
	return [numD,numR,numO] ; 
}

var updateStateData = function(data,type){

	var stateId = data.states[type];
	var state = stateId.state;
	var len = state.length;

	if(type == 0){
		title = ["众议院席位","民主党席位","其他席位","共和党席位"];

		$("table.p-voteTable").find("tHead").find("th.special").text(function(n){
			return title[n];
		})
		updateHouseStateData(state);
	}
	else if(type == 1){
		title = ["当选议员","民主党得票","其他得票","共和党得票"];

		$("table.p-voteTable").find("tHead").find("th.special").text(function(n){
			return title[n];
		})
		updateSenateStateData(state);
	}
	else if(type == 2){
		title = ["当选州长","民主党得票","其他得票","共和党得票"];

		$("table.p-voteTable").find("tHead").find("th.special").text(function(n){
			return title[n];
		})
		updateGovernorStateData(state);
	}
}

var updateHouseStateData = function(data){
	$.each(data,function(n,obj){
		//console.log(obj[7])
		iconStr = "";  //每次清空
		status = voteStatus[obj[0]-1];  //状态对应文字

		if(obj[0] == 3){                 //判断最大党，平局为3,不显示 /  民主党0 / 共和党1 / 其他党2
			if(obj[1]>obj[2]){
				flag = obj[1] > obj[3] ? 0 : (obj[1] == obj[3] ? 3 : 2) ; 
			}
			else if(obj[1] < obj[2]){
				flag = obj[2] > obj[3] ? 1 : (obj[2] == obj[3] ? 3 : 2) ;
			}
			else{
				flag = obj[1] > obj[3] ? 3 : 2;
			}	
			iconStr = "<span class='icon-list "+ winStatus[flag] +"'></span>";
		}
		//console.log(obj[0])
		if(flag == 3){                   // 3为不显示
			iconStr = "";
		}
		if(obj[0] == 1){                 // 未开始状态
			obj = [1,0,0,0] ;
			per = [0,0,0] ;
		}else{
			per = perNum(obj,1,2,3)    //各党票数占比
		}
		
		//图标字符串
		winStr = "<tr><td class='first'><div class='name'><span class='icon'>"+ iconStr +"</span><span class='txt'>" + Params.baseNameCN[Params.zyStateId[n]] + "</span></div></td><td>";

		//百分比字符串
		voteStr = "<div class='p-colLineBox'><div class='colLineBox-num'>" + "<span class='num-1'>" + obj[2] + "</span>" + "<span class='num-2'>" + obj[3] + "</span>" + "<span class='num-3'>" + obj[1] + "</span></div>" ;
		
		//数据条字符串
		pieceStr = "<div class='colLineBox-inner'><div class='colorC' style='width:" + per[2] + "%'></div>" + "<div class='colorL' style='width:" + per[0] + "%'></div>" + "<div class='colorR' style='width:" + per[1] + "%'></div>" + "</div></div>";

		//整体字符串
		str = winStr + Params.zySeats[n] + "</td><td>" + time + "</td><td>" + status + "</td><td class='colorBox' colspan='3'>" + voteStr + pieceStr + "</td></tr>";

		//更新列表
		$("table.p-voteTable").find("tBody").append(str);
	})
}

var updateSenateStateData = function(data){
	$.each(data,function(n,obj){
		//console.log(obj[7])
		iconStr = "";  //每次清空
		status = voteStatus[obj[0]-1];  //状态对应文字

		if(obj[0] == 3){                 //判断最大党，平局为3,不显示 /  民主党0 / 共和党1 / 其他党2
			if(obj[1]>obj[2]){
				flag = obj[1] > obj[3] ? 0 : (obj[1] == obj[3] ? 3 : 2) ;
			}
			else if(obj[1] < obj[2]){
				flag = obj[2] > obj[3] ? 1 : (obj[2] == obj[3] ? 3 : 2) ;
			}
			else{
				flag = obj[1] > obj[3] ? 3 : 2;
			}	
			iconStr = "<span class='icon-list "+ winStatus[flag] +"'></span>";
		}
		//console.log(obj[0])
		if(flag == 3){                   // 3为不显示
			iconStr = "";
		}
		if(obj[0] == 1){                 // 未开始状态
			obj = [1,0,0,0] ;
			per = [0,0,0] ;
		}else{
			per = perNum(obj,1,2,3)    //各党票数占比
		}
		seat = obj[7]||"";
		//图标字符串
		winStr = "<tr><td class='first'><div class='name'><span class='icon'>"+ iconStr +"</span><span class='txt'>" + Params.baseNameCN[Params.cyStateId[n]] + "</span></div></td><td>";

		//百分比字符串
		voteStr = "<div class='p-colLineBox'><div class='colLineBox-num'>" + "<span class='num-1'>" + obj[2] + "</span>" + "<span class='num-2'>" + obj[3] + "</span>" + "<span class='num-3'>" + obj[1] + "</span></div>" ;
		
		//数据条字符串
		pieceStr = "<div class='colLineBox-inner'><div class='colorC' style='width:" + per[2] + "%'></div>" + "<div class='colorL' style='width:" + per[0] + "%'></div>" + "<div class='colorR' style='width:" + per[1] + "%'></div>" + "</div></div>";

		//整体字符串
		str = winStr + seat + "</td><td>" + time + "</td><td>" + status + "</td><td class='colorBox' colspan='3'>" + voteStr + pieceStr + "</td></tr>";

		//更新列表
		$("table.p-voteTable").find("tBody").append(str);
	})
}

var updateGovernorStateData = function(data){
	$.each(data,function(n,obj){
		//console.log(obj[7])
		iconStr = "";  //每次清空
		status = voteStatus[obj[0]-1];  //状态对应文字

		if(obj[0] == 3){                 //判断最大党，平局为3,不显示 /  民主党0 / 共和党1 / 其他党2
			if(obj[1]>obj[2]){
				flag = obj[1] > obj[3] ? 0 : (obj[1] == obj[3] ? 3 : 2) ;
			}
			else if(obj[1] < obj[2]){
				flag = obj[2] > obj[3] ? 1 : (obj[2] == obj[3] ? 3 : 2) ;
			}
			else{
				flag = obj[1] > obj[3] ? 3 : 2;
			}	
			iconStr = "<span class='icon-list "+ winStatus[flag] +"'></span>";
		}
		//console.log(obj[0])
		if(flag == 3){                   // 3为不显示
			iconStr = "";
		}
		if(obj[0] == 1){                 // 未开始状态
			obj = [1,0,0,0] ;
			per = [0,0,0] ;
		}else{
			per = perNum(obj,1,2,3)    //各党票数占比
		}
		seat = obj[7]||"";
		//图标字符串
		winStr = "<tr><td class='first'><div class='name'><span class='icon'>"+ iconStr +"</span><span class='txt'>" + Params.baseNameCN[Params.zzStateId[n]] + "</span></div></td><td>";

		//百分比字符串
		voteStr = "<div class='p-colLineBox'><div class='colLineBox-num'>" + "<span class='num-1'>" + obj[2] + "</span>" + "<span class='num-2'>" + obj[3] + "</span>" + "<span class='num-3'>" + obj[1] + "</span></div>" ;
		
		//数据条字符串
		pieceStr = "<div class='colLineBox-inner'><div class='colorC' style='width:" + per[2] + "%'></div>" + "<div class='colorL' style='width:" + per[0] + "%'></div>" + "<div class='colorR' style='width:" + per[1] + "%'></div>" + "</div></div>";

		//整体字符串
		str = winStr + seat + "</td><td>" + time + "</td><td>" + status + "</td><td class='colorBox' colspan='3'>" + voteStr + pieceStr + "</td></tr>";

		//更新列表
		$("table.p-voteTable").find("tBody").append(str);
	})
}

var updateTop = function(id,data){
	numL = $(id).find(".numL").text(data[1]);
	numR = $(id).find(".numR").text(data[0]);
	icon_win = $(id).find(".icon-win");
	per = perNum(data,1,0,2);
	//console.log(per)
	$(id).find(".colorL").animate({"width":per[0]+"%"},1000);
	$(id).find(".colorR").animate({"width":per[1]+"%"},1000);
	$(id).find(".colorC").animate({"width":per[2]+"%"},1000);
	if(data[3] == 3){
		win = data[0] - data[1];
		if(win == 0){
			icon_win.hide();
		}
		else if(win > 0){
			icon_win.css({"left":"80px"});
			icon_win.show();
		}
		else if(win < 0){
			icon_win.css({"left":"200px"});
			icon_win.show();
		}

	}
}



jQuery.ajax({
    url           : "scripts/testData.js",
    dataType      : "jsonp",
    jsonpCallback : "pollUpdate", 
    success: function(data) {
    	console.log(data)
    	for(var i = 0 ; i < 3 ; i++){
    		total[i] = data.states[i].total;
    		total[i][3] = data.states[i].condition;
    	};
    	
    	updateTop("#boxL",total[0]);
    	updateTop("#boxM",total[1]);
    	updateTop("#boxR",total[2]);

    	//清空列表
		$("table.p-voteTable tBody").empty();

	    updateStateData(data,1);
		//},1000);
		//众议院数据更新
    	
    		
    }
});
})()