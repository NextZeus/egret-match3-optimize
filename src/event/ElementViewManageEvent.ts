class ElementViewManageEvent extends egret.Event {
    // 点击两个不同的element
    public static TAP_TWO_ELEMENT: string = "tap_two_element";
    // 单个elementView 移动位置结束
    public static SINGLE_ELEMENT_VIEW_MOVE_ANIMATION_OVER: string = "single_element_view_move_animation_over";
    // 两个互换位置的元素 互换结束
    public static ALL_ELEMENT_MOVE_ANIMATION_OVER: string = "all_move_animation_over";
    public static SINGLE_ELEMENT_VIEW_DISAPPEARED: string = "single_element_view_disappear"; // 单个 elementView 消失动画结束
    public static ALL_ELEMENT_VIEW_DISAPPEARED: string = "all_element_view_disappear"; // 所有消除元素的 elementView 消失(直接消失 或者移动到收集目标位置)
    public static SINGLE_ELEMENT_VIEW_UPDATE_LOCATION_OVER: string = "single_element_view_update_location_over"; // 单个elementView移动到新的位置动画结束(从上往下掉落)
    public static ALL_ELEMENT_VIEW_UPDATE_LOCATION_OVER: string = "all_element_view_update_location_over"; // 所有 elementView 移动到新位置结束(从上往下掉落)
    public static USE_PROP_CLICK: string = "use_prop_click";

    public propToElementLocation: number = 0; //携带道具点击的元素位置
    public gameElementId1: number = 0;//第一个点击的元素id
    public gameElementId2: number = 0;//第二个点击的元素id
    public constructor(type: string, bubbles: boolean = false, cancelable: boolean = false) {
        super(type, bubbles, cancelable);
    }
}
































