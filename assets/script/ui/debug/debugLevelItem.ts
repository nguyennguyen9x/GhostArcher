import { Constant } from './../../framework/constant';
import { UIManager } from './../../framework/uiManager';
import { PlayerData } from './../../framework/playerData';
import { _decorator, Component, LabelComponent, SpriteComponent, Color } from 'cc';
import { ClientEvent } from '../../framework/clientEvent';
const { ccclass, property } = _decorator;
//调试关卡等级脚本
@ccclass('DebugLevelItem')
export class DebugLevelItem extends Component {
    @property(LabelComponent)
    public lbLevelTxt: LabelComponent = null!;//等级文本组件

    @property(SpriteComponent)
    public spCom: SpriteComponent = null!;//图标组件

    private _colorSelected: Color = new Color().fromHEX("#3CE649");//选中
    private _colorUnSelected: Color = new Color().fromHEX("#ffffff");//未选中
    private _isSelected: boolean = false;//是否选中
    private _level: number = 0;//等级
    private _itemInfo: any = null!;//自节点数据

    onEnable () {
        ClientEvent.on(Constant.EVENT_TYPE.HIDE_DEBUG_LEVEL_SELECTED, this._hideDebugLevelSelected, this);
    }

    onDisable () {
        ClientEvent.off(Constant.EVENT_TYPE.HIDE_DEBUG_LEVEL_SELECTED, this._hideDebugLevelSelected, this);
    }

    start () {
        // [3]
    }

    /**
     *  初始化
     *
     * @param {*} itemInfo
     * @memberof DebugLevelItem
     */
    public init (itemInfo: any) {
        this._level = itemInfo.ID;
        this.lbLevelTxt.string = `${this._level}`;
        this._itemInfo = itemInfo;
        this._refreshState();
    }

    /**
     * 切换选中与非选中状态
     *
     * @private
     * @memberof DebugSkillItem
     */
    private _refreshState () {
        this._isSelected = PlayerData.instance.playerInfo.level === this._itemInfo.ID;
        if (this._isSelected) {
            this.spCom.color = this._colorSelected;
        } else {
            this.spCom.color = this._colorUnSelected;
        }
    }

    /**
     * 点击按钮
     */
    public onBtnClick () {
        ClientEvent.dispatchEvent(Constant.EVENT_TYPE.HIDE_DEBUG_LEVEL_SELECTED);
        this._isSelected = true;
        this._refreshState();

        ClientEvent.dispatchEvent(Constant.EVENT_TYPE.RECYCLE_ALL);

        PlayerData.instance.playerInfo.level = Number(this._level);
        PlayerData.instance.savePlayerInfoToLocalCache();
        ClientEvent.dispatchEvent(Constant.EVENT_TYPE.ON_GAME_INIT, () => {
            UIManager.instance.hideDialog("debug/debugPanel");
            UIManager.instance.hideDialog("fight/fightPanel");
        });
    }

    /**
     * 隐藏选中状态
     *
     * @private
     * @memberof DebugLevelItem
     */
    private _hideDebugLevelSelected () {
        this._isSelected = false;
        this._refreshState();
    }

    // update (deltaTime: number) {
    //     // [4]
    // }
}