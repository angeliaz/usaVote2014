var pollUpdate;
(function(win, $) {

	// 状态所对应的颜色，数组中 0 是默认颜色，1 鼠标hover的颜色，2 字体颜色
	var stateColor = {
		// 共和党领先
		r_lead: ["#e97373", "#db3b3b", "#fff"],
		// 共和党获胜
		r_win: ["#ab2f2f", "#741f1f", "#FFFFFF"],
		// 民主党领先
		d_lead: ["#b1c7e7", "#6885b0", "#fff"],
		// 民主党获胜
		d_win: ["#3d538e", "#202f56", "#FFFFFF"],
		// 其它党领先
		o_lead: ["#b8e2bc", "#b8e2bc", "#fff"],
		// 其它党获胜
		o_win: ["#7acd52", "#7acd52", "#fff"],
		// 两派领先
		twins_lead: ["#7d7d7d", "#7d7d7d", "#fff"],
		// 两派获胜
		twins_win: ["#7d7d7d", "#7d7d7d", "#fff"],
		// 尚未开始投票
		prepare: ["#cfcfcf", "#cfcfcf", "#000000"],
		// 不参选
		not_join: ["#f6f6f6", "#f6f6f6", "#000000"]
	};

	var Util = {
		// 是否是移动设备
		find: function(a, b) {
			return a.indexOf(b) + 1;
		},

		// 格式化数字中的逗号
		formatDot: function(iNumber) {
			var s = iNumber + '';
			return s.replace(/(?=(?!\b)(?:\d{3})+(?!\d))/g, ',');
		},

		// 获取最大值的索引
		getMaxIndex: function(n1, n2, n3) {
			var count = 0, index = 0;
			var maxNum = Math.max(n1, n2, n3);
			if(maxNum === n1) {count++; index = 1;}
			if(maxNum === n2) {count++; index = 2;}
			if(maxNum === n3) {count++; index = 3;}
			return (count === 1) ? index : 0;
		},

		getIndexByName: function(name, type) {
			var i = 0, len = type.length;
			for(; i < len; i++) {
				if(name === type[i][1]) return type[i][0];
			}
		},

		// 根据州名称获取索引
		getIndexByState: function(type, stateId) {
			var stateIndex = Params.baseName.indexOf(stateId);
			if(type === 0) {
				stateIds = Params.zyStateId;
			} else if(type === 1) {
				stateIds = Params.cyStateId;
			} else {
				stateIds = Params.zzStateId;
			}
			return stateIds.indexOf(stateIndex);
		}

	};

	// 定义两个地图容器，背景题图，蒙版地图
	var paperBack, paperMask;

	// 定义窗口4个顶点的信息
	var winTop, winLeft, winBottom, winRight;

	// 状态信息，初始为空，请求到数据以后，如果是最新的，则更新此对象。
	var stateInfo = {};

	// 当前鼠标所在区块，激活弹出窗口时更新。
	var currentBlock = null;

	// 弹出窗口的定时器
	var popTimer = null;

	// 弹出动画的定时器
	var animPopProTime = null;

	// 地图数据对象集合
	var mapData = {};

	// 定义包围容器
	var wrapper = document.getElementById("map_main");
	var popInfo = document.getElementById("map_pop");

	var voteType = $('.p-mapTab li a').index($('.cur'));

	// 获取浏览器信息
	var na = navigator.userAgent.toLowerCase();
	var isAndroid = Util.find(na, "android");
	var isIphone = Util.find(na, "iphone");
	var isIpad = Util.find(na, "ipad");
	var isMobile = isIphone || isIpad || isAndroid;
	var isPoorBrowser = isMobile || ($.browser.msie && $.browser.version == "6.0");
	var animPopCount = isPoorBrowser ? 10 : 15;
	var animPopTime = isPoorBrowser ? 20 : 20;

	// 初始化地图
	var initMap = function() {

			updateWinPosition();
			initContainer();
			initPaper();

			var stateId;
			var oMap;
			var baseName = Params.baseName;

			/*for(stateId in mappaths) {
				oMap = {};
				oMap.back = creatMapBack(stateId);
				oMap.info = creatMapInfo(stateId);
				oMap.mask = creatMapMask(stateId);
				mapData[stateId] = oMap;
			}*/

			var i = 0, len = baseName.length;
			for(; i < len; i++) {
				oMap = {};
				stateId = baseName[i];
				oMap.back = creatMapBack(stateId);
				oMap.info = creatMapInfo(stateId, i);
				oMap.mask = creatMapMask(stateId);
				mapData[stateId] = oMap;
			}

			resizeMap();
			initSideEvent();

		};


	// 更新窗口4个边的值，为了控制弹窗层不滑出窗口
	var updateWinPosition = function() {

			winTop = $(window).scrollTop();
			winLeft = $(window).scrollLeft();
			winBottom = $(window).height() + winTop;
			winRight = $(window).width() + winLeft;

		}

	// 初始化容器，ie8及以下使用的是vml容器，容器分4层：地图背景，州名称，地图蒙版，州名称侧栏。
	var initContainer = function() {

			if(Raphael.type == "VML") {
				$(wrapper).append('<rvml:group style="position : absolute; width: 990px; height: 990px; top: 0px; left: 0px;" coordsize="1090,1090" class="rvml" id="map_back"></rvml:group>');
				$(wrapper).append('<div id="map_info"></div>');
				$(wrapper).append('<div id="map_info_side"></div>');
				$(wrapper).append('<rvml:group style="position : absolute; width: 990px; height: 990px; top: 0px; left: 0px;" coordsize="1090,1090" class="rvml" id="map_mask"></rvml:group>');
			} else {
				$(wrapper).append('<div id="map_back" style="position : absolute; top: 0px; left: 0px;"></div>');
				$(wrapper).append('<div id="map_info"></div>');
				$(wrapper).append('<div id="map_info_side"></div>');
				$(wrapper).append('<div id="map_mask" style="position : absolute; top: 0px; left: 0px;"></div>');
			}

		};

	// 初始化放置容器
	var initPaper = function() {

			paperBack = Raphael("map_back", 930, 590);
			paperMask = Raphael("map_mask", 930, 590);

		};

	// 建立地图背景
	var creatMapBack = function(stateId) {

			var block = paperBack.path(mappaths[stateId]);
			block.stateId = stateId;
			
			// 初始化为尚未开始投票。
			block.state = "not_join";
			block.attr({
				fill: stateColor["not_join"][0],
				stroke: "#FFFFFF",
				'stroke-width': 1,
				'stroke-linejoin': 'round'
			});
			return block;

		};

	/**
	 * 建立州名称
	 * @param  {String} stateId 州英文名
	 * @param  {Int} 	index   州name在baseName中索引
	 */
	var creatMapInfo = function(stateId, index) {
			
			var o = points[stateId];
			var top = (parseInt(o.top)) + 'px';
			
			var className = o.sClass || "not_join";

			var seatNum = '';
			if(voteType === 0 && index < 50) {
				var stateIndex = Params.zyStateId.indexOf(index);
				seatNum = Params.zySeats[stateIndex];
			}

			var seatStyle = voteType === 0 ? '>' : ' style="visibility:hidden;">0';

			if(typeof o.type !== "undefined" && o.type === "side") {
				$("#map_info_side").append('<div id="t_' + stateId + '" class="' + className + '" style="top: ' + top + '; left: ' + o.left + ';" data-stateId="' + stateId + '" data-class="' + className + '" ><p><em' + seatStyle + seatNum + '</em>' + o.text + '</p></div>');
			} else {
				$("#map_info").append('<div id="t_' + stateId + '" class="' + className + '" style="top: ' + top + '; left: ' + o.left + ';" data-stateId="' + stateId + '" data-class="' + className + '" ><em' + seatStyle + seatNum + '</em>' + o.text + '</div>');
			}
			return "t_" + stateId;

		};

	// 建立地图蒙版
	var creatMapMask = function(stateId) {

			var block = paperMask.path(mappaths[stateId]);
			block.stateId = stateId;
			block.attr({
				fill: "#FFFFFF",
				cursor: 'pointer',
				"opacity": 0
			});
			regMapEvent(block);
			return block;

		};

	// 注册地图上的事件
	var regMapEvent = function(block) {

			if(isMobile) {
				block.touchstart(mTouchStart);
			} else {
				block.mouseover(pOver);
				block.mouseout(pOut);
			}

		};

	// 移动设备上的touchstart函数
	var mTouchStart = function(e) {

			var lastStateId = currentBlock ? currentBlock.stateId : "";
			var stateId = this.stateId;
			var block = mapData[stateId].back;
			var fillColor = stateColor[block.state][1];

			if(lastStateId !== "" && stateId !== lastStateId) {
				mapData[lastStateId].back.attr({
					fill: stateColor[mapData[lastStateId].back.state][0]
				});
				$("#t_" + lastStateId).find("p").removeClass("hoverIt");
			}

			var $textDiv = $("#t_" + stateId);
			if($textDiv.parent()[0].id === "map_info_side") {
				$textDiv.find("p").addClass("hoverIt");
			}
			block.attr({
				fill: fillColor
			});
			currentBlock = this;
			popInfo.style.visibility = "visible";
			getMouseXY_touch(e);
			changePop(stateId, stateInfo.state[stateId]);

		};

	// pc上的鼠标的mouseover的回调函数
	var pOver = function(e) {

			var _this = this;
			var stateId = this.stateId;
			var stateIndex = Util.getIndexByState(voteType, stateId);
			var block = mapData[stateId].back;
			var fillColor = stateColor[block.state][1];

			if(typeof stateIndex !== 'undefined' && stateIndex >= 0) {
				// 200毫秒的延迟显示pop窗口
				popTimer = setTimeout(function() {

					var $textDiv = $("#t_" + stateId);
					if($textDiv.parent()[0].id === "map_info_side") {
						$textDiv.find("p").addClass("hoverIt");
					}

					block.attr({
						fill: fillColor
					});
					currentBlock = _this;

					popInfo.style.visibility = "visible";
					popTimer = null;
					changePop(stateId, stateInfo[stateIndex]);

				}, 200);
			}
			

		};

	// pc上的鼠标mouseout的回调函数
	var pOut = function(e) {

			clearTimeout(animPopProTime);
			var stateId = this.stateId;
			var block = mapData[stateId].back;
			var fillColor = stateColor[block.state][0];

			var $textDiv = $("#t_" + stateId);
			if($textDiv.parent()[0].id === "map_info_side") {
				$textDiv.find("p").removeClass("hoverIt");
			}

			if(popTimer) {
				clearTimeout(popTimer);
				popTimer = null;
				return;
			}

			block.attr({
				fill: fillColor
			});
			currentBlock = null;
			popInfo.style.visibility = "hidden";

		};

	// 缩放地图的大小
	var resizeMap = function() {

			paperBack.canvas.setAttribute("viewBox", "0 0 930 590");
			paperBack.setSize(813, 515);
			paperMask.canvas.setAttribute("viewBox", "0 0 930 590");
			paperMask.setSize(813, 515);

		};

	// 初始化侧栏的事件: 右侧单独列出州名称部分
	var initSideEvent = function() {

			if(isMobile) {

				$("#map_info_side").delegate("div", "touchstart", function(e) {


					var lastStateId = currentBlock ? currentBlock.stateId : "";
					var stateId = $(this).attr("data-stateId");
					var block = mapData[stateId].back;
					var fillColor = stateColor[block.state][1];

					if(lastStateId !== "" && stateId !== lastStateId) {

						mapData[lastStateId].back.attr({
							fill: stateColor[mapData[lastStateId].back.state][0]
						});
						$("#t_" + lastStateId).find("p").removeClass("hoverIt");
					}

					$(this).find("p").addClass("hoverIt");

					block.attr({
						fill: fillColor
					});

					currentBlock = mapData[stateId].mask;
					getMouseXY_touch(e.originalEvent);
					popInfo.style.visibility = "visible";
					var stateIndex = Util.getIndexByState(voteType, stateId);
					changePop(stateId, stateInfo[stateIndex]);

				});

			} else {

				$("#map_info_side").delegate("div", "mouseenter", function() {

					var _this = this;
					var stateId = $(this).attr("data-stateId");
					var stateIndex = Util.getIndexByState(voteType, stateId);
					var blockMask = mapData[stateId].mask;
					var block = mapData[stateId].back;
					var condition = block.state;
					var fillColor = stateColor[block.state][1];

					if('undefined' !== typeof stateIndex && stateIndex >= 0) {
						popTimer = setTimeout(function() {

							block.attr({
								fill: fillColor
							});
							currentBlock = blockMask;
							popInfo.style.visibility = "visible";
							popTimer = null;

							changePop(stateId, stateInfo[stateIndex]);
							$(this).find("p").addClass("hoverIt");

						}, 200);
					}
					

				});

				$("#map_info_side").delegate("div", "mouseleave", function() {

					clearTimeout(animPopProTime);
					var stateId = $(this).attr("data-stateId");
					var block = mapData[stateId].back;
					var fillColor = stateColor[block.state][0];
					
					clearTimeout(popTimer);
					block.attr({
						fill: fillColor
					});
					currentBlock = null;
					popInfo.style.visibility = "hidden";
					$(this).find("p").removeClass("hoverIt");

				});

			}

		};

	// 投票数据的更新函数，通过异步请求来触发
	pollUpdate = function(datas) {
		
		updateing = (updateing - 1 < 0) ? 0 : updateing - 1;
		currentLevel = 1;

		if(stateInfo.timestamp >= datas.timestamp) {
			return;
		}

		$("#map_back")[0].style.visibility = "hidden";
		$("#map_info")[0].style.visibility = "hidden";

		// type:0众议院|1参议院|2州长
		var type = $('.p-mapTab li a').index($('.cur'));
		voteType = type;
		triggerByType(type, datas);
		
		return;
	};

	// 根据投票类型改变地图状态
	// type:0众议院|1参议院|2州长
	var triggerByType = function(type, datas) {
		var data;
		var relation;
		var baseName = Params.baseName;
		var voteData = datas.states[type].state; // 选举投票数据
		if(type === 0) {
			relation = Params.zyStateId;
		} else if(type === 1) {	
			relation = Params.cyStateId;
		} else {
			relation = Params.zzStateId;
		}

		// 众议院：只有参与州的数据，不参与的显示默认值
		var i = 0, len = relation.length;
		for(; i < len; i++) {
			stateId = baseName[relation[i]];
			data = voteData[i];
			//console.log('stateId:' + stateId + '; '  + i  +'; data:' +  data);
			// 参议院多余两条数据
			if(!(voteType === 1 && (i === 24 || i === 28))) {
				changeMapState(stateId, data);
			}
			
		}

		$("#map_info")[0].style.visibility = "visible";
		$("#map_back")[0].style.visibility = "visible";

		stateInfo = voteData;  // 某种选举全部数据


		if(currentBlock) {
			var stateIds;
			var stateId = currentBlock.stateId;
			var index = Util.getIndexByState(voteType, stateId);
			if(index >= 0) {
				changePop(stateId, stateInfo[index]);
			}
		}
	};
	

	// 改变地图的状态，地图背景的颜色，州说明的颜色
	var changeMapState = function(stateId, data) {
			
			var block = mapData[stateId].back;

			// 当前鼠标所在区块，激活弹出窗口时更新。
			var currentState = block.state;
			
			var state = getState(stateId, data); // 获取开票状态
			//console.log('currentState:' + currentState + '; state:' + state + '; ' + stateColor[state][0] + '; ' + stateId);
			if(currentState !== state) {
				block.state = state;
				block.attr({
					fill: stateColor[state][0]
				});
				var specialClass = $("#t_" + stateId).attr("data-class") || "";
				document.getElementById("t_" + stateId).className = state + " " + specialClass;
			}

		};

	// 获取当前州的开票状态
	var getState = function(stateId, data) {
			var state;
			switch(data[0]) {

			// 进行中
			case 2:
				state = Util.getMaxIndex(data[1], data[2], data[3]);
				if(state === 0) { // 两派共同领先
					return "twins_lead";
				} else if(state === 1) { // 共和党领先
					return "r_lead";
				} else if(state === 2) { // 民主党领先
 					return "d_lead";
				} else { // 其他党领先
					return "o_lead";
				}
				break;

			case 3:
				state = Util.getMaxIndex(data[1], data[2], data[3]);
				if(state === 0) { // 两派共同获胜
					return "twins_win";
				} else if(state === 1) { // 共和党获胜
					return "r_win";
				} else if(state === 2) { // 民主党获胜
 					return "d_win";
				} else { // 其他党获胜
					return "o_win";
				}
				break;

			default:
				return "prepare";
				break;
			}

		};

	// 改变弹出窗口的数据
	// todo 1026 那个refStateId是否需要这么做，因为这么做，又多了一个状态值，能否用现有状态替代。
	/**
	 * [changePop description]
	 * @param  {String} stateId [州名称]
	 * @param  {Array}  data    [该州的一条数组数据]
	 */
	var changePop = function(stateId, data) {

			if(!currentBlock) {
				return false;
			}

			if(currentBlock.stateId !== stateId) {
				return false;
			}

			var $pop = $(popInfo);
			var refStateId = $pop.data("refStateId") || "";

			// 修改弹出框的基本信息
			// 根据当前要显示的州的id跟上一次显示的州的id做比较，来初始化pop窗口的内容。
			// 如果两个id不一样，即说明这次pop中的数据不是上个州的，需要进行初始化的动画（从0开始的动画）
			if(refStateId !== stateId) {
				var title = Params.baseNameCN[Params.baseName.indexOf(stateId)];
				var index = Util.getIndexByState(stateId);
				$pop.data("refStateId", stateId);
				$pop.find(".title").text(title);
				$pop.find(".poll_count em").text(Params.zySeats[index]);
				

				// 如果当前状态为未开始投票，则将百分比请空和投票数设为0
				// todo 实际情况中是否需要这么做。
				if(data[0] === 1) {
					$pop.find(".d_bar").height(0);
					$pop.find(".r_bar").height(0);
					$pop.find(".o_bar").height(0);
					$pop.find(".d_per").text("");
					$pop.find(".r_per").text("");
					$pop.find(".o_per").text("");
					$pop.find(".d_info em").text(0);
					$pop.find(".r_info em").text(0);
					$pop.find(".o_info em").text(0);
					$('.d_sign').height(0);
					$('.r_sign').height(0);
					$('.o_sign').height(0);
					$("#d_win_bar").hide();
					$("#r_win_bar").hide();
					$("#o_win_bar").hide();
				} else {
					creatAnimPop([1, 0, 0, 0, 0, 0, 0], data);
				}

			} else {

				// 如果当前状态为未开始投票，则将百分比请空和投票数设为0
				// todo 实际情况中是否需要这么做。
				if(data[0] === 1) {
					$pop.find(".d_per").text("");
					$pop.find(".r_per").text("");
					$pop.find(".o_per").text("");
					$pop.find(".d_info em").text(0);
					$pop.find(".r_info em").text(0);
					$pop.find(".o_info em").text(0);
					$('.d_sign').height(0);
					$('.r_sign').height(0);
					$('.o_sign').height(0);
					$("#d_win_bar").hide();
					$("#r_win_bar").hide();
					$("#o_win_bar").hide();
				} else {
					var stateIndex = Util.getIndexByState(voteType, stateId);
					creatAnimPop(stateInfo[stateIndex], data);
				}

			}

		};

	// 为创建pop窗口的投票动画，进行数据的准备。
	var creatAnimPop = function(lastData, currentData) {
			var $pop = $(popInfo);
			var elmOPre = $pop.find(".o_per")[0];
			var elmRPre = $pop.find(".r_per")[0];
			var elmOBar = $pop.find(".o_bar")[0];
			var elmRBar = $pop.find(".r_bar")[0];
			var elmOTicket = $pop.find(".o_info em")[0];
			var elmRTicket = $pop.find(".r_info em")[0];
			var dBeginTicket = lastData[1];
			var rBeginTicket = lastData[2];
			var oBeginTicket = lastData[3];
			var dEndTicket = currentData[1];
			var rEndTicket = currentData[2];
			var oEndTicket = currentData[3];

			// 由于有人工干预，投票百分比的计算有点麻烦
			var dBeginPre;
			if(lastData[3] !== 0 && lastData[4] !== 0) {
				dBeginPre = lastData[3];
			} else {

				// 无票的判断
				if((rBeginTicket + dBeginTicket) <= 0) {
					dBeginPre = 0;
				} else {
					// 获取小数点后一位的数字
					dBeginPre = (((dBeginTicket / (rBeginTicket + dBeginTicket)) * 100).toFixed(1)) / 1;
				}

			}

			var rBeginPre;
			if(lastData[3] !== 0 && lastData[4] !== 0) {
				rBeginPre = lastData[4];
			} else {

				if((rBeginTicket + dBeginTicket) <= 0) {
					rBeginPre = 0;
				} else {
					rBeginPre = 100 - dBeginPre;
				}

			}

			var oBeginPre = lastData[3];

			var dEndPre = currentData[2];
			/*if(currentData[3] !== 0 && currentData[4] !== 0) {
				dEndPre = currentData[3];
			} else {

				if((dEndTicket + rEndTicket) <= 0) {
					dEndPre = 0;
				} else {
					dEndPre = (((dEndTicket / (dEndTicket + rEndTicket)) * 100).toFixed(1)) / 1;
				}

			}*/

			var rEndPre = currentData[1];

			/*if(currentData[3] !== 0 && currentData[4] !== 0) {
				rEndPre = currentData[4];
			} else {

				if((dEndTicket + rEndTicket) <= 0) {
					rEndPre = 0;
				} else {
					rEndPre = 100 - dEndPre;
				}

			}*/

			var oEndPre = currentData[3];

			clearTimeout(animPopProTime);
			// dBeginTicket:开始票数
			// dEndTicket:  结束票数
			// dBeginPre: 	开始百分比
			// dEndPre: 	结束百分比
			animPopPro([dBeginTicket, dEndTicket, dBeginPre, dEndPre, lastData[0]], [rBeginTicket, rEndTicket, rBeginPre, rEndPre, currentData[0]], [oBeginTicket, oEndTicket, oBeginPre, oEndPre, currentData[0]], animPopCount);

		};

	// @angelia:创建pop窗口的投票动画
	var animPopPro = function(dDatas, rDatas, oDatas, count) {

		var a = [];
		var ratio = 8;
		
		if(dDatas[2] === dDatas[3] || count === 0) {
			
			var rWinBar = "";
			var oWinBar = "";
			var sFixTop = 'style="top: 167px;"';
			
			if(dDatas[3]*1.2 - 57 > 0) {
				sFixTop = 'style="top: '+ (167 - (dDatas[3]*1.2 - 57)/2) +'px;"';
			}

			if(rDatas[3]*1.2 - 57 > 0) {
				sFixTop = 'style="top: '+ (167 - (rDatas[3]*1.2 - 57)/2) +'px;"';
			}


	        if(rDatas[4] === 3) {
	        	// 加上win标志
	        	if(dDatas[3] > rDatas[3]) {
	        		oWinBar = '<div id="d_win_bar" '+ sFixTop +'></div>';
	        	} else {
	        		rWinBar = '<div id="r_win_bar" '+ sFixTop +'></div>';
	        	}

	        }	

	        a.push('<div class="d_bar" style="height: '+ dDatas[3]*ratio +'px"><div class="d_per">'+ dDatas[3].toFixed(0) +'</div></div><div class="d_sign"></div><div class="d_info">民主党(D)<br/><em>'+ Util.formatDot(dDatas[1]) +'</em>票</div>' + oWinBar);
	        a.push('<div class="r_bar" style="height: '+ rDatas[3]*ratio +'px"><div class="r_per">'+ rDatas[3].toFixed(0) +'</div></div><div class="r_sign"></div><div class="r_info">共和党(R)<br/><em>'+ Util.formatDot(rDatas[1]) +'</em>票</div>' + rWinBar);
	        a.push('<div class="o_bar" style="height: '+ oDatas[3]*ratio +'px"><div class="o_per">'+ oDatas[3].toFixed(0) +'</div></div><div class="o_sign"></div><div class="o_info">其它(O)<br/><em>'+ Util.formatDot(rDatas[1]) +'</em>票</div>' + rWinBar);

	        //a.push('<div class="d_bar" style="height: '+ oDatas[3]*1.2 +'px"><div class="d_per">'+ dDatas[3].toFixed(1) +'%</div></div><div class="d_sign"></div><div class="d_info">民主党(D)<br/><em>'+ Util.formatDot(dDatas[1]) +'</em>票</div>' + oWinBar);
	        //a.push('<div class="r_bar" style="height: '+ rDatas[3]*1.2 +'px"><div class="r_per">'+ rDatas[3].toFixed(1) +'%</div></div><div class="r_sign"></div><div class="r_info">共和党(R)<br/><em>'+ Util.formatDot(rDatas[1]) +'</em>票</div>' + rWinBar);
	        
	        document.getElementById("js_bar_box").innerHTML = a.join("");

		} else {
			oDifPre = (((dDatas[3] - dDatas[2]) / count).toFixed(1)) / 1;
			dDatas[2] = dDatas[2] + oDifPre;
			oDifTicket = Math.floor((dDatas[1] - dDatas[0]) / count);
			dDatas[0] = dDatas[0] + oDifTicket;

			rDifPre = (((rDatas[3] - rDatas[2]) / count).toFixed(1)) / 1;
			rDatas[2] = rDatas[2] + rDifPre;
			rDifTicket = Math.floor((rDatas[1] - rDatas[0]) / count);
			rDatas[0] = rDatas[0] + rDifTicket;

	        a.push('<div class="d_bar" style="height: '+ dDatas[2]*ratio +'px"><div class="d_per">'+ dDatas[2].toFixed(0) +'</div></div><div class="d_sign"></div><div class="d_info">民主党(D)<br/><em>'+ Util.formatDot(dDatas[0]) +'</em>票</div>');
	        a.push('<div class="r_bar" style="height: '+ rDatas[2]*ratio +'px"><div class="r_per">'+ rDatas[2].toFixed(0) +'</div></div><div class="r_sign"></div><div class="r_info">共和党(R)<br/><em>'+ Util.formatDot(rDatas[0]) +'</em>票</div>');
	        a.push('<div class="o_bar" style="height: '+ rDatas[2]*ratio +'px"><div class="o_per">'+ rDatas[2].toFixed(0) +'</div></div><div class="o_sign"></div><div class="o_info">其它(O)<br/><em>'+ Util.formatDot(rDatas[0]) +'</em>票</div>');
	        document.getElementById("js_bar_box").innerHTML = a.join("");

			animPopProTime = setTimeout(function() {
				animPopPro(dDatas, rDatas, oDatas, count - 1);
			}, animPopTime);

		}

	};

	// 卸载所有的事件，为了修复ie6下面刷新页面
	var removeall = function() {

			for(var stateId in mapData) {
				
				mapData[stateId].mask.unmouseover(pOver);
				mapData[stateId].mask.unmouseout(pOut);
				mapData[stateId].mask = null;
				mapData[stateId].back = null;
			}
			$(wrapper).unbind();
			$(".refresh_button").unbind();
			mapData = null;
			currentBlock = null;
			paperMask.clear();
			paperBack.clear();
			$("#map_info_side").undelegate();
			$("#map_main").html("");

		};

	// 获取当前鼠标位置
	// @angelia 设置蒙版的位置
	var getMouseXY = function(e) {

			e = e || window.event;

			if(e && e.pageX) {
				mouseX = e.pageX;
				mouseY = e.pageY;
			} else {
				mouseX = e.clientX + document.body.scrollLeft;
				mouseY = e.clientY + document.body.scrollTop;
			}
			// catch possible negative values
			if(mouseX < 0) {
				mouseX = 0;
			}
			if(mouseY < 0) {
				mouseY = 0;
			}

			var boxTop = mouseY - 171;
			var boxLeft = mouseX + 15;

			if(boxTop < winTop) {
				boxTop = winTop;
			} else if((boxTop + 341) > winBottom) {
				boxTop = winBottom - 341;
			}

			if((boxLeft + 341) > winRight) {
				boxLeft = boxLeft - 341 - 30;
			}

			popInfo.style.top = boxTop + "px";
			popInfo.style.left = boxLeft + "px";

		};

	// 触屏设备获取鼠标坐标点。
	var getMouseXY_touch = function(e) {

			var touch = e.touches[0];
			mouseX = touch.pageX;
			mouseY = touch.pageY;
			// catch possible negative values
			if(mouseX < 0) {
				mouseX = 0;
			}
			if(mouseY < 0) {
				mouseY = 0;
			}

			var boxTop = mouseY - 168;
			var boxLeft = mouseX + 15;

			if(boxTop < winTop) {
				boxTop = winTop;
			} else if((boxTop + 338) > winBottom) {
				boxTop = winBottom - 338;
			}

			if((boxLeft + 338) > winRight) {
				boxLeft = boxLeft - 338 - 30;
			}

			popInfo.style.top = boxTop + "px";
			popInfo.style.left = boxLeft + "px";

		};

	// 初始化
	var init = function() {
		
		// @angelia-start 每次unload时移除所有事件：IE6下bug
		window.onunload = removeall;

		// 注册全局事件
		if(!isMobile) {
			$(wrapper).on("mousemove", getMouseXY);
		}

		// 监控window的scroll 和 resize事件，来改变限制pop窗口的4个边界。
		$(window).scroll(updateWinPosition);
		$(window).resize(updateWinPosition);

		// 画地图
		initMap();


	};

	init();
 
	

	// 异步请求的循环
	// 最大级别，如果请求一直不响应，每3秒增加一个级别，达到最大级别则强制刷新
	var maxLevel = usaMaxLevel || 20;
	var currentLevel = 1;
	var updateUrl = usaUpdateUrl || "http://news.ifeng.com/usa2012/data/state.js";
	// 是否能更新，如果窗口失去焦点，则不去请求。
	var canUpdate = true;
	// 正在请求的数量，如果不为0， 则不去增加新的请求。
	var updateing = 0;

	var timeInterval = usaTimeInterval || 3000;

	// 添加一个异步请求
	// @angelia 异步请求state.js数据
	var creatRequest = function() {

			$(".mx_usa_update_script").remove();
			var script = document.createElement("script");
			script.setAttribute("type", "text/javascript");
			script.setAttribute("class", "mx_usa_update_script");
			script.setAttribute("src", updateUrl + "?_=" + new Date().valueOf());
			window.document.getElementsByTagName('head')[0].appendChild(script);

			if(!($.browser.msie && $.browser.version === "6.0")) {
				script.onerror = function() {
					updateing = (updateing - 1) < 0 ? 0 : updateing - 1;
					script.onerror = null;
				};
			}

			updateing = updateing + 1;

		};

	creatRequest();

	// 3秒轮询，根据机制看是否能进行请求
	setInterval(function() {

		if(canUpdate) {

			// 如果正在请求的数据为0
			if(updateing <= 0) {
				currentLevel = 1;
				creatRequest();

				// 或者当前级别大于等于允许的最大级别
			} else if(currentLevel >= maxLevel) {
				currentLevel = 1;
				creatRequest();
			} else {
				currentLevel = currentLevel + 1;
			}

		} else {
			currentLevel = currentLevel + 1;
		}

	}, 3000);

	// 坚持窗口是否活动
	// @angelia 监测
	if($.browser.msie) {

		$(document).on("focusin", function() {
			canUpdate = true;
		});

		$(document).on("focusout", function() {
			canUpdate = false;
		});

	} else {
		$(window).on("focus", function() {
			canUpdate = true;
		});

		$(window).on("blur", function() {
			canUpdate = false;
		});
	}

	// @angelia “刷新”功能
	if(isMobile) {

		$(".refresh_button").on("touchstart", function() {
			window.location.reload();
		});

		$(".ipad_pop_close").show();
		$(".ipad_pop_close").on("touchstart", function() {
			$("#map_pop").css("visibility", "hidden");
		})

	} else {

		$(".refresh_button").on("click", function() {
			window.location.reload();
		});

	}

})(window, jQuery);