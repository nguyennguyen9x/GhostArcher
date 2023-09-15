import { AudioManager } from './../framework/audioManager';
import { Util } from './../framework/util';
import { LocalConfig } from './../framework/localConfig';
import { EffectManager, loadAndPlayEffectOptions } from './../framework/effectManager';
import { UIManager } from './../framework/uiManager';
import { _decorator, Component, Vec3, macro, Node, Quat, Material, MeshRenderer, SkinnedMeshBatchRenderer, SkinnedMeshRenderer, tween } from 'cc';
import { Constant } from '../framework/constant';
import { GameManager } from './gameManager';
import { MonsterBloodBar } from '../ui/fight/monsterBloodBar';
import { ClientEvent } from '../framework/clientEvent';
import { MonsterModel } from './monsterModel';
import { ResourceUtil } from '../framework/resourceUtil';
import { EnergyBall } from './monsterSkill/energyBall';
import { FireBall } from './monsterSkill/fireBall';
import { DispersionSurround } from './monsterSkill/dispersionSurround';
import { Dispersion } from './monsterSkill/dispersion';
import { FireBallBig } from './monsterSkill/fireBallBig';
import { Tornado } from './monsterSkill/tornado';
import { Laser } from './monsterSkill/laser';
import { CharacterRigid } from './characterRigid';
import { PoolManager } from '../framework/poolManager';
let qt_0 = new Quat();
let v3_0 = new Vec3();

const { ccclass, property } = _decorator;
//普通怪物脚本
@ccclass('Monster')
export class Monster extends Component {
    @property(Material)
    public matNormal: Material = null!;//默认材质

    @property(Material)
    public matDissolve: Material = null!;//阵亡时候溶解材质

    @property(SkinnedMeshRenderer)
    public skiMeshCom: SkinnedMeshRenderer = null!;//怪物蒙皮组件

    public set curMoveSpeed (v: number) {
        this._curMoveSpeed = v;
        this.scriptCharacterRigid.initSpeed(v, GameManager.moveSpeedAddition);
    }

    public get curMoveSpeed () {
        return this._curMoveSpeed;
    }

    public set isDie (v: boolean) {
        this._isDie = v;

        if (this._isDie) {
            this.showDie();
        }
    }

    public get isDie () {
        return this._isDie;
    }

    public set isMoving (v: boolean) {
        this._isMoving = v;
    }

    public get isMoving () {
        return this._isMoving;
    }

    public set scriptBloodBar (v: MonsterBloodBar) {
        this._scriptBloodBar = v;
    }

    public get scriptBloodBar () {
        return this._scriptBloodBar;
    }

    public set bloodTipDirection (v: number) {
        this._bloodTipDirection = v;
    }

    public get bloodTipDirection () {
        return this._bloodTipDirection;
    }

    public set skillInfo (v: any) {
        this._skillInfo = v;
    }

    public get skillInfo () {
        return this._skillInfo;
    }

    public set baseInfo (v: any) {
        this._baseInfo = v;
    }

    public get baseInfo () {
        return this._baseInfo;
    }

    public set layerInfo (v: any) {
        this._layerInfo = v;
    }

    public get layerInfo () {
        return this._layerInfo;
    }

    public set curAttackSpeed (v: any) {
        this._curAttackSpeed = v;
    }

    public get curAttackSpeed () {
        return this._curAttackSpeed;
    }

    public set scriptWarning (v: any) {
        this._scriptWarning = v;
    }

    public get scriptWarning () {
        return this._scriptWarning;
    }

    public set attackForward (v: Vec3) {
        this._attackForward = v;
    }

    public get attackForward () {
        return this._attackForward;
    }

    public set attackPos (v: Vec3) {
        this._attackPos = v;
    }

    public get attackPos () {
        return this._attackPos;
    }

    public set scriptCharacterRigid (v: CharacterRigid) {
        this._scriptCharacterRigid = v;
    }

    public get scriptCharacterRigid () {
        return this._scriptCharacterRigid;
    }

    protected _scriptCharacterRigid: CharacterRigid = null!;
    protected _attackPos: Vec3 = new Vec3();//技能即将攻击的位置
    protected _attackForward: Vec3 = new Vec3();//攻击朝向
    protected _scriptWarning: any = null!;//预警技能脚本
    protected _curAttackSpeed: number = 0;//当前攻击速度    
    protected _layerInfo: any = null!;//怪物在当前层级的配置数据
    protected _baseInfo: any = null!;//怪物在base表里面对应数据
    protected _skillInfo: any = null!;//技能信息
    protected _bloodTipDirection: number = Constant.BLOOD_TIP_DIRECTION.LEFT_UP;//血量提示方向
    protected _scriptBloodBar: MonsterBloodBar = null!;//关联的血条脚本
    protected _scriptMonsterModel: MonsterModel = null!;//怪物动画组件播放脚本
    protected _isMoving: boolean = false;//怪物是否正在移动
    protected _allSkillInfo: any = null!;//所有拥有的技能信息
    protected _isDie: boolean = false;//是否死亡
    protected _curAttackInterval: number = 0;//距离上次被攻击的时长
    protected _isHitByPlayer: boolean = false;//是否被玩家击中
    protected _isInitBloodBar: boolean = false;//是否已经初始化血条
    protected _bloodTipOffsetPos: Vec3 = new Vec3(0, 50, 0);//怪物血条距离人物位置偏差
    protected _hideBloodCountDown: number = 3;//怪物的血条被攻击后才会显示，且如果3秒未被攻击则会隐藏
    protected _hitEffectPos: Vec3 = new Vec3(0, 0.2, 0);//受击特效位置
    protected _isAllowToAttack: boolean = false;//是否允许攻击
    protected _playerMonsterOffset: Vec3 = new Vec3();//怪物和玩家间距
    protected _curAngleY: number = 0;//当前Y分量旋转角度
    protected _horizontal: number = 0;//水平移动距离
    protected _vertical: number = 0;//垂直移动距离
    protected _iceDamageCountDown: number = 0;//冰冻伤害倒计时
    protected _fireDamageCountDown: number = 0;//灼烧伤害倒计时
    protected _ndMonsterSkill: Node = null!;//技能特效节点
    protected _skillIndex: number = 0;//当前技能索引
    protected _minLength: number = 3;//怪物和玩家之间的最小距离
    protected _curMoveSpeed: number = 0;//当前移动速度
    protected _dissolveData: any = { uEdge: 1, time: 1 };//溶解数据，v溶解程度默认为1（0为完全溶解），time为溶解所需时间
    //移动相关
    protected _moveMode: number = 0;//移动方式
    protected _movePattern: number = 0;//移动模式
    protected _moveFrequency: number = 0;//两次移动间隔,为0表示一直移动)
    protected _offsetPos: Vec3 = new Vec3();//和玩家之间的向量差
    protected _offsetPos_2: Vec3 = new Vec3();//和玩家之间的向量差
    protected _mixOffset: Vec3 = new Vec3(1, 0, 1);//和玩家的最小间距
    protected _targetWorPos: Vec3 = new Vec3();//下一步的目标位置
    protected _isPlayRotate: boolean = false;//是否旋转
    protected _curAngle: Vec3 = new Vec3()//当前旋转的角度
    protected _curAngle_2: Vec3 = new Vec3();//怪物角度
    protected _tempAngle: Vec3 = new Vec3();//临时变量，怪物角度
    protected _rotateDirection: Vec3 = new Vec3();//旋转方向
    protected _forWard: Vec3 = new Vec3();//朝向
    protected _ndRunSmokeEffect: Node = null!;//烟雾特效
    protected _originAngle: Vec3 = new Vec3(0, -90, 0);//怪物开始角度
    protected _targetAngle: Vec3 = new Vec3();//目标旋转角度
    protected _checkInterval: number = 0.04;//每40ms刷新一次
    protected _currentTime: number = 0;//当前累积时间
    protected _ndBody: Node = null!;//
    protected _curMoveWorPos: Vec3 = new Vec3();//当前怪物移动位置
    protected _isArrived: boolean = false;//是否到达
    protected _checkMoveInterval: number = 0;//检查当前是否移动时间间隔
    protected _prevMoveWorPos: Vec3 = new Vec3();//之前怪物的移动坐标
    protected _moveUnit: Vec3 = new Vec3();//每次移动的单位向量
    protected _minLengthRatio: number = 1.1;//达到最小距离的1.1倍视为进入最小距离
    protected _randomMoveTryTimes: number = 5;//每次随机移动位置最多计算次数
    protected _action: number = 0;//怪物行为

    onEnable () {
        ClientEvent.on(Constant.EVENT_TYPE.MONSTER_MOVE, this._monsterMove, this);
    }

    onDisable () {
        ClientEvent.off(Constant.EVENT_TYPE.MONSTER_MOVE, this._monsterMove, this);

        //回收血条节点
        if (this.scriptBloodBar) {
            if (this.scriptBloodBar.node.parent) {
                PoolManager.instance.putNode(this.scriptBloodBar.node);
            }
            this.scriptBloodBar = null!;
        }

        //回收预警节点
        this.recycleWarning();

        //回收技能节点
        if (this._ndMonsterSkill) {
            PoolManager.instance.putNode(this._ndMonsterSkill);
            this._ndMonsterSkill = null!;
        }
    }

    start () {
        // [3]
    }

    public init (baseInfo: any, layerInfo: any) {
        this.baseInfo = baseInfo;
        this.layerInfo = layerInfo;
        this.isDie = false;

        this.recycleWarning();
        this.skiMeshCom.setMaterial(this.matNormal, 0);

        this._ndBody = this.node.getChildByName("body") as Node;
        this._scriptMonsterModel = this._ndBody.getComponent(MonsterModel) as MonsterModel;
        this._scriptMonsterModel.playAni(Constant.MONSTER_ANI_TYPE.IDLE, true);

        this.scriptCharacterRigid = this.node.getComponent(CharacterRigid) as CharacterRigid;
        this.scriptCharacterRigid.stopMove();

        this._curAttackInterval = 0;
        this._isHitByPlayer = false;
        this._isInitBloodBar = false;
        this._isAllowToAttack = false;
        this._isArrived = false;
        this._checkMoveInterval = 0;
        this._iceDamageCountDown = 0;
        this._fireDamageCountDown = 0;
        this._ndMonsterSkill = null!;
        this._skillIndex = 0;
        this._moveUnit.set(0, 0, 0);
        this._movePattern = layerInfo.movePattern ? layerInfo.movePattern : this.baseInfo.movePattern;
        this._dissolveData.uEdge = 1;

        this.scriptBloodBar = null!;

        this._refreshSkill();

        this._scriptMonsterModel.scriptMonster = this;

        this.curAttackSpeed = this.baseInfo.attackSpeed;
        this.curMoveSpeed = this.baseInfo.moveSpeed;

        this._getMinLength();
    }

    /**
     * 获取怪物和玩家之间的最小距离
     *
     * @memberof Monster
     */
    protected _getMinLength () {
        if (this.node.name === "aula") {
            this._minLength = 2;
            this._dissolveData.time = 3.33;
        } else if (this.node.name === "boomDragon") {
            this._minLength = 2;
            this._dissolveData.time = 0.87;
        } else if (this.node.name === "hellFire") {
            this._minLength = 2.5;
            this._dissolveData.time = 1.06;
        } else if (this.node.name === "magician") {
            this._minLength = 2.5;
            this._dissolveData.time = 0.87;
        } else if (this.node.name === "dragon") {
            this._minLength = 5;
            this._dissolveData.time = 2;
        }
    }

    /**
     * 刷新当前使用技能
     *
     * @private
     * @memberof Monster
     */
    protected _refreshSkill () {
        this._allSkillInfo = this.layerInfo.skill === "" ? [] : this.layerInfo.skill.split("#");
        if (this._allSkillInfo.length) {
            this._skillIndex = this._skillIndex >= this._allSkillInfo.length ? 0 : this._skillIndex;
            let skillID = this._allSkillInfo[this._skillIndex];
            this.skillInfo = LocalConfig.instance.queryByID("monsterSkill", skillID);
            this._skillIndex += 1;
        }
    }

    /**
     * 怪物阵亡
     *
     * @memberof Monster
     */
    public showDie () {
        this.scriptCharacterRigid.stopMove();

        this.recycleWarning();

        AudioManager.instance.playSound(`${this.node.name}Die`);

        GameManager.showRewardBounce(this.node, "gold/gold", this.baseInfo.goldNum, () => {
            if (this.baseInfo.heartDropRate >= Math.random()) {
                GameManager.showRewardBounce(this.node, "heart/heart", 1);
            }
        });

        //检查玩家是否拥有嗜血技能：主角击杀敌人时回复自身生命上限2%的生命值。
        if (GameManager.scriptPlayer.isBloodthirsty) {
            let bloodNum = GameManager.scriptPlayer.curHpLimit * 0.02;
            GameManager.scriptPlayer.addBlood(bloodNum);
        }

        //溶解效果
        this.skiMeshCom.setMaterial(this.matDissolve, 0);
        tween(this._dissolveData)
            .to(this._dissolveData.time, { uEdge: 0.1 })
            .start();

        this._scriptMonsterModel.playAni(Constant.MONSTER_ANI_TYPE.DIE, false, () => {
            if (this.isDie) {
                if (GameManager.ndBoss) {
                    GameManager.ndBoss = null!;
                }

                if (this.scriptBloodBar) {
                    this.scriptBloodBar = null!
                }

                PoolManager.instance.putNode(this.node);
            }
        });
    }

    public recycleWarning () {
        //回收预警节点
        if (this.scriptWarning) {
            if (this.scriptWarning.node.parent) {
                PoolManager.instance.putNode(this.scriptWarning.node);
            }
            this.scriptWarning = null!;
        }
    }

    /**
     * 怪物播放受击效果
     *
     * @param {boolean} isArrowLaunch 是否被弹射的弓箭射中，如果是则造成普通伤害
     * @param {boolean} isPassiveLightning 是否被动受到电击
     * @return {*} 
     * @memberof Monster
     */
    public playHit (isArrowLaunch: boolean = false, isPassiveLightning: boolean = false) {
        if (this.isDie) {
            return;
        }

        AudioManager.instance.playSound(Constant.SOUND.HIT_MONSTER);

        //播放受击特效
        let effectPath = "hit/hit";
        let arrEffectPath: any = [];
        let recycleTime = 1.2;

        let isHasIce = GameManager.scriptPlayer.isArrowIce;
        let isHasFire = GameManager.scriptPlayer.isArrowFire;
        let isHasLightning = GameManager.scriptPlayer.isArrowLightning;

        if (isHasFire || isHasIce || isHasLightning) {
            if (isHasFire && isHasIce && isHasLightning) {
                arrEffectPath = ["hit/hitFire", "hit/hitIce", "hit/hitLightning"];
            } else {
                if (isHasFire && isHasIce || isHasFire && isHasLightning || isHasIce && isHasLightning) {
                    if (isHasFire && isHasIce) {
                        arrEffectPath = ["hit/hitFire", "hit/hitIce"];
                    } else if (isHasLightning && isHasFire) {
                        arrEffectPath = ["hit/hitFire", "hit/hitLightning"];
                    } else if (isHasLightning && isHasIce) {
                        arrEffectPath = ["hit/hitIce", "hit/hitLightning"];
                    }
                } else {
                    if (isHasFire) {
                        arrEffectPath = ["hit/hitFire"];
                    } else if (isHasIce) {
                        arrEffectPath = ["hit/hitIce"];
                    } else if (isHasLightning) {
                        arrEffectPath = ["hit/hitLightning"];
                    }
                }
            }

            effectPath = arrEffectPath[Math.floor(Math.random() * arrEffectPath.length)];

            if (effectPath === "hit/hitFire") {
                //灼烧技能持续2秒
                recycleTime = 2;
            } else if (effectPath === "hit/hitIce") {
                recycleTime = 1;
            }

            //被冰冻技能击中
            if (isHasIce && this._iceDamageCountDown <= 0) {
                this._iceDamageCountDown = 1;
            }

            //被灼烧技能击中
            if (isHasFire && this._fireDamageCountDown <= 0) {
                this._fireDamageCountDown = 2;
            }
        }

        let options: loadAndPlayEffectOptions = { effectPath: effectPath, ndTarget: this.node, pos: this._hitEffectPos, isPlayAnimation: false, speed: GameManager.gameSpeed, isRecycle: true, recycleTime: recycleTime };
        EffectManager.instance.loadAndPlayEffect(options);

        //攻击的时候霸体状态
        if (!this._scriptMonsterModel.isAttacking) {
            this._scriptMonsterModel.playAni(Constant.MONSTER_ANI_TYPE.HIT);
        }

        //受到攻击的敌人会向身旁一定范围内的所有敌人发射闪电，减少生命上限5%的生命值
        if (GameManager.scriptPlayer.isArrowLightning && !isPassiveLightning) {
            let arrTargets = GameManager.getNearbyMonster(this.node, true);

            if (arrTargets) {
                arrTargets.forEach((ndChild: Node) => {
                    EffectManager.instance.showLightningChain(this.node, ndChild);
                    let scriptMonster = ndChild.getComponent(Monster) as Monster;
                    scriptMonster.playHit(false, true);
                })
            }
        }

        //怪物扣血
        if (Math.random() > this.baseInfo.dodgeRate) {
            //闪避失败
            let tipType = Constant.FIGHT_TIP.REDUCE_BLOOD;
            let damage = GameManager.scriptPlayer.curAttackPower * (1 - this.baseInfo.defensePower * GameManager.defenseAddition / (this.baseInfo.defensePower + 400));
            let isCriticalHit = Math.random() <= GameManager.scriptPlayer.curCriticalHitRate;//是否暴击
            //是否暴击
            if (isCriticalHit) {
                //不是被弹射的箭击中，且不是被动受到电击
                if (!isArrowLaunch && !isPassiveLightning) {
                    damage = damage * GameManager.scriptPlayer.curCriticalHitDamage;
                    tipType = Constant.FIGHT_TIP.CRITICAL_HIT;
                }
            }

            if (isPassiveLightning) {
                damage = this.baseInfo.hp * 0.05 * (1 - this.baseInfo.defensePower / (this.baseInfo.defensePower + 400));
            }

            this.refreshBlood(-damage, tipType);
        }
    }

    /**
     * 刷新血量
     *
     * @private
     * @param {number} bloodNum
     * @memberof Monster
     */
    public refreshBlood (bloodNum: number, tipType: number) {
        let cb = () => {
            this.scriptBloodBar.refreshBlood(bloodNum);
            UIManager.instance.showBloodTips(this, tipType, bloodNum, this._bloodTipOffsetPos);
        }

        this._curAttackInterval = 0;

        if (!this._isInitBloodBar) {
            this._isInitBloodBar = true;
            console.log("###小怪生成新的血条", this.node.name);
            UIManager.instance.showMonsterBloodBar(this, this.baseInfo.hp, GameManager.hpAddition, () => {
                cb();
            });
        } else {
            if (this.scriptBloodBar) {
                this.scriptBloodBar.node.active = true;
                cb();
            }
        }
    }

    /**
     * 怪物行为
     *
     * @param {*} obj
     * @memberof Player
     */
    public playAction (obj: any) {
        this._action = obj.action;

        switch (obj.action) {
            case Constant.MONSTER_ACTION.MOVE://向目标位置移动
                let angle = obj.value + 135;
                let radian = angle * macro.RAD;
                this._horizontal = Math.round(Math.cos(radian) * 1);
                this._vertical = Math.round(Math.sin(radian) * 1);
                this._curAngleY = obj.value;
                this._curAngleY = this._curAngleY < 0 ? this._curAngleY + 360 : this._curAngleY > 360 ? this._curAngleY - 360 : this._curAngleY;
                this.isMoving = true;
                break;
            case Constant.MONSTER_ACTION.STOP_MOVE://停止移动，原地转向玩家，攻击玩家
                let angle_1 = obj.value + 135;
                let radian_1 = angle_1 * macro.RAD;
                this._horizontal = Math.round(Math.cos(radian_1) * 1);
                this._vertical = Math.round(Math.sin(radian_1) * 1);
                this._curAngleY = obj.value;
                this._curAngleY = this._curAngleY < 0 ? this._curAngleY + 360 : this._curAngleY > 360 ? this._curAngleY - 360 : this._curAngleY;
                this.isMoving = false;
                this.scriptCharacterRigid.stopMove();

                if (GameManager.ndPlayer) {
                    this._attackPlayer();
                } else {
                    this._scriptMonsterModel.playAni(Constant.MONSTER_ANI_TYPE.IDLE, true);
                }
                break;
            default:
                break;
        }
    }

    /**
     * 攻击玩家
    */
    protected _attackPlayer () {
        if (GameManager.scriptPlayer.isDie || this._scriptMonsterModel.isAttacking) {
            return;
        }

        Vec3.subtract(this._offsetPos_2, GameManager.ndPlayer.worldPosition, this.node.worldPosition);
        let length = this._offsetPos_2.length();
        this.attackForward = this._offsetPos_2.normalize().negative();
        this.attackForward.y = 0;
        this.attackPos.set(GameManager.ndPlayer.worldPosition);

        //预警
        if (this._allSkillInfo.length && this.skillInfo && this.skillInfo.warning) {
            let scale = 1;
            if (this.skillInfo.ID === Constant.MONSTER_SKILL.FIRE_BALL) {
                scale = 0.1;
            } else if (this.skillInfo.ID === Constant.MONSTER_SKILL.FIRE_BALL_BIG) {
                scale = 0.4;
            } else if (this.skillInfo.ID === Constant.MONSTER_SKILL.LASER) {
                scale = 3;
            } else if (this.skillInfo.ID === Constant.MONSTER_SKILL.ENERGY_BALL) {
                scale = length;
            }

            //回收预警节点
            this.recycleWarning();

            EffectManager.instance.showWarning(this.skillInfo.warning, scale, this).then(() => {
                this.playAttackAni();
            });
        } else {
            this.playAttackAni();
        }
    }

    /**
     * 播放攻击动画
     *
     * @protected
     * @memberof Monster
     */
    public playAttackAni () {
        let attackAniName = Constant.MONSTER_ANI_TYPE.ATTACK;
        if (this.baseInfo.resName === "hellFire") {
            //hellFire的攻击动画有两个，其他小怪动画只有一个
            if (!this._allSkillInfo.length) {
                //近战
                attackAniName = Constant.MONSTER_ANI_TYPE.ATTACK_1;
            } else {
                //远程
                attackAniName = Constant.MONSTER_ANI_TYPE.ATTACK_2;
            }
        }

        //远程
        if (this._allSkillInfo.length) {
            this._scriptMonsterModel.playAni(attackAniName, false, () => {
                if (!this.isDie && !this._scriptMonsterModel.isHitting) {
                    this._scriptMonsterModel.playAni(Constant.MONSTER_ANI_TYPE.IDLE, true);
                    this.scheduleOnce(() => {
                        this._monsterMove()
                    }, this.baseInfo.moveFrequency)
                }
            });
        } else {
            //近战
            let offsetLength = Util.getTwoNodeXZLength(this.node, GameManager.ndPlayer);
            if (offsetLength <= this._minLength * this._minLengthRatio) {
                this._scriptMonsterModel.playAni(attackAniName, false, () => {
                    if (!this.isDie && !this._scriptMonsterModel.isHitting) {
                        this._scriptMonsterModel.playAni(Constant.MONSTER_ANI_TYPE.IDLE, true);
                        this.scheduleOnce(() => {
                            this._monsterMove()
                        }, this.baseInfo.moveFrequency)
                    }
                });
            } else {
                if (!this.isDie && !this._scriptMonsterModel.isHitting) {
                    this._scriptMonsterModel.playAni(Constant.MONSTER_ANI_TYPE.IDLE, true);
                    this.scheduleOnce(() => {
                        this._monsterMove()
                    }, this.baseInfo.moveFrequency)
                }
            }
        }
    }

    /**
     * 移动到随机位置
     *
     * @private
     * @memberof Monster
     */
    private _moveToRandomPos () {
        this._randomMoveTryTimes -= 1;
        //随机移动：先以怪物圆环区间(1, minLength)随机移动,再朝向玩家,然后攻击
        let x = Util.getRandom(1, 3) * Util.getRandomDirector();
        let z = Util.getRandom(1, 3) * Util.getRandomDirector();
        this._targetWorPos.set(Util.toFixed(this.node.worldPosition.x + x), Util.toFixed(this.node.worldPosition.y), Util.toFixed(this.node.worldPosition.z + z));

        let offsetLength = Util.getTwoPosXZLength(this._targetWorPos.x, this._targetWorPos.z, GameManager.ndPlayer.worldPosition.x, GameManager.ndPlayer.worldPosition.z);
        //当目标位置和玩家大于最小距离，进行移动
        if (offsetLength > this._minLength) {
            Vec3.subtract(this._offsetPos, this._targetWorPos, this.node.worldPosition);
            this._offsetPos.y = 0;
            Vec3.normalize(this._moveUnit, this._offsetPos);

            this._moveToTargetWorPos(this._targetWorPos);
            this.isMoving = true;
            this._isArrived = false;
        } else {
            //否则尝试5次随机移动，都没合适的位置则进行进攻
            if (this._randomMoveTryTimes <= 0) {
                this._stayRotateAttack();
            } else {
                this._moveToRandomPos();
            }
        }
    }

    /**
     * 先移动
     *
     * @private
     * @memberof Monster
     */
    protected _monsterMove () {
        if (this.isDie) {
            return;
        }

        if (!this._isAllowToAttack) {
            this._isAllowToAttack = true;
        }

        if (this._movePattern === Constant.MONSTER_MOVE_PATTERN.NO_MOVE) {
            //不移动，原地攻击玩家
            this._stayRotateAttack();
        } else if (this._movePattern === Constant.MONSTER_MOVE_PATTERN.RANDOM) {
            this._randomMoveTryTimes = 5;
            this._moveToRandomPos();
        } else if (this._movePattern === Constant.MONSTER_MOVE_PATTERN.FORWARD_PLAYER) {
            //面向玩家移动：先面向玩家，再移动，然后攻击
            this._moveToTargetWorPos(GameManager.ndPlayer.worldPosition);
            Vec3.subtract(this._offsetPos, GameManager.ndPlayer.worldPosition, this.node.worldPosition);
            this._offsetPos.y = 0;

            let offsetLength = Util.getTwoNodeXZLength(this.node, GameManager.ndPlayer);
            //当怪物和玩家小于2个最小距离之和或者大于一个最小距离且小于两个最小距离，进行移动
            if (offsetLength > this._minLength * 2 || (offsetLength > this._minLength && offsetLength < this._minLength * 2)) {
                //单位向量
                Vec3.normalize(this._moveUnit, this._offsetPos);
                Vec3.multiplyScalar(this._offsetPos, this._moveUnit, this._minLength);

                if (offsetLength > this._minLength * 2) {
                    //向玩家移动2个单位向量
                    Vec3.add(this._targetWorPos, this.node.worldPosition, this._offsetPos);
                } else {
                    Vec3.subtract(this._targetWorPos, GameManager.ndPlayer.worldPosition, this._offsetPos);
                }

                this._targetWorPos.set(Util.toFixed(this._targetWorPos.x), Util.toFixed(this.node.worldPosition.y), Util.toFixed(this._targetWorPos.z));
                this._isArrived = false;
                this.isMoving = true;
            } else {
                //与玩家相距小于等于最小距离，怪物原地进行攻击
                this._stayRotateAttack();
            }
        }
    }

    /**
     * 怪物向目标位置移动
     *
     * @private
     * @memberof Monster
     */
    protected _moveToTargetWorPos (targetWorPos: Vec3) {
        let angleY = this._getTwoPosAngleY(this.node.worldPosition, targetWorPos);
        this.playAction({ action: Constant.MONSTER_ACTION.MOVE, value: angleY });
    }

    protected _getTwoPosAngleY (selfWorPos: Vec3, targetWorPos: Vec3) {
        let targetScreenPos = GameManager.mainCamera?.worldToScreen(targetWorPos) as Vec3;
        let selfScreenPos = GameManager.mainCamera?.worldToScreen(selfWorPos) as Vec3;
        Vec3.subtract(this._playerMonsterOffset, targetScreenPos, selfScreenPos);
        let angleY = Math.round(Math.atan2(this._playerMonsterOffset.y, this._playerMonsterOffset.x) * 180 / Math.PI);
        return angleY;
    }

    /**
     * 怪物原地不动-旋转角度朝向玩家-攻击玩家
     *
     * @protected
     * @memberof Monster
     */
    protected _stayRotateAttack () {
        let angleY = this._getTwoPosAngleY(this.node.worldPosition, GameManager.ndPlayer.worldPosition);
        this.playAction({ action: Constant.MONSTER_ACTION.STOP_MOVE, value: angleY });
    }

    /**
     * 向玩家释放技能
     *
     * @returns
     * @memberof Player
     */
    public releaseSkillToPlayer (isNormalAttack?: boolean) {
        //没有技能则使用近战
        if (!this._allSkillInfo.length) {
            let offsetLength = Util.getTwoNodeXZLength(this.node, GameManager.ndPlayer);
            if (offsetLength <= this._minLength * this._minLengthRatio) {
                GameManager.scriptPlayer.reduceBlood(this.baseInfo);
            }
            return;
        }

        //加载对应技能
        ResourceUtil.loadEffectRes(`${this.skillInfo.resName}/${this.skillInfo.resName}`).then((prefab: any) => {
            if (this.isMoving) {
                return;
            }
            this._ndMonsterSkill = PoolManager.instance.getNode(prefab, GameManager.ndGameManager as Node) as Node;
            this._ndMonsterSkill.setWorldPosition(this.node.worldPosition.x, 2.5, this.node.worldPosition.z);
            this._ndMonsterSkill.forward = this.attackForward.negative();

            let scriptSkillCollider: any = null!;

            //怪物技能初始化
            switch (this.skillInfo.ID) {
                case Constant.MONSTER_SKILL.ENERGY_BALL:
                    scriptSkillCollider = this._ndMonsterSkill.getComponent(EnergyBall) as EnergyBall;
                    scriptSkillCollider.init(this.skillInfo, this.baseInfo, this);
                    break;
                case Constant.MONSTER_SKILL.FIRE_BALL:
                    scriptSkillCollider = this._ndMonsterSkill.getComponent(FireBall) as FireBall;
                    scriptSkillCollider.init(this.skillInfo, this.baseInfo, this);
                    break;
                case Constant.MONSTER_SKILL.DISPERSION:
                    this._ndMonsterSkill.children.forEach((ndChild: Node, idx: number) => {
                        let scriptSkillCollider = ndChild.getComponent(Dispersion) as Dispersion;
                        scriptSkillCollider.init(this.skillInfo, this.baseInfo);
                    })
                    break;
                case Constant.MONSTER_SKILL.TORNADO:
                    scriptSkillCollider = this._ndMonsterSkill.getComponent(Tornado) as Tornado;
                    scriptSkillCollider.init(this.skillInfo, this.baseInfo, this);
                    break;
                case Constant.MONSTER_SKILL.FIRE_BALL_BIG:
                    scriptSkillCollider = this._ndMonsterSkill.getComponent(FireBallBig) as FireBallBig;
                    scriptSkillCollider.init(this.skillInfo, this.baseInfo, this);
                    break;
                case Constant.MONSTER_SKILL.DISPERSION_SURROUND:
                    this._ndMonsterSkill.children.forEach((ndChild: Node) => {
                        let scriptSkillCollider = ndChild.getComponent(DispersionSurround) as DispersionSurround;
                        scriptSkillCollider.init(this.skillInfo, this.baseInfo);
                    })
                    break;
                case Constant.MONSTER_SKILL.LASER:
                    scriptSkillCollider = this._ndMonsterSkill.getComponent(Laser) as Laser;
                    scriptSkillCollider.init(this.skillInfo, this.baseInfo, this);
                    break;
            }

            this._refreshSkill();
        })
    }

    update (deltaTime: number) {
        //刷新溶解材质
        if (this.isDie && this._dissolveData.uEdge > 0.1) {
            this.matDissolve.setProperty("uEdge", this._dissolveData.uEdge);
            return;
        }

        if (!GameManager.isGameStart || GameManager.isGameOver || GameManager.isGamePause || this.isDie || !this._isAllowToAttack || !GameManager.scriptPlayer || GameManager.scriptPlayer.isDie) {
            return;
        }

        //3秒未被攻击则会隐藏血条
        if (!this._isHitByPlayer && this.scriptBloodBar) {
            this._curAttackInterval += deltaTime;

            if (this._curAttackInterval >= this._hideBloodCountDown && this.scriptBloodBar.node.active) {
                this.scriptBloodBar.node.active = false;
            }
        }

        //是否进行移动
        if (this.isMoving) {
            if (this._movePattern === Constant.MONSTER_MOVE_PATTERN.RANDOM) {
                //如果移动到目标位置就停止移动
                let offsetLength = Util.getTwoPosXZLength(this.node.worldPosition.x, this.node.worldPosition.z, this._targetWorPos.x, this._targetWorPos.z);
                let offsetTarget = 0.05;

                //爆炸龙的位移是跳，不容易精准到达目标位置,把达到范围适当增大
                if (this.baseInfo.resName === 'boomDragon') {
                    offsetTarget = 0.5;
                }

                if (offsetLength <= offsetTarget && !this._isArrived) {
                    // console.log("###随机移动，到达目标位置");
                    this._isArrived = true;
                    this._stayRotateAttack();
                }

                // console.log("随机移动");
            } else if (this._movePattern === Constant.MONSTER_MOVE_PATTERN.FORWARD_PLAYER) {

                let offsetLength = Util.getTwoPosXZLength(this.node.worldPosition.x, this.node.worldPosition.z, this._targetWorPos.x, this._targetWorPos.z);
                if (offsetLength <= 0.05 && !this._isArrived) {
                    // console.log("###面向玩家移动，到达目标位置");
                    // 进行攻击
                    this._isArrived = true;
                    this._stayRotateAttack();
                }

                // console.log("朝向玩家移动");
            }
        }

        //怪物旋转
        if (this._isPlayRotate) {
            //当前怪物角度
            this._tempAngle.set(this.node.eulerAngles);
            this._tempAngle.y = this._tempAngle.y < 0 ? this._tempAngle.y + 360 : this._tempAngle.y;

            if (this._curAngle.length() === 0) {
                this._curAngle.set(this._tempAngle);
            }

            this.node.eulerAngles = this._tempAngle;
            //第二个参数越小朝向越精确
            let isEqual = this._curAngle.equals(this._targetAngle, 0.01);

            if (!isEqual) {
                Vec3.lerp(this._curAngle, this._curAngle, this._targetAngle, 0.167);
                this.node.eulerAngles = this._curAngle;
            } else {
                this._isPlayRotate = false;
                this.node.eulerAngles = this._targetAngle;
                this._curAngle.set(0, 0, 0);
            }
        }

        if (this._horizontal !== 0 || this._vertical !== 0) {
            //计算出旋转角度
            this._rotateDirection.set(this._horizontal, 0, -this._vertical);
            this._rotateDirection = this._rotateDirection.normalize();

            Quat.fromViewUp(qt_0, this._rotateDirection);
            Quat.toEuler(v3_0, qt_0);
            v3_0.y = v3_0.y < 0 ? v3_0.y + 360 : v3_0.y;

            this._isPlayRotate = true;

            //设置当前怪物角度为正数
            this._curAngle_2.set(this.node.eulerAngles);
            if (this._curAngle_2.y < 0) {
                this._curAngle_2.y += 360;
                this.node.eulerAngles = this._curAngle_2; // 转为0~360
            } else if (this._curAngle_2.y > 360) {
                this._curAngle_2.y -= 360;
                this.node.eulerAngles = this._curAngle_2; // 转为0~360
            }

            //设置目标旋转角度
            if (!v3_0.equals(this.node.eulerAngles, 0.01)) {
                this._targetAngle.y = this._curAngleY + 225;
                this._targetAngle.y = this._targetAngle.y < 0 ? this._targetAngle.y + 360 : this._targetAngle.y > 360 ? this._targetAngle.y - 360 : this._targetAngle.y;
                this._targetAngle.x = 0;
                this._targetAngle.z = 0;

                if (Math.abs(this._targetAngle.y - this._curAngle_2.y) > 180) {
                    if (this._targetAngle.y > this._curAngle_2.y) {
                        this._targetAngle.y -= 360;
                    } else {
                        this._targetAngle.y += 360;
                    }
                }

                //每次有新的_targetAngle之后，先将_curAngle初始化
                this._curAngle.set(0, 0, 0);
            } else {
                this._isPlayRotate = false;
                this.node.eulerAngles = v3_0;
            }

            if (!this.isMoving) {
                return;
            }

            //怪物朝着目标位置移动：
            if (this._movePattern !== Constant.MONSTER_MOVE_PATTERN.NO_MOVE) {
                this.scriptCharacterRigid.move(-this._moveUnit.x * this.curMoveSpeed * GameManager.moveSpeedAddition * 0.5 * deltaTime, -this._moveUnit.z * this.curMoveSpeed * GameManager.moveSpeedAddition * 0.5 * deltaTime);
            }

            if (!this._scriptMonsterModel.isRunning && this._movePattern !== Constant.MONSTER_MOVE_PATTERN.NO_MOVE && this._action !== Constant.MONSTER_ACTION.STOP_MOVE) {
                this._scriptMonsterModel.playAni(Constant.MONSTER_ANI_TYPE.RUN, true);
            }
        } else {
            if (!this.isDie && !this._scriptMonsterModel.isIdle && !this._scriptMonsterModel.isAttacking && !this._scriptMonsterModel.isHitting) {
                this._scriptMonsterModel.playAni(Constant.MONSTER_ANI_TYPE.IDLE, true);
                this.scriptCharacterRigid.stopMove();
            }
        }

        //冰冻持续降低攻击力和伤害
        if (this._iceDamageCountDown > 0) {
            this._iceDamageCountDown -= deltaTime;
            this.curAttackSpeed = this.baseInfo.attackSpeed * (1 - 0.1);
            this.curMoveSpeed = this.baseInfo.moveSpeed * (1 - 0.5);

            if (this._iceDamageCountDown <= 0) {
                this.curAttackSpeed = this.baseInfo.attackSpeed;
                this.curMoveSpeed = this.baseInfo.moveSpeed;
            }
        }

        //灼烧持续扣血
        if (this._fireDamageCountDown > 0) {
            this._fireDamageCountDown -= deltaTime;

            let countDown = Number((this._fireDamageCountDown).toFixed(2))
            countDown = countDown * 100 % 50;
            if (countDown === 0) {
                let bloodNum = this.baseInfo.hp * 0.05;
                this.refreshBlood(-bloodNum, Constant.FIGHT_TIP.REDUCE_BLOOD);
            }
        }

        //检查当前是否碰到障碍或者其他物体导致无法达到目标位置
        if (this._movePattern !== Constant.MONSTER_MOVE_PATTERN.NO_MOVE && !this._isArrived) {
            this._checkMoveInterval += deltaTime;
            if (this._checkMoveInterval >= 0.2) {
                this._checkMoveInterval = 0;

                let length = Util.getTwoPosXZLength(this._prevMoveWorPos.x, this._prevMoveWorPos.z, this.node.worldPosition.x, this.node.worldPosition.z);
                if (this._scriptMonsterModel.isRunning && length <= 0.01) {
                    this._stayRotateAttack();
                    // console.log("###碰到障碍, 停止移动");
                } else {
                    this._prevMoveWorPos.set(this.node.worldPosition);
                }
            }
        }
    }
}
