class MapControl {
    public constructor() { }

    //创建全地图元素
    public createElementAllMap() {
        this.createAllMap();
    }

    //创建全部地图元素
    //游戏开始时调用
    private createAllMap() {
        var type: string = "";
        var havelink: boolean = true;
        var id: number = 0;
        var ztype: string = ""; // 纵向 前两个元素相同则标记类型
        var htype: string = ""; // 横向 前两个元素相同则标记类型
        for (let row: number = 0; row < GameData.MaxRow; row++) {
            for (let col: number = 0; col < GameData.MaxColumn; col++) {
                if (GameData.hasGameElementIdAt(row, col)) {
                    while (havelink) {
                        type = this.getRandomElementType();
                        if (row > 1 && GameData.hasGameElementIdAt(row - 1, col) && GameData.hasGameElementIdAt(row - 2, col)) {
                            if (GameData.elements[GameData.mapData[row - 1][col]].type == GameData.elements[GameData.mapData[row - 2][col]].type) {
                                ztype = GameData.elements[GameData.mapData[row - 1][col]].type;
                            }
                        }
                        if (col > 1 && GameData.mapData[row][col - 1] != -1 && GameData.mapData[row][col - 2] != -1) {
                            if (GameData.elements[GameData.mapData[row][col - 1]].type == GameData.elements[GameData.mapData[row][col - 2]].type) {
                                htype = GameData.elements[GameData.mapData[row][col - 1]].type;
                            }
                        }
                        // 检测随机的类型是否和横向&纵向的前两个元素类型相同，
                        // 如果相同 表示这三个元素在一块是可以消除的，需要再次随机
                        if (type != ztype && type != htype) {
                            havelink = false;
                        }
                    }

                    // 从没有用到的id数组中删除第一个元素，并返回该元素的值
                    id = GameData.unUsedElementsId.shift();
                    GameData.mapData[row][col] = id;
                    GameData.elements[id].setType(type);
                    GameData.elements[id].setLocation(GameData.getLocationByRowAndColumn(row, col));
                    havelink = true;
                    ztype = "";
                    htype = "";
                }
            }
        }

        GameData.printMapData();

        // console.log('createAllMap mapData:', GameData.mapData);
        // console.log('createAllMap elements:', GameData.elements);
        // console.log('createAllMap unUsedElementsId:', GameData.unUsedElementsId);
    }

    //随机创建一个类型元素
    private getRandomElementType(): string {
        return GameData.elementTyps[Math.floor(Math.random() * GameData.elementTyps.length)].toString();
    }

    //针对某一个数据元素更新它得类型
    public changeGameElementTypeById(id: number) {
        GameData.elements[id].setType(this.getRandomElementType());
    }

    //根据当前删除得地图元素，刷新所有元素得位置
    public updateMapLocation() {
        // 去重删除的元素id
        let uniqueRemoveGameElementId: Set<number> = new Set();
        // 存储列编号得数据，记录共有几列需要移动位置
        let uniqueColumnOfRemoveGameElement: Set<number> = new Set();
        // 找出 uniqueRemoveGameElementId 最大的 row, 避免 row下面的元素移动位置(没必要移动)
        let uniqueRemoveGameElementIdMaxRow: number = 0;
        // 被移除的元素 二维数组
        for (let i: number = 0; i < LinkLogic.lines.length; i++) {
            for (let j: number = 0; j < LinkLogic.lines[i].length; j++) {
                let gameElementId: number = LinkLogic.lines[i][j];
                if (!uniqueRemoveGameElementId.has(gameElementId)) {
                    uniqueRemoveGameElementId.add(gameElementId);
                    console.log(`${gameElementId} => uniqueRemoveGameElementId`);
                    let [row] = GameData.getRowAndColumnByLocation(GameData.elements[gameElementId].location);
                    if (row > uniqueRemoveGameElementIdMaxRow) {
                        uniqueRemoveGameElementIdMaxRow = row;
                    }
                    // 重新分配元素类型
                    this.changeGameElementTypeById(gameElementId);
                    // 获取当前元素所在的列
                    let column = GameData.getColumnByGameElementId(gameElementId);
                    if (!uniqueColumnOfRemoveGameElement.has(column)) {
                        uniqueColumnOfRemoveGameElement.add(column);
                        console.log(`${column} => uniqueColumnOfRemoveGameElement`);
                    }
                }
            }
        }

        console.log(`${Array.from(uniqueRemoveGameElementId).toString()} => uniqueRemoveGameElementId`);
        console.log(`${Array.from(uniqueColumnOfRemoveGameElement).toString()} => uniqueColumnOfRemoveGameElement`);
        console.log('uniqueRemoveGameElementIdMaxRow: ', uniqueRemoveGameElementIdMaxRow);

        // 遍历有删除元素的列
        // 口 口 ❎ ❎ ❎ 口 口 口
        // 或者
        // 口
        // 口
        // 口
        // 口
        // ❎
        // ❎
        // ❎
        // 口
        // 从左到右 遍历有删除元素的列
        Array.from(uniqueColumnOfRemoveGameElement)
            .sort((a, b) => a - b)
            .forEach((column) => {
                console.log(`----开始遍历第 ${column} 列----`);
                // 当前列要删除的元素 纵向消除的时候 length>=3  横向消除的时候length=1
                var gameElementIdArrOfRemoved: number[] = new Array();
                // 当前列要删除的元素 上面的元素, 它们要逐个的向下移动位置
                var gameElementIdArrAtUp: number[] = new Array();

                // 反向遍历行 因为元素位置变化从最下面的开始
                for (let row = uniqueRemoveGameElementIdMaxRow; row >= 0; row--) {
                    // 当前行元素id(有可能没有元素)
                    let gameElementId = GameData.mapData[row][column];

                    // 当前行有要删除的元素
                    if (uniqueRemoveGameElementId.has(gameElementId)) {
                        gameElementIdArrOfRemoved.push(gameElementId);
                        // console.log('remove gameElementId:', gameElementId, ' row:', row, ' column:', column, ' location:', GameData.elements[gameElementId].location);
                        console.log(`row:${row} column:${column} ${gameElementId} => gameElementIdArrOfRemoved`);
                    } else {
                        // 当前行没有要删除的元素 但是当前列有删除的元素 说明当前行的元素需要移动位置
                        if (GameData.hasGameElementIdAt(row, column)) {
                            gameElementIdArrAtUp.push(gameElementId);
                            // console.log('up gameElementId:', gameElementId, ' row:', row, ' column:', column, ' location:', GameData.elements[gameElementId].location);
                            console.log(`row:${row} column:${column} ${gameElementId} => gameElementIdArrAtUp`);
                        }
                    }
                }

                console.log('gameElementIdArrOfRemoved ', gameElementIdArrOfRemoved);
                console.log('gameElementIdArrOfUp ', gameElementIdArrAtUp);

                // 合并两个数组 必须是 gameElementIdArrOfRemoved 放在后面 因为是从上往下的
                // 删除的元素 从上面落下 作为新的元素
                let gameElementIdArrOfSorted = gameElementIdArrAtUp.concat(gameElementIdArrOfRemoved);

                console.log('gameElementIdArrOfSorted: ', gameElementIdArrOfSorted);

                // 将当前列元素重新放入map中，并改变元素Location
                // 从下往上遍历行 将 gameElementIdArrOfSorted 重新分配给每一行的元素
                for (let row = uniqueRemoveGameElementIdMaxRow; row >= 0; row--) {
                    if (GameData.hasGameElementIdAt(row, column)) {
                        // 从重新排好的元素中取出第一个 重新分配id location
                        let id = gameElementIdArrOfSorted.shift();
                        console.log(`取出 ${id} <= gameElementIdArrOfSorted 分配给 row:${row} column:${column}`);
                        GameData.mapData[row][column] = id;
                        GameData.elements[id].setLocation(GameData.getLocationByRowAndColumn(row, column));
                    }
                }
                // 后续需要播放移动位置动画 ElementViewManage.updateMapData()
            });

        GameData.printMapData();
    }
}