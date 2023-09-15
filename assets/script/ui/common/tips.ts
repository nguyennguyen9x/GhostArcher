import { Util } from './../../framework/util';
import { _decorator, Component, LabelComponent, Vec3, tween, UIOpacityComponent, isValid, SpriteFrame, SpriteComponent, UITransform, Color } from 'cc';
import { PoolManager } from '../../framework/poolManager';
const { ccclass, property } = _decorator;
//提示脚本
@ccclass('tips')
export class tips extends Component {
    @property(LabelComponent)
    public lbTips: LabelComponent = null!;

    @property(SpriteComponent)
    public spIcon: SpriteComponent = null!;

    @property(SpriteComponent)
    public spBg: SpriteComponent = null!;

    @property(UIOpacityComponent)
    public UIOpacityBg: UIOpacityComponent = null!;

    @property(SpriteFrame)
    public sfGold: SpriteFrame = null!;

    @property(SpriteFrame)
    public sfHeart: SpriteFrame = null!;

    private _movePos: Vec3 = new Vec3();
    private _curTipPos = new Vec3();
    private _uiTipTargetPos: Vec3 = new Vec3(0, 230, 0);//文字提示目标位置

    public show (content: string, type: string, targetPos: Vec3, scale: number, callback: Function = () => { }) {
        this.node.setScale(scale, scale, scale);

        let size = this.lbTips?.node?.getComponent(UITransform)?.contentSize;
        if (!isValid(size)) {//size不存在，自我销毁
            PoolManager.instance.putNode(this.node);
            return;
        }

        this.lbTips.string = content;
        this.lbTips.color = new Color(214, 132, 53, 255);

        if (type === 'gold' || type === 'heart') {
            this.spBg.enabled = false;
            this._movePos.set(0, 0, 0);
            this._curTipPos.set(0, 0, 0);
            this.UIOpacityBg.opacity = 50;

            if (type === 'gold') {
                this.spIcon.spriteFrame = this.sfGold;
            } else if (type === 'heart') {
                this.spIcon.spriteFrame = this.sfHeart;
            }

            this.lbTips.color = new Color(255, 255, 255, 255);
            this.lbTips.string = Util.formatValue(Number(content));

            tween(this.node)
                .to(1.2, { scale: new Vec3(scale, scale, scale) }, { easing: 'smooth' })
                .start();

            tween(this.UIOpacityBg)
                .to(0.8, { opacity: 255 }, { easing: 'smooth' })
                .to(0.4, { opacity: 0 }, { easing: 'smooth' })
                .call(() => {
                    callback && callback();
                    PoolManager.instance.putNode(this.node);
                })
                .start();
        } else {
            //纯文字提示
            this.spBg.enabled = true;
            this.UIOpacityBg.opacity = 255;
            this.node.setPosition(targetPos);

            this.spIcon.node.active = false;

            this.scheduleOnce(() => {
                tween(this.node)
                    .to(1.1, { position: this._uiTipTargetPos }, { easing: 'smooth' })
                    .call(() => {
                        callback && callback();
                        PoolManager.instance.putNode(this.node);
                    })
                    .start();

                tween(this.UIOpacityBg)
                    .to(0.7, { opacity: 220 }, { easing: 'smooth' })
                    .to(0.4, { opacity: 0 }, { easing: 'smooth' })
                    .call(() => {

                    })
                    .start();
            }, 0.8);
        }
    }
}
