import { _decorator, Node, Prefab, AnimationComponent, ParticleSystemComponent, Vec3, find, AnimationState, AnimationClip, isValid, director } from 'cc';
import { PoolManager } from './poolManager';
import { ResourceUtil } from './resourceUtil';
import { WarningCircle } from '../fight/warningSkill/warningCircle';
import { WarningStrip } from '../fight/warningSkill/warningStrip';
import { WarningLine } from '../fight/warningSkill/warningLine';


//加载特效所需参数
export interface loadAndPlayEffectOptions {
    effectPath: string,//特效路径
    ndTarget?: Node,//特效所在节点，即特效(ndEffect)的父节点
    isLocal?: boolean,//是否将特效节点设置在本地坐标或者世界坐标下
    pos?: Vec3,//坐标
    eulerAngles?: Vec3,//角度
    isPlayAnimation?: boolean,//是否播放动画
    isPlayParticle?: boolean,//是否播放特效
    scale?: number,//缩放大小
    speed?: number,//播放速度
    isRecycle?: boolean,//是否回收
    recycleTime?: number, //回收时间，如果需要回收但不传值，则等特效和非循环的动画都播放完成才回收
}

//播放特效所需参数
export interface playEffectOptions {
    ndEffect: Node,//特效节点
    isPlayAnimation?: boolean,//是否播放动画
    isPlayParticle?: boolean,//是否播放特效
    speed?: number,//播放速度
    isRecycle?: boolean,//是否回收
    recycleTime?: number, //回收时间，如果需要回收但不传值，则等特效和非循环的动画都播放完成才回收
}

//播放动画所需参数
export interface playAnimationOptions {
    ndEffect: Node,//特效节点
    animationName?: string,//动画名称（当节点下只有一个动画组件，并指定播放动画的时候才会使用这个参数，否则都使用默认动画）
    speed?: number,//动画播放速度
    wrapMode?: number,//动画循环模式
    isRecycle?: boolean,//是否回收
    recycleTime?: number, //回收时间，如果需要回收但不传值，则等非循环的动画都播放完成才回收
}

//播放特效所需参数
export interface playParticleOptions {
    ndEffect: Node,//特效节点
    speed?: number,//粒子播放速度
    isRecycle?: boolean,//是否回收
    recycleTime?: number, //多少秒回收，如果需要回收但不传值，则等特效都播放完成才回收
}

const { ccclass, property } = _decorator;
//特效管理脚本
@ccclass('EffectManager')
export class EffectManager {
    private _ndParent: Node = null!;

    private static _instance: EffectManager;

    public get ndParent () {
        if (!this._ndParent) {
            let ndEffectParent = find("effectManager") as Node;

            if (ndEffectParent) {
                this._ndParent = ndEffectParent;
            } else {
                // console.warn("请在场景里添加effectManager节点");
                this._ndParent = new Node("effectManager");
                director.getScene()?.addChild(this._ndParent);
            }
        }

        return this._ndParent;
    }

    public static get instance () {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new EffectManager();
        return this._instance;
    }

    /**
     * 重置特效节点状态
     * @param ndEffect 特效节点
     * @param aniName 动画名字
     * @returns 
     */
    public resetEffectState (ndEffect: Node, aniName?: string) {
        if (!isValid(ndEffect)) {
            return;
        }

        let arrParticle: ParticleSystemComponent[] = ndEffect.getComponentsInChildren(ParticleSystemComponent);

        if (arrParticle.length) {
            arrParticle.forEach((element: ParticleSystemComponent) => {
                element?.stop();
                element?.clear();
            })
        }

        let arrAni: AnimationComponent[] = ndEffect.getComponentsInChildren(AnimationComponent);

        if (arrAni.length) {
            arrAni.forEach((element: AnimationComponent, idx: number) => {

                if (element.defaultClip && element.defaultClip.name) {
                    let aniState: any = null!;

                    if (aniName) {
                        aniState = element.getState(aniName);
                    }

                    if (!aniState) {
                        aniState = element.getState(element.defaultClip.name);
                    }

                    if (aniState) {
                        aniState.stop();
                        aniState.time = 0;
                        aniState.sample();
                    }
                }
            })
        }
    }
    /**
         * 加载特效节点并播放节点下面的动画、粒子
         *
         * @param {loadAndPlayEffectOptions} options
         * @return {*} 
         * @memberof EffectManager
         */
    public async loadAndPlayEffect (options: loadAndPlayEffectOptions) {
        //给options赋默认值
        let {
            effectPath = "",
            ndTarget = null,
            isLocal = true,
            pos = null,
            eulerAngles = null,
            isPlayAnimation = true,
            isPlayParticle = true,
            scale = 1,
            speed = 1,
            isRecycle = false,
            recycleTime = 0,
        } = options;

        //如果是本地坐标，父节点被回收的时候不播放
        if (isLocal && (!ndTarget || !ndTarget.parent)) {
            return;
        }

        let pf = await ResourceUtil.loadEffectRes(effectPath) as Prefab;
        let ndParent = isLocal ? ndTarget : this.ndParent;
        let ndEffect: Node = PoolManager.instance.getNode(pf, ndParent as Node);

        if (isLocal) {
            ndEffect.setScale(scale, scale, scale);

            if (pos && pos instanceof Vec3) {
                ndEffect.setPosition(pos);
            }

            if (eulerAngles && eulerAngles instanceof Vec3) {
                ndEffect.setRotationFromEuler(eulerAngles.x, eulerAngles.y, eulerAngles.z);
            }
        } else {
            ndEffect.setWorldScale(scale, scale, scale);

            if (pos && pos instanceof Vec3) {
                ndEffect.setWorldPosition(pos);
            }

            if (eulerAngles && eulerAngles instanceof Vec3) {
                ndEffect.setWorldRotationFromEuler(eulerAngles.x, eulerAngles.y, eulerAngles.z);
            }
        }

        let obj: playEffectOptions = {
            ndEffect,
            isPlayAnimation,
            isPlayParticle,
            speed,
            isRecycle,
            recycleTime,
        }

        this.playEffect(obj);
    }

    /**
     * 播放节点下面的动画、粒子
     *
     * @param {playEffectOptions} options
     * @memberof EffectManager
     */
    public playEffect (options: playEffectOptions) {
        return new Promise((resolve, reject) => {
            //给options赋默认值
            let {
                ndEffect,
                isPlayAnimation = true,
                isPlayParticle = true,
                speed = 1,
                isRecycle = false,
                recycleTime = 0,
            } = options;

            let arrPromise = [];

            if (isPlayAnimation) {
                let obj: playAnimationOptions = {
                    ndEffect,
                    animationName: "",
                    speed,
                }
                let p1 = this.playAnimation(obj);
                arrPromise.push(p1);
            }

            if (isPlayParticle) {
                let obj: playParticleOptions = {
                    ndEffect,
                    speed,
                }
                let p2 = this.playParticle(obj);
                arrPromise.push(p2);
            }

            let cb = () => {
                if (ndEffect && ndEffect.parent) {
                    if (isRecycle) {
                        PoolManager.instance.putNode(ndEffect);
                        // console.log(`###回收特效节点: ${ndEffect.name}`);
                    }

                    resolve?.(null);
                }
            }

            if (isRecycle && recycleTime) {
                setTimeout(cb, recycleTime * 1000);
            } else {
                Promise.all(arrPromise).then(() => {
                    // console.log(`###特效播放结束: ${ndEffect.name}`);
                    cb();
                })
            }
        })
    }

    /**
     * 播放节点上的动画特效
     *
     * @param {playAnimationOptions} options
     * @return {*} 
     * @memberof EffectManager
     */
    public playAnimation (options: playAnimationOptions) {
        return new Promise((resolve, reject) => {
            //给options赋默认值
            let {
                ndEffect,
                speed = 1,
                animationName = "",
                wrapMode = AnimationClip.WrapMode.Default,
                isRecycle = false,
                recycleTime = 0,
            } = options;

            if (!ndEffect.active) {
                ndEffect.active = true;
            }

            let arrAni: AnimationComponent[] = ndEffect.getComponentsInChildren(AnimationComponent);
            let noLoopAniPlayCount: number = 0;//非循环的动画未播放完成的数量 

            //arrAni去掉动画组件没有激活和动画组件所在节点在场景中没有激活的节点
            arrAni = arrAni.filter((aniCom: AnimationComponent) => {
                return aniCom.node.activeInHierarchy && aniCom.enabled;
            })

            if (arrAni.length) {
                arrAni.forEach((aniCom: AnimationComponent, idx: number) => {
                    let aniName = animationName ? animationName : aniCom?.defaultClip?.name;

                    if (aniName) {
                        let aniState!: AnimationState;
                        aniState = aniCom.getState(aniName);
                        if (aniState) {
                            aniState.time = 0;
                            aniState.speed = speed;
                            aniState.sample();

                            if (wrapMode) {
                                aniState.wrapMode = wrapMode;
                            }

                            //区分不同的动画模式
                            switch (aniState.wrapMode) {
                                case AnimationClip.WrapMode.Normal:
                                case AnimationClip.WrapMode.Reverse:
                                    noLoopAniPlayCount += 1;
                                    aniCom.once(AnimationComponent.EventType.FINISHED, () => {
                                        noLoopAniPlayCount -= 1;
                                        if (noLoopAniPlayCount === 0 && (!isRecycle || !recycleTime)) {
                                            // console.log("###动画循环模式为normal、reverse的动画都播放完成了");
                                            cb();
                                        }
                                    })
                                    break;
                                case AnimationClip.WrapMode.Loop:
                                case AnimationClip.WrapMode.PingPong:
                                case AnimationClip.WrapMode.PingPongReverse:
                                case AnimationClip.WrapMode.Default:
                                    break;
                            }

                            aniCom?.play(aniName);
                        }
                    }
                })

                let cb = () => {
                    if (ndEffect && ndEffect.parent) {
                        if (isRecycle) {
                            PoolManager.instance.putNode(ndEffect);
                            // console.log(`###回收动画特效节点: ${ndEffect.name}`);
                        }

                        // console.log(`###节点上的动画播放完成: ${ndEffect.name}`);
                        resolve?.(null);
                    }
                }

                if (isRecycle && recycleTime) {
                    setTimeout(cb, recycleTime * 1000);
                } else if (!noLoopAniPlayCount) {
                    cb();
                    // console.warn(`###没有播放循环为normal、reverse的动画，直接返回播放完成状态(resolve), 如需回收请传入recycleTime`);
                }
            } else {
                console.warn(`###${ndEffect.name}节点下没有可以播放的动画组件，直接返回播放完成状态`);
                resolve?.(null);
            }
        })
    }

    /**
     * 播放节点上的粒子特效
     *
     * @param {playParticleOptions} options
     * @return {*} 
     * @memberof EffectManager
     */
    public playParticle (options: playParticleOptions) {
        return new Promise((resolve, reject) => {
            //给options赋默认值
            let {
                ndEffect,
                speed = 1,
                isRecycle = false,
                recycleTime = 0,
            } = options;

            //粒子播放最长时间
            let maxDuration: number = 0;

            if (!ndEffect.active) {
                ndEffect.active = true;
            }

            let arrParticle: ParticleSystemComponent[] = ndEffect.getComponentsInChildren(ParticleSystemComponent);

            //arrParticle去掉粒子组件在没有激活和粒子组件所在节点在场景中没有激活的节点
            arrParticle = arrParticle.filter((particleCom: ParticleSystemComponent) => {
                return particleCom.node.activeInHierarchy && particleCom.enabled;
            })

            if (arrParticle.length) {
                arrParticle.forEach((element: ParticleSystemComponent) => {
                    element.simulationSpeed = speed;
                    element?.clear();
                    element?.stop();
                    element?.play();

                    let duration: number = element.duration;
                    maxDuration = duration > maxDuration ? duration : maxDuration;
                })

                //优先使用传进来的时间，如果没有，则使用粒子最长时间（后续如果能监听粒子播放结束状态，则再优化写法）
                maxDuration = recycleTime && recycleTime > 0 ? recycleTime : maxDuration;

                setTimeout(() => {
                    if (ndEffect && ndEffect.parent) {
                        if (isRecycle) {
                            // console.log(`###回收粒子特效节点: ${ndEffect.name}`);
                            PoolManager.instance.putNode(ndEffect);
                        }

                        // console.log(`###节点上的粒子播放完成: ${ndEffect.name}`);
                        resolve?.(null);
                    }
                }, maxDuration * 1000)

            } else {
                console.warn(`###${ndEffect.name}节点下没有可以播放的粒子组件，直接返回播放完成状态`);
                resolve?.(null);
            }
        })
    }

    /**
     * 展示预警
     *
     * @param {string} warningName
     * @param {number} scale
     * @param {*} scriptParent
     * @memberof EffectManager
     */
    public async showWarning (warningName: string, scale: number, scriptParent: any) {
        let pf = await ResourceUtil.loadEffectRes(`warning/${warningName}`) as Prefab;
        let ndWarning = PoolManager.instance.getNode(pf, this.ndParent) as Node;

        let scriptWarning: any = null;
        if (warningName === "warningLine") {
            scriptWarning = ndWarning.getComponent(WarningLine) as WarningLine;
        } else if (warningName === "warningStrip") {
            scriptWarning = ndWarning.getComponent(WarningStrip) as WarningStrip;
        } else if (warningName === "warningCircle") {
            scriptWarning = ndWarning.getComponent(WarningCircle) as WarningCircle;
        }

        scriptWarning.init(scale, scriptParent);
        scriptParent.scriptWarning = scriptWarning;
    }

    /**
     * 展示闪电特效连接
     *
     * @param {Node} ndParent
     * @param {Node} ndTarget
     * @memberof EffectManager
     */
    public async showLightningChain (ndParent: Node, ndTarget: Node) {
        let pf = await ResourceUtil.loadEffectRes(`lightningChain/lightningChain`) as Prefab;
        let ndEffect = PoolManager.instance.getNode(pf, ndParent) as Node;
        ndEffect.setWorldPosition(ndParent.worldPosition.x, 2.3, ndParent.worldPosition.z);

        let offsetPos: Vec3 = new Vec3();

        Vec3.subtract(offsetPos, ndTarget.worldPosition, ndParent.worldPosition);
        ndEffect.setWorldScale(1, offsetPos.length(), 1);
        ndEffect.forward = offsetPos.normalize().negative();

        setTimeout(() => {
            PoolManager.instance.putNode(ndEffect);
        }, 100)
    }
}
