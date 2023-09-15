import { _decorator, Component, game, Node, assetManager, director } from 'cc';
import { Constant } from './framework/constant';

//挂载到login场景下的canvas节点
const { ccclass, property } = _decorator;

@ccclass('Login')
export class Login extends Component {
    @property(Node)
    public ndCanvas: Node = null!;

    start () {
        console.log("login");
        game.addPersistRootNode(this.ndCanvas);

        Constant.LOGIN_TIME = Date.now();

        let bundleRoot = ["resources", "main"];
        let arr: any = [];

        //微信优化开屏加载性能
        //@ts-ignore
        if (window.wx) {
            bundleRoot.forEach((item: string) => {
                let p = new Promise((resolve, reject) => {
                    assetManager.loadBundle(item, function (err, bundle) {
                        if (err) {
                            return reject(err);
                        }

                        resolve(bundle);
                    });
                })

                arr.push(p);
            })

            Promise.all(arr).then(() => {
                director.loadScene("fight", () => {
                }, () => {

                })
            })
        } else {
            director.loadScene("fight", () => {
            }, () => {

            })
        }
    }
}
