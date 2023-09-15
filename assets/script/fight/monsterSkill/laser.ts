import { EffectManager, playParticleOptions } from './../../framework/effectManager';
import { _decorator, Component } from 'cc';
import { Constant } from '../../framework/constant';
import { AudioManager } from '../../framework/audioManager';
const { ccclass, property } = _decorator;
//激光技能脚本
@ccclass('Laser')
export class Laser extends Component {
    public set baseInfo (v: any) {
        this._baseInfo = v;
    }

    public get baseInfo () {
        return this._baseInfo;
    }

    public set skillInfo (v: any) {
        this._skillInfo = v;
    }

    public get skillInfo () {
        return this._skillInfo;
    }

    public set scriptWarning (v: any) {
        this._scriptWarning = v;
    }

    public get scriptWarning () {
        return this._scriptWarning;
    }

    private _baseInfo: any = null!;//敌人基本信息
    private _skillInfo: any = null!;//技能信息
    private _timer: any = null!;//定时器
    private _scriptWarning: any = null!;//预警技能脚本

    start () {
        // [3]
    }

    public init (skillInfo: any, baseInfo: any, scriptParent?: any) {
        this.skillInfo = skillInfo;
        this.baseInfo = baseInfo;
        this.node.active = false;
        this._closeTimer();

        this._timer = setTimeout(() => {
            if (!scriptParent.isDie) {
                AudioManager.instance.playSound(Constant.SOUND.LASER);
                this.node.active = true;
                scriptParent?.scriptWarning?.hideWarning();

                let options: playParticleOptions = { ndEffect: this.node, speed: skillInfo.flySpeed, isRecycle: true };
                EffectManager.instance.playParticle(options).then(() => {
                    this._closeTimer();
                });
            } else {
                this._closeTimer();
            }
        }, 400)
    }

    private _closeTimer () {
        if (this._timer) {
            clearTimeout(this._timer);
            this._timer = null!;
        }
    }

    // update (deltaTime: number) {
    //     // [4]
    // }
}