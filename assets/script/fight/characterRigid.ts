import { Constant } from '../framework/constant';
import { _decorator, Component, Vec3, RigidBodyComponent, EPSILON } from 'cc';
//角色刚体碰撞检测脚本
const { ccclass, property } = _decorator;
const v3_0 = new Vec3();
const v3_1 = new Vec3();

@ccclass('CharacterRigid')
export class CharacterRigid extends Component {
    @property
    public damping: number = 0.5;//阻尼

    @property
    public gravity: number = -10;//重力

    public get velocity () {
        return this._velocity;
    }
    public get onGround () {
        return this._grounded;
    }

    protected _rigidBody: RigidBodyComponent = null!;
    protected _grounded = true;//是否着地
    protected _velocity = new Vec3();//线性速度
    protected _curMaxSpeed: number = 0;//当前最大速度
    protected _prevAngleY: number = 0;//之前的Y角度值
    protected _stateX: number = 0;  // 1 positive, 0 static, -1 negative
    protected _stateZ: number = 0;

    onLoad () {
        this._rigidBody = this.getComponent(RigidBodyComponent)!;
    }

    start () {
        this._prevAngleY = this.node.eulerAngles.y;
    }

    /**
     * 初始化角色最大速度
     *
     * @param {number} moveSpeed
     * @param {number} [ratio=1]
     * @memberof CharacterRigid
     */
    public initSpeed (moveSpeed: number, ratio: number = 1) {
        this._curMaxSpeed = moveSpeed * ratio;
    }

    /**
     * 角色移动传入x和z
     *
     * @param {number} x
     * @param {number} z
     */
    public move (x: number, z: number) {
        if ((x > 0 && this._stateX < 0) || (x < 0 && this._stateX > 0) || (z > 0 && this._stateZ < 0) || (z < 0 && this._stateZ > 0)) {
            this.clearVelocity();
            // console.log("当前跟之前方向不一致则清除速度,避免惯性太大");
        }

        this._stateX = x;
        this._stateZ = z;
        // console.log("_stateX", this._stateX, "z", this._stateZ);
    }

    /**
     * 刚体停止移动
     *
     */
    public stopMove () {
        this._stateX = 0;
        this._stateZ = 0;
        this.clearVelocity();
    }

    /**
     * 更新刚体状态
     *
     * @private
     * @param {number} dt
     * @return {*} 
     */
    private _updateCharacter (dt: number) {
        this.updateFunction(dt);

        if (!this.onGround) return;
        if (this._stateX || this._stateZ) {
            v3_0.set(this._stateX, 0, this._stateZ);
            v3_0.normalize().negative();
            this.rigidMove(v3_0, 1);
        }
    }

    /**
     * 清除移动速度
     */
    public clearVelocity () {
        this._rigidBody.clearVelocity();
    }

    /**
     * 刚体移动
     *
     * @param {Vec3} dir
     * @param {number} speed
     */
    public rigidMove (dir: Vec3, speed: number) {
        this._rigidBody.getLinearVelocity(v3_1);
        Vec3.scaleAndAdd(v3_1, v3_1, dir, speed);

        // console.log('v3_1' + v3_1);

        const ms = this._curMaxSpeed;
        const len = v3_1.lengthSqr();
        let ratio = 1;
        if (len > ms) {
            if (Math.abs(this.node.eulerAngles.y - this._prevAngleY) >= 10) {
                ratio = 2;
            }
            this._prevAngleY = this.node.eulerAngles.y;
            v3_1.normalize();
            v3_1.multiplyScalar(ms / ratio);
        }
        this._rigidBody.setLinearVelocity(v3_1);
        // console.log('setLinearVelocity1' + v3_1);
    }

    /**
     * 刷新
     * @param dt 
     */
    public updateFunction (dt: number) {
        // this._updateContactInfo();
        this._applyGravity();
        this._applyDamping();
        this._saveState();
    }

    /**
     * 施加阻尼
     *
     * @private
     * @param {number} [dt=1 / constant.GAME_FRAME]
     */
    private _applyDamping (dt = 1 / Constant.GAME_FRAME) {
        this._rigidBody.getLinearVelocity(v3_1);
        // console.log('getLinearVelocity2' + v3_1);
        if (v3_1.lengthSqr() > EPSILON) {
            v3_1.multiplyScalar(Math.pow(1.0 - this.damping, dt));
            this._rigidBody.setLinearVelocity(v3_1);
            // console.log('setLinearVelocity2' + v3_1);
        }
    }

    /**
     * 施加重力
     *
     * @private
     */
    private _applyGravity () {
        const g = this.gravity;
        const m = this._rigidBody.mass;
        v3_1.set(0, m * g, 0);
        this._rigidBody.applyForce(v3_1)
    }

    /**
     * 获取线性速度
     *
     * @private
     */
    private _saveState () {
        this._rigidBody.getLinearVelocity(this._velocity);
        // console.log('getLinearVelocity3' + this._velocity  + ":" + this._grounded);
    }

    update (dtS: number) {
        const dt = 1000 / Constant.GAME_FRAME;
        this._updateCharacter(dt);
    }
}