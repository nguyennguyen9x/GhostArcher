import { EffectManager, loadAndPlayEffectOptions } from './../../framework/effectManager';
import { GameManager } from './../../fight/gameManager';
import { _decorator, Component, SpriteComponent, LabelComponent, Color, Button } from 'cc';
import { PlayerData } from '../../framework/playerData';
import { ResourceUtil } from '../../framework/resourceUtil';
import { AudioManager } from '../../framework/audioManager';
import { Constant } from '../../framework/constant';
const { ccclass, property } = _decorator;
//商品脚本
@ccclass('ShopItem')
export class ShopItem extends Component {
    @property(SpriteComponent)
    public spSkillIcon: SpriteComponent = null!;

    @property(LabelComponent)
    public lbName: LabelComponent = null!;

    @property(LabelComponent)
    public lbDesc: LabelComponent = null!;

    @property(LabelComponent)
    public lbGold: LabelComponent = null!;

    @property(Button)
    public btnCom: Button = null!;

    private _callback: Function = null!;
    private _itemInfo: any = null!;
    private _colorRed: Color = new Color(255, 0, 0, 255);
    private _colorBlack: Color = new Color(0, 0, 0, 255);
    private _isMoneyEnough: boolean = false;//是否有足够的钱购买技能 

    public init (itemInfo: any, callback: Function) {
        this._itemInfo = itemInfo;
        this._callback = callback;

        this.lbName.string = itemInfo.name;
        this.lbDesc.string = itemInfo.desc;
        this.lbGold.string = itemInfo.price;

        this._isMoneyEnough = PlayerData.instance.playerInfo.gold >= itemInfo.price;
        this.btnCom.interactable = this._isMoneyEnough;

        if (!this._isMoneyEnough) {
            this.lbGold.color = this._colorRed;
        } else {
            this.lbGold.color = this._colorBlack;
        }

        ResourceUtil.setSpriteFrame(`texture/skillIcon/${itemInfo.icon}`, this.spSkillIcon);
    }

    public onBtnItemClick () {
        AudioManager.instance.playSound(Constant.SOUND.SELL);

        if (this._isMoneyEnough) {
            this._callback && this._callback();
            PlayerData.instance.addPlayerSkill(this._itemInfo);
            GameManager.addGold(-this._itemInfo.price);

            let options: loadAndPlayEffectOptions = { effectPath: "levelUp/levelUp", ndTarget: GameManager.ndPlayer, isPlayAnimation: false, speed: GameManager.gameSpeed, isRecycle: true };
            EffectManager.instance.loadAndPlayEffect(options);
        }
    }
}
