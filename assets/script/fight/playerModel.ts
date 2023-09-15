import { GameManager } from './gameManager';
import { _decorator, Component, Node, Vec3, SkeletalAnimationState, AnimationClip, SkeletalAnimationComponent } from 'cc';
import { Constant } from '../framework/constant';
import { AudioManager } from '../framework/audioManager';
const { ccclass, property } = _decorator;
//玩家角色模型脚本
@ccclass('PlayerModel')
export class PlayerModel extends Component {
    @property(Node)
    public ndSocketLoose: Node = null!//弓箭发射的节点

    @property(Node)
    public ndSocketHand: Node = null!//手节点

    @property(Node)
    public ndArrow: Node = null!;//攻击时候展示的弓箭

    @property(SkeletalAnimationComponent)
    public aniComPlayer: SkeletalAnimationComponent = null!;//动画播放组件

    public set looseEulerAngles (v: Vec3) {
        this._looseEulerAngles = v;
    }

    public get looseEulerAngles () {
        return this._looseEulerAngles;
    }

    public set isAniPlaying (v: boolean) {
        this._isAniPlaying = v;
    }

    public get isAniPlaying () {
        return this._isAniPlaying;
    }

    //是否正在跑
    public get isRunning () {
        return this._aniType === Constant.PLAYER_ANI_TYPE.RUN && this.isAniPlaying === true;
    }

    //是否待机
    public get isIdle () {
        return this._aniType === Constant.PLAYER_ANI_TYPE.IDLE && this.isAniPlaying === true;
    }

    //是否正在攻击
    public get isAttacking () {
        return this._aniType === Constant.PLAYER_ANI_TYPE.ATTACK && this.isAniPlaying === true;
    }

    private _aniType: string = "";//动画类型
    private _aniState: SkeletalAnimationState = null!;//动画播放状态
    private _stepIndex: number = 0;//脚步
    private _looseEulerAngles: Vec3 = new Vec3();//射箭时的角度
    private _isAniPlaying: boolean = false;//当前动画是否正在播放

    start () {
        // [3]
    }

    public init () {
        this.hideArrow();
    }

    /**
     * attack帧事件:箭射出去的时候触发
     * @returns 
     */
    public onFrameAttackLoose () {
        if (GameManager.isGameOver || GameManager.isGamePause) {
            return;
        }

        this.looseEulerAngles = this.node.parent?.eulerAngles as Vec3;
        GameManager.scriptPlayer.throwArrowToEnemy();
        this.ndArrow.active = false;

        // console.log("looseEulerAngles", this.looseEulerAngles);
    }

    /**
     * run帧事件：脚落地的时候播放音效
     *
     * @memberof PlayerModel
     */
    public onFrameRun () {
        this._stepIndex = this._stepIndex === 0 ? 1 : 0;
        AudioManager.instance.playSound(Constant.SOUND.FOOT_STEP[this._stepIndex]);
    }

    /**
     * attack帧事件: 拉弓的时候触发
     */
    public onFrameAttackDraw () {
        this.ndArrow.active = true;
    }

    /**
     * 隐藏模型手中默认的箭
     */
    public hideArrow () {
        this.ndArrow.active = false;
    }

    /**
 * 播放玩家动画
 *
 * @param {string} aniType 动画类型
 * @param {boolean} [isLoop=false] 是否循环
 * @param {Function} [callback] 回调函数
 * @param {number} [callback] 调用播放动画的位置，方便用于测试
 * @returns
 * @memberof Player
 */
    public playAni (aniType: string, isLoop: boolean = false, callback?: Function, pos?: number) {
        // console.log("playerAniType", aniType, "curAniType", this.aniType, "pos", pos);
        this._aniState = this.aniComPlayer?.getState(aniType) as SkeletalAnimationState;

        if (this._aniState && this._aniState.isPlaying) {
            return;
        }

        this._aniType = aniType;

        if (this._aniType !== Constant.PLAYER_ANI_TYPE.ATTACK) {
            this.hideArrow();
        }

        this.aniComPlayer?.play(aniType);
        this.isAniPlaying = true;

        if (this._aniState) {
            if (isLoop) {
                this._aniState.wrapMode = AnimationClip.WrapMode.Loop;
            } else {
                this._aniState.wrapMode = AnimationClip.WrapMode.Normal;
            }

            switch (aniType) {
                case Constant.PLAYER_ANI_TYPE.ATTACK:
                    this._aniState.speed = GameManager.gameSpeed * GameManager.scriptPlayer.curAttackSpeed;
                    GameManager.scriptPlayer.hideRunSmoke();
                    break;
                case Constant.PLAYER_ANI_TYPE.RUN:
                    this._aniState.speed = GameManager.gameSpeed * (GameManager.scriptPlayer.curMoveSpeed / GameManager.scriptPlayer.playerBaseInfo.moveSpeed);
                    GameManager.scriptPlayer.playRunSmoke();
                    break;
                case Constant.PLAYER_ANI_TYPE.IDLE:
                    this._aniState.speed = GameManager.gameSpeed;
                    break;
                default:
                    this._aniState.speed = GameManager.gameSpeed;
                    break;
            }
        }

        if (!isLoop) {
            this.aniComPlayer.once(SkeletalAnimationComponent.EventType.FINISHED, () => {
                this.isAniPlaying = false;
                callback && callback();
            })
        }
    }

    // update (deltaTime: number) {
    //     // [4]
    // }
}