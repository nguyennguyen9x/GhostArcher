import { _decorator, Component } from 'cc';
const { ccclass, property } = _decorator;
//直线范围型的火焰
@ccclass('JetFires')
export class JetFires extends Component {
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

    start () {
        // [3]
    }

    public init (skillInfo: any, baseInfo: any, scriptParent: any) {
        this.skillInfo = skillInfo;
        this.baseInfo = baseInfo;
    }

    // update (deltaTime: number) {
    //     // [4]
    // }
}
