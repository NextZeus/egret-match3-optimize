class MapDataParse {

    //根据外部加载的数据来创建地图数据
    //数组中存放着无法放置内容得区域，该区域数值均为-1
    public static createMapData(emptyElementIndexList: Array<number>): void {
        GameData.emptyElementNum = emptyElementIndexList.length;
        for (var i: number = 0; i < emptyElementIndexList.length; i++) {
            let index: number = emptyElementIndexList[i];
            let [row, column] = GameData.getRowAndColumnByLocation(index);
            GameData.mapData[row][column] = -1;
        }

        GameData.currentElementNum = GameData.TotalElementCount - emptyElementIndexList.length;
        // console.log('createMapData: ', GameData.mapData);
    }
}