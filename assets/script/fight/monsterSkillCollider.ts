import { GameManager } from './gameManager';
import { _decorator, Component, MeshColliderComponent, Quat, BoxColliderComponent, CylinderColliderComponent, ITriggerEvent, Vec3, Enum, AnimationComponent, CapsuleColliderComponent, SphereCollider, Node, ICollisionEvent } from 'cc';
import { Constant } from '../framework/constant';
import { DispersionSurround } from './monsterSkill/dispersionSurround';
import { Dispersion } from './monsterSkill/dispersion';
import { EnergyBall } from './monsterSkill/energyBall';
import { JetFires } from './monsterSkill/jetFires';
import { FireBall } from './monsterSkill/fireBall';
import { FireBallBig } from './monsterSkill/fireBallBig';
import { Laser } from './monsterSkill/laser';
import { Tornado } from './monsterSkill/tornado';
import { PoolManager } from '../framework/poolManager';
//怪物武器碰撞器/触发器脚本
const { ccclass, property } = _decorator;

const COLLIDER_NAME = Enum({
    ENERGY_BALL: 1,//直线飞行能量球
    FIRE_BALL: 2,//线飞行的小火球
    JET_FIRES: 3,//直线范围型的火焰
    DISPERSION: 4,//180度散射
    TORNADO: 5,//旋转前进的龙卷风
    FIRE_BALL_BIG: 6,//直线下坠的大火团 
    DISPERSION_SURROUND: 7,//360度六角形散射
    LASER: 8,//直线激光
})

@ccclass('MonsterSkillCollider')
export class MonsterSkillCollider extends Component {
    @property({
        type: COLLIDER_NAME,
        displayOrder: 1
    })
    public colliderName: any = COLLIDER_NAME.ENERGY_BALL;//碰撞体/触发器类型名称

    public static COLLIDER_NAME = COLLIDER_NAME;

    private _isOnJetFires: boolean = false;//是否处在龙火焰中
    private _checkInterval: number = 1;//大龙火焰检查间隔
    private _colliderCom: any = null;

    onLoad () {
        this._colliderCom = this.node.getComponent(BoxColliderComponent) || this.node.getComponent(CylinderColliderComponent) || this.node.getComponent(SphereCollider) || this.node.getComponent(CapsuleColliderComponent) || this.node.getComponent(MeshColliderComponent) || this.node.getComponent(CylinderColliderComponent);

        if (!this._colliderCom) {
            console.error("this node does not have collider component");
        }
    }

    onEnable () {
        if (this.colliderName === COLLIDER_NAME.JET_FIRES) {
            this._colliderCom.on("onTriggerStay", this._onTriggerStayCb, this);
            this._colliderCom.on("onTriggerExit", this._onTriggerExitCb, this);
        } else {
            if (this._colliderCom.isTrigger) {
                this._colliderCom.on('onTriggerEnter', this._onTriggerEnterCb, this);
            } else {
                this._colliderCom.on('onCollisionEnter', this._onCollisionEnterCb, this);
            }
        }

    }

    onDisable () {
        if (this.colliderName === COLLIDER_NAME.JET_FIRES) {
            this._colliderCom.off("onTriggerStay", this._onTriggerStayCb, this);
            this._colliderCom.off("onTriggerExit", this._onTriggerExitCb, this);
        } else {
            if (this._colliderCom.isTrigger) {
                this._colliderCom.off('onTriggerEnter', this._onTriggerEnterCb, this);
            } else {
                this._colliderCom.off('onCollisionEnter', this._onCollisionEnterCb, this);
            }
        }
    }

    start () {
        this._isOnJetFires = false;
    }

    /**
     * 初始化
     */
    public init () {

    }

    private _onTriggerEnterCb (event: ITriggerEvent) {
        this._hitTarget(event.otherCollider);
    }

    private _onCollisionEnterCb (event: ICollisionEvent) {
        this._hitTarget(event.otherCollider);
    }

    private _hitTarget (otherCollider: any) {
        if (GameManager.isGameOver || !GameManager.isGameStart) {
            return;
        }

        if (otherCollider.getGroup() === Constant.PHY_GROUP.OBSTACLE) {
            //技能碰到游戏中的障碍则回收
            let scriptSkillCollider: any = null;

            switch (this.colliderName) {
                case COLLIDER_NAME.ENERGY_BALL:
                    scriptSkillCollider = this.node.getComponent(EnergyBall) as EnergyBall;
                    if (!scriptSkillCollider.skillInfo.penetrate) {
                        PoolManager.instance.putNode(this.node);
                    }
                    break;
                case COLLIDER_NAME.DISPERSION:
                    scriptSkillCollider = this.node.getComponent(Dispersion) as Dispersion;
                    if (!scriptSkillCollider.skillInfo.penetrate) {
                        scriptSkillCollider.hide();
                    }
                    break;
                case COLLIDER_NAME.TORNADO:
                    scriptSkillCollider = this.node.parent?.getComponent(Tornado) as Tornado;
                    if (!scriptSkillCollider.skillInfo.penetrate) {
                        PoolManager.instance.putNode(this.node.parent as Node);
                    }
                    break;
                case COLLIDER_NAME.DISPERSION_SURROUND:
                    scriptSkillCollider = this.node.getComponent(DispersionSurround) as DispersionSurround;
                    if (!scriptSkillCollider.skillInfo.penetrate) {
                        scriptSkillCollider.hide();
                    }
                    break;
            }
        } else if (otherCollider.getGroup() == Constant.PHY_GROUP.PLAYER && GameManager.ndPlayer) {
            let scriptSkillCollider: any = null;

            switch (this.colliderName) {
                case COLLIDER_NAME.ENERGY_BALL:
                    PoolManager.instance.putNode(this.node);

                    scriptSkillCollider = this.node.getComponent(EnergyBall) as EnergyBall;
                    this._hitPlayer(scriptSkillCollider.baseInfo);
                    break;
                case COLLIDER_NAME.FIRE_BALL:
                    //不在这里回收节点.在fireBall里面会回收
                    scriptSkillCollider = this.node.parent?.getComponent(FireBall) as FireBall;
                    this._hitPlayer(scriptSkillCollider.baseInfo);
                    break;
                case COLLIDER_NAME.DISPERSION:
                    //注意这里不回收节点，只回收父节点
                    scriptSkillCollider = this.node.getComponent(Dispersion) as Dispersion;
                    scriptSkillCollider.hide();

                    this._hitPlayer(scriptSkillCollider.baseInfo);
                    break;
                case COLLIDER_NAME.TORNADO:
                    scriptSkillCollider = this.node.parent?.getComponent(Tornado) as Tornado;
                    this._hitPlayer(scriptSkillCollider.baseInfo);
                    break;
                case COLLIDER_NAME.FIRE_BALL_BIG:
                    scriptSkillCollider = this.node.parent?.getComponent(FireBallBig) as FireBallBig;
                    this._hitPlayer(scriptSkillCollider.baseInfo);
                    break;
                case COLLIDER_NAME.DISPERSION_SURROUND:
                    //注意这里不回收，只回收父节点
                    scriptSkillCollider = this.node.getComponent(DispersionSurround) as DispersionSurround;
                    scriptSkillCollider.hide();
                    this._hitPlayer(scriptSkillCollider.baseInfo);
                    break;
                case COLLIDER_NAME.LASER:
                    scriptSkillCollider = this.node.parent?.getComponent(Laser) as Laser;
                    this._hitPlayer(scriptSkillCollider.baseInfo);
                    break;
            }
        }
    }

    private _hitPlayer (baseInfo: any) {
        if (!baseInfo) {
            console.warn("###找不到技能来源敌人", this.colliderName);
            return;
        }
        // console.log("###技能碰到玩家了", this.colliderName);
        GameManager.scriptPlayer.reduceBlood(baseInfo);
    }

    private _onTriggerStayCb (event: ITriggerEvent) {
        if (event.otherCollider.getGroup() == Constant.PHY_GROUP.PLAYER && GameManager.ndPlayer) {
            this._isOnJetFires = true;
        }
    }

    private _onTriggerExitCb (event: ITriggerEvent) {
        if (event.otherCollider.getGroup() == Constant.PHY_GROUP.PLAYER && GameManager.ndPlayer) {
            this._isOnJetFires = false;
        }
    }

    update (deltaTime: number) {
        if (GameManager.isGameOver || !GameManager.ndPlayer || !this.node.parent) {
            return;
        }

        //检测是否在龙焰（持续性技能里面），每隔0.5秒时间扣减一定伤害
        if (this.colliderName === COLLIDER_NAME.JET_FIRES && this._isOnJetFires) {
            this._checkInterval += deltaTime;
            if (this._checkInterval >= 0.5) {
                this._checkInterval = 0;

                let scriptSkillCollider = this.node.parent.getComponent(JetFires) as JetFires;
                this._hitPlayer(scriptSkillCollider.baseInfo);
            }
        }
    }
}

