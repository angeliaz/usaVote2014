var pollUpdate;
(function(win, $) {

	// 总票数
	var totalTicket = 538;

	// 状态信息，初始为空，请求到数据以后，如果是最新的，则更新此对象。
	var stateInfo = {};

	// 当前鼠标所在区块，激活弹出窗口时更新。
	var currentBlock = null;

	// 状态所对应的颜色，数组中 0 是默认颜色，1 鼠标hover的颜色，2 字体颜色
	var stateColor = {
		// 罗姆尼领先
		r_lead: ["#e97373", "#db3b3b", "#951a1a"],
		// 罗姆尼获胜
		r_win: ["#ab2f2f", "#741f1f", "#FFFFFF"],
		// 奥巴马领先
		o_lead: ["#b1c7e7", "#6885b0", "#3d538e"],
		// 奥巴马获胜
		o_win: ["#3d538e", "#202f56", "#FFFFFF"],
		// 尚未开始投票
		prepare: ["#d6d7d8", "#999999", "#000000"]
	};

	// 弹出窗口的定时器
	var popTimer = null;

	// 弹出动画的定时器
	var animPopProTime = null;

	// 地图数据对象集合
	var mapData = {};

	// 定义包围容器
	var wrapper = document.getElementById("map_main");
	var popInfo = document.getElementById("map_pop");

	// 定义两个地图容器，背景题图，蒙版地图
	var paperBack, paperMask;

	// 定义窗口4个顶点的信息
	var winTop, winLeft, winBottom, winRight;

	// 是否是移动设备
	var find = function(a, b) {
		return a.indexOf(b) + 1;
	};

	var na = navigator.userAgent.toLowerCase();
	var isAndroid = find(na, "android");
	var isIphone = find(na, "iphone");
	var isIpad = find(na, "ipad");
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

			for(stateId in mappaths) {
				oMap = {};
				oMap.back = creatMapBack(stateId);
				oMap.info = creatMapInfo(stateId);
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
			block.state = "prepare";
			block.attr({
				fill: "#97d6f5",
				stroke: "#FFFFFF",
				'stroke-width': 1,
				'stroke-linejoin': 'round'
			});
			return block;

		};

	// 建立州名称
	var creatMapInfo = function(stateId) {

			var o = points[stateId];
			var className = o.sClass || "";

			if(typeof o.type !== "undefined" && o.type === "side") {
				$("#map_info_side").append('<div id="t_' + stateId + '" class="' + className + '" style="top: ' + o.top + '; left: ' + o.left + ';" data-stateId="' + stateId + '" data-class="' + className + '" ><p><em>' + baseInfo[stateId][1] + '</em>' + o.text + '</p></div>');
			} else {
				$("#map_info").append('<div id="t_' + stateId + '" class="' + className + '" style="top: ' + o.top + '; left: ' + o.left + ';" data-stateId="' + stateId + '" data-class="' + className + '" ><em>' + baseInfo[stateId][1] + '</em>' + o.text + '</div>');
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
			var block = mapData[stateId].back;
			var fillColor = stateColor[block.state][1];

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
				changePop(stateId, stateInfo.state[stateId]);

			}, 200);

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
					changePop(stateId, stateInfo.state[stateId]);

				});

			} else {

				$("#map_info_side").delegate("div", "mouseenter", function() {

					var _this = this;
					var stateId = $(this).attr("data-stateId");
					var blockMask = mapData[stateId].mask;
					var block = mapData[stateId].back;
					var condition = block.state;
					var fillColor = stateColor[block.state][1];

					popTimer = setTimeout(function() {

						block.attr({
							fill: fillColor
						});
						currentBlock = blockMask;
						popInfo.style.visibility = "visible";
						popTimer = null;
						changePop(stateId, stateInfo.state[stateId]);
						$(this).find("p").addClass("hoverIt");

					}, 200);

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

		var stateId;
		var data;

		$("#map_back")[0].style.visibility = "hidden";
		$("#map_info")[0].style.visibility = "hidden";
		for(stateId in datas.state) {

			data = datas.state[stateId]
			changeMapState(stateId, data);

		}
		$("#map_info")[0].style.visibility = "visible";
		$("#map_back")[0].style.visibility = "visible";

		if(currentBlock) {
			changePop(currentBlock.stateId, datas.state[currentBlock.stateId]);
		}
		stateInfo = datas;

		return;
	};

	// 改变地图的状态，地图背景的颜色，州说明的颜色
	var changeMapState = function(stateId, data) {

			var block = mapData[stateId].back;
			// 当前鼠标所在区块，激活弹出窗口时更新。
			var currentState = block.state;
			var state = getState(stateId, data);

			if(currentState !== state) {
				block.state = state;
				block.attr({
					fill: stateColor[state][0]
				});
				var specialClass = $("#t_" + stateId).attr("data-class") || "";
				document.getElementById("t_" + stateId).className = state + " " + specialClass;
			}

		};

	// 获取当前州的状态
	var getState = function(stateId, data) {

			switch(data[0]) {

			case 2:
			
				if(data[3] + data[4] > 0) {
					return(data[3] >= data[4]) ? "o_lead" : "r_lead";
				} else {
					return(data[1] >= data[2]) ? "o_lead" : "r_lead";
				}
				break;

			case 3:
			
				if(data[3] + data[4] > 0) {
					return(data[3] >= data[4]) ? "o_win" : "r_win";
				} else {
					return(data[1] >= data[2]) ? "o_win" : "r_win";
				}
				break;

			default:
				return "prepare";
				break;
			}

		};

	// 改变弹出窗口的数据
	// todo 1026 那个refStateId是否需要这么做，因为这么做，又多了一个状态值，能否用现有状态替代。
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
				var blockBaseInfo = baseInfo[stateId];
				$pop.data("refStateId", stateId);
				$pop.find(".title").text(blockBaseInfo[0]);
				$pop.find(".poll_count em").text(blockBaseInfo[1]);

				// 如果当前状态为未开始投票，则将百分比请空和投票数设为0
				// todo 实际情况中是否需要这么做。
				if(data[0] === 1) {
					$pop.find(".o_bar").height(0);
					$pop.find(".r_bar").height(0);
					$pop.find(".o_per").text("");
					$pop.find(".r_per").text("");
					$pop.find(".o_info em").text("0");
					$pop.find(".r_info em").text("0");
					$("#o_win_bar").hide();
					$("#r_win_bar").hide();
				} else {
					creatAnimPop([1, 0, 0, 0, 0, 0, 0], data);
				}

			} else {

				// 如果当前状态为未开始投票，则将百分比请空和投票数设为0
				// todo 实际情况中是否需要这么做。
				if(data[0] === 1) {
					$pop.find(".o_per").text("");
					$pop.find(".r_per").text("");
					$pop.find(".o_info em").text("0");
					$pop.find(".r_info em").text("0");
					$("#o_win_bar").hide();
					$("#r_win_bar").hide();
				} else {
					creatAnimPop(stateInfo.state[stateId], data);
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
			var oBeginTicket = lastData[1];
			var rBeginTicket = lastData[2];
			var oEndTicket = currentData[1];
			var rEndTicket = currentData[2];

			// 由于有人工干预，投票百分比的计算有点麻烦
			var oBeginPre;
			if(lastData[3] !== 0 && lastData[4] !== 0) {
				oBeginPre = lastData[3];
			} else {

				// 无票的判断
				if((rBeginTicket + oBeginTicket) <= 0) {
					oBeginPre = 0;
				} else {
					// 获取小数点后一位的数字
					oBeginPre = (((oBeginTicket / (rBeginTicket + oBeginTicket)) * 100).toFixed(1)) / 1;
				}

			}

			var rBeginPre;
			if(lastData[3] !== 0 && lastData[4] !== 0) {
				rBeginPre = lastData[4];
			} else {

				if((rBeginTicket + oBeginTicket) <= 0) {
					rBeginPre = 0;
				} else {
					rBeginPre = 100 - oBeginPre;
				}

			}

			var oEndPre;
			if(currentData[3] !== 0 && currentData[4] !== 0) {
				oEndPre = currentData[3];
			} else {

				if((oEndTicket + rEndTicket) <= 0) {
					oEndPre = 0;
				} else {
					oEndPre = (((oEndTicket / (oEndTicket + rEndTicket)) * 100).toFixed(1)) / 1;
				}

			}

			var rEndPre;
			if(currentData[3] !== 0 && currentData[4] !== 0) {
				rEndPre = currentData[4];
			} else {

				if((oEndTicket + rEndTicket) <= 0) {
					rEndPre = 0;
				} else {
					rEndPre = 100 - oEndPre;
				}

			}

			clearTimeout(animPopProTime);
			animPopPro([oBeginTicket, oEndTicket, oBeginPre, oEndPre, lastData[0]], [rBeginTicket, rEndTicket, rBeginPre, rEndPre, currentData[0]], animPopCount);

		};

	// @angelia:创建pop窗口的投票动画
	var animPopPro = function(oDatas, rDatas, count) {

		var a = [];
		if(oDatas[2] === oDatas[3] || count === 0) {
			
			var rWinBar = "";
			var oWinBar = "";
			var sFixTop = 'style="top: 167px;"';
			
			if(oDatas[3]*1.2 - 57 > 0) {
				sFixTop = 'style="top: '+ (167 - (oDatas[3]*1.2 - 57)/2) +'px;"';
			}

			if(rDatas[3]*1.2 - 57 > 0) {
				sFixTop = 'style="top: '+ (167 - (rDatas[3]*1.2 - 57)/2) +'px;"';
			}


	        if(rDatas[4] === 3) {

	        	if(oDatas[3] > rDatas[3]) {
	        		oWinBar = '<div id="o_win_bar" '+ sFixTop +'></div>';
	        	} else {
	        		rWinBar = '<div id="r_win_bar" '+ sFixTop +'></div>';
	        	}

	        }	        
	        a.push('<div class="o_bar" style="height: '+ oDatas[3]*1.2 +'px"><div class="o_per">'+ oDatas[3].toFixed(1) +'%</div></div><div class="o_sign"></div><div class="o_info">奥巴马<br/><em>'+ formatDot(oDatas[1]) +'</em>票</div>' + oWinBar);
	        a.push('<div class="r_bar" style="height: '+ rDatas[3]*1.2 +'px"><div class="r_per">'+ rDatas[3].toFixed(1) +'%</div></div><div class="r_sign"></div><div class="r_info">罗姆尼<br/><em>'+ formatDot(rDatas[1]) +'</em>票</div>' + rWinBar);
	        document.getElementById("js_bar_box").innerHTML = a.join("");

		} else {
			oDifPre = (((oDatas[3] - oDatas[2]) / count).toFixed(1)) / 1;
			oDatas[2] = oDatas[2] + oDifPre;
			oDifTicket = Math.floor((oDatas[1] - oDatas[0]) / count);
			oDatas[0] = oDatas[0] + oDifTicket;

			rDifPre = (((rDatas[3] - rDatas[2]) / count).toFixed(1)) / 1;
			rDatas[2] = rDatas[2] + rDifPre;
			rDifTicket = Math.floor((rDatas[1] - rDatas[0]) / count);
			rDatas[0] = rDatas[0] + rDifTicket;

	        a.push('<div class="o_bar" style="height: '+ oDatas[2]*1.2 +'px"><div class="o_per">'+ oDatas[2].toFixed(1) +'%</div></div><div class="o_sign"></div><div class="o_info">奥巴马<br/><em>'+ formatDot(oDatas[0]) +'</em>票</div>');
	        a.push('<div class="r_bar" style="height: '+ rDatas[2]*1.2 +'px"><div class="r_per">'+ rDatas[2].toFixed(1) +'%</div></div><div class="r_sign"></div><div class="r_info">罗姆尼<br/><em>'+ formatDot(rDatas[0]) +'</em>票</div>');
	        document.getElementById("js_bar_box").innerHTML = a.join("");

			animPopProTime = setTimeout(function() {
				animPopPro(oDatas, rDatas, count - 1);
			}, animPopTime);

		}

	};


	// 格式化数字中的逗号
	var formatDot = function(iNumber) {

			var s = iNumber + "";
			return s.replace(/(?=(?!\b)(?:\d{3})+(?!\d))/g, ',');

		};

	// 卸载所有的事件，为了修复ie6下面刷新页面
	var removeall = function() {

			for(var stateId in mapData) {
				// console.log('stateId:' + stateId);
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

	// @angelia-start 每次unload时移除所有事件：IE6下bug
	window.onunload = removeall;

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

	// @angelia 
	// 注册全局事件
	if(!isMobile) {
		$(wrapper).on("mousemove", getMouseXY);
	}

	// 监控window的scroll 和 resize事件，来改变限制pop窗口的4个边界。
	$(window).scroll(updateWinPosition);
	$(window).resize(updateWinPosition);

	// @angelia 画地图
	initMap();


	// 异步请求的循环
	// 最大级别，如果请求一直不响应，每3秒增加一个级别，达到最大级别则强制刷新。
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