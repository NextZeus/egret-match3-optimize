class GameLogic {
    private _gameStage: egret.Sprite;
    public constructor(gameStage: egret.Sprite) {
        this._gameStage = gameStage;
        this.init();
    }


    /*-----------------------------初始化数据,创建各种控制器--------------------------------------*/
    private evm: ElementViewManage;
    private levm: LevelReqViewManage;
    private mapc: MapControl;
    private pvm: PropViewManage;
    private init() {
        GameData.initData();  //初始化数据

        var leveldata = RES.getRes("l1");   //初始化GameData数据
        // leveldata map是空白元素位置
        MapDataParse.createMapData(leveldata.map);  //创建地图数据
        LevelGameDataParse.parseLevelGameData(leveldata);  //解析游戏关卡数据

        this.mapc = new MapControl();
        this.mapc.createElementAllMap();

        var gbg: GameBackGround = new GameBackGround();
        this._gameStage.addChild(gbg);
        gbg.changeBackground();

        var lec: egret.Sprite = new egret.Sprite();
        this._gameStage.addChild(lec);
        this.levm = new LevelReqViewManage(lec);
        this.levm.createCurrentLevelReq();

        var pvmc: egret.Sprite = new egret.Sprite();
        this._gameStage.addChild(pvmc);
        this.pvm = new PropViewManage(pvmc);


        var cc: egret.Sprite = new egret.Sprite();
        this._gameStage.addChild(cc);
        this.evm = new ElementViewManage(cc);
        this.evm.showAllElement();
        this.evm.addEventListener(ElementViewManageEvent.TAP_TWO_ELEMENT, this.viewTouchTap, this);
        this.evm.addEventListener(ElementViewManageEvent.ALL_ELEMENT_MOVE_ANIMATION_OVER, this.allElementMoveAniOver, this);
        this.evm.addEventListener(ElementViewManageEvent.ALL_ELEMENT_VIEW_DISAPPEARED, this.refreshMap, this);
        this.evm.addEventListener(ElementViewManageEvent.ALL_ELEMENT_VIEW_UPDATE_LOCATION_OVER, this.checkOtherElementLink, this);
        this.evm.addEventListener(ElementViewManageEvent.USE_PROP_CLICK, this.usePropClick, this);
    }
    /*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/


    /*-----------------------------视图管理器中存在两个被tap的元素，进行判断--------------------------------------*/
    private viewTouchTap(evt: ElementViewManageEvent) {
        var rel: boolean = LinkLogic.canMove(evt.gameElementId1, evt.gameElementId2);//从二维地图中判断，两个元素是否可交换位置
        console.log("位置上是否可以交换" + rel, evt.gameElementId1, evt.gameElementId2);
        if (rel) {
            //判断两个位置移动后是否可以消除
            let gameElement1 = GameData.getGameElementById(evt.gameElementId1);
            let gameElement2 = GameData.getGameElementById(evt.gameElementId2);
            // 是否可消除
            var linerel: boolean = LinkLogic.isHaveLineByLocation(gameElement1.location, gameElement2.location);

            console.log("移动后是否能消除", linerel);
            //执行移动
            if (linerel) {
                //移动，然后消除
                console.log("消除动画");
                this.evm.changeLocationAndScale(evt.gameElementId1, evt.gameElementId2);
                //更新步数
                GameData.stepNum--;
                this.levm.updateStep();
            } else {
                this.evm.changeLocationAndBack(evt.gameElementId1, evt.gameElementId2);
            }
        } else {
            this.evm.setElementViewFocus(evt.gameElementId2);// 两个元素从空间位置上不可交换，设置新焦点
        }
    }
    /*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/


    /*-----------------------------元素置换动画播放结束，数据操作，并播放删除动画--------------------------------------*/
    //即将删除的元素移动结束
    //开始搜索删除数据，并且播放删除动画
    //更新地图数据
    //更新其他数据
    private allElementMoveAniOver() {
        console.log("需要消除 " + LinkLogic.lines);
        for (var i: number = 0; i < LinkLogic.lines.length; i++) {
            for (var j: number = 0; j < LinkLogic.lines[i].length; j++) {
                let id = LinkLogic.lines[i][j]; // GameElement.id
                var etype: string = GameData.elements[id].type;
                var rel: boolean = this.levm.haveReqType(etype);
                //有相同关卡类型,运动到指定位置
                if (rel) {
                    var p: egret.Point = this.levm.getPointByType(etype);
                    GameData.levelreq.changeReqNum(etype, 1);
                    this.levm.update();
                    this.evm.playReqRemoveAni(id, p.x, p.y);
                } else {
                    this.evm.playRemoveAni(id);
                }
            }
        }
    }
    /*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/





    /*---------------------------所有元素都删除完毕后，创建新元素，并刷新视图---------------------------------*/
    private refreshMap() {
        console.log("刷新地图数据！！！！！！！！");
        this.mapc.updateMapLocation();
        this.evm.updateMapData();
    }
    /*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/


    /*-----------------------------删除动画完成后，检测地图中是否存在剩余可消除元素--------------------------------------*/
    private checkOtherElementLink() {
        // 地图中还有可消除的元素
        if (LinkLogic.isHaveLine()) {
            console.log('地图中还有可消除元素');
            this.allElementMoveAniOver();
        } else {
            console.log("检测是否存在移动一步可消除的项目");
            if (!LinkLogic.isNextHaveLine()) {
                var rel: boolean = false;
                // 没有可消除的元素了,检查是否存在移动一步可消除的项目
                var next: boolean = true;
                while (next) {
                    console.log("执行乱序");
                    LinkLogic.changeOrder();// 乱序
                    // 没有可消除元素，但是移动一步有可消除元素(即不会让移动无元素可消除)
                    if (!LinkLogic.isHaveLine() && LinkLogic.isNextHaveLine()) {
                        next = false;
                        rel = true;
                    }
                }
                if (rel) {
                    this.evm.updateOrder();
                }
            }
        }
        console.log("所有动画逻辑结束");
        // 检测步数和关卡数
        this.isGameOver();
    }
    /*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/



    /*-----------------------------检测当前游戏是否GameOver------------------------------*/
    private gameoverpanel: GameOverPanel;
    private isGameOver() {
        console.log("道具是否清空", GameData.levelreq.isClear());
        if (!this.gameoverpanel) {
            //步数为0，GameOver
            if (GameData.stepNum == 0) {
                this.gameoverpanel = new GameOverPanel();
                this._gameStage.addChild(this.gameoverpanel);
                if (GameData.levelreq.isClear()) {
                    this.gameoverpanel.show(true);
                }
                else {
                    this.gameoverpanel.show(false);
                }
            } else {
                // 所有关卡数量为0，GameOver
                if (GameData.levelreq.isClear()) {
                    this.gameoverpanel = new GameOverPanel();
                    this._gameStage.addChild(this.gameoverpanel);
                    this.gameoverpanel.show(true);
                }
            }
        }
    }
    /*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/



    /*-----------------------------携带道具被点击--------------------------------------*/
    private usePropClick(evt: ElementViewManageEvent) {
        PropLogic.useProp(PropViewManage.proptype, evt.propToElementLocation);//操作数据
        this.pvm.useProp();
        this.allElementMoveAniOver();  //播放删除动画
    }
    /*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/





    /*
        private static _thiss:GameLogic;
        public static ss()
        {
            LinkLogic.changeOrder();//乱序
            GameLogic._thiss.evm.updateOrder();
        }
    */
}