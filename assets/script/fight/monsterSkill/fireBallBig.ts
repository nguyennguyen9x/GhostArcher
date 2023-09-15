import { Constant } from './../../framework/constant';
import { _decorator, Component, Node, tween, Prefab } from 'cc';
import { EffectManager, playParticleOptions } from '../../framework/effectManager';
import { ResourceUtil } from '../../framework/resourceUtil';
import { AudioManager } from '../../framework/audioManager';
import { PoolManager } from '../../framework/poolManager';
import { GameManager } from '../gameManager';
const { ccclass, property } = _decorator;
//大火球脚本: 炸开的时候才有伤害，跟小火球一样
@ccclass('FireBallBig')
export class FireBallBig extends Component {
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

    public set scriptWarning (v: number) {
        this._scriptWarning = v;
    }

    public get scriptWarning () {
        return this._scriptWarning;
    }

    public set isPlayHitFireBall (v: boolean) {
        this._isPlayHitFireBall = v;
    }

    public get isPlayHitFireBall () {
        return this._isPlayHitFireBall;
    }

    private _baseInfo: any = null!;//敌人基本信息
    private _skillInfo: any = null!;//技能信息
    private _scriptWarning: any = null!;//预警技能脚本
    private _isPlayHitFireBall: boolean = false;//是否开始播放爆炸特效

    start () {
        // [3]
    }

    public init (skillInfo: any, baseInfo: any, scriptParent?: any) {
        this.skillInfo = skillInfo;
        this.baseInfo = baseInfo;
        this.isPlayHitFireBall = false;

        let playerWorPos = scriptParent.attackPos;
        this.node.setWorldPosition(playerWorPos.x, 23, playerWorPos.z);

        this.node.children.forEach((ndChild: Node) => {
            ndChild.active = true;
        })

        let options: playParticleOptions = { ndEffect: this.node };
        EffectManager.instance.playParticle(options);

        tween(this.node)
            .to(1 / skillInfo.flySpeed, { position: playerWorPos }, { easing: "elasticIn" })
            .call(() => {
                AudioManager.instance.playSound(Constant.SOUND.FIRE_BALL_BIG);

                this.isPlayHitFireBall = true;
                //关闭预警
                scriptParent?.scriptWarning?.hideWarning();

                this.node.children.forEach((ndChild: Node) => {
                    ndChild.active = false;
                })

                // console.log("大火球碰到地面");

                ResourceUtil.loadEffectRes("hit/hitFireBall2").then((prefab: any) => {
                    let ndEffect: Node = PoolManager.instance.getNode(prefab as Prefab, this.node) as Node;
                    ndEffect.setWorldPosition(this.node.worldPosition);

                    let options: playParticleOptions = { ndEffect: ndEffect, speed: GameManager.gameSpeed, isRecycle: true, recycleTime: 1.1 };
                    EffectManager.instance.playParticle(options).then(() => {
                        PoolManager.instance.putNode(this.node);
                    });
                })
            })
            .start()
    }
}