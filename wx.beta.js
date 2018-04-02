var F = {
	/*
	*	入口文件
	*/
	init : function(data){
		this.disDeBug({debug:false,msg:"init入口文件"});
		this.getUserAuthorize(data);
	},
	init2: function(callback){
		var _this = this;
		_this.ajaxPost({url:_this.configs().jsSdk,params:{op:"jsSdk",url:_this.getCurrUrl()}},function(res){
			res = eval("("+res+")");
			_this.jsSDKInit(res);
		});
		if(callback)callback();
	},
	/*
	*	获取用户授权
	*/
	getUserAuthorize: function(data){
		var _this = this;
		this.disDeBug({debug:true,msg:"getUserAuthorize获取用户授权"});
		data.scope ? data.scope = "snsapi_userinfo" : data.scope = "snsapi_base";
		this.getFaqUrlParam()["code"] ? code = this.getFaqUrlParam()["code"] : code = 0;
		this.ajaxPost({url:this.configs().getUserAuthorize, params:{op:"getUserAuthorize",scope:data.scope,sendUrl:this.getCurrUrl(),code:code}},function(res){
			res = eval("("+res+")");
			console.log(res);
			if(!res.state){
				setTimeout(function(){
					window.location.href = res.url;					
				},1000);
			}else{
				if(res.state == -1){
					window.location.href = _this.setSaveUrl();
				}else{
					_this.ajaxPost({url:_this.configs().jsSdk,params:{op:"jsSdk",url:_this.getCurrUrl()}},function(res){
						res = eval("("+res+")");
						_this.jsSDKInit(res);
					});
					if(data.callback)data.callback();
				}
			}
		});
	},
	/*
	*	通用ajax方法
	*/
	ajaxPost: function(data,callback){
		var _this = this;
		if(!data.async)$.ajaxSetup({async:false});
		$.post(data.url,data.params,callback);
	},
	/*
	*	通用ajax方法
	*/
	Post: function(data){
		var _this = this;
		if(!data.async)$.ajaxSetup({async:false});
		$.post(data.url,data.params,data.callback);
	},
	/*
	*	配置文件
	*/
	configs: function(){
		return {
			getUserAuthorize:"/configs/getUserAuthorize.php",
			debug:false,
			jsSdk:"/configs/jsSdk.php",
		};
	},
	/*
	*	deBug
	*/
	disDeBug: function(params){
		if(params.debug){
			console.info("-------------"+params.msg+"------------------")
		}
	},
	/*
	*	获取当前URL
	*/
	getCurrUrl: function(){
		var thisURL = window.location.href;
		//请求地址（当前页面地址，可以保留?符号，去掉#号后面的）
		var returnURL =  (thisURL.indexOf('#') > -1) ? thisURL.split('#')[0] : thisURL;
		return returnURL;
	},
	/*
	*	获取"?"后的url参数
	*/
	getFaqUrlParam: function(){
		var url = location.search; //获取url中"?"符后的字串
		var theRequest = new Object();
		if (url.indexOf("?") != -1) {
			var str = url.substr(1);
			if (str.indexOf("&") != -1) {
				strs = str.split("&");
				for (var i = 0; i < strs.length; i++) {
					theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
				}
			} else {
				var key = str.substring(0, str.indexOf("="));
				var value = str.substr(str.indexOf("=") + 1);
				theRequest[key] = decodeURI(value);
			}
		}
		return theRequest;
	},
	/*
	*	设置授权错误时的安全回跳域名
	*/
	setSaveUrl:function(){
		var str = this.getCurrUrl().split("code")[0];
		str = str.substr(0,str.length-1);
		return str;
	},
	/*
	*	jsSDKInit(微信JSSDK)
	*/
	jsSDKInit: function(data){
		this.disDeBug({debug:true,msg:"jsSDKInit(微信JSSDK)"});
		wx.config({
		    // debug: true, 					// debug
		    debug: false, 					// debug
		    appId: data.appId, 				// 必填，公众号的唯一标识
		    timestamp: data.timestamp, 		// 必填，生成签名的时间戳
		    nonceStr: data.nonceStr, 		// 必填，生成签名的随机串
		    signature: data.signature,		// 必填，签名，
		    jsApiList: [
			    // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
		    	"onMenuShareTimeline",
				"onMenuShareAppMessage",
				"onMenuShareQQ",
				"onMenuShareWeibo",
				"onMenuShareQZone",
				"startRecord",
				"stopRecord",
				"onVoiceRecordEnd",
				"playVoice",
				"pauseVoice",
				"stopVoice",
				"onVoicePlayEnd",
				"uploadVoice",
				"downloadVoice",
				"chooseImage",
				"previewImage",
				"uploadImage",
				"downloadImage",
				"getLocalImgData",
				"translateVoice",
				"getNetworkType",
				"openLocation",
				"getLocation",
				"hideOptionMenu",
				"showOptionMenu",
				"hideMenuItems",
				"showMenuItems",
				"hideAllNonBaseMenuItem",
				"showAllNonBaseMenuItem",
				"closeWindow",
				"scanQRCode",
				"chooseWXPay",
				"openProductSpecificView",
				"addCard",
				"chooseCard",
				"openCard"
		    ] 		    
		});
	},
	shareH5:function(data){
		var _this = this;
		wx.ready(function(){
			if(data.share){
				_this.onMenuShareTimeline(data);				// 分享到朋友圈
				_this.onMenuShareAppMessage(data);			// 分享给朋友
				_this.onMenuShareQQ(data);					// 分享到QQ
				_this.onMenuShareWeibo(data);				// 分享到腾讯微博
				_this.onMenuShareQZone(data);				// 分享到QQ空间							
			}else{
				wx.hideOptionMenu();
			}
		});
	},
	/*
	*	分享到朋友圈
	*/
	onMenuShareTimeline: function(data){
		wx.onMenuShareTimeline({
		    title: data.title2, // 分享标题
		    link: data.link, // 分享链接
		    imgUrl: data.imgUrl, // 分享图标
		    success: function () { 
		        // 用户确认分享后执行的回调函数
		        if(data.successTL)data.successTL();
		    },
		    cancel: function () { 
		        // 用户取消分享后执行的回调函数
		        if(data.cancelTL)data.cancelTL();
		    }
		});
	},
	/*
	*	分享给朋友
	*/
	onMenuShareAppMessage: function(data){
		wx.onMenuShareAppMessage({
		    title: data.title, // 分享标题
		    desc: data.desc, // 分享描述
		    link: data.link, // 分享链接
		    imgUrl: data.imgUrl, // 分享图标
		    type: '', // 分享类型,music、video或link，不填默认为link
		    dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
		    success: function () { 
		        // 用户确认分享后执行的回调函数
		        if(data.successApp)data.successApp();
		    },
		    cancel: function () { 
		        // 用户取消分享后执行的回调函数
		        if(data.cancelApp)data.cancelApp();
		    }
		});
	},
	/*
	*	分享到QQ
	*/
	onMenuShareQQ: function(data){
		wx.onMenuShareQQ({
		    title: data.title, // 分享标题
		    desc: data.desc, // 分享描述
		    link: data.link, // 分享链接
		    imgUrl: data.imgUrl, // 分享图标
		    success: function () { 
		       // 用户确认分享后执行的回调函数
		       if(data.successQQ)data.successQQ();
		    },
		    cancel: function () { 
		       // 用户取消分享后执行的回调函数
		       if(data.cancelQQ)data.cancelQQ();
		    }
		});
	},
	/*
	*	分享到腾讯微博
	*/
	onMenuShareWeibo: function(data){
		wx.onMenuShareWeibo({
		    title: data.title, // 分享标题
		    desc: data.desc, // 分享描述
		    link: data.link, // 分享链接
		    imgUrl: data.imgUrl, // 分享图标
		    success: function () { 
		       // 用户确认分享后执行的回调函数
		       if(data.successWeibo)data.successWeibo();
		    },
		    cancel: function () { 
		       // 用户取消分享后执行的回调函数
		       if(data.cancelWeibo)data.cancelWeibo();
		    }
		});
	},
	/*
	*	分享到QQ空间
	*/
	onMenuShareQZone: function(data){
		wx.onMenuShareQZone({
		    title: data.title, // 分享标题
		    desc: data.desc, // 分享描述
		    link: data.link, // 分享链接
		    imgUrl: data.imgUrl, // 分享图标
		    success: function () { 
		       // 用户确认分享后执行的回调函数
		       if(data.successQZone)data.successQZone();
		    },
		    cancel: function () { 
		       // 用户取消分享后执行的回调函数
		       if(data.cancelQZone)data.cancelQZone();
		    }
		});
	},
	// Ios,Android判断
	checkIosAndroid:function(){
		var u = navigator.userAgent;
		// var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
		// var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
		if(u.indexOf('Android') > -1 || u.indexOf('Adr') > -1){
			return 0;
		}else if(!!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)){
			return 1;
		}
	},
	// 用于兼容 iOS WKWebview 不支持 localId 直接显示图片（用于微信选图后为img赋值显示不兼容）
	localImgUrl: function(data){
		var s = this.checkIosAndroid();
		if(!s)data = "data:image/jpeg;base64,"+data;
		return data;
	},
	/*
	 *  JS上传图片并返回base64数据（返回值可以做为img的src显示）
	 *	target:上传input的id名
	 *	callback:图片上传成功时的回调函数	callback(res)	res为返回的base64数据
	*/
	jsUploadImg: function(target, callback){
		var oTarget = document.getElementById(target);
		oTarget.addEventListener('change', function(){
			var fr = new FileReader();
			fr.readAsDataURL(oTarget.files[0]);
			fr.addEventListener('load', function(){
				if(callback)callback(fr.result);
			});
		});
	},
	/*
	 *	图片预加载
	 *	src:图片的src路径
	 *	callback:图片成功加载后的回调
	*/
	imgPreLoad: function(src, callback){
		var Img = new Image(); 
		Img.src = src;
		Img.onload = function(){
			if(callback)callback(src);
		}
		Img.onerror = function(){
			console.error('图片文件：'+src+"不存在！");
		}
	},
}