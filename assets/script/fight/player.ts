import { MapManager } from './mapManager';
import { Util } from './../framework/util';
import { AudioManager } from './../framework/audioManager';
import { EffectManager, loadAndPlayEffectOptions, playParticleOptions } from './../framework/effectManager';
import { PlayerData } from './../framework/playerData';
import { LocalConfig } from './../framework/localConfig';
import { PlayerModel } from './playerModel';
import { ClientEvent } from './../framework/clientEvent';
import { _decorator, Component, Quat, Vec3, Node, macro, RigidBodyComponent, CapsuleColliderComponent, Prefab } from 'cc';
import { Constant } from '../framework/constant';
import { GameManager } from './gameManager';
import { ResourceUtil } from '../framework/resourceUtil';
import { Arrow } from './arrow';
import { UIManager } from '../framework/uiManager';
import { PlayerBloodBar } from '../ui/fight/playerBloodBar';
import { CharacterRigid } from './characterRigid';
import { PoolManager } from '../framework/poolManager';
//玩家脚本
let qt_0 = new Quat();
let v3_0 = new Vec3();

const { ccclass, property } = _decorator;
@ccclass('Player')
export class Player extends Component {
    @property(PlayerModel)
    public scriptPlayerModel: PlayerModel = null!;//玩家动画组件播放脚本

    @property(RigidBodyComponent)
    public rigidComPlayer: RigidBodyComponent = null!;

    @property(CapsuleColliderComponent)
    public colliderComPlayer: CapsuleColliderComponent = null!;

    public set isDie (v: boolean) {
        this._isDie = v;

        if (this._isDie) {
            this._showDie();
        }
    }

    public get isDie () {
        return this._isDie;
    }

    public set scriptBloodBar (v: PlayerBloodBar) {
        this._scriptBloodBar = v;
    }

    public get scriptBloodBar () {
        return this._scriptBloodBar;
    }

    public set isMoving (v: boolean) {
        this._isMoving = v;
    }

    public get isMoving () {
        return this._isMoving;
    }

    public set isPlayRotate (v: boolean) {
        this._isPlayRotate = v;
    }

    public get isPlayRotate () {
        return this._isPlayRotate;
    }

    public set scriptCharacterRigid (v: CharacterRigid) {
        this._scriptCharacterRigid = v;
    }

    public get scriptCharacterRigid () {
        return this._scriptCharacterRigid;
    }

    public set playerBaseInfo (v: any) {
        this._playerBaseInfo = v;
    }

    public get playerBaseInfo () {
        return this._playerBaseInfo;
    }

    public set curMoveSpeed (v: number) {
        this._curMoveSpeed = v;
        this.scriptCharacterRigid.initSpeed(v);
    }

    public get curMoveSpeed () {
        return this._curMoveSpeed;
    }

    public set isArrowDouble (v: boolean) {
        this._isArrowDouble = v;
    }

    public get isArrowDouble () {
        return this._isArrowDouble;
    }

    public set isArrowPenetrate (v: boolean) {
        this._isArrowPenetrate = v;
    }

    public get isArrowPenetrate () {
        return this._isArrowPenetrate;
    }

    public set isArrowContinuous (v: boolean) {
        this._isArrowContinuous = v;
    }

    public get isArrowContinuous () {
        return this._isArrowContinuous;
    }

    public set isArrowIce (v: boolean) {
        this._isArrowIce = v;
    }

    public get isArrowIce () {
        return this._isArrowIce;
    }

    public set isArrowFire (v: boolean) {
        this._isArrowFire = v;
    }

    public get isArrowFire () {
        return this._isArrowFire;
    }

    public set isBloodthirsty (v: boolean) {
        this._isBloodthirsty = v;
    }

    public get isBloodthirsty () {
        return this._isBloodthirsty;
    }

    public set isArrowLightning (v: boolean) {
        this._isArrowLightning = v;
    }

    public get isArrowLightning () {
        return this._isArrowLightning;
    }

    public set isArrowLaunch (v: boolean) {
        this._isArrowLaunch = v;
    }

    public get isArrowLaunch () {
        return this._isArrowLaunch;
    }

    public set curAttackPower (v: number) {
        this._curAttackPower = v;
    }

    public get curAttackPower () {
        return this._curAttackPower;
    }

    public set curDefensePower (v: number) {
        this._curDefensePower = v;
    }

    public get curDefensePower () {
        return this._curDefensePower;
    }

    public set curAttackSpeed (v: number) {
        this._curAttackSpeed = v;
    }

    public get curAttackSpeed () {
        return this._curAttackSpeed;
    }

    public set curDodgeRate (v: number) {
        this._curDodgeRate = v;
    }

    public get curDodgeRate () {
        return this._curDodgeRate;
    }

    public set curCriticalHitRate (v: number) {
        this._curCriticalHitRate = v;
    }

    public get curCriticalHitRate () {
        return this._curCriticalHitRate;
    }

    public set curCriticalHitDamage (v: number) {
        this._curCriticalHitDamage = v;
    }

    public get curCriticalHitDamage () {
        return this._curCriticalHitDamage;
    }

    public set curHpLimit (v: number) {
        this._curHpLimit = v;
    }

    public get curHpLimit () {
        return this._curHpLimit;
    }

    //当前"数值技能"值
    private _curAttackPower: number = 20;//当前攻击力
    private _curDefensePower: number = 1;//当前防御力
    private _curAttackSpeed: number = 1;//当前攻击速度
    private _curDodgeRate: number = 0;//当前闪避率
    private _curCriticalHitRate: number = 0;//当前暴击率，0为不暴击
    private _curCriticalHitDamage: number = 0;//当前暴击伤害
    private _curHpLimit: number = 0;//当前玩家生命值上限（这个是上限，是生命上限，不是当前生命值）

    //是否拥有触发技能
    private _isBloodthirsty: boolean = false;//是否拥有技能：嗜血
    private _isArrowLightning: boolean = false;//是否拥有技能： 闪电
    private _isArrowLaunch: boolean = false;//是否拥有技能：弹射

    //是否拥有buff技能
    private _isArrowIce: boolean = false;//是否拥有技能：冰冻
    private _isArrowFire: boolean = false;//是否拥有技能：灼烧

    //是否拥有形态技能
    private _isArrowDouble: boolean = false;//是否拥有技能：弓箭双重射击
    private _isArrowPenetrate: boolean = false;//是否拥有技能：弓箭穿透射击
    private _isArrowContinuous: boolean = false;//是否拥有技能：连续射击

    //技能数组
    private _arrFormChangeSkill: string[] = [];//玩家当前拥有的形态变化技能10x
    private _arrValueChangeSkill: string[] = [];//玩家数值变化技能20x
    private _arrBuffSkill: string[] = [];//玩家buff技能30x
    private _arrTriggerSkill: string[] = [];//玩家触发技能40x

    private _scriptBloodBar: PlayerBloodBar = null!;//血条绑定脚本
    private _isMoving: boolean = false;//玩家是否正在移动
    private _isPlayRotate: boolean = false;//是否旋转
    private _scriptCharacterRigid: CharacterRigid = null!;
    private _playerBaseInfo: any = {};//玩家在base.csv的基础数据
    private _hp: number = 0;//玩家当前生命值
    private _isDie: boolean = false;//主角是否阵亡
    private _horizontal: number = 0;//水平移动距离
    private _vertical: number = 0;//垂直移动距离
    private _targetAngle: Vec3 = new Vec3();//目标旋转角度
    private _curAngleY: number = 0;//当前Y分量旋转角度
    private _ndTarget: Node = null!;//目标小怪
    private _throwArrowSpeed: number = 30;//弓箭速30
    private _arrowPos: Vec3 = new Vec3();//箭初始化位置
    private _bloodTipOffsetPos: Vec3 = new Vec3(-10, 150, 0);//血量提示和玩家间距
    private _playerMonsterOffset: Vec3 = new Vec3();//小怪和玩家间距
    private _oriPlayerPos: Vec3 = new Vec3(0, 1.7, 0);//玩家初始世界坐标
    private _oriPlayerScale: Vec3 = new Vec3(4, 4, 4);//玩家初始缩放倍数
    private _oriPlayerAngle: Vec3 = new Vec3(0, -90, 0);//玩家初始角度
    private _curAngle_1: Vec3 = new Vec3()//当前玩家旋转的角度
    private _curAngle_2: Vec3 = new Vec3();//玩家角度
    private _rotateDirection: Vec3 = new Vec3();//旋转方向
    private _ndRunSmokeEffect: Node = null!;//烟雾特效
    private _originAngle: Vec3 = new Vec3(0, -90, 0);//玩家开始角度
    private _tempAngle: Vec3 = new Vec3();//临时变量，玩家角度
    private _forWard: Vec3 = new Vec3();//朝向
    private _range: number = 0.01;//
    private _curMoveSpeed: number = 0;//当前玩家移动速度
    private _curBlood: number = 0;//当前血量
    private _rotateInterval: number = 0.3;//检查停止移动后是否还在旋转
    private _arrArrowPreload: string[] = [];

    onEnable () {
        ClientEvent.on(Constant.EVENT_TYPE.PARSE_PLAYER_SKILL, this._parsePlayerSkill, this);
        ClientEvent.on(Constant.EVENT_TYPE.ON_REVIVE, this._onRevive, this);
    }

    onDisable () {
        ClientEvent.off(Constant.EVENT_TYPE.PARSE_PLAYER_SKILL, this._parsePlayerSkill, this);
        ClientEvent.off(Constant.EVENT_TYPE.ON_REVIVE, this._onRevive, this);

        if (this.scriptBloodBar) {
            this._curBlood = this.scriptBloodBar.curBlood;
            this.scriptBloodBar.node.destroy();
            this.scriptBloodBar = null!;
        }
    }

    start () {

    }

    public init () {
        this.isMoving = false;
        this.isDie = false;
        this.isPlayRotate = false;

        this.isArrowDouble = false;
        this.isArrowPenetrate = false;
        this.isArrowContinuous = false;
        this.isArrowIce = false;
        this.isArrowFire = false;
        this.isBloodthirsty = false;
        this.isArrowLightning = false;
        this.isArrowLaunch = false;

        this._horizontal = 0;
        this._vertical = 0;

        this._curBlood = 0;
        this._ndTarget = null!;

        this.scriptCharacterRigid = this.node.getComponent(CharacterRigid) as CharacterRigid;

        //获取玩家基础数据
        this.playerBaseInfo = LocalConfig.instance.queryByID("base", Constant.BASE.PLAYER_01);

        if (this.playerBaseInfo) {
            //设置玩家大小
            let arrScale = Util.parseStringData(this.playerBaseInfo.scale, ",");
            this._oriPlayerScale.set(arrScale[0], arrScale[1], arrScale[2]);
            this.node.setScale(this._oriPlayerScale);

            this.resetPlayerWorPos();

            //设置角度
            let arrAngle = Util.parseStringData(this.playerBaseInfo.angle, ",");
            this._oriPlayerAngle.set(arrAngle[0], arrAngle[1], arrAngle[2]);
            this.node.eulerAngles = this._oriPlayerAngle;

            this.curAttackPower = this.playerBaseInfo.attackPower;
            this.curDefensePower = this.playerBaseInfo.defensePower;
            this.curAttackSpeed = this.playerBaseInfo.attackSpeed;
            this.curMoveSpeed = this.playerBaseInfo.moveSpeed;
            this.curDodgeRate = this.playerBaseInfo.dodgeRate;
            this.curCriticalHitRate = this.playerBaseInfo.criticalHitRate;
            this.curCriticalHitDamage = this.playerBaseInfo.criticalHitDamage;
            this.curHpLimit = this.playerBaseInfo.hp;

            this._hp = this.playerBaseInfo.hp;
        }

        this._parsePlayerSkill(true);

        console.log("###加载血条1");
        //展示血条
        UIManager.instance.showPlayerBloodBar(this, this._hp, this._hp, () => {
            // if (GameManager.isTesting) {
            //     this.addBlood(2000, true);
            // }
        }, this._bloodTipOffsetPos);

        this.scriptPlayerModel.playAni(Constant.PLAYER_ANI_TYPE.IDLE, true);

        this.scriptPlayerModel.init();

        this.rigidComPlayer.clearState();
    }

    /**
     * 每次成功进入新的一层则更新玩家状态
     *
     * @memberof Player
     */
    public resetPlayerState () {
        this.node.active = true;
        this.rigidComPlayer.clearState();
        this.resetPlayerWorPos();
        this.node.eulerAngles = this._originAngle;
        this.scriptPlayerModel.playAni(Constant.PLAYER_ANI_TYPE.IDLE, true);
        //将未播放结束的特效节点隐藏，避免到下一层还在展示特效
        this.node.children.forEach((ndChild: Node) => {
            if (ndChild.name !== "body") {
                ndChild.active = false;
            }
        })

        if (!this.scriptBloodBar) {
            UIManager.instance.showPlayerBloodBar(this, this.curHpLimit, this._curBlood, () => {
            }, this._bloodTipOffsetPos);
        }
    }

    /**
     * 根据an、anS两张图设置不同的玩家初始位置
     */
    private resetPlayerWorPos () {
        let arrPosition = Util.parseStringData(this.playerBaseInfo.position, ",");

        if (MapManager.isMapAnS) {
            this._oriPlayerPos.set(-16.742, arrPosition[1], -0.719);
        } else {
            //设置坐标
            this._oriPlayerPos.set(arrPosition[0], arrPosition[1], arrPosition[2]);
        }

        this.node.setPosition(this._oriPlayerPos);
    }

    /**
     * 解析玩家当前技能
     * 
     * @param {boolean} isCoverSkill 是否重新覆盖技能，主角初始化的要，其他时候不需要
     * @memberof Player
     */
    private _parsePlayerSkill (isCoverSkill: boolean = false) {
        let arrSkill = PlayerData.instance.playerInfo.arrSkill;

        let arrFormChangeSkill: string[] = [];
        let arrValueChangeSkill: string[] = [];
        let arrBuffSkill: string[] = [];
        let arrTriggerSkill: string[] = [];

        if (arrSkill.length) {
            arrSkill.forEach((item: string) => {
                if (item.startsWith(Constant.PLAYER_SKILL_USE.FORM_CHANGE)) {
                    arrFormChangeSkill.push(item);
                } else if (item.startsWith(Constant.PLAYER_SKILL_USE.VALUE)) {
                    arrValueChangeSkill.push(item);
                } else if (item.startsWith(Constant.PLAYER_SKILL_USE.BUFF)) {
                    arrBuffSkill.push(item);
                } else if (item.startsWith(Constant.PLAYER_SKILL_USE.TRIGGER)) {
                    arrTriggerSkill.push(item);
                }
            });
        }

        this._arrFormChangeSkill = arrFormChangeSkill;
        this._arrValueChangeSkill = arrValueChangeSkill;
        this._arrBuffSkill = arrBuffSkill;
        this._arrTriggerSkill = arrTriggerSkill;

        // console.log("###_arrFormChangeSkill", this._arrFormChangeSkill);
        // console.log("###_arrValueChangeSkill", this._arrValueChangeSkill);
        // console.log("###_arrBuffSkill", this._arrBuffSkill);
        // console.log("###_arrTriggerSkill", this._arrTriggerSkill);

        if (this._arrFormChangeSkill.length) {
            this.isArrowDouble = this._arrFormChangeSkill.indexOf(Constant.PLAYER_SKILL.ARROW_DOUBLE) !== -1;
            this.isArrowPenetrate = this._arrFormChangeSkill.indexOf(Constant.PLAYER_SKILL.ARROW_PENETRATE) !== -1;
            this.isArrowContinuous = this._arrFormChangeSkill.indexOf(Constant.PLAYER_SKILL.ARROW_CONTINUOUS) !== -1;
        } else {
            this.isArrowDouble = false;
            this.isArrowPenetrate = false;
            this.isArrowContinuous = false;
        }

        //数值技能只使用一次, 注意：每次获得到需用乘法都是用当前值去乘，而不是乘以最开始的值
        if (this._arrValueChangeSkill.length) {
            //攻击力提升百分比
            let oriAttackPower = this.playerBaseInfo.attackPower;
            let curAttackPower = oriAttackPower;
            //攻击力1
            let raiseAttackPowerRate_1 = this.getValueSkillRate(Constant.PLAYER_SKILL.RAISE_ATTACK_01);
            curAttackPower = oriAttackPower * (1 + raiseAttackPowerRate_1);
            //攻击力2
            let raiseAttackPowerRate_2 = this.getValueSkillRate(Constant.PLAYER_SKILL.RAISE_ATTACK_02);
            this.curAttackPower = curAttackPower * (1 + raiseAttackPowerRate_2);

            //闪避率提升百分比
            let oriDodgeRate = this.playerBaseInfo.dodgeRate;
            let raiseDodgeRate = this.getValueSkillRate(Constant.PLAYER_SKILL.RAISE_DODGE);
            this.curDodgeRate = oriDodgeRate + raiseDodgeRate;//注：以加法形式增加

            //攻速提升百分比
            let oriAttackSpeed = this.playerBaseInfo.attackSpeed;
            let curAttackSpeed = oriAttackSpeed;
            //攻速1
            let raiseAttackSpeedRate_1 = this.getValueSkillRate(Constant.PLAYER_SKILL.RAISE_ATTACK_SPEED_01);
            curAttackSpeed = oriAttackSpeed * (1 + raiseAttackSpeedRate_1);
            //攻速2
            let raiseAttackSpeedRate_2 = this.getValueSkillRate(Constant.PLAYER_SKILL.RAISE_ATTACK_SPEED_02);
            this.curAttackSpeed = curAttackSpeed * (1 + raiseAttackSpeedRate_2);

            if (!isCoverSkill) {
                let oriHpLimit = this.playerBaseInfo.hp;
                let raiseHpLimitRate = this.getValueSkillRate(Constant.PLAYER_SKILL.RAISE_HP_LIMIT);
                let offsetHp = oriHpLimit * raiseHpLimitRate;
                let curHpLimit = oriHpLimit + offsetHp;

                if (curHpLimit > this.curHpLimit) {
                    this.addBlood(offsetHp, true);
                    this.curHpLimit = curHpLimit;
                    this._hp += offsetHp;
                }
            }

            //移速提升百分比
            let oriMoveSpeed = this.playerBaseInfo.moveSpeed;
            let raiseMoveSpeedRate = this.getValueSkillRate(Constant.PLAYER_SKILL.MOVE_SPEED);
            this.curMoveSpeed = oriMoveSpeed * (1 + raiseMoveSpeedRate);

            //暴击+爆伤提升百分比
            let oriCriticalHitRate = this.playerBaseInfo.criticalHitRate;
            let oriCriticalHitDamage = this.playerBaseInfo.criticalHitDamage;
            let arrCritical_1: any = [0, 0];//暴击率,暴击伤害比
            let arrCritical_2: any = [0, 0];//暴击率,暴击伤害比
            arrCritical_1 = this.getValueSkillRateArr(Constant.PLAYER_SKILL.RAISE_CRITICAL_HIT_DAMAGE_01);
            arrCritical_2 = this.getValueSkillRateArr(Constant.PLAYER_SKILL.RAISE_CRITICAL_HIT_DAMAGE_02);

            let raiseCriticalHitRate = arrCritical_1[0] + arrCritical_2[0];
            let raiseCriticalHitDamage = arrCritical_1[1] + arrCritical_2[1];

            if (raiseCriticalHitRate) {
                this.curCriticalHitRate = oriCriticalHitRate + raiseCriticalHitRate;//注：以加法形式增加
            }

            if (raiseCriticalHitDamage) {
                this.curCriticalHitDamage = oriCriticalHitDamage + raiseCriticalHitDamage;//注：以加法形式增加
            }
        } else {
            this.curAttackPower = this.playerBaseInfo.attackPower;
            this.curAttackSpeed = this.playerBaseInfo.attackSpeed;
            this.curMoveSpeed = this.playerBaseInfo.moveSpeed;
            this.curDodgeRate = this.playerBaseInfo.dodgeRate;
            this.curCriticalHitRate = this.playerBaseInfo.criticalHitRate;
            this.curCriticalHitDamage = this.playerBaseInfo.criticalHitDamage;
            this.curHpLimit = this.playerBaseInfo.hp;
        }

        if (this._arrBuffSkill.length) {
            this.isArrowIce = this._arrBuffSkill.indexOf(Constant.PLAYER_SKILL.ARROW_ICE) !== -1;
            this.isArrowFire = this._arrBuffSkill.indexOf(Constant.PLAYER_SKILL.ARROW_FIRE) !== -1;
        } else {
            this.isArrowIce = false;
            this.isArrowFire = false;
        }

        if (this._arrTriggerSkill.length) {
            this.isArrowLightning = this._arrTriggerSkill.indexOf(Constant.PLAYER_SKILL.ARROW_LIGHTNING) !== -1;
            this.isArrowLaunch = this._arrTriggerSkill.indexOf(Constant.PLAYER_SKILL.ARROW_LAUNCH) !== -1;
            this.isBloodthirsty = this._arrTriggerSkill.indexOf(Constant.PLAYER_SKILL.BLOODTHIRSTY) !== -1;
        } else {
            this.isArrowLightning = false;
            this.isArrowLaunch = false;
            this.isBloodthirsty = false;
        }
    }

    /**
     * 返回当前数值技能提升比例
     */
    private getValueSkillRate (key: string) {
        let rate = 0;//百分比

        if (this._arrValueChangeSkill.indexOf(key) !== -1) {
            let skillInfo = LocalConfig.instance.queryByID("playerSkill", key);
            rate = Number(skillInfo.value);
        }

        return rate ?? 0;
    }

    /**
     * 返回当前数值技能提升比例数组
     */
    private getValueSkillRateArr (key: string) {
        let arrRate: any[] = [];

        if (this._arrValueChangeSkill.indexOf(key) !== -1) {
            let skillInfo = LocalConfig.instance.queryByID("playerSkill", key);
            arrRate = skillInfo.value.split("#");
        }

        arrRate = arrRate.map((item: number) => {
            return item ? Number(item) : 0;
        })

        if (arrRate.length === 0) {
            arrRate = [0, 0];
        }

        return arrRate;
    }

    /**
     * 玩家行为
     *
     * @param {*} obj
     * @memberof Player
     */
    public playAction (obj: any) {
        if (this.isDie) {
            return;
        }

        switch (obj.action) {
            case Constant.PLAYER_ACTION.MOVE:
                let angle = obj.value + 135;
                let radian = angle * macro.RAD;
                this._horizontal = Math.round(Math.cos(radian) * 1);
                this._vertical = Math.round(Math.sin(radian) * 1);
                this.isMoving = true;
                this._curAngleY = obj.value;
                this._curAngleY = this._curAngleY < 0 ? this._curAngleY + 360 : this._curAngleY > 360 ? this._curAngleY - 360 : this._curAngleY;
                break;
            case Constant.PLAYER_ACTION.STOP_MOVE:
                this._horizontal = 0;
                this._vertical = 0;
                this._onPlayerStopMove();
                this.isMoving = false;
                this.rigidComPlayer.clearState();
                this.scriptCharacterRigid.stopMove();
                this._rotateInterval = 0.2;
                break;
            default:
                break;
        }
    }

    /**
     * 玩家不移动时：a) 地图上没有怪物：在原地待机。b) 地图上有怪物：向怪物方向攻击。
     *
     * @private
     * @memberof Player
     */
    private _onPlayerStopMove () {
        if (!GameManager.isGameOver && GameManager.isGameStart) {
            if (GameManager.arrMonster.length) {
                let isMonsterSurvive = GameManager.arrMonster.some((item: Node) => {
                    return item.parent !== null;
                })

                if (isMonsterSurvive) {
                    this._attackMonster();
                }
            } else {
                this.scriptPlayerModel.playAni(Constant.PLAYER_ANI_TYPE.IDLE, true);
            }
        }
    }

    /**
     * 向目标位置移动
     *
     * @private
     * @memberof Monster
     */
    private _moveToTargetWorPos (targetWorPos: Vec3) {
        let angleY = this._getTwoPosAngleY(this.node.worldPosition, targetWorPos);
        this.playAction({ action: Constant.MONSTER_ACTION.MOVE, value: angleY });
    }

    private _getTwoPosAngleY (selfWorPos: Vec3, targetWorPos: Vec3) {
        let targetScreenPos = GameManager.mainCamera?.worldToScreen(targetWorPos) as Vec3;
        let selfScreenPos = GameManager.mainCamera?.worldToScreen(selfWorPos) as Vec3;
        Vec3.subtract(this._playerMonsterOffset, targetScreenPos, selfScreenPos);
        let angleY = Math.round(Math.atan2(this._playerMonsterOffset.y, this._playerMonsterOffset.x) * 180 / Math.PI);
        return angleY;
    }

    /**
     * 向怪物方向攻击
     */
    private _attackMonster () {
        this._ndTarget = GameManager.getNearestMonster()!;

        if (!this._ndTarget || this.isDie) {
            return;
        }

        this._moveToTargetWorPos(this._ndTarget.worldPosition);

        this.isMoving = false;

        //播放攻击动画
        this.scriptPlayerModel.playAni(Constant.PLAYER_ANI_TYPE.ATTACK, false, () => {
            if (!this.scriptPlayerModel.isRunning) {
                this._attackMonster();
            }
        });
    }

    /**
     * 向敌人射箭
     *
     * @returns
     * @memberof Player
     */
    public throwArrowToEnemy () {
        //射击摇摆
        this.node.forward = Vec3.subtract(this._forWard, this.node.worldPosition, this._ndTarget.worldPosition).normalize().negative();

        //使用形态变换技能
        if (this._arrFormChangeSkill.length) {
            //使用技能
            if (this.isArrowDouble) {
                if (this.isArrowContinuous) {
                    this._initArrow("arrowDoubleContinuous");
                } else {
                    this._initArrow("arrowDouble");
                }
            } else {
                if (this.isArrowContinuous) {
                    this._initArrow("arrowSingleContinuous");
                } else {
                    this._initArrow("arrowSingle");
                }
            }

            this._arrFormChangeSkill.forEach((item: string) => {
                let skillInfo = LocalConfig.instance.queryByID("playerSkill", String(item));

                if (item === Constant.PLAYER_SKILL.ARROW_REVERSE || item === Constant.PLAYER_SKILL.ARROW_SIDE || item === Constant.PLAYER_SKILL.ARROW_UMBRELLA) {
                    this._initArrow(skillInfo.resName);
                }
            })
        } else {
            //没有技能则默认连续射单只箭
            this._initArrow("arrowSingle");
        }
    }

    /**
     * 初始化箭
     *
     * @private
     * @param {string} arrowName
     * @memberof Player
     */
    private _initArrow (arrowName: string) {
        ResourceUtil.loadModelRes(`weapon/arrow/${arrowName}`).then((prefab: any) => {
            if (this.isMoving) {
                return;
            }
            let ndArrow = PoolManager.instance.getNode(prefab, GameManager.ndGameManager as Node) as Node;
            let playerWorPos = this.node.worldPosition;
            this._arrowPos.set(playerWorPos.x, 3, playerWorPos.z);

            // if (GameManager.isTesting) {
            //     this._arrowPos.set(playerWorPos.x, -3, playerWorPos.z);
            // }

            ndArrow.setWorldPosition(this._arrowPos);
            ndArrow.eulerAngles = this.node.eulerAngles;

            ndArrow.children.forEach((ndArrowItem: Node) => {
                let scriptArrowItem = ndArrowItem.getComponent(Arrow) as Arrow;
                scriptArrowItem.init(this._throwArrowSpeed, this.node.worldPosition);
            })

            //播放箭的音效
            let isHasIce = GameManager.scriptPlayer.isArrowIce;
            let isHasFire = GameManager.scriptPlayer.isArrowFire;
            let isHasLightning = GameManager.scriptPlayer.isArrowLightning;

            if (isHasIce || isHasFire || isHasLightning) {
                if (isHasIce) {
                    AudioManager.instance.playSound(Constant.SOUND.ICE);
                }

                if (isHasFire) {
                    AudioManager.instance.playSound(Constant.SOUND.FIRE);
                }

                if (isHasLightning) {
                    AudioManager.instance.playSound(Constant.SOUND.LIGHTNING);
                }
            } else {
                AudioManager.instance.playSound(Constant.SOUND.LOOSE);
            }
        })
    }

    /**
     * 玩家加血、增加血量上限
     *
     * @param {number} bloodNum
     * @param {boolean} [isIncreaseLimit]
     * @memberof Player
     */
    public addBlood (bloodNum: number, isIncreaseLimit?: boolean) {
        let options: loadAndPlayEffectOptions = { effectPath: "recovery/recovery", ndTarget: this.node, isPlayAnimation: false, speed: GameManager.gameSpeed, isRecycle: true };
        EffectManager.instance.loadAndPlayEffect(options);

        UIManager.instance.showBloodTips(this, Constant.FIGHT_TIP.ADD_BLOOD, bloodNum, this._bloodTipOffsetPos);
        this.scriptBloodBar.refreshBlood(bloodNum, isIncreaseLimit);

        AudioManager.instance.playSound(Constant.SOUND.RECOVERY);
    }

    // /**
    //  * 展示复活效果
    //  *
    //  * @private
    //  * @param {number} bloodNum
    //  * @memberof Player
    //  */
    // private _showRevival (bloodNum: number) {

    // }

    /**
     * 玩家扣血
     *
     * @param {*} baseInfo 敌人基础信息
     * @return {*} 
     * @memberof Player
     */
    public reduceBlood (baseInfo: any) {
        if (this.isDie) {
            return;
        }

        AudioManager.instance.playSound(Constant.SOUND.HIT_PLAYER);

        if (Math.random() > this.playerBaseInfo.dodgeRate) {
            //扣血
            let tipType = Constant.FIGHT_TIP.REDUCE_BLOOD;
            //敌人伤害
            let damage = baseInfo.attackPower * GameManager.attackAddition * (1 - this.playerBaseInfo.defensePower / (this.playerBaseInfo.defensePower + 400));
            let isCriticalHit = Math.random() <= baseInfo.criticalHitRate;//是否暴击
            if (isCriticalHit) {
                damage = damage * baseInfo.criticalHitDamage;
                tipType = Constant.FIGHT_TIP.CRITICAL_HIT;
            }

            UIManager.instance.showBloodTips(this, tipType, -damage, this._bloodTipOffsetPos);
            this.scriptBloodBar.refreshBlood(-damage);
        }
    }

    /**
     * 奔跑的时候加个烟雾
     *
     * @memberof Player
     */
    public async playRunSmoke () {
        if (!this._ndRunSmokeEffect) {
            let pf = await ResourceUtil.loadEffectRes("runSmoke/runSmoke") as Prefab;
            this._ndRunSmokeEffect = PoolManager.instance.getNode(pf, this.node);
        }

        let options: playParticleOptions = { ndEffect: this._ndRunSmokeEffect };
        EffectManager.instance.playParticle(options);
    }

    /**
     * 攻击的时候隐藏烟雾
     *
     * @memberof Player
     */
    public hideRunSmoke () {
        if (this._ndRunSmokeEffect && this._ndRunSmokeEffect.active) {
            this._ndRunSmokeEffect.active = false;
            // console.log("隐藏烟雾");
        }
    }

    /**
     * 预加载箭和特效
     *
     * @param {Function} callback
     * @memberof Player
     */
    public preloadArrow (callback: Function) {
        let arrPromise = [];

        let loadArrow = (arrowName: string, arrowItemNum: number) => {
            return new Promise((resolve, reject) => {
                if (this._arrArrowPreload.indexOf(arrowName) == -1) {
                    console.log("是否首次加载箭", arrowName);
                    this._arrArrowPreload.push(arrowName);
                    let groupNum = 2;//加载两三组
                    let p1 = GameManager.preloadArrowEffects(arrowItemNum * groupNum);
                    let p2 = GameManager.preloadArrow(arrowName, groupNum);
                    Promise.all([p1, p2]).then(() => {
                        resolve(null);
                    })
                } else {
                    resolve(null);
                }
            })
        }

        //没有技能,默认单只箭
        if (this._arrFormChangeSkill.length) {

            //使用技能
            this._arrFormChangeSkill.forEach((item: string) => {
                let skillInfo = LocalConfig.instance.queryByID("playerSkill", String(item));
                if (item === Constant.PLAYER_SKILL.ARROW_REVERSE || item === Constant.PLAYER_SKILL.ARROW_SIDE || item === Constant.PLAYER_SKILL.ARROW_UMBRELLA) {
                    let p = loadArrow(skillInfo.resName, 2);
                    arrPromise.push(p);
                }
            })

            if (this.isArrowDouble) {
                if (this.isArrowContinuous) {
                    let p = loadArrow("arrowDoubleContinuous", 4);
                    arrPromise.push(p);

                } else {
                    let p = loadArrow("arrowDouble", 2);
                    arrPromise.push(p);
                }
            } else {
                if (this.isArrowContinuous) {
                    let p = loadArrow("arrowSingleContinuous", 2);
                    arrPromise.push(p);
                } else {
                    let p = loadArrow("arrowSingle", 1);
                    arrPromise.push(p);
                }
            }
        } else {
            //默认连续射单只箭
            let p = loadArrow("arrowSingle", 1);
            arrPromise.push(p);
        }

        Promise.all(arrPromise).then(() => {
            callback && callback();
        })
    }

    private _showDie () {
        this.scriptCharacterRigid.stopMove();
        AudioManager.instance.playSound(Constant.SOUND.PLAYER_01_DIE);

        this.scriptPlayerModel.playAni(Constant.PLAYER_ANI_TYPE.DIE, false, () => {
            GameManager.isWin = false;
        });
    }

    /**
     * 玩家复活
     */
    private _onRevive () {
        let options: loadAndPlayEffectOptions = { effectPath: "revival/revival", ndTarget: this.node, speed: GameManager.gameSpeed, isRecycle: true };
        EffectManager.instance.loadAndPlayEffect(options);

        this.scheduleOnce(() => {
            let bloodNum = this.curHpLimit * 0.5;
            if (GameManager.isGamePause && !GameManager.isGameOver) {
                UIManager.instance.showBloodTips(this, Constant.FIGHT_TIP.ADD_BLOOD, bloodNum, this._bloodTipOffsetPos);
                this.scriptBloodBar.refreshBlood(bloodNum, false);
                AudioManager.instance.playSound(Constant.SOUND.RECOVERY);

                GameManager.isGamePause = false;
                this.scriptBloodBar.node.active = true;

                this.scriptPlayerModel.playAni(Constant.PLAYER_ANI_TYPE.REVIVE, false, () => {
                    this.isDie = false;
                    this.playAction({ action: Constant.PLAYER_ACTION.STOP_MOVE });
                    ClientEvent.dispatchEvent(Constant.EVENT_TYPE.MONSTER_MOVE);
                });

                AudioManager.instance.playSound(Constant.SOUND.REVIVE);
            }
        }, 2)
    }

    update (deltaTime: number) {
        if (!GameManager.isGameStart || GameManager.isGameOver || GameManager.isGamePause || this.isDie) {
            return;
        }

        //玩家旋转
        if (this.isPlayRotate) {
            //当前玩家角度
            this._tempAngle.set(this.node.eulerAngles);
            this._tempAngle.y = this._tempAngle.y < 0 ? this._tempAngle.y + 360 : this._tempAngle.y;

            this.node.eulerAngles = this._tempAngle;

            this._curAngle_1.set(0, this._tempAngle.y, 0);

            if (this._horizontal === 0 && this._vertical === 0) {
                this._range = 0.1;
            } else {
                this._range = 0.01;
            }

            //第二个参数越小朝向敌人越精确
            let isEqual = this._curAngle_1.equals(this._targetAngle, this._range);

            if (!isEqual) {
                Vec3.lerp(this._curAngle_1, this._curAngle_1, this._targetAngle, 0.167);
                this.node.eulerAngles = this._curAngle_1;
            } else {
                this.isPlayRotate = false;
                this.node.eulerAngles = this._targetAngle;
            }
        }

        if (this._horizontal !== 0 || this._vertical !== 0) {
            //计算出旋转角度
            this._rotateDirection.set(this._horizontal, 0, -this._vertical);
            this._rotateDirection.normalize();
            Quat.fromViewUp(qt_0, this._rotateDirection);
            Quat.toEuler(v3_0, qt_0);
            v3_0.y = v3_0.y < 0 ? v3_0.y + 360 : v3_0.y;

            // console.log("v3_0", v3_0.y);

            this.isPlayRotate = true;

            //设置当前玩家角度为正数
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
                this._targetAngle.set(0, this._targetAngle.y, 0);

                if (Math.abs(this._targetAngle.y - this._curAngle_2.y) > 180) {
                    if (this._targetAngle.y > this._curAngle_2.y) {
                        this._targetAngle.y -= 360;
                    } else {
                        this._targetAngle.y += 360;
                    }
                }

                // console.log("this._targetAngle.y", this._targetAngle.y);
            } else {
                this.isPlayRotate = false;
                this.node.eulerAngles = v3_0;
            }

            if (!this.isMoving) {
                return;
            }

            this.scriptCharacterRigid.move(this._rotateDirection.x * this.curMoveSpeed * 0.5 * deltaTime, this._rotateDirection.z * this.curMoveSpeed * 0.5 * deltaTime);

            if (!this.scriptPlayerModel.isRunning && !this.isDie) {
                this.scriptPlayerModel.playAni(Constant.PLAYER_ANI_TYPE.RUN, true);
            }
        } else {
            if (!this.isDie && !this.scriptPlayerModel.isIdle && !this.scriptPlayerModel.isAttacking) {
                this.scriptPlayerModel.playAni(Constant.PLAYER_ANI_TYPE.IDLE, true);
                this.scriptCharacterRigid.stopMove();
            }

            if (this._rotateInterval > 0) {
                this._rotateInterval -= deltaTime;
                if (this._rotateInterval <= 0 && this.isPlayRotate) {
                    this.isPlayRotate = false;
                }
            }
        }
    }
}
