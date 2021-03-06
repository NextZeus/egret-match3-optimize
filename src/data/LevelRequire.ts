class LevelRequire
{
    /*
        过关条件，内置一个数组，用来记录当前关卡需要消除多少种
        类型的元素。
        每种元素要消除的数量为多少
     */
    public reqElements:Array<LevelRequireElement>;

    public constructor()
    {
        this.reqElements = new Array();
    }

    //过卡过关条件数量
    public getLevelReqNum():number
    {
        return this.reqElements.length;
    }

    //添加一个关卡元素，类型与数量
    public addElement(type:string,num:number)
    {
        var element:LevelRequireElement = new LevelRequireElement();
        element.num = num;
        element.setType(type);
        this.reqElements.push( element );
    }

    //启动关卡条件修改
    public openChange()
    {
        this.reqElements = [];
    }

    //减少关卡中得元素数量
    public changeReqNum(type:string,num:number)
    {
        var l:number = this.getLevelReqNum();
        for(var i:number=0;i<l;i++)
        {
            if(this.reqElements[i].type == type)
            {
                this.reqElements[i].num-=num;
                // console.log("最新数量",this.reqElements[i].num);
                return;
            }
        }
    }

    //检测所有关卡元素是否都被删除
    public isClear():boolean
    {
        var l:number = this.getLevelReqNum();
        for(var i:number=0;i<l;i++)
        {
            if(this.reqElements[i].num>0)
            {
                return false;
            }
        }
        return true;
    }

}