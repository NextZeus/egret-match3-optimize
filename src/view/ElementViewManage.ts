class ElementViewManage extends egret.EventDispatcher {
    private _layer: egret.Sprite; //元素存在的容器
    public constructor(elementLayer: egret.Sprite) {
        super();
        this._layer = elementLayer;
        this.init();
    }


    /*-----------------------------初始化数据--------------------------------------*/
    /**
     * ElementView对象池 (0~63)
     * location 和 GameData.elements的location 按索引一一对应
     * 全局仅最多GameData.MaxRow*GameData.MaxColumn个，默认为64个
     */
    private elementViews: ElementView[];

    //初始化所有数据变量
    private init() {
        this.elementViews = new Array();
        for (let index: number = 0; index < GameData.TotalElementCount; index++) {
            let elementView: ElementView = new ElementView(this._layer);
            elementView.id = index;
            elementView.setLocation(GameData.elements[index].location);
            this.elementViews.push(elementView);
            // 每个元素绑定事件
            elementView.addEventListener(egret.TouchEvent.TOUCH_TAP, this.tapElement, this);
            elementView.addEventListener(ElementViewManageEvent.SINGLE_ELEMENT_VIEW_MOVE_ANIMATION_OVER, this.elementMoveAniOver, this);
            elementView.addEventListener(ElementViewManageEvent.SINGLE_ELEMENT_VIEW_DISAPPEARED, this.elementViewDisappear, this);
            elementView.addEventListener(ElementViewManageEvent.SINGLE_ELEMENT_VIEW_UPDATE_LOCATION_OVER, this.moveNewLocationOver, this);
        }
    }
    /*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/


    /*-----------------------------焦点相关控制--------------------------------------*/
    private _tapedId: number = -1;  // 当前被点击（即将获取焦点）的元素ID，如为-1则表示没有元素获取焦点或无点击对象
    // 是否有元素获取焦点
    private get elementViewFocused(): boolean {
        return this._tapedId != -1;
    }

    //元素被点击响应事件
    //判断当前元素焦点状态，是否需要改变，如果存在两个焦点，则派发TAP_TWO_ELEMENT,通知上层逻辑，对连个被点击元素进行数据计算
    private tapElement(evt: egret.TouchEvent) {
        if (!PropViewManage.propActive()) {
            //无道具激活
            if (evt.currentTarget instanceof ElementView) {
                var currElementView: ElementView = <ElementView>evt.currentTarget;
                if (!this.elementViewFocused) {
                    // 点击第一个元素 加focus特效
                    this.setElementViewFocus(currElementView.id);
                } else {
                    let currentElement = GameData.getGameElementById(currElementView.id);
                    let tapedElement = GameData.getGameElementById(this._tapedId);
                    if (tapedElement.id === currentElement.id) {
                        // 重复点击同一个元素 取消focus特效
                        this.cancelElementViewFocus(currElementView.id);
                    } else {
                        // 点击两个元素 派发事件
                        var event: ElementViewManageEvent = new ElementViewManageEvent(ElementViewManageEvent.TAP_TWO_ELEMENT);
                        event.gameElementId1 = this._tapedId;
                        event.gameElementId2 = currElementView.id;
                        this.dispatchEvent(event);
                    }
                }
            }
        } else {
            // 使用道具 有元素被选中 取消focus特效
            if (this.elementViewFocused) {
                this.cancelElementViewFocus(this._tapedId);
            }
            // 使用道具 消除元素事件
            var evts: ElementViewManageEvent = new ElementViewManageEvent(ElementViewManageEvent.USE_PROP_CLICK);
            evts.propToElementLocation = (<ElementView>evt.currentTarget).location;
            this.dispatchEvent(evts);
        }
    }

    // 改变焦点,将旧焦点取消，设置新对象焦点
    public setElementViewFocus(location: number) {
        if (this.elementViewFocused) {
            this.elementViews[this._tapedId].setFocus(false);
        }
        this.elementViews[location].setFocus(true);
        this._tapedId = location;
    }
    // 取消焦点
    public cancelElementViewFocus(location: number) {
        this.elementViews[location].setFocus(false);
        this._tapedId = -1;
    }
    /*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/


    /*-----------------------------播放交互动画，交换后再返回--------------------------------------*/
    // 可以交换，但是交换后没有发生位置移动
    // 移除焦点
    // 播放一个交换的动画，然后两个位置再换回来
    public changeLocationAndBack(id1: number, id2: number) {
        if (this.elementViews[id1].focus) {
            this.cancelElementViewFocus(id1);
            if (this._layer.getChildIndex(this.elementViews[id1]) < this._layer.getChildIndex(this.elementViews[id2])) {
                this._layer.swapChildren(this.elementViews[id1], this.elementViews[id2]);
            }
            this.elementViews[id1].moveAndBack(this.elementViews[id2].location, true);
            this.elementViews[id2].moveAndBack(this.elementViews[id1].location);
        } else {
            this.cancelElementViewFocus(id2);
            if (this._layer.getChildIndex(this.elementViews[id1]) > this._layer.getChildIndex(this.elementViews[id2])) {
                this._layer.swapChildren(this.elementViews[id1], this.elementViews[id2]);
            }
            this.elementViews[id1].moveAndBack(this.elementViews[id2].location);
            this.elementViews[id2].moveAndBack(this.elementViews[id1].location, true);
        }
    }
    /*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/





    /*-----------------------------播放删除动画--------------------------------------*/
    public changeLocationAndScale(id1: number, id2: number) {
        if (this.elementViews[id1].focus) {
            this.elementViews[id1].setFocus(false);
            if (this._layer.getChildIndex(this.elementViews[id1]) < this._layer.getChildIndex(this.elementViews[id2])) {
                this._layer.swapChildren(this.elementViews[id1], this.elementViews[id2]);
            }
            this.elementViews[id1].moveAndScale(this.elementViews[id2].location, true);
            this.elementViews[id2].moveAndScale(this.elementViews[id1].location);
        } else {
            this.elementViews[id2].setFocus(false);
            if (this._layer.getChildIndex(this.elementViews[id1]) > this._layer.getChildIndex(this.elementViews[id2])) {
                this._layer.swapChildren(this.elementViews[id1], this.elementViews[id2]);
            }
            this.elementViews[id1].moveAndScale(this.elementViews[id2].location);
            this.elementViews[id2].moveAndScale(this.elementViews[id1].location, true);
        }
        this._tapedId = -1;
    }
    /*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/





    /*-----------------------------显示所有元素，并播放出场动画--------------------------------------*/
    public showAllElement() {
        this._layer.removeChildren();
        var ele: ElementView;
        for (var i: number = 0; i < GameData.MaxRow; i++) {
            for (var t: number = 0; t < GameData.MaxColumn; t++) {
                if (GameData.hasGameElementIdAt(i, t)) {
                    ele = this.elementViews[GameData.mapData[i][t]];
                    ele.setTexture("e" + GameData.elements[GameData.mapData[i][t]].type + "_png");
                    ele.x = ele.targetX();
                    ele.y = GameData.startY - ele.width;
                    ele.show((50 * GameData.MaxColumn * GameData.MaxRow - 50 * GameData.emptyElementNum) - (i * GameData.MaxRow + t) * 50);
                }
            }
        }
    }
    /*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/





    /*-----------------------------动画播放控制--------------------------------------*/
    private movedElementCount: number = 0;  // 已经移动的元素数量
    // 移动位置动画播放结束
    private elementMoveAniOver() {
        this.movedElementCount++;
        if (this.movedElementCount == 2) {
            this.movedElementCount = 0;
            // 转到 GameLogic.allElementMoveAniOver
            this.dispatchEvent(new ElementViewManageEvent(ElementViewManageEvent.ALL_ELEMENT_MOVE_ANIMATION_OVER));
        }
    }

    // 移动元素个数
    private moveEleCount: number = 0;
    //播放曲线动画，此类型动画用于可消除过关条件得情况
    public playReqRemoveAni(id: number, tx: number, ty: number) {
        this.moveEleCount++;
        var el: ElementView = this.elementViews[id];
        if (el.parent) {
            this._layer.setChildIndex(el, this._layer.numChildren);
        }
        // console.log(`准备移动到过关条件位置 id:${id} tx:${tx} ty:${ty}`);

        el.playCurveMove(tx, ty);
    }

    //播放放大动画，播放后直接删除,用于可删除元素，但元素类型不是关卡过关条件
    public playRemoveAni(id: number) {
        this.moveEleCount++;
        var el: ElementView = this.elementViews[id];
        if (el.parent) {
            this._layer.setChildIndex(el, this._layer.numChildren);
        }
        // console.log(`准备直接消失 id:${id}`);

        // 从视图上删除元素
        el.playRemoveAni();
    }

    // 删除动画完成，现在更新地图元素
    private elementViewDisappear() {
        this.moveEleCount--;
        if (this.moveEleCount == 0) {
            // 转到 GameLogic.refreshMap 处理
            let evt: ElementViewManageEvent = new ElementViewManageEvent(ElementViewManageEvent.ALL_ELEMENT_VIEW_DISAPPEARED)
            this.dispatchEvent(evt);
        }
    }
    /*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/


    /*-----------------------------更新整个地图中元素位置--------------------------------------*/
    public updateMapData() {
        console.log("重新布局");
        this.moveLocElementNum = 0;
        for (var i: number = 0; i < this.elementViews.length; i++) {
            let ev = this.elementViews[i];
            // let currentLocation = ev.location;
            let newLocation = GameData.elements[i].location;
            // 移除的元素 会重新随机元素类型
            ev.setTexture("e" + GameData.elements[i].type + "_png");
            // console.log(`重新设置location elementViewId: ${ev.id} currentLocatin:${currentLocation} newLocation:${newLocation}`);
            // 移动位置 从上往下移动
            ev.setLocation(newLocation);
            ev.moveNewLocation();
        }
    }
    private moveLocElementNum: number = 0;
    private moveNewLocationOver() {
        this.moveLocElementNum++;
        if (this.moveLocElementNum == (GameData.MaxColumn * GameData.MaxRow)) {
            console.log('all elementView move over');
            // 转到 GameLogic.checkOtherElementLink
            var evt: ElementViewManageEvent = new ElementViewManageEvent(ElementViewManageEvent.ALL_ELEMENT_VIEW_UPDATE_LOCATION_OVER);
            this.dispatchEvent(evt);
        }
    }
    /*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/



    /*-----------------------------乱序操作，移动全部元素位置--------------------------------*/
    /**
     * 乱序移动指令触发
     */
    public updateOrder() {
        var len: number = this.elementViews.length;
        egret.Tween.removeAllTweens();
        for (var i: number = 0; i < len; i++) {
            this.elementViews[i].setLocation(GameData.elements[i].location);
            this.elementViews[i].move();
        }
    }
    /*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/
}