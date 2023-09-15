import { _decorator, Component, Button } from "cc";
import { AudioManager } from "../audioManager";
const { ccclass, property, menu, requireComponent, disallowMultiple } = _decorator;
//按钮适配脚本
@ccclass("btnAdapter")
@menu('自定义组件/btnAdapter')
@requireComponent(Button)
@disallowMultiple
export class btnAdapter extends Component {

    /**
     * 点击后是否播放点击音效
     * @property isPlaySound
     * @type {Boolean}
     * @default true
     */
    @property({ tooltip: '点击后是否播放点击音效' })
    public isPlaySound: Boolean = true;

    /**
     * 点击音效名
     * @property clickSoundName
     * @type {String}
     * @default true
     */
    @property({ tooltip: '点击音效名' })
    public clickSoundName: string = 'click';

    /**
     * 是否禁止快速二次点击
     * @property isPreventSecondClick
     * @type {Boolean}
     * @default true
     */
    @property({ tooltip: '是否禁止快速二次点击' })
    public isPreventSecondClick: Boolean = false;

    /**
     * 点击后多久才能再次点击,仅isPreventSecondClick为true生效
     * @property preventTime
     * @type {number}
     * @default true
     */
    @property({ tooltip: '点击后多久才能再次点击,仅isPreventSecondClick为true生效' })
    public preventTime: number = 2;

    start () {
        let button: Button = this.node.getComponent(Button) as Button;
        this.node.on('click', () => {
            if (this.isPreventSecondClick) {
                button.interactable = false;
                this.scheduleOnce(() => {
                    if (button.node) button.interactable = true;
                }, this.preventTime);
            }

            if (this.isPlaySound) AudioManager.instance.playSound(this.clickSoundName, false);
        });
    }

    // update (dt) {},
};
