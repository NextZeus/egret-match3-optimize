
class BaseElement {
	//游戏元素基类
	public type: string = ''; //元素类型
	public constructor() {}

	public setType(type: string) {
		this.type = type;
	}
}
