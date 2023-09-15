import { PlayerData } from './../framework/playerData';
import { UIManager } from './../framework/uiManager';
import { GameManager } from './gameManager';
import { _decorator, Component, Quat, MeshColliderComponent, Node, BoxColliderComponent, CylinderColliderComponent, ITriggerEvent, Enum, AnimationComponent, CapsuleColliderComponent, ICollisionEvent, math, game, PhysicsSystem, isValid } from 'cc';
import { Constant } from '../framework/constant';
import { PoolManager } from '../framework/poolManager';
//碰撞器脚本

const { ccclass, property } = _decorator;

const COLLIDER_NAME = Enum({
    HEART_BIG: 1,//大爱心, 玩家吃到后增加生命上限
    WARP_GATE: 2,//传送门
    NPC_BUSINESS_MAN: 3,//NPC商人
    NPC_WISE_MAN: 4,//NPC智慧老头
})

//管理游戏中若干碰撞器
@ccclass('ColliderItem')
export class ColliderItem extends Component {
    @property({
        type: COLLIDER_NAME,
        displayOrder: 1
    })
    public colliderName: any = COLLIDER_NAME.HEART_BIG;//碰撞体类型名称

    public set timer (obj: any) {
        if (this._timer) {
            clearTimeout(this._timer);
            this._timer = null;
        }
    }

    public static COLLIDER_NAME = COLLIDER_NAME;

    private _curHeartBigQuat: Quat = new Quat();//爱心旋转
    private _timer: any = null;//定时器
    private _colliderCom: any = null;

    onLoad () {
        this._colliderCom = this.node.getComponent(BoxColliderComponent) || this.node.getComponent(CylinderColliderComponent) || this.node.getComponent(CapsuleColliderComponent) || this.node.getComponent(MeshColliderComponent);

        if (!this._colliderCom) {
            console.error("this node does not have collider component");
        }
    }

    onEnable () {
        if (this._colliderCom.isTrigger) {
            this._colliderCom.on('onTriggerEnter', this._onTriggerEnterCb, this);
        } else {
            this._colliderCom.on('onCollisionEnter', this._onCollisionEnterCb, this);
        }
    }

    onDisable () {
        if (this._colliderCom.isTrigger) {
            this._colliderCom.off('onTriggerEnter', this._onTriggerEnterCb, this);
        } else {
            this._colliderCom.off('onCollisionEnter', this._onCollisionEnterCb, this);
        }
    }

    start () {
    }

    /**
     * 初始化
     */
    public init () {

    }

    private _onTriggerEnterCb (event: ITriggerEvent) {
        this._hitTarget(event.otherCollider, event.selfCollider);
    }

    private _onCollisionEnterCb (event: ICollisionEvent) {
        this._hitTarget(event.otherCollider, event.selfCollider);
    }

    private _hitTarget (otherCollider: any, selfCollider: any) {
        if (GameManager.isGameOver || !GameManager.isGameStart) {
            return;
        }

        if ((otherCollider.getGroup() == Constant.PHY_GROUP.PLAYER) && isValid(GameManager.ndPlayer)) {
            switch (this.colliderName) {
                case COLLIDER_NAME.HEART_BIG:
                    GameManager.scriptPlayer.addBlood(300);
                    PoolManager.instance.putNode(this.node);
                    GameManager.checkTriggerAll();
                    break;
                case COLLIDER_NAME.WARP_GATE:
                    GameManager.scriptPlayer.playAction({ action: Constant.PLAYER_ACTION.STOP_MOVE });
                    GameManager.scriptPlayer.scriptCharacterRigid.stopMove();
                    GameManager.ndPlayer.active = false;

                    if (PhysicsSystem.PHYSICS_PHYSX) {
                        this.node.destroy();
                    } else {
                        PoolManager.instance.putNode(this.node);
                    }
                    GameManager.isWin = true;
                    break;
                case COLLIDER_NAME.NPC_BUSINESS_MAN:
                    GameManager.isGamePause = true;
                    GameManager.scriptPlayer.scriptCharacterRigid.stopMove();
                    GameManager.scriptPlayer.scriptPlayerModel.playAni(Constant.PLAYER_ANI_TYPE.IDLE, true);
                    if (PlayerData.instance.isPlayerSkillAllUnlock) {
                        //防错
                        UIManager.instance.showTips("所有技能均已解锁");
                        PoolManager.instance.putNode(this.node);
                        GameManager.isGamePause = false;
                    } else {
                        UIManager.instance.hideDialog("fight/fightPanel");
                        UIManager.instance.showDialog("shop/shopPanel", [() => {
                            GameManager.isGamePause = false;
                            PoolManager.instance.putNode(this.node);
                        }], () => { }, Constant.PRIORITY.DIALOG);
                    }

                    GameManager.checkTriggerAll();
                    break;
                case COLLIDER_NAME.NPC_WISE_MAN:
                    GameManager.isGamePause = true;
                    GameManager.scriptPlayer.scriptCharacterRigid.stopMove();
                    GameManager.scriptPlayer.scriptPlayerModel.playAni(Constant.PLAYER_ANI_TYPE.IDLE, true);
                    if (PlayerData.instance.isPlayerSkillAllUnlock) {
                        UIManager.instance.showTips("所有技能均已解锁");
                        PoolManager.instance.putNode(this.node);
                        GameManager.isGamePause = false;
                    } else {
                        UIManager.instance.hideDialog("fight/fightPanel");
                        UIManager.instance.showDialog("skill/skillPanel", [() => {
                            PoolManager.instance.putNode(this.node);
                            GameManager.isGamePause = false;
                        }], () => { }, Constant.PRIORITY.DIALOG);
                    }

                    GameManager.checkTriggerAll();
                    break;
            }
        }
    }

    update (deltaTime: number) {
        if (GameManager.isGameOver || !GameManager.ndPlayer || !this.node.parent) {
            return;
        }

        if (this.colliderName === COLLIDER_NAME.HEART_BIG) {
            Quat.fromEuler(this._curHeartBigQuat, 0, 120 * deltaTime, 0);
            this.node.rotate(this._curHeartBigQuat);
        }
    }
}

