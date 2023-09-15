import { PlayerData } from './../../framework/playerData';
import { _decorator, Component, Node, Sprite, SpriteComponent, LabelComponent, UITransform } from 'cc';
import { ClientEvent } from '../../framework/clientEvent';
import { Constant } from '../../framework/constant';
import { UIManager } from '../../framework/uiManager';
const { ccclass, property } = _decorator;
//复活界面脚本
@ccclass('RevivePanel')
export class RevivePanel extends Component {
    @property(SpriteComponent)
    public spPayIcon: SpriteComponent = null!;

    @property(LabelComponent)
    public lbLevel: LabelComponent = null!;

    @property(Node)
    public ndMask: Node = null!;

    @property(LabelComponent)
    public lbCountDown: LabelComponent = null!;

    public set countDown (value: number) {
        this._countDown = value;
        this.lbCountDown.string = String(Math.floor(this._countDown));
        this.lbLevel.string = PlayerData.instance.playerInfo.level;

        this._curMaskHeight += this._maxMaskHeight / (this._countDown * 120);
        this._curMaskHeight = this._curMaskHeight >= this._maxMaskHeight ? this._maxMaskHeight : this._curMaskHeight;
        this.ndMask.getComponent(UITransform)?.setContentSize(260, this._curMaskHeight);

        if (value < 0) {
            this._close();
        }
    }

    public get countDown () {
        return this._countDown;
    }

    private _countDown: number = 10;
    private _maxMaskHeight: number = 190;
    private _curMaskHeight: number = 0;
    private _callback: Function = null!;

    public show (callback: Function) {
        this._countDown = 10;
        this._curMaskHeight = 0;
        this._callback = callback;
    }

    public onBtnSkipClick () {
        this._close()
    }

    public onBtnReviveClick () {
        UIManager.instance.hideDialog("revive/revivePanel");
        ClientEvent.dispatchEvent(Constant.EVENT_TYPE.ON_REVIVE);
    }

    private _close () {
        this._callback && this._callback();
        UIManager.instance.hideDialog("fight/fightPanel");
        UIManager.instance.hideDialog("revive/revivePanel");
        UIManager.instance.showDialog("settlement/settlementPanel");
    }

    update (deltaTime: number) {
        if (this.countDown > 0) {
            this.countDown -= deltaTime;
        }
    }
}
