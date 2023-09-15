import { UIManager } from './../../framework/uiManager';
import { AudioManager } from './../../framework/audioManager';
import { SpriteFrame, SpriteComponent, Vec3, profiler, LabelComponent } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { StorageManager } from '../../framework/storageManager';

const { ccclass, property } = _decorator;
//设置界面脚本
@ccclass('SettingPanel')
export class SettingPanel extends Component {
    @property(SpriteFrame)
    public sfSelect: SpriteFrame = null!;

    @property(SpriteFrame)
    public sfUnSelect: SpriteFrame = null!;

    @property(Node)
    public ndBtnVibration: Node = null!;

    @property(Node)
    public ndBtnMusic: Node = null!;

    @property(Node)
    public ndBtnDebug: Node = null!;

    private _isAudioOpen: boolean = false;
    private _isVibrationOpen: boolean = false;
    private _isDebugOpen: boolean = false;
    private _curDotPos: Vec3 = new Vec3();//当前选中点的位置

    public show () {
        this._isAudioOpen = AudioManager.instance.getAudioSetting(true);
        this._changeState(this.ndBtnMusic, this._isAudioOpen);

        this._isVibrationOpen = StorageManager.instance.getGlobalData("vibration") ?? true;
        this._changeState(this.ndBtnVibration, this._isVibrationOpen);

        this._isDebugOpen = StorageManager.instance.getGlobalData("debug") ?? false;
        this._changeState(this.ndBtnDebug, this._isDebugOpen);
    }

    private _changeState (ndParget: Node, isOpen: boolean) {
        let spCom = ndParget.getComponent(SpriteComponent) as SpriteComponent;
        let ndDot = ndParget.getChildByName("dot") as Node;
        let lbTxt = ndDot.getChildByName("txt")?.getComponent(LabelComponent) as LabelComponent;
        let ndDotPos = ndDot.position;

        if (isOpen) {
            spCom.spriteFrame = this.sfSelect;
            this._curDotPos.set(24, ndDotPos.y, ndDotPos.z);
            ndDot.setPosition(this._curDotPos);
            lbTxt.string = "开";
        } else {
            spCom.spriteFrame = this.sfUnSelect;
            this._curDotPos.set(-24, ndDotPos.y, ndDotPos.z);
            ndDot.setPosition(this._curDotPos);
            lbTxt.string = "关";
        }
    }

    public onBtnVibrationClick () {
        this._isVibrationOpen = !this._isVibrationOpen;
        this._changeState(this.ndBtnVibration, this._isVibrationOpen);
        StorageManager.instance.setGlobalData("vibration", this._isVibrationOpen);
    }

    public onBtnMusicClick () {
        this._isAudioOpen = !this._isAudioOpen;
        this._changeState(this.ndBtnMusic, this._isAudioOpen);

        AudioManager.instance.switchSound(this._isAudioOpen);
        AudioManager.instance.switchMusic(this._isAudioOpen);
    }

    public onBtnDebugClick () {
        this._isDebugOpen = !this._isDebugOpen;
        this._changeState(this.ndBtnDebug, this._isDebugOpen);
        StorageManager.instance.setGlobalData("debug", this._isDebugOpen);

        this._isDebugOpen === true ? profiler.showStats() : profiler.hideStats();
    }

    public onBtnCloseClick () {
        UIManager.instance.hideDialog("setting/settingPanel");
    }

    // update (deltaTime: number) {
    //     // [4]
    // }
}
