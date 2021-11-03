class LinkLogic {
    public static lines: number[][]; //检索后的数据池，即将被消除的元素ID

    /**
     * 检查是否存在可消除项目
     * 横向 自左向右检索
     * 纵向 自顶向下检索
     */
    public static isHaveLine(): boolean {
        LinkLogic.lines = new Array();
        // 上一个检索的元素类型
        var previousType: string = "";
        // 相同元素类型数量
        var sameTypeCount: number = 0;

        // 横向 自左向右检索
        for (let i: number = 0; i < GameData.MaxRow; i++) {
            for (let j: number = 0; j < GameData.MaxColumn; j++) {
                // 现在i是行 j是列 按[0][0~7],[1][0~7],,,[7][0~7] 逐行检索
                if (!GameData.hasGameElementIdAt(i, j)) {
                    // 当前位置元素为空 检测之前的检索结果 是否有可消除的元素
                    this.checkHorizontalDirectionLineOver(sameTypeCount, i, j);
                    previousType = "";
                    sameTypeCount = 0;

                    // 继续检索
                    continue;
                }

                const gameElementId = GameData.mapData[i][j]; // 当前位置元素id
                const gameElement = GameData.getGameElementById(gameElementId);

                if (previousType === gameElement.type) {
                    // 元素类型和上一个检索的元素类型相同 计数加1
                    sameTypeCount++;
                } else {
                    // 遇到不同的元素类型 停止检索 检测之前的检索结果 是否有可消除的元素
                    this.checkHorizontalDirectionLineOver(sameTypeCount, i, j);
                    previousType = gameElement.type;
                    sameTypeCount = 1;
                }
            }

            // 一行检索完 可能会出现后面 >=3列 有类型相同元素，需要再次检查检索结果，是否有可消除的元素
            this.checkHorizontalDirectionLineOver(sameTypeCount, i, GameData.MaxColumn);
            // 一行结束后，重置计数数据 继续下一行检索
            previousType = "";
            sameTypeCount = 0;
        }


        // 纵向 自顶向下检索
        for (let i = 0; i < GameData.MaxRow; i++) {
            for (let j = 0; j < GameData.MaxColumn; j++) {
                // 现在j是行 i是列 按[0~7][0],[0~7][1],,,[0~7][7]逐列检索
                if (!GameData.hasGameElementIdAt(j, i)) {
                    // 当前位置元素为空 检测之前的检索结果 是否有可消除的元素
                    this.checkVerticalDirectionLineOver(sameTypeCount, j, i);
                    previousType = "";
                    sameTypeCount = 0;
                    continue;
                }

                const gameElementId = GameData.mapData[j][i];
                const gameElement = GameData.getGameElementById(gameElementId);
                if (previousType === gameElement.type) {
                    // 元素类型和上一个检索的元素类型相同 计数加1
                    sameTypeCount++;
                    continue;
                } else {
                    // 遇到不同的元素类型 停止检索 检测之前的检索结果 是否有可消除的元素
                    this.checkVerticalDirectionLineOver(sameTypeCount, j, i);
                    previousType = gameElement.type;
                    sameTypeCount = 1;
                }
            }

            // 一列检索完 可能会出现后面 >=3行 有类型相同元素，需要再次检查检索结果，是否有可消除的元素
            this.checkVerticalDirectionLineOver(sameTypeCount, GameData.MaxColumn, i);
            //一行结束后，清空数据
            previousType = "";
            sameTypeCount = 0;
        }

        console.log("检索可消除元素完毕 LinkLogic.lines=>", LinkLogic.lines.toString());
        GameData.printMapData();
        // 返回是否有可消除元素
        return LinkLogic.lines.length != 0;
    }

    // 水平方向检测
    private static checkHorizontalDirectionLineOver(sameTypeCount: number, row: number, column: number) {
        //上一组检测结束了，把数据存储进去
        if (sameTypeCount >= 3) {
            let arr: number[] = [];
            // 按从左到右顺序来 (强迫症)
            for (let q = sameTypeCount - 1; q >= 0; q--) {
                console.log(`横压入数组, typeNum:${sameTypeCount} row:${row}, column:${column}, q:${q}, _column:${(column - q - 1)}, id:${GameData.mapData[row][column - q - 1]}`);
                arr.push(GameData.mapData[row][column - q - 1]);
            }
            console.log('水平方向 ', arr.join(','),' => LinkLogic.lines');
            
            LinkLogic.lines.push(arr);
        }
    }

    // 垂直方向检测
    private static checkVerticalDirectionLineOver(sameTypeCount: number, row: number, column: number) {
        //上一组检测结束了，把数据存储进去
        if (sameTypeCount >= 3) {
            let arr: number[] = [];
            // 按从上往下的顺序来(强迫症)
            for (let q = sameTypeCount - 1; q >= 0; q--) {
                console.log(`纵压入数组, typeNum:${sameTypeCount} row:${row}, column:${column}, _row:${(row - q - 1)} q:${q}  id:${GameData.mapData[row - q - 1][column]}`);
                arr.push(GameData.mapData[row - q - 1][column]);
            }
            console.log('垂直方向 ', arr.join(','),' => LinkLogic.lines');
            LinkLogic.lines.push(arr);
        }
    }

    //根据移动后的某一点，检测消除项目
    //参数未互换得两个点得位置,0-80编号
    //在地图中，将ID互换，然后检查舞台中有没有能消除得格子，如果有，返回true，如果没有，把数据切换回来
    /**
     * @param p1Location - GameElement.location
     * @param p2Location - GameElement.location
     * @returns 
     */
    public static isHaveLineByLocation(p1Location: number, p2Location: number): boolean {
        const [p1Row, p1Column] = GameData.getRowAndColumnByLocation(p1Location);
        const [p2Row, p2Column] = GameData.getRowAndColumnByLocation(p2Location);

        var p1id: number = GameData.mapData[p1Row][p1Column];
        var p2id: number = GameData.mapData[p2Row][p2Column];

        // 修改内存中的id
        GameData.mapData[p1Row][p1Column] = p2id;
        GameData.mapData[p2Row][p2Column] = p1id;

        // 是否有可消除元素
        var haveLine: boolean = LinkLogic.isHaveLine();
        if (haveLine) {
            GameData.elements[p1id].setLocation(p2Location);
            GameData.elements[p2id].setLocation(p1Location);
        } else {
            // 不可消除 恢复内存中的id
            GameData.mapData[p1Row][p1Column] = p1id;
            GameData.mapData[p2Row][p2Column] = p2id;
        }

        return haveLine;
    }

    //打乱所有顺序,在没有能连接的情况下使用
    public static changeOrder(): void {
        var arr: number[] = new Array();
        for (var i: number = 0; i < GameData.MaxRow; i++) {
            for (var t: number = 0; t < GameData.MaxColumn; t++) {
                if (GameData.mapData[i][t] != -1) {
                    arr.push(GameData.mapData[i][t]);
                }
            }
        }

        //console.log(arr.length);
        var index: number = 0;
        for (i = 0; i < GameData.MaxRow; i++) {
            for (t = 0; t < GameData.MaxColumn; t++) {
                if (GameData.mapData[i][t] != -1) {
                    index = Math.floor(Math.random() * arr.length);
                    GameData.mapData[i][t] = arr[index];
                    // GameData.elements[arr[index]].location = i * GameData.MaxColumn + t;
                    GameData.elements[arr[index]].setLocation(i * GameData.MaxColumn + t);
                    arr.splice(index, 1);
                    //console.log("数组长度",arr.length);
                }
            }
        }
    }

    /**
     * 检查是否存在移动一步后能够消除的项目
     */
    public static isNextHaveLine(): boolean {
        //逐个分析，搜索横向与纵向两种情况，同时每个方向有两种拼接方式
        //-------方式1------- 绿色方块周边的6个其中之一颜色相同 则可消除
        //   口    口
        // 口  ❎ ❎  口
        //   口    口
        //-------方式2-------- 绿色方块周边的2个其中之一颜色相同 则可消除
        //   口
        // ❎  ❎
        //   口
        for (var i: number = 0; i < GameData.MaxRow; i++) {
            for (var t: number = 0; t < GameData.MaxColumn; t++) {
                // 元素不等于 -1
                if (GameData.hasGameElementIdAt(i, t)) {
                    // 横向 方式1 排除极限值 t = (GameData.MaxColumn - 1)
                    // 当前元素和右边元素类型相同
                    let currGameElement = GameData.elements[GameData.mapData[i][t]];
                    if (t < (GameData.MaxColumn - 1) && GameData.mapData[i][t + 1] != -1 && currGameElement.type == GameData.elements[GameData.mapData[i][t + 1]].type) {
                        // 判断左边三个点 
                        // t>0表示左边有空  
                        // GameData.hasGameElementIdAt(i - 1, t - 1)表示左边有元素，才可以和左边三个点交换位置
                        if (t > 0 && GameData.hasGameElementIdAt(i, t - 1)) {
                            // 左上角 i>0上方有空
                            if (i > 0 && GameData.mapData[i - 1][t - 1] && GameData.hasGameElementIdAt(i - 1, t - 1) &&
                                GameData.elements[GameData.mapData[i - 1][t - 1]].type == currGameElement.type) {
                                console.log("-1能消除项目1！！！", i, t);
                                return true;
                            }
                            // 左下角 i < (GameData.MaxRow - 1)下方有空
                            if (i < (GameData.MaxRow - 1) && GameData.mapData[i + 1][t - 1] && GameData.hasGameElementIdAt(i + 1, t - 1) && GameData.elements[GameData.mapData[i + 1][t - 1]].type == currGameElement.type) {
                                console.log("-1能消除项目2！！！", i, t);
                                return true;
                            }
                            // 左中 t > 1左方有空
                            if (t > 1 && GameData.mapData[i][t - 2] && GameData.hasGameElementIdAt(i, t - 2) && GameData.elements[GameData.mapData[i][t - 2]].type == currGameElement.type) {
                                console.log("-1能消除项目3！！！", i, t);
                                return true;
                            }
                        }
                        // 判断右边三个点
                        // t < (GameData.MaxColumn - 2)表示右边有空 
                        // GameData.hasGameElementIdAt(i, t + 2)表示右边有元素，才可以和右边三个点交换位置
                        if (t < (GameData.MaxColumn - 2) && GameData.hasGameElementIdAt(i, t + 2)) {
                            // 右上角
                            if (i > 0 && GameData.mapData[i - 1][t + 2] && GameData.hasGameElementIdAt(i - 1, t + 2) && GameData.elements[GameData.mapData[i - 1][t + 2]].type == currGameElement.type) {
                                console.log("-1能消除项目4！！！", i, t);
                                return true;
                            }
                            // 右下角
                            if (i < (GameData.MaxRow - 1) && GameData.mapData[i + 1][t + 2] && GameData.hasGameElementIdAt(i + 1, t + 2) && GameData.elements[GameData.mapData[i + 1][t + 2]].type == currGameElement.type) {
                                console.log("-1能消除项目5！！！", i, t);
                                return true;
                            }
                            // 右中
                            if (t < (GameData.MaxColumn - 3) && GameData.mapData[i][t + 3] && GameData.hasGameElementIdAt(i, t + 3) && GameData.elements[GameData.mapData[i][t + 3]].type == currGameElement.type) {
                                console.log("-1能消除项目6！！！", i, t);
                                return true;
                            }
                        }
                    }
                    // 纵向 方式1
                    if (i < (GameData.MaxRow - 1) && GameData.mapData[i + 1][t] != -1 && currGameElement.type == GameData.elements[GameData.mapData[i + 1][t]].type) {
                        if (i > 0 && GameData.mapData[i - 1][t] != -1) {
                            if (i > 1 && GameData.mapData[i - 2][t] && GameData.mapData[i - 2][t] != -1 && GameData.elements[GameData.mapData[i - 2][t]].type == currGameElement.type) {
                                console.log("|1能消除项目1！！！", i, t);
                                return true;
                            }
                            if (i > 0 && t > 0 && GameData.mapData[i - 1][t - 1] && GameData.mapData[i - 1][t - 1] != -1 && GameData.elements[GameData.mapData[i - 1][t - 1]].type == currGameElement.type) {
                                console.log("|1能消除项目2！！！", i, t);
                                return true;
                            }
                            if (i > 0 && t < (GameData.MaxColumn - 1) && GameData.mapData[i - 1][t + 1] && GameData.mapData[i - 1][t + 1] != -1 && GameData.elements[GameData.mapData[i - 1][t + 1]].type == currGameElement.type) {
                                console.log("|1能消除项目3！！！", i, t);
                                return true;
                            }
                        }
                        if (i < (GameData.MaxRow - 2) && GameData.mapData[i + 2][t] != -1) {
                            if (i < (GameData.MaxRow - 3) && GameData.mapData[i + 3][t] && GameData.mapData[i + 3][t] != -1 && GameData.elements[GameData.mapData[i + 3][t]].type == currGameElement.type) {
                                console.log("|1能消除项目4！！！", i, t);
                                return true;
                            }
                            if (t < (GameData.MaxColumn - 2) && GameData.mapData[i + 2][t + 1] && GameData.mapData[i + 2][t + 1] != -1 && GameData.elements[GameData.mapData[i + 2][t + 1]].type == currGameElement.type) {
                                console.log("|1能消除项目5！！！", i, t);
                                return true;
                            }
                            if (t > 0 && GameData.mapData[i + 2][t - 1] && GameData.mapData[i + 2][t - 1] != -1 && GameData.elements[GameData.mapData[i + 2][t - 1]].type == currGameElement.type) {
                                console.log("|1能消除项目6！！！", i, t);
                                return true;
                            }
                        }
                    }
                    // 横向 方式2
                    if (t < (GameData.MaxColumn - 2) && GameData.hasGameElementIdAt(i, t + 2) && currGameElement.type == GameData.elements[GameData.mapData[i][t + 2]].type) {
                        if (GameData.hasGameElementIdAt(i, t + 1)) {
                            // 右上角
                            if (i > 0 && GameData.mapData[i - 1][t + 1] && GameData.hasGameElementIdAt(i - 1, t + 1) && GameData.elements[GameData.mapData[i - 1][t + 1]].type == currGameElement.type) {
                                console.log("-2能消除项目1！！！", i, t);
                                return true;
                            }
                            // 右下角
                            if (i < (GameData.MaxRow - 1) && GameData.mapData[i + 1][t + 1] && GameData.hasGameElementIdAt(i + 1, t + 1) && GameData.elements[GameData.mapData[i + 1][t + 1]].type == currGameElement.type) {
                                console.log("-2能消除项目2！！！", i, t);
                                return true;
                            }
                        }
                    }
                    // 纵向 方式2
                    if (i < (GameData.MaxRow - 2) && GameData.mapData[i + 2][t] != -1 && currGameElement.type == GameData.elements[GameData.mapData[i + 2][t]].type) {
                        if (GameData.mapData[i + 1][t] != -1) {
                            if (t < (GameData.MaxColumn - 1) && GameData.mapData[i + 1][t + 1] && GameData.mapData[i + 1][t + 1] != -1 && GameData.elements[GameData.mapData[i + 1][t + 1]].type == currGameElement.type) {
                                console.log("|2能消除项目1！！！", i, t);
                                return true;
                            }
                            if (i < (GameData.MaxRow - 1) && t > 0 && GameData.mapData[i + 1][t - 1] && GameData.mapData[i + 1][t - 1] != -1 && GameData.elements[GameData.mapData[i + 1][t - 1]].type == currGameElement.type) {
                                console.log("|2能消除项目2！！！", i, t);
                                return true;
                            }
                        }
                    }
                }
            }
        }
        return false;
    }

    /**
     * 判断两个点是否可以互相移动，关系是否为上下，左右
     */
    public static canMove(p1id: number, p2id: number): boolean {
        let ele1 = GameData.getGameElementById(p1id);
        let ele2 = GameData.getGameElementById(p2id);

        const [p1row, p1col] = GameData.getRowAndColumnByLocation(ele1.location);
        const [p2row, p2col] = GameData.getRowAndColumnByLocation(ele2.location);

        console.log(`canMove 判断两点互换位置 p1id:${p1id} p1row:${p1row}, p1col:${p1col} p2id:${p2id} p2row:${p2row}, p2col:${p2col}`);
        if ((p1row == p2row && Math.abs(p1col - p2col) == 1) ||
            (p1col == p2col && Math.abs(p1row - p2row) == 1)) {
            return true;
        }
        return false;
    }
}