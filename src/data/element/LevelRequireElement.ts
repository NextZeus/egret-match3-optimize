//////////////////////////////////////////////////////////////////////////////////////
// 数据：地图数据，基础数据，关卡数据，道具数据
// 视图：元素试图，背景视图，关卡视图，道具视图，游戏结束面板视图
// 逻辑：主逻辑控制器，数据解析器，地图数据控制器，链接算法控制器，视图控制器
//
// 地图数据描述：一位数组 二维数组
//	elements[30]
//		index = row*8+column
//		row = Math.floot(index/8)
//		column = index%8
//	mapData[3][6](行列)
// 地图配置描述：
//		下标标记不显示的一维数组 {"map":[0,1,8,9,6,7,14,15]}
//		下标标记不显示的区域二维数组 {"map":[[0,0],[0,1],[0,6],[0,7],[1,0],[1,1],[1,6],[1,7]]}
// 元素数据设计：(对象池技术)
//		Element :Type（道具，卡片）, ID, Location（卡片数据）（64 Elemnt）
//			elements[index]
//			index=element.ID
//
//
//过关
//玩家步数
//当前关卡背景
//最大行数
//最大列数
//空白地图数量
// 
//
class LevelRequireElement extends BaseElement{
	// 需要消除的元素数量
	public num:number = 0;
}