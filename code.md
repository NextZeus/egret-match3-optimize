# 代码流程

src/game/init.ts
src/game/views/GameScene.ts 
	- new GameLogic()

src/game/GameLogic.ts
	- init
		- 初始化地图数据 GameData.initData()
			- 初始化 mapData[0~7][0~7] = -2
			- 初始化 elements.push(new GameElement(0~63))
			- 初始化 unUsedElementsId.push(0~63)
		- 解析地图配置数据
			- MapDataParse.createMapData(number[]) 
				- 将配置中未使用的位置 修改mapData[row][column] = -1
				- 设置 unUsedLocationNum 
				- 设置 currentElementNum
			- MapControl.createElementAllMap
				- 生成地图元素类型 生成过程中检测是否有可消除元素逻辑
				- 赋值消除元素
					- 从 unUsedElementsId 中取出第一个id(0~63)
					- 赋值 mapData[row][column].id = id (row, column是可用元素的row, column)
					- 赋值 mapData[row][column].location = GameData.getLocationByRowAndColumn(row, col) (0~63)
					- 赋值 mapData[row][column].type = 随机元素类型


注册事件监听器
src/view/ElementViewManage.ts
	- _tapedId: 上一次被点击的元素GameElement.id
	- movedElementCount: number = 0;  // 移动的元素数量

	elementView.addEventListener(egret.TouchEvent.TOUCH_TAP, this.tapElement, this);
		- 元素点击事件处理逻辑
		- 元素未被点击过, 设置focus特效
		- 元素被点击过
			- currentElement: ElementView: 当前被点击的元素 
			- 判断 currentElement.id === _tapedId
				- 等, 说明是点击了同一个元素
				- 不等, 说明是点击了不同元素
					- 派发 ElementViewManageEvent.TAP_TWO_ELEMENT 事件
					- event: ElementViewManageEvent = new ElementViewManageEvent(ElementViewManageEvent.TAP_TWO_ELEMENT);
					- event.gameElementId1 = this._tapedId;
                    - event.gameElementId2 = currElementView.id;
                    - 逻辑走到 src/GameLogic.ts viewTouchTap函数 
	elementView.addEventListener(ElementViewManageEvent.ELEMENT_MOVE_ANIMATION_OVER, this.elementMoveAniOver, this);
		- this.movedElementCount++;
        - this.movedElementCount == 2 (点击的两个元素互换位置完成)
        	- this.movedElementCount = 0; // 重置
            - 派发两个元素互换位置完成事件
            - this.dispatchEvent(new ElementViewManageEvent(ElementViewManageEvent.ALL_ELEMENT_MOVE_ANIMATION_OVER))
            	- 交给 src/GameLogic.ts allElementMoveAniOver函数处理
    elementView.addEventListener(ElementViewManageEvent.UPDATE_MAP, this.updateMap, this);
    	- 事件派发源自：ElementView curveMoveCall || removeAniCall, 元素移动位置之后，需要更新地图
    	- 处理逻辑
    		- movedElementCount = 0
    			- 派发事件 ElementViewManageEvent.UPDATE_MAP, 转至 GameLogic.createNewElement 处理
    elementView.addEventListener(ElementViewManageEvent.UPDATE_VIEW_OVER, this.moveNewLocationOver, this);
    	- 所有 elementView 都移动位置结束
    	- this.dispatchEvent(new ElementViewManageEvent(ElementViewManageEvent.ALL_UPDATE_VIEW_OVER))
    		- 转到GameLogic.checkOtherElementLink
src/GameLogic.ts
	this.evm = new ElementViewManage();
	<!-- 点击两个元素 判断是否可以移动互换位置，互换位置后是否可消除 -->
    this.evm.addEventListener(ElementViewManageEvent.TAP_TWO_ELEMENT, this.viewTouchTap, this);
    	- canMove = LinkLogic.canMove 判断是否可互换
    	- canMove = true
    		- linerel = LinkLogic.isHaveLineByLocation 
    			- 先替换内存中mapData两个元素的 id
    			- LinkLogic.isHaveLine() 判断是否可消除
    				- 检测逻辑
    					- 横向 自左向右检索
    						- for(var i = 0; i < GameData.MaxRow; i++)
    						- for(var j = 0; j < GameData.MaxColumn; j++)
							- 按[0][0~7],[1][0~7],,,[7][0~7] 逐行检索
    						- let previousType: string = "" 记录上一个检索的元素类型
    						- let sameTypeCount:number = 0 记录相同元素类型数量
    						- 当前元素是否为空 (mapData[i][j] != -1)
    							- 不为空
    								- 判断 previousType 是否等于当前元素 type
    									- 等于 
    										- sameTypeCount + 1
    									- 不等于 (判断是否有连续超过3个元素)
    										- checkHorizontalDirectionLineOver
    											- sameTypeCount >= 3
    											- array.push(mapData[i][j-(0~sameTypeCount-1)-1])
    										- sameTypeCount = 0, previousType = GameData.elements[GameData[i][j]]type
    							- 为空
    								- checkHorizontalDirectionLineOver
    									- sameTypeCount >= 3
    									- array.push(mapData[i][j-(0~sameTypeCount-1)-1])
    									- LinkLogic.lines.push(arr) 后续消除动画会用到
    								- sameTypeCount = 0, previousType=""

    					- 纵向 自顶向下检索
    						- for(var i = 0; i < GameData.MaxRow; i++)
    						- for(var j = 0; j < GameData.MaxColumn; j++)
    						- 按 [0~7][0],[0~7][1],,,[0~7][7] 逐列检索
    						- previousType: string = "" 记录上一个检索的元素类型
    						- sameTypeCount:number = 0 记录相同元素类型数量
    						- 当前元素是否为空 (mapData[j][i] != -1)
    							- 不为空
    								- 判断 previousType 是否等于当前元素 type
    									- 等于 
    										- sameTypeCount + 1
    									- 不等于 (判断是否有连续超过3个元素)
    										- checkHorizontalDirectionLineOver
    											- sameTypeCount >= 3
    											- array.push(mapData[j-(0~sameTypeCount-1)-1][i])
    										- sameTypeCount = 0, previousType = GameData.elements[GameData[j][i]]type
    							- 为空
    								- checkVerticalDirectionLineOver
    									- sameTypeCount >= 3
    									- array.push(mapData[j-(0~sameTypeCount-1)-1][i])
    									- LinkLogic.lines.push(arr) 后续消除动画会用到
    								- sameTypeCount = 0, previousType=""
    				- 检测结果
	    				- 可消除 
	    					- 替换GameData.elements 两个元素的location
	    				- 不可消除
	    					- 恢复id
	    	- linerel是否为true
	    		- 是 changeLocationAndScale(evt.elementView1Id, evt.elementView2Id)
	    			- ElementView.moveAndScale() 两个元素播放互换位置动画
	    				- 派发 ElementViewManageEvent.ELEMENT_MOVE_ANIMATION_OVER 事件
	    				- this.dispatchEvent(new ElementViewManageEvent(ElementViewManageEvent.ELEMENT_MOVE_ANIMATION_OVER));
	    					- 交给 src/view/ElementViewManage.ts elementMoveAniOver函数处理
	    		- 否 changeLocationAndBack(evt.elementView1Id, evt.elementView2Id) 元素复位
	    - canMove = false, 设置当前点击元素 focus

	<!-- 点击的两个元素互换位置完成 接着要播放消除元素的动画 -->
    this.evm.addEventListener(ElementViewManageEvent.ALL_ELEMENT_MOVE_ANIMATION_OVER, this.allElementMoveAniOver, this);
    	- 遍历 二维数组 LinkLogic.lines: number[][] （检索后的数据池，即将被消除的元素ID)
    	- for (var i: number = 0; i < LinkLogic.lines.length; i++) 
    	- for (var j: number = 0; j < LinkLogic.lines[i].length; j++)
    	- let id = LinkLogic.lines[i][j]; // GameElement.id
    	- 判断关卡条件中是否包含当前元素类型 (GameElement.type === LevelElementView.type)
    		- 有 
    			- 关卡数-1
    			- 当前元素移动到关卡元素所在位置 然后消失 
    			- (ElementViewManage.playReqRemoveAni -> ElementView.playCurveMove -> emit ElementViewManageEvent.UPDATE_MAP -> ElementViewManage.updateMap)
    		- 否 
    			- 直接消失
    			- ElementViewManage.playRemoveAni -> ElementView.playRemoveAni -> emit ElementViewManageEvent.UPDATE_MAP -> ElementViewManage.updateMap
    this.evm.addEventListener(ElementViewManageEvent.UPDATE_MAP, this.createNewElement, this);
    	- createNewElement
    		- MapControl.updateMapLocation 更新地图元素位置
    			- LinkLogic.lines 存储着要删除的元素id
    			- uniqueRemoveGameElementId: Set<number> 将 LinkLogic.lines 中的id去重
    			- uniqueColumnOfRemoveGameElement: Set<number> 计算 uniqueRemoveGameElementId 中元素的列(去重) 
    			- 从左至右 遍历 uniqueColumnOfRemoveGameElement
    				- 从下至上遍历行(因为元素位置要从上往下落)
    				// 当前列要删除的元素 纵向消除的时候 length>=3  横向消除的时候length=1
            		- var gameElementIdArrOfRemoved: number[] = new Array();
		            // 当前列要删除的元素 上面的元素, 它们要逐个的向下移动位置
		            - var gameElementIdArrAtUp: number[] = new Array();
		            - 合并两个数组 必须是 gameElementIdArrOfRemoved 放在后面 因为是从上往下的
		            	- let gameElementIdArrOfSorted = gameElementIdArrAtUp.concat(gameElementIdArrOfRemoved);
		            - 在当前列，重新遍历行 从下至上, 将 gameElementIdArrOfSorted 重新分配给每一行的元素，更新每一行元素的 location
		        - 完毕
    		- ElementViewManage.updateMapData
    			- 上面 MapControl.updateMapLocation 更新地图元素 id & 位置
    			- 该函数内进行元素视图位置移动
    				- 遍历 elementViews
    				- 对应的 elements[index] type & location ，重新赋值到 elementView上
    				- 根据新的location 播放移动动画
    					- elementView.dispatchEvent(new ElementViewManageEvent(ElementViewManageEvent.ALL_UPDATE_VIEW_OVER))
    						- 事件会发送到 ElementViewManage.moveNewLocationOver 处理

    this.evm.addEventListener(ElementViewManageEvent.ALL_UPDATE_VIEW_OVER, this.checkOtherElementLink, this);
    	- 检查地图中是否有可消除的元素
    		- 有可消除元素(不需要移动位置)
    			- 直接调用 GameLogic.allElementMoveAniOver() 执行后续操作逻辑
    		- 无可消除元素
    			- 检查是否无法继续移动消除
    				-  移动一步是否有可消除元素
    					- 无 
    						- 则打乱所有元素 
    							- 把所有mapData id放到一个数组中
    							- 遍历行 遍历列 从数组中随机一个id 赋值
    							- 修改mapData, elements.location
    						- 直到出现 没有可消除元素&&移动一步有可消除的元素
    							- 修改elementView.location
    							- elementView.move 移动位置
    					
    				- 检查游戏是否结束
    					- 剩余步数为0
    					- 收集元素个数达标
    this.evm.addEventListener(ElementViewManageEvent.USE_PROP_CLICK, this.usePropClick, this);






