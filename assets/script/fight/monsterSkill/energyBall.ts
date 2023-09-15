import { Util } from './../../framework/util';
import { GameManager } from './../gameManager';
import { _decorator, Component, Node, Vec3 } from 'cc';
import { EffectManager, playParticleOptions } from '../../framework/effectManager';
import { AudioManager } from '../../framework/audioManager';
import { Constant } from '../../framework/constant';
import { PoolManager } from '../../framework/poolManager';
//能量球脚本: 直线飞行
const { ccclass, property } = _decorator;

@ccclass('EnergyBall')
export class EnergyBall extends Component {
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

    private _baseInfo: any = null!;//敌人基本信息
    private _skillInfo: any = null!;//技能信息
    private _curSpeed: number = 0;//当前速度
    private _targetSpeed: number = 0;//目标速度
    private _offsetPos: Vec3 = new Vec3();//和玩家之间的向量差
    private _curWorPos: Vec3 = new Vec3();//当前节点世界坐标
    private _disappearRange: number = 25;//能量球节点超过玩家这个范围则隐藏
    private _targetWorPos: Vec3 = new Vec3();//能量球的下次目标位置

    /**
    * 初始化 
    */
    public init (skillInfo: any, baseInfo: any, scriptParent: any) {
        this.skillInfo = skillInfo;
        this.baseInfo = baseInfo;
        scriptParent.scriptWarning?.hideWarning();
        this._targetSpeed = skillInfo.flySpeed;;
        this._curSpeed = skillInfo.flySpeed * 0.5;

        let options: playParticleOptions = { ndEffect: this.node };
        EffectManager.instance.playParticle(options);

        AudioManager.instance.playSound(Constant.SOUND.ENERGY_BALL);
    }

    update (deltaTime: number) {
        if (!this.node.parent || !GameManager.ndPlayer || GameManager.isGameOver || GameManager.isGamePause) {
            return;
        }

        //朝forward方向飞行
        this._curSpeed = Util.lerp(this._targetSpeed, this._curSpeed, 0.25);
        this._targetWorPos.set(0, 0, -deltaTime * this._curSpeed);
        this.node.translate(this._targetWorPos, Node.NodeSpace.LOCAL);
        this._curWorPos.set(this.node.worldPosition);

        //超过玩家一定范围则隐藏
        Vec3.subtract(this._offsetPos, this._curWorPos, GameManager.ndPlayer.worldPosition);
        if (this._offsetPos && this._offsetPos.length() >= this._disappearRange) {
            PoolManager.instance.putNode(this.node);
        }
    }
}