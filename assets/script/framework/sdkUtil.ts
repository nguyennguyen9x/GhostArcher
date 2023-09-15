import { _decorator, SpriteFrame, sys } from "cc";
import { PlayerData } from "./playerData";
import { StorageManager } from './storageManager';
//管理广告、分享、SDK相关内容的组件
export class SdkUtil {
    public static platform: string = 'cocos'; //平台
    public static imgAd: SpriteFrame = null!;
    public static imgShare: SpriteFrame = null!;
    public static isDebugMode: boolean = false;
    public static onlineInterval: number = -1;
    public static isEnableVibrate: boolean = true;
    public static isCheckOffline: boolean = false; //登录后会检查是否展示登录界面，而且只检查一次
    public static isWatchVideoAd: boolean = false;//是否正在播放广告
    public static isEnableMoving: boolean = false;//是否允许屏幕上下移动
    public static isEnableZoom: boolean = false;//是否允许屏幕缩放
    public static arrLockDiary = [];//未解锁日记
    public static vibrateInterval: number = 100;//两次震动之间的间隔,AppActivity里面的震动间隔也是100
    public static vibratePreTime: number = 0;//上次震动时间

    /**
       * 自定义事件统计
       *
       * @param {string} eventType
       * @param {object} objParams
       */
    public static customEventStatistics(eventType: string, objParams?: any) {
        eventType = eventType.toString();
        if (!objParams) {
            objParams = {};
        }

        // console.log({'eventType': eventType},{'objParams': objParams});

        objParams.isNewBee = PlayerData.instance.isNewBee;

        if (this.platform === 'wx') {
            //@ts-ignore
            if (window['wx'] && window['wx']['aldSendEvent']) {
                //@ts-ignore
                window.wx['aldSendEvent'](eventType, objParams);
            }
        }

        //@ts-ignore
        if (this.platform === 'cocos' && window.cocosAnalytics && window.cocosAnalytics.isInited()) {
            console.log("###统计", eventType, objParams);
            //@ts-ignore
            window.cocosAnalytics.CACustomEvent.onStarted(eventType, objParams);
        }
    }

    /**
     * 调用震动
     */
    public static vibrateShort() {
        let isEnableVibrate = StorageManager.instance.getGlobalData("vibration") ?? true;

        if (isEnableVibrate) {
            let now = Date.now();

            if (now - this.vibratePreTime >= this.vibrateInterval) {
                if (sys.isNative) {
                    jsb.reflection.callStaticMethod("com/cocos/game/AppActivity", "vibrator", "()V");
                //@ts-ignore
                } else if (window.wx) {
                //@ts-ignore
                    wx.vibrateShort({
                        success: (result: any) => {

                        },
                        fail: () => { },
                        complete: () => { }
                    });
                }

                this.vibratePreTime = now;
            }
        }
    }

    /**
     * 微信分享
     * 
     * @static
     * @param {string} title
     * @param {string} imageUrl
     * @returns
     * @memberof SdkUtil
     */
    public static shareGame(title: string, imageUrl: string) {
        //@ts-ignore
        if (!window.wx) {
            return;
        }

        //@ts-ignore
        wx.showShareMenu({
            withShareTicket: true,
            complete: () => {

            }
        });

        //@ts-ignore
        if (wx.aldOnShareAppMessage) {
            //@ts-ignore
            wx.aldOnShareAppMessage(function () {
                // 用户点击了“转发”按钮
                return {
                    title: title,
                    imageUrl: imageUrl,

                };
            });
        } else {
            //@ts-ignore
            wx.onShareAppMessage(function () {
                // 用户点击了“转发”按钮
                return {
                    title: title,
                    imageUrl: imageUrl,

                };
            });
        }
    }
}
