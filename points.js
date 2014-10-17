// 各州名字的位置
var points = {
	"alabama": {
		"top": "325px",
		"left": "560px",
		"text": "亚拉<br>巴马"
	},
	"alaska": {
		"top": "412px",
		"left": "78px",
		"text": "阿拉斯加"
	},
	"arizona": {
		"top": "289px",
		"left": "154px",
		"text": "亚利桑那"
	},
	"arkansas": {
		"top": "304px",
		"left": "458px",
		"text": "阿肯色"
	},
	"california": {
		"top": "245px",
		"left": "48px",
		"text": "加利福尼亚"
	},
	"colorado": {
		"top": "221px",
		"left": "255px",
		"text": "科罗拉多"
	},
	"florida": {
		"top": "407px",
		"left": "651px",
		"text": "&nbsp;佛罗<br>&nbsp;&nbsp;&nbsp;里达",
		"sClass": "special_florida"
	},
	"georgia": {
		"top": "328px",
		"left": "605px",
		"text": "佐治亚"
	},
	"hawaii": {
		"top": "481px",
		"left": "300px",
		"text": "夏威夷",
		"sClass": "special_hawaii"
	},
	"idaho": {
		"top": "115px",
		"left": "159px",
		"text": "爱达荷"
	},
	"illinois": {
		"top": "189px",
		"left": "507px",
		"text": "伊利<br>诺伊"
	},
	"indiana": {
		"top": "192px",
		"left": "549px",
		"text": "印第<br>安纳"
	},
	"iowa": {
		"top": "165px",
		"left": "432px",
		"text": "艾奥瓦"
	},
	"kansas": {
		"top": "238px",
		"left": "363px",
		"text": "堪萨斯"
	},
	"kentucky": {
		"top": "238px",
		"left": "578px",
		"text": "肯塔基"
	},
	"louisiana": {
		"top": "356px",
		"left": "465px",
		"text": "路易<br>斯安那",
		"sClass": "special_louisiana"
	},
	"maine": {
		"top": "53px",
		"left": "764px",
		"text": "*缅因"
	},
	"michigan": {
		"top": "136px",
		"left": "560px",
		"text": "密歇根"
	},
	"minnesota": {
		"top": "80px",
		"left": "425px",
		"text": "明尼<br>苏达"
	},
	"mississippi": {
		"top": "328px",
		"left": "514px",
		"text": "密西<br>西比"
	},
	"missouri": {
		"top": "236px",
		"left": "450px",
		"text": "密苏里"
	},
	"montana": {
		"top": "59px",
		"left": "218px",
		"text": "蒙大拿"
	},
	"nebraska": {
		"top": "173px",
		"left": "338px",
		"text": "*内布拉斯加"
	},
	"nevada": {
		"top": "177px",
		"left": "104px",
		"text": "内华达"
	},
	"newMexixo": {
		"top": "303px",
		"left": "238px",
		"text": "新墨西哥"
	},
	"newYork": {
		"top": "113px",
		"left": "699px",
		"text": "纽约"
	},
	"northCarolina": {
		"top": "262px",
		"left": "656px",
		"text": "北卡罗来纳",
		"sClass": "special_northCarolina"
	},
	"northDakota": {
		"top": "60px",
		"left": "340px",
		"text": "北达科他"
	},
	"ohio": {
		"top": "187px",
		"left": "588px",
		"text": "俄亥俄"
	},
	"oklahoma": {
		"top": "292px",
		"left": "369px",
		"text": "俄克拉何马"
	},
	"oregon": {
		"top": "89px",
		"left": "77px",
		"text": "俄勒冈"
	},
	"pennsylvenia": {
		"top": "162px",
		"left": "650px",
		"text": "宾夕法尼亚"
	},
	"southDakota": {
		"top": "117px",
		"left": "340px",
		"text": "南达科他"
	},
	"tennessee": {
		"top": "292px",
		"left": "530px",
		"text": "田纳西",
		"sClass": "special_tennessee"
	},
	"texas": {
		"top": "365px",
		"left": "344px",
		"text": "德克萨斯"
	},
	"utah": {
		"top": "205px",
		"left": "185px",
		"text": "犹他"
	},
	"virginia": {
		"top": "223px",
		"left": "663px",
		"text": "弗吉尼亚"
	},
	"washington": {
		"top": "27px",
		"left": "92px",
		"text": "华盛顿"
	},
	"wisconsin": {
		"top": "111px",
		"left": "496px",
		"text": "威斯<br>康星"
	},
	"wyoming": {
		"top": "140px",
		"left": "248px",
		"text": "怀俄明"
	},
	"connecticut": {
		"type": "side",
		"top": "203px",
		"left": "846px",
		"text": "康涅狄格"
	},
	"delaware": {
		"type": "side",
		"top": "280px",
		"left": "846px",
		"text": "特拉华"
	},
	"dc": {
		"type": "side",
		"top": "356px",
		"left": "846px",
		"text": "哥伦比亚特区"
	},
	"maryland": {
		"type": "side",
		"top": "318px",
		"left": "846px",
		"text": "马里兰"
	},
	"massachusetts": {
		"type": "side",
		"top": "127px",
		"left": "846px",
		"text": "马萨诸塞"
	},
	"newHampshire": {
		"type": "side",
		"top": "88px",
		"left": "846px",
		"text": "新罕布什尔"
	},
	"newJersey": {
		"type": "side",
		"top": "241px",
		"left": "846px",
		"text": "新泽西"
	},
	"rhodeIsland": {
		"type": "side",
		"top": "165px",
		"left": "846px",
		"text": "罗得岛"
	},
	"westVirginia": {
		"type": "side",
		"top": "394px",
		"left": "846px",
		"text": "西弗吉尼亚"
	},
	"southCarolina": {
		"type": "side",
		"top": "433px",
		"left": "846px",
		"text": "南卡罗来纳"
	},
	"vermont": {
		"type": "side",
		"top": "26px",
		"left": "587px",
		"text": "佛蒙特",
		"sClass": "special_vermont"
	}
};