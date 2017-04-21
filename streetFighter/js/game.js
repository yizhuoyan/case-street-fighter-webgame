var Log = {
    log: function() {
        if (window.console) {
            var msg = arguments[0];
            for (var i = 1; i < arguments.length; i++) {
                msg += "\n";
                msg += arguments[i];
            }
            console.log(msg);
        }
    }
};

/**
 * 元素背景帧动画
 * 
 */
var BGFrameAnimation = (function() {

    var Constructor = function(options) {
        //显示帧动画的视图
        this.view = null;
        //帧动画图片路径
        this.image = options.image;
        //动画名称
        this.name = options.name;
        //背景图片高宽(默认水平帧)
        this.imageWidth = options.width;
        this.imageHeight = options.height;
        //帧数,默认1
        this.frames = options.frames || 1;
        //每帧高宽
        this.frameWidth = null;
        this.frameHeight = null;
        //播放间隔,默认80
        this.frameInterval = options.frameInterval || 80;
        //播放次数,默认1次
        this.playTimes = options.times || 1;
        //当前播放时间
        this.currentPlayTimes = 0;
        //当前帧位置
        this.currentFramePosition = 0;
        //上一帧绘制时间
        this.previousFramePaintTime = 0;

        //播放完毕回调
        this.overCallback = options.over;
        //播放状态0=停止,1=正在播放
        this.status = 0;

        this._init();
    };
    Constructor.prototype = {
        _init: function() {
            //计算帧高宽
            this.frameWidth = this.imageWidth / this.frames;
            this.frameHeight = this.imageHeight;
            //未播放
            this.status = 0;
        },
        //动画重置
        reset: function() {
            this.currentPlayTimes = 1;
            this.currentFramePosition = 0;
            this.previousFramePaintTime=0;
            this.status = 0;
        }
    };
    /**
     * 动画应用于view,播放times次,默认1次
     * @param {Object} view 
     * @param {Object} times -1,表示无数次
     */
    Constructor.prototype.apply = function(view, times,callback) {
        //帧动画重置
        this.reset();
        //设置背景图片
        view.style.backgroundImage = "url(" + this.image + ")";
        //设置视图实际高宽
        view.style.width = this.frameWidth + "px";
        view.style.height = this.frameHeight + "px";
        this.view = view;
        //播放中
        this.status = 1;
        this.playTimes = times || 1;
        this.currentPlayTimes=1;
        this.overCallback=callback;
    };
    //帧动画绘制
    Constructor.prototype.paint = function(now) {
        if(this.status==0)return;
        //没到绘制时间,跳过
        if (now - this.previousFramePaintTime < this.frameInterval) {
            return;
        }
        //计算下一帧位置
        var nextFramePosition = this.currentFramePosition - this.frameWidth;
        //没有下一帧
        if (nextFramePosition + this.imageWidth === 0) {
            if(this.playTimes === -1){
                //则回到第一帧
                nextFramePosition = 0;
            }else if(this.currentPlayTimes < this.playTimes) {
                //则回到第一帧
                nextFramePosition = 0;
                //绘制次数+1
                this.currentPlayTimes++;
            } else { //播放完毕
                this.status=0;
                //回调播放完毕
                if (this.overCallback) {
                   this.overCallback.call(this,this.view);
                }
                return;
            }
        }
        //下一帧
        this.currentFramePosition = nextFramePosition;
        //绘制当前帧
        this.view.style.backgroundPosition = this.currentFramePosition + "px bottom";
        //记录当前帧绘制时间
        this.previousFramePaintTime = now;
        
        
    };
    return Constructor;
})();

//加载资源
var Assets = (function() {
    var Constructor = function() {
        //所有资源map
        this.map = {};
        //总大小
        this.size = 0;
        this._init();

    };
    //帧动画图片的正则
    Constructor.REG_ANIMATION_IMAGE = /^fa-(\w+@\w+)\.(\d+)x(\d+)\.(\d+)\.gif$/;

    Constructor.prototype = {
        //加载所有资源
        _init: function() {
            var animations = [
                "fa-RYU1@crouch_heavy_boxing.375x126.5.gif",
"fa-RYU1@crouch_heavy_kick.615x61.5.gif",
"fa-RYU1@crouch_light_boxing.291x61.3.gif",
"fa-RYU1@crouch_light_kick.342x64.3.gif",
"fa-RYU1@crouch_middle_boxing.282x62.3.gif",
"fa-RYU1@crouch_middle_kick.740x64.5.gif",
"fa-RYU1@go_back.378x91.6.gif",
"fa-RYU1@go_forward.396x92.6.gif",
"fa-RYU1@heavy_boxing.546x113.6.gif",
"fa-RYU1@heavy_kick.610x94.5.gif",
"fa-RYU1@jump_heavy_boxing.360x77.4.gif",
"fa-RYU1@jump_heavy_kick.480x104.5.gif",
"fa-RYU1@jump_light_boxing.166x71.2.gif",
"fa-RYU1@jump_light_kick.156x92.2.gif",
"fa-RYU1@jump_middle_boxing.360x77.4.gif",
"fa-RYU1@jump_middle_kick.234x92.3.gif",
"fa-RYU1@light_boxing.282x91.3.gif",
"fa-RYU1@light_kick.580x94.5.gif",
"fa-RYU1@middle_boxing.575x95.5.gif",
"fa-RYU1@middle_kick.440x102.5.gif",
"fa-RYU1@spirit_wave.113x32.2.gif",
"fa-RYU1@wait_crouch_form.63x83.1.gif",
"fa-RYU1@wait_jump_form.464x109.8.gif",
"fa-RYU1@wait_stand_form.372x93.6.gif",
"fa-RYU1@wave_boxing.432x90.4.gif"

            ];
            //加载帧动画
            for (var i = animations.length; i-- > 0;) {
                this.loadAnimation(animations[i]);
            }

            //加载声音
            //this.loadAudio();
        }

    };

    /**
     * 加载帧动画 
     * @param {String} img 帧动画图片路径
     */
    Constructor.prototype.loadAnimation = function(img) {
        var result = img.match(Assets.REG_ANIMATION_IMAGE);
        if (!result) {
            Log.log("加载资源" + img + "失败");
            return;
        }
        /*依次获取帧动画属性*/
        //动画名称
        var name = result[1];
        //图片高宽
        var w = parseInt(result[2], 10);
        var h = parseInt(result[3], 10);
        //帧数
        var frames = result[4];
        //构建帧动画对象
        var animation = new BGFrameAnimation({
            image: "img/" + img,
            name: name,
            width: w,
            height: h,
            frames: frames
        });
        //保存到资源中
        this.map[name] = animation;
        this.size++;
        Log.log("加载帧动画" + img + "成功");
    };
    /**
     * 加载声音 
     * @param {Object} name
     * @param {Object} options
     */
    Constructor.prototype.loadAudio = function(name, options) {
        this.map[name] = animation;
        this.size++;
    };
    /**
     *获取资源 
     * @param {Object} name 资源名称
     */
    Constructor.prototype.get = function(name) {
        return this.map[name];
    }
    return Constructor;
})();

//玩家
var Player = (function() {
    var P = function(game,name) {
        this.game = game;
        //视图
        this.view = null;
        //人物名称
        this.name = name||"RYU1";
        //玩家当前动画
        this.currentAnimation = null;
        //玩家按键相关
        this.keyStack=[];
        //玩家坐标相关
        this.x = 0;
        this.y = 0;
        this.maxX = 0;
        this.maxY = 0;
        this.w = 0;
        this.h = 0;
        //玩家跳跃属性相关
        this.jumpMaxY=120;//最大跳跃高度
        this.frameJumpY=0;//每帧跳跃移动高度
        //气波功相关属性
        this.waveBoxingView=null;
        this.waveBoxingAnimation=null;
        this.waveBoxingX=0;//气功波当前X
        this.waveBoxingY=0;//气功波当前Y
        this.waveBoxingFrameX=2;//每帧移动宽度
        this.waveBoxingStatus=0;//气功波状态0未发出,1=发出中,2已销毁
        /*
         * 人物形态
         * 0=下蹲
         * 1=站立
         * 2=跳跃
         */
        this.formType=1;
        
        //是否待命
        this.isWait=true;

        this._init();
    }
    P.prototype = {
        _init: function() {
            var canvas = this.game.canvas;
            this.maxX = canvas.width;
            this.maxY = canvas.height;
            this._createView();
            this._createWaveBoxingView();
            this.wait();
        },
        _createView: function() {
            var view = document.createElement("div");
            view.style.position = "absolute";
            //view.style.border="1px solid black";
            var canvas = this.game.canvas;
            canvas.appendChild(view);
            //模型和视图关联
            view.model=this;
            this.view = view;
        },
        _createWaveBoxingView:function(){
            var an=this.game.getAnimation(this.name+"@spirit_wave");
            if(!an){
                Log.log("无法加载气功波");
                return;
            }
            this.waveBoxingAnimation=an;
            
            var view = document.createElement("div");
            view.style.position = "absolute";
            view.style.display="none";
            view.style.width=an.frameWidth+"px";
            view.style.height=an.frameHeight+"px";
            //view.style.border="1px solid black";
            var canvas = this.game.canvas;
            canvas.appendChild(view);
            //模型和视图关联
            view.model=this;
            this.waveBoxingView = view;
            an.apply(view,-1);
        },
        paint:function(now) {
            if (this.currentAnimation) {
                this.currentAnimation.paint(now);
            }
            if(this.formType===2){
                this.paintJump();
            }
            if(this.waveBoxingStatus===1){
                this.paintWaveBoxing();  
            }
            var v = this.view;
            v.style.width = this.w + "px";
            v.style.height = this.h + "px";
            v.style.left = this.x + "px";
            //this.y表示人物离地面的距离
            v.style.top = (this.maxY - this.h - this.y) + "px";
        },
        paintJump: function(now) {
            
            if(this.frameJumpY>0){//上升
                if(this.y>=this.jumpMaxY){//到顶
                    this.y=this.jumpMaxY;
                    this.frameJumpY=-0.1;
                }else{
                    this.y+=this.frameJumpY;
                    this.frameJumpY+=0.2;
                }
            }else{//下降
                if(this.y<=0){//到底
                    this.y=0;
                    this.wait(1);
                }else{
                    this.y+=this.frameJumpY;
                    this.frameJumpY-=0.2;
                }
            }
        },
        paintWaveBoxing:function(){
            var v=this.waveBoxingView;
            this.waveBoxingX+=this.waveBoxingFrameX;
            
            if(this.waveBoxingX+v.offsetWidth>=this.maxX){
                v.style.display="none";
                this.waveBoxingStatus=0;
                return;
            }
            v.style.left=this.waveBoxingX+"px";
            v.style.top = (this.maxY - v.offsetHeight - this.waveBoxingY) + "px";                
        },
        /**
         * 游戏人物应用帧动画 
         * @param {Object} animationName 动画名称
         * @param {Object} times 应用次数,默认1次,-1循环
         * @param {Object} callback 动画播放完毕回调
         */
        applyAnimation:function(animationName, times,callback) {
            animationName=this.name + "@" + animationName;
            var newAnimation = this.game.getAnimation(animationName);
            if(!newAnimation){
                Log.log("无法找到帧动画"+animationName);
                return;
            }
            //已是当前动画
            if (this.currentAnimation === newAnimation) {
                return;
            }
            newAnimation.apply(this.view, times,callback||function(view){
                var player=view.model;
                player.wait();
            });
    
            this.currentAnimation = newAnimation;
            this.w = newAnimation.frameWidth;
            this.h = newAnimation.frameHeight;
        }
        

    };
    /**
     *出拳 
     * @param {String} strength 力量heaving/middle/light
     */
    P.prototype.boxing = function(strength) {
        //非待命状态无法出拳
        if(!this.isWait){
            return;
        }
        this.isWait=false;
        var animation=strength;
        switch (this.formType){
        	case 0:
        	   animation="crouch_"+strength;
        		break;
        	case 2:
               animation="jump_"+strength;
                break;
        }
        this.applyAnimation(animation+"_boxing");
    };
     /**
     *踢腿
     * @param {String} strength 力量heaving/middle/light
     */
    P.prototype.kick = function(strength) {
        //非待命状态无法踢腿
        if(!this.isWait){
            return;
        }
        this.isWait=false;
        var animation=strength;
        switch (this.formType){
            case 0:
               animation="crouch_"+strength;
                break;
            case 2:
               animation="jump_"+strength;
                break;
        }
        this.applyAnimation(animation+"_kick");
    };
    
    /**
     * 待命状态 
     * @param {int} type 形态类型  0=下蹲,1=站立,2=跳跃
     */
    P.prototype.wait = function(type) {
        //未传参数,则按照当前形态待命
        this.isWait=true;
        if(typeof type==="undefined"){
            type=this.formType;
        }else{
            this.formType=type;
        }
        if (type==0) {//下蹲
            this.applyAnimation("wait_crouch_form",-1);
        } else if (type==2) {//跳跃
            this.applyAnimation("wait_jump_form", 1);
        }else{ 
            //站立
            this.applyAnimation("wait_stand_form", -1);
        }
    };
    P.prototype.goForward = function(move) {
      
       this.applyAnimation("go_forward");
        this.x += move;
        if (this.x + this.w > Game.w) {
            this.x = 0;
        }
    };
    P.prototype.goBack = function(move) {
        
        this.applyAnimation("go_back");
        this.x -= move;
        if (this.x <= 0) {
            this.x = 0;
        }
    };
    P.prototype.goCrouch = function() {
        this.applyAnimation("wait_crouch_form",-1);
        this.formType=0;
    };
    P.prototype.goJump = function() {
        this.applyAnimation("wait_jump_form",-1);
        this.formType=2;
        this.frameJumpY=0.1;
    };
    /**
     *气功波 
     */
    P.prototype.waveBoxing = function() {
        
        //非待命状态不可发出
        if(!this.isWait)return;
        //已发出不允许再次发出
        
        if(this.waveBoxingStatus!==0){
            return;
        }
        this.isWait=false;
        
        this.applyAnimation("wave_boxing",1,function(view){
            var p=view.model;
            p.wait();
            var v=p.waveBoxingView;
            v.style.display="block";
            p.waveBoxingX=p.x+p.w;
            p.waveBoxingY=p.y+(p.h/2);
            p.waveBoxingStatus=1;
        });
        
        
    };
    /**
     *判断是否是组合键发技能 
     * 只要按键中包含序列即可
     * @param {Object} keys 
     */
    P.prototype.judgeKeyGroup=function(keys){
        var ks=this.keyStack;
        var ksString=ks.toString();
        var inputKs=[];
        for(var i=0;i<arguments.length;i++){
            inputKs.push(arguments[i]);
        }
        return ksString.indexOf(inputKs.toString())!==-1;
    };
    P.prototype.handleKeyDown = function(code) {
        var now=new Date().getTime();
        //保留500毫秒内连续按下的方向按键,用于识别组合技能键
        switch(code){
            case 65: //left
            case 87: //up
            case 68: //right
            case 83: //down
            var ks=this.keyStack;
            //无按键,保存
            if(ks.length===0){
                ks.push(code);
                //保存按键时间
                ks.time=now;
            }else{
                if(now-ks.time<=500){
                  ks.push(code);
                }else{
                    //超出500毫秒,全部清空,保存当前键
                    this.keyStack=[code];
                    this.keyStack.time=now;    
                }
            }
        }
        switch (code) {
            case 65: //left
                this.goBack(6);
                break;
            case 87: //up
                this.goJump();
                break;
            case 68: //right
                this.goForward(6);
                break;
            case 83: //down
                this.goCrouch();
                break;
            case 74: //j
                if(this.judgeKeyGroup(83,68)){//下右,气功波
                    this.waveBoxing();
                }else{
                    this.boxing("light");
                }
                break;
            case 75: //k
                this.boxing("middle");
                break;
            case 76: //l
               this.boxing("heavy");
                break;
            case 85: //u
                this.kick("light");
                break;
            case 73: //i
                this.kick("middle");
                break;
            case 79: //o:
                this.kick("heavy");
                break;
            default:
        }
    };
    P.prototype.handleKeyUp = function(code) {
        var curAnimation = this.currentAnimation;
        switch (code) {
            case 65: //left
                this.wait();
                break;
            case 87: //up
                break;
            case 68: //right
                this.wait();
                break;
            case 83: //down
                this.wait(1);
                break;
        }
    };
    return P;
})();


/**
 * 游戏控制器 
 */
var Game = (function() {
    var Constructor = function(canvas) {
        //游戏画布
        this.canvas = canvas;
        //所有精灵
        this.spirits = [];
        //资源管理
        this.assets = null;

        this._init();
    };
    Constructor.FPS = 1000 / 60;

    Constructor.prototype = {
        _init: function() {
            //加载资源
            this.assets = new Assets();
            //计算画布大小
            var c = this.canvas;
            c.width = c.offsetWidth;
            c.height = c.offsetHeight;
            //初始化所有精灵
            this._initSpirits();
            //添加按键监听
            this._addKeyListener();
        },
        _initSpirits: function() {
            //创建玩家1
            var p1 = new Player(this,"RYU1");
            this.spirits.push(p1);

        },
        _addKeyListener: function() {
            var that = this;
            var keyEventHandler = function(evt) {
                var code = evt.keyCode;
                var spirits = that.spirits;
                if ("keydown" === evt.type) {
                    for (var i = 0, len = spirits.length; i < len; i++) {
                        spirits[i].handleKeyDown(code);
                    }
                } else if("keyup"===evt.type) {
                    for (var i = 0, len = spirits.length; i < len; i++) {
                        spirits[i].handleKeyUp(code);
                    }
                }
            };
            document.addEventListener("keydown", keyEventHandler);
            document.addEventListener("keyup", keyEventHandler);
        }
    };
    //获取动画
    Constructor.prototype.getAnimation = function(name) {
        return this.assets.get(name);
    };
    /**
     * 游戏开始
     * 开启游戏绘制
     */
    Constructor.prototype.start = function() {
        var sm = this;
        //游戏绘制核心方法
        var paint = function() {
            var spirits = sm.spirits;
            //绘制所有精灵
            for (var i = 0, len = spirits.length; i < len; i++) {
                spirits[i].paint(new Date().getTime());
            }
            setTimeout(paint, Game.FPS);
        }
        paint();
    }

    return Constructor;
})();
//入口
var streetMaster = new Game(document.getElementById("canvas"));
streetMaster.start();