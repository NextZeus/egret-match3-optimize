class GameBackGround extends egret.Sprite {
    public constructor() {
        super();
    }

    public changeBackground(): void {
        this.cacheAsBitmap = false;
        this.removeChildren();
        this.createBackGroundImage();
        this.createMapBg();
        this.createLevelReqBg();
        this.createStepBg();
        this.cacheAsBitmap = true;
    }

    private bgImage: egret.Bitmap;
    private girdBg: egret.Bitmap[];//网格背景


    //创建地图背景图片
    private createBackGroundImage() {
        if (!this.bgImage) {
            this.bgImage = new egret.Bitmap();
        }
        //场景背景图
        this.bgImage.texture = RES.getRes(GameData.levelBackgrouindImageName);
        this.bgImage.width = GameData.stageW;
        this.bgImage.height = GameData.stageH;
        this.addChild(this.bgImage);
        //道具背景图
        var propbg: egret.Bitmap = new egret.Bitmap();
        propbg.texture = RES.getRes("propbg_png");
        propbg.width = GameData.stageW;
        propbg.height = GameData.stageH / 5 + 20;
        propbg.y = GameData.stageH - propbg.height;
        this.addChild(propbg);
    }

    //创建地图背景图片的格子图
    private createMapBg() {
        if (!this.girdBg) {
            this.girdBg = new Array();
        }
        for (var i: number = 0; i < GameData.MaxRow; i++) {
            for (var t: number = 0; t < GameData.MaxColumn; t++) {
                if (GameData.hasGameElementIdAt(i, t)) {
                    let gird: egret.Bitmap = new egret.Bitmap();
                    this.girdBg.push(gird);
                    gird.width = GameData.gridWidth;
                    gird.height = GameData.gridWidth;
                    gird.x = GameData.startX + GameData.gridWidth * t;
                    gird.y = GameData.startY + GameData.gridWidth * i;
                    if ((i % 2 == 0 && t % 2 == 0) || (i % 2 == 1 && t % 2 == 1)) {
                        gird.texture = RES.getRes("elementbg1");
                    } else {
                        gird.texture = RES.getRes("elementbg2");
                    }
                    this.addChild(gird);
                }
            }
        }
    }

    //创建过关条件背景图片
    private createLevelReqBg() {
        var bg: egret.Bitmap = new egret.Bitmap();
        bg.texture = RES.getRes("levelreqbg_png");
        bg.width = GameData.levelreq.getLevelReqNum() * (10 + GameData.gridWidth) + 20;
        bg.height = GameData.gridWidth + 60;
        bg.x = 20;
        bg.y = 50;
        this.addChild(bg);

        var bgtxt: egret.Bitmap = new egret.Bitmap();
        bgtxt.texture = RES.getRes("levelreqtitle_png");
        bgtxt.x = bg.x + (bg.width - bgtxt.width) / 2;
        bgtxt.y = bg.y - 18;
        this.addChild(bgtxt);
    }

    //剩余步数背景
    private createStepBg() {
        var bg: egret.Bitmap = new egret.Bitmap();
        bg.texture = RES.getRes("levelreqbg_png");
        bg.width = 100;
        bg.height = 100;
        bg.x = GameData.stageW - 110;
        bg.y = 50;
        this.addChild(bg);

        var bgtxt: egret.Bitmap = new egret.Bitmap();
        bgtxt.texture = RES.getRes("sursteptitle_png");
        bgtxt.x = bg.x + (bg.width - bgtxt.width) / 2;
        bgtxt.y = bg.y + 10;
        this.addChild(bgtxt);
    }
}