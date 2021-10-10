interface LevelReqData {
	type: number; // 元素类型
	num: number; // 元素数量
}
// 关卡地图数据格式
interface MapData {
	map: number[]; // 不显示的块 id(0~63)
	step: number; // 当前关卡步数
	element: number[]; // 元素类型
	levelreq: LevelReqData[]; // 收集元素目标数量
	levelbgimg: string; // 背景图资源名称
}