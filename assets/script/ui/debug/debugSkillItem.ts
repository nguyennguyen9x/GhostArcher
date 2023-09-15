import { PlayerData } from './../../framework/playerData';
import { _decorator, Component, Node, LabelComponent, SpriteComponent, Color } from 'cc';
import { Constant } from '../../framework/constant';
import { GameManager } from '../../fight/gameManager';
import { EffectManager, loadAndPlayEffectOptions } from '../../framework/effectManager';
import { AudioManager } from '../../framework/audioManager';
const { ccclass, property } = _decorator;
//调试单个选项脚本
@ccclass('DebugSkillItem')
export class DebugSkillItem extends Component {
    @property(LabelComponent)
    public lbLevelTxt: LabelComponent = null!;//等级文本组件

    @property(SpriteComponent)
    public spCom: SpriteComponent = null!;//图标组件

    private _colorSelected: Color = new Color().fromHEX("#3CE649");//选中
    private _colorUnSelected: Color = new Color().fromHEX("#ffffff");//未选中
    private _isSelected: boolean = false;//是否选中
    private _itemInfo: any = null!;//子节点数据

    public init (itemInfo: any) {
        this.lbLevelTxt.string = itemInfo.name;
        this._itemInfo = itemInfo;
        this._changeState();
    }

    /**
     * 切换选中与非选中状态
     *
     * @private
     * @memberof DebugSkillItem
     */
    private _changeState () {
        this._isSelected = PlayerData.instance.playerInfo.arrSkill.includes(this._itemInfo.ID);

        if (this._isSelected) {
            this.spCom.color = this._colorSelected;
        } else {
            this.spCom.color = this._colorUnSelected;
        }
    }

    public onBtnClick () {
        AudioManager.instance.playSound(Constant.SOUND.GET_SKILL);

        if (this._isSelected) {
            PlayerData.instance.reducePlayerSkill(this._itemInfo);
        } else {
            PlayerData.instance.addPlayerSkill(this._itemInfo);
            let options: loadAndPlayEffectOptions = { effectPath: "levelUp/levelUp", ndTarget: GameManager.ndPlayer, isPlayAnimation: false, speed: GameManager.gameSpeed, isRecycle: true };
            EffectManager.instance.loadAndPlayEffect(options);
        }

        this._changeState();
    }


    // update (deltaTime: number) {
    //     // [4]
    // }
}