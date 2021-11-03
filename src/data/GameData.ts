class GameData {
    public static emptyElementNum: number = 0;   //空白地图块数量
    public static mapData: number[][];   //游戏地图, 存储 GameElement.id -1表示块地图不能使用，－2表示，此地图没有元素
    public static stepNum: number = 0;   //玩家剩余步数
    public static levelStepNum: number = 0; //当前关卡步数
    public static elementTyps: number[];  //当前关卡出现的元素类型
    public static levelreq: LevelRequire;//当前关卡过关条件
    public static elements: GameElement[]; //游戏中出现得元素数据池，最多为64个，因为8*8
    public static unUsedElementsId: number[]; //游戏中未使用得元素，仅记录元素ID
    public static levelBackgrouindImageName: string = "";   //当前关卡背景图资源名

    public static MaxRow: number = 8;     //最大的行
    public static MaxColumn: number = 8;   //最大的列
    // public static TotalElement: number = 0;
    public static currentElementNum: number = 0; //当前关卡游戏中地图可用元素数量

    //舞台宽高，此封装为了方便调用
    public static stageW: number = 0;
    public static stageH: number = 0;

    //初始化游戏数据，仅仅创建空对象
    public static initData() {
        GameData.mapData = new Array();
        for (var i: number = 0; i < GameData.MaxRow; i++) {
            var arr: Array<number> = new Array();
            GameData.mapData.push(arr);
            for (var t: number = 0; t < GameData.MaxColumn; t++) {
                GameData.mapData[i].push(-2); // 填充占位
            }
        }
        // console.log('init mapData:', GameData.mapData);

        GameData.elements = new Array();
        GameData.unUsedElementsId = new Array();

        for (let index: number = 0; index < GameData.TotalElementCount; index++) {
            GameData.elements.push(new GameElement(index));
            GameData.unUsedElementsId.push(index);
        }

        GameData.stageW = egret.MainContext.instance.stage.stageWidth;
        GameData.stageH = egret.MainContext.instance.stage.stageHeight;
        // console.log('init elements:', GameData.elements);
        // console.log('init unUsedElementsId:', GameData.unUsedElementsId);

        GameData.levelreq = new LevelRequire();
    }

    public static getGameElementById(id: number): GameElement {
        return GameData.elements[id];
    }

    // 总元素个数
    public static get TotalElementCount(): number {
        return GameData.MaxRow * GameData.MaxColumn;
    }

    // 当前位置 当前列是否有元素
    public static hasGameElementIdAt(row: number, column: number): boolean {
        return GameData.mapData[row][column] != -1;
    }

    public static isElementEnableByLocation(location: number): boolean {
        const [row, column] = this.getRowAndColumnByLocation(location);
        return GameData.mapData[row][column] != -1;
    }

    public static getMapDataIdByLocation(location: number): number {
        const [row, column] = this.getRowAndColumnByLocation(location);
        return GameData.mapData[row][column];
    }

    public static getRowAndColumnByLocation(location: number): number[] {
        return [Math.floor(location / GameData.MaxColumn), location % GameData.MaxRow];
    }

    public static getRowByGameElementId(id: number): number {
        return Math.floor(GameData.elements[id].location / GameData.MaxColumn);
    }

    public static getColumnByGameElementId(id: number): number {
        return GameData.elements[id].location % GameData.MaxRow;
    }

    public static getLocationByRowAndColumn(row: number, column: number): number {
        return row * GameData.MaxRow + column;
    }

    // 获取格子宽度
    public static get gridWidth(): number {
        return (GameData.stageW - 40) / GameData.MaxColumn;
    }

    // 获取格子高度
    public static get gridHeight(): number {
        return (GameData.stageH - 40) / GameData.MaxRow;
    }

    // 消除元素 x轴开始坐标
    public static get startX(): number {
        return 20;
    }

    // 消除元素 y轴开始坐标
    public static get startY(): number {
        return (GameData.stageH - (GameData.stageW - 30) / 6 - 60) - GameData.gridWidth * GameData.MaxColumn;
    }

    public static printMapData() {
        console.log('------id分布------');

        // 输出日志 便于观察
        for (let row: number = 0; row < GameData.MaxRow; row++) {
            let str = ``;
            for (let col: number = 0; col < GameData.MaxColumn; col++) {
                let id = GameData.mapData[row][col]
                str += (id >= 10 ? ' ' : id < 0 ? ' ' : ' 0') + id;
            }
            console.log(str);
        }
    }
}