import { Util } from './../framework/util';
import { GameManager } from './gameManager';
import { _decorator, Component, Node, Vec3, Quat, ParticleSystemComponent, math, ITriggerEvent, BoxColliderComponent } from 'cc';
import { ResourceUtil } from '../framework/resourceUtil';
import { Constant } from '../framework/constant';
import { Monster } from './monster';
import { PoolManager } from '../framework/poolManager';
//单只弓箭脚本
const { ccclass, property } = _decorator;
@ccclass('Arrow')
export class Arrow extends Component {
    public set isAutoRotate (v: boolean) {
        this._isAutoRotate = v;
    }

    public get isAutoRotate () {
        return this._isAutoRotate;
    }

    public set isArrowLaunch (v: boolean) {
        this._isArrowLaunch = v;
    }

    public get isArrowLaunch () {
        return this._isArrowLaunch;
    }

    private _isAutoRotate: boolean = true;//箭是否自动调整角度
    private _isArrowLaunch: boolean = false;//箭是否弹射
    private _ndBody: Node = null!;//放弓箭特效的节点
    private _curSpeed: number = 0;//当前速度
    private _targetSpeed: number = 0;//目标速度
    private _oriPos: Vec3 = null!;//初始默认位置
    private _oriEulerAngles: Vec3 = null!//初始默认角度
    private _offsetPos: Vec3 = new Vec3();//和玩家之间的向量差
    private _curWorPos: Vec3 = new Vec3();//当前节点世界坐标
    private _disappearRange: number = 25;//箭节点超过玩家这个范围则隐藏
    private _isLoadEffectOver: boolean = false;//是否已经加载完所有特效
    private _isNeedShowEffect: boolean = false;//是否需要特效
    private _targetWorPos: Vec3 = new Vec3();//箭的下次目标位置
    private _curEulerAngles: Vec3 = new Vec3();//当前角度
    private _oriForward: Vec3 = null!;//初始朝向
    private _curForward: Vec3 = new Vec3();//当前朝向
    private _releaseWorPos: Vec3 = new Vec3();//技能释放位置的世界坐标
    private _offsetPos_1: Vec3 = new Vec3();//向量差
    private _offsetPos_2: Vec3 = new Vec3();//向量差
    private _cross: Vec3 = new Vec3();//两个向量叉乘
    private _colliderCom: BoxColliderComponent = null!;//

    onLoad () {
        this._colliderCom = this.node.getComponent(BoxColliderComponent) as BoxColliderComponent;
    }

    onEnable () {
        this._colliderCom.on('onTriggerEnter', this._onTriggerEnterCb, this);
    }

    onDisable () {
        this._colliderCom.off('onTriggerEnter', this._onTriggerEnterCb, this);
    }

    start () {
        // [3]
    }

    /**
    * 初始化 
    */
    public init (speed: number, releaseWorPos: Vec3, isPreload: boolean = false) {
        this._releaseWorPos.set(releaseWorPos);

        if (!this._ndBody) {
            this._ndBody = this.node.getChildByName("body") as Node;
        }

        this._isLoadEffectOver = false;
        this._isNeedShowEffect = false;
        this._disappearRange = isPreload ? 5 : 25;

        this.isArrowLaunch = false;

        if (!this._oriPos) {
            this._oriPos = this.node.position.clone();
        }

        if (!this._oriEulerAngles) {
            this._oriEulerAngles = this.node.eulerAngles.clone();
        }

        if (!this._oriForward) {
            this._oriForward = this.node.forward.clone();
        }

        this.node.active = false;
        this.node.setPosition(this._oriPos);
        this.node.eulerAngles = this._oriEulerAngles;
        this._curForward.set(this._oriForward);

        this._targetSpeed = speed;
        this._curSpeed = speed * 0.5;

        this._ndBody.children.forEach((ndChild: Node) => {
            if (ndChild.name.startsWith("arrow")) {
                ndChild.active = false;
            }
        })

        let isHasIce = GameManager.scriptPlayer.isArrowIce;
        let isHasFire = GameManager.scriptPlayer.isArrowFire;
        let isHasLightning = GameManager.scriptPlayer.isArrowLightning;

        //根据玩家拥有的不同技能展示对应特效
        if (isHasFire || isHasIce || isHasLightning) {
            this._isNeedShowEffect = true;

            if (isHasFire && isHasIce && isHasLightning) {
                this._showTrail("arrowAll");
            } else {
                if ((isHasFire && isHasIce) || (isHasFire && isHasLightning) || (isHasIce && isHasLightning)) {
                    if (isHasFire && isHasIce) {
                        this._showTrail("arrowFireIce");
                    } else if (isHasLightning && isHasFire) {
                        this._showTrail("arrowLightningFire");
                    } else if (isHasLightning && isHasIce) {
                        this._showTrail("arrowLightningIce");
                    }
                } else {
                    if (isHasFire) {
                        this._showTrail("arrowFire");
                    } else if (isHasIce) {
                        this._showTrail("arrowIce");
                    } else if (isHasLightning) {
                        this._showTrail("arrowLightning");
                    }
                }
            }
        } else {
            //不展示特效
            this._ndBody.children.forEach((ndChild: Node) => {
                if (ndChild.name.startsWith("arrow")) {
                    ndChild.active = false;
                }
            })

            this.node.active = true;
        }
    }

    /**
     * 展示箭的特效拖尾
     *
     * @private
     * @param {string} effectName
     * @memberof Arrow
     */
    private _showTrail (effectName: string) {
        let ndTrail: Node | null = this._ndBody.getChildByName(effectName);
        if (ndTrail) {
            ndTrail.active = true;
            this.node.active = true;
            this._isLoadEffectOver = true;
        } else {
            ResourceUtil.loadEffectRes(`arrow/${effectName}`).then((pf: any) => {
                ndTrail = PoolManager.instance.getNode(pf, this._ndBody);
                this.node.active = true;
                this._isLoadEffectOver = true;
            });
        }
    }

    /**
     *  回收弓箭组，在weapon/arrow下
     *
     * @memberof Arrow
     */
    public recycleArrowGroup () {
        if (this.node.parent) {
            PoolManager.instance.putNode(this.node.parent);
        }
    }

    /**
     * 击中目标,隐藏箭
     *
     * @memberof Arrow
     */
    public hideArrow () {
        if (!this.node.parent) {
            return;
        }

        //清除拖尾特效残留
        let arrParticle: ParticleSystemComponent[] = this._ndBody.getComponentsInChildren(ParticleSystemComponent);
        arrParticle.forEach((item: ParticleSystemComponent) => {
            item.simulationSpeed = 1;
            item?.clear();
            item?.stop();
        })

        this.node.active = false;

        //如果弓箭组里所有的箭都隐藏了则回收整个弓箭组
        let isAllArrowHide = this.node.parent?.children.every((ndArrow: Node) => {
            return ndArrow.active === false;
        })

        if (isAllArrowHide) {
            this.recycleArrowGroup();
        }
    }

    /**
     * 箭弹射给一定范围内的某个敌人
     *
     * @param {Node} ndMonster
     * @memberof Arrow
     */
    public playArrowLaunch (ndMonster: Node) {
        this.isArrowLaunch = true;

        let arrTargets = GameManager.getNearbyMonster(ndMonster);

        if (arrTargets.length) {
            let ndTarget = arrTargets[0];
            this._offsetPos_1.set(this._releaseWorPos.x - this.node.worldPosition.x, 0, this._releaseWorPos.z - this.node.worldPosition.z);
            this._offsetPos_2.set(this.node.worldPosition.x - ndTarget.worldPosition.x, 0, this.node.worldPosition.z - ndTarget.worldPosition.z);
            //两个向量之间弧度
            let radian = Vec3.angle(this._offsetPos_1, this._offsetPos_2);
            //角度
            let angle = math.toDegree(radian);
            //叉乘
            Vec3.cross(this._cross, this._offsetPos_1, this._offsetPos_2);
            //判断正反角度
            if (this._cross.y > 0) {
                this._curEulerAngles.y = angle;
            } else {
                this._curEulerAngles.y = -angle;
            }

            this.node.eulerAngles = this._curEulerAngles;
        }
    }

    private _onTriggerEnterCb (event: ITriggerEvent) {
        // this._hitTarget(event.otherCollider, event.selfCollider);
        if (GameManager.isGameOver || !GameManager.isGameStart) {
            return;
        }

        let otherCollider = event.otherCollider;

        if (otherCollider.getGroup() === Constant.PHY_GROUP.OBSTACLE) {
            //箭碰到游戏中的障碍则回收
            let scriptArrow = this.node.getComponent(Arrow) as Arrow;
            scriptArrow.hideArrow();

        } else if (otherCollider.getGroup() === Constant.PHY_GROUP.MONSTER) {
            //箭碰到敌人
            let ndMonster = otherCollider.node as Node;
            let scriptMonster = ndMonster.getComponent(Monster) as Monster;
            let scriptArrow = this.node.getComponent(Arrow) as Arrow;

            //箭是否弹射
            if (GameManager.scriptPlayer.isArrowLaunch) {
                if (!scriptArrow.isArrowLaunch) {
                    //第一次弹射
                    scriptArrow.playArrowLaunch(ndMonster);
                } else {
                    //第二次直接隐藏
                    scriptArrow.hideArrow();
                }
            } else if (GameManager.scriptPlayer.isArrowPenetrate) {
                //箭穿透
            } else {
                scriptArrow.hideArrow();
            }

            scriptMonster.playHit(scriptArrow.isArrowLaunch);

            //龙被射到龙改变颜色
            if (ndMonster.name === "dragon") {
                //@ts-ignore

                scriptMonster.changeDragonMat();
            }
        }
    }

    update (deltaTime: number) {
        if (!this.node.parent || !GameManager.ndPlayer || GameManager.isGameOver || GameManager.isGamePause || (this._isNeedShowEffect && !this._isLoadEffectOver)) {
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
            this.hideArrow();
        }
    }
}