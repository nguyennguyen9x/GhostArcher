import { UIManager } from './../../framework/uiManager';
import { PlayerData } from './../../framework/playerData';
import { _decorator, Component, LabelComponent, SpriteComponent } from 'cc';
import { ClientEvent } from '../../framework/clientEvent';
import { Constant } from '../../framework/constant';
import { AudioManager } from '../../framework/audioManager';
const { ccclass, property } = _decorator;
//主界面脚本
@ccclass('HomePanel')
export class HomePanel extends Component {
    @property(SpriteComponent)
    public spLevelName: SpriteComponent = null!;

    @property(LabelComponent)
    public lbLevel: LabelComponent = null!;

    private _callback: Function = null!;

    public show (callback?: Function) {
        this._callback = callback!;
        //已经解锁的最高层级
        this.lbLevel.string = `${PlayerData.instance.playerInfo.highestLevel}层`;
    }

    public onBtnSettingClick () {
        UIManager.instance.showDialog("setting/settingPanel", [], () => { }, Constant.PRIORITY.DIALOG);
    }

    public onBtnStartClick () {
        AudioManager.instance.playSound(Constant.SOUND.HOME_PANEL_CLICK);


        // if (this._callback) {
        //     this._callback();
        // } else {
        ClientEvent.dispatchEvent(Constant.EVENT_TYPE.ON_GAME_INIT, () => {
            UIManager.instance.hideDialog("home/homePanel");
        });
        // }
    }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.0/manual/en/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.0/manual/en/scripting/ccclass.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.0/manual/en/scripting/life-cycle-callbacks.html
 */
