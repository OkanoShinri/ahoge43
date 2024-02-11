import Matter from 'matter-js'
import { Howl } from 'howler'

const ObjectType = {
    Wall: 0b001,
    Sand: 0b010,
    BorderLine: 0b100,
}
function createWall(x: number, y: number, w: number, h: number, angle: number, color: string = "black") {
    return Matter.Bodies.rectangle(x, y, w, h, {
        isStatic: true, angle: angle * Math.PI / 180, render: { fillStyle: color }, collisionFilter: {
            group: 0,
            category: ObjectType.Wall,
            mask: ObjectType.Sand // 衝突対象
        }
    })
}

export default class MatterEngine {
    private engine: Matter.Engine
    private world: Matter.World

    private is_gameover = false
    private is_playing = false;

    /**
     * 新しい物理演算エンジンのインスタンスとデバッグ用のビューを生成します
     * @param selector デバッグ用のビューを置くhtml要素のセレクター
     */
    constructor(selector: string) {
        const Render = Matter.Render
        const WORLD_WIDTH = 1400
        const WORLD_HEIGHT = 800
        this.engine = Matter.Engine.create()
        this.world = this.engine.world
        const world = this.world
        const render = Render.create({
            element: document.querySelector(selector),
            engine: this.engine,
            options: {
                width: WORLD_WIDTH * 1,
                height: WORLD_HEIGHT * 1,
                wireframes: false,
                background: 'peru'
                //showAngleIndicator: true,
                //showCollisions: true,
                //showVelocity: true
            }
        } as any)
        Render.lookAt(render, {
            min: { x: WORLD_WIDTH * 0, y: WORLD_HEIGHT * 0 },
            max: { x: WORLD_WIDTH * 1, y: WORLD_HEIGHT * 1.2 }
        })
        Render.run(render)

        const runner = Matter.Runner.create({})
        Matter.Runner.run(runner, this.engine)


        // 世界創造
        const side = 220;
        Matter.World.add(world, [
            createWall(side, 260, 500, 10, 60),
            createWall(800 - side, 260, 500, 10, -60),
            createWall(side, 690, 500, 10, -60),
            createWall(800 - side, 690, 500, 10, 60),

            createWall(400, 900, 620, 10, 0),

        ]);

        const borderline = 650
        Matter.World.add(world, Matter.Bodies.rectangle(400, borderline, 500, 10, {
            isStatic: true, render: { fillStyle: "red" }, collisionFilter: {
                group: 0,
                category: ObjectType.BorderLine,
                mask: 0 // 衝突対象
            }
        }))

        Matter.World.add(world, [
            createWall(1000, 400, 400, 50, 90),
            createWall(1400, 400, 400, 50, 90),
            createWall(1200, 200, 400, 50, 0),
            createWall(1200, 600, 400, 50, 0),
        ]);


        //ママ
        Matter.World.add(world, Matter.Bodies.rectangle(1200, 400, 1, 1, {
            isStatic: true, render: {
                sprite: {
                    xScale: 0.7,
                    yScale: 0.7,
                    texture: "./images/mama.png"
                }
            }
        }))

        //酔っ払い
        Matter.World.add(world, [
            Matter.Bodies.circle(1200, 400, 10, {
                restitution: 1.3, render: {
                    sprite: {
                        xScale: 0.3,
                        yScale: 0.3,
                        texture: "./images/yopparai.png"
                    }
                }, collisionFilter: {
                    group: 0,
                    category: ObjectType.Sand,
                    mask: ObjectType.Wall// 衝突対象
                }
            }),
            Matter.Bodies.circle(1200, 400, 10, {
                restitution: 1.4, render: {
                    sprite: {
                        xScale: 0.3,
                        yScale: 0.3,
                        texture: "./images/yopparai.png"
                    }
                }, collisionFilter: {
                    group: 0,
                    category: ObjectType.Sand,
                    mask: ObjectType.Wall// 衝突対象
                }
            })])


        //経過時間
        // Matter.World.add(world, Matter.Bodies.rectangle(1200, 400, 1, 1, {
        //     isStatic: true, render: {
        //         sprite: {
        //             xScale: 0.7,
        //             yScale: 0.7,
        //             texture: "./images/mama.png"
        //         }
        //     }
        // }))

        // デバッグ用のマウスコントローラ
        const mouse = Matter.Mouse.create(render.canvas)
        const mouseConstraint = Matter.MouseConstraint.create(this.engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.9,
                render: {
                    visible: false,
                }
            }
        })
        Matter.World.add(world, mouseConstraint);
        render.mouse = mouse;

        const bgm = new Howl({
            src: ["./sound/こんとどぅふぇ素材No.0173-冬眠終了！.mp3"], loop: true,
            volume: 0.5,
        });
        const bakuhatsu = new Howl({
            src: ["./sound/nc9232.mp3"],
            volume: 0.5,
        });

        bgm.play();


        const m_elm = document.querySelector('.matter')
        if (m_elm) {
            m_elm.addEventListener('click', () => {
                if (!this.is_playing) {
                    this.is_playing = true;
                    //砂粒
                    var stack = Matter.Composites.stack(240, -250, 12, 12, 0, 0, (x: number, y: number) => {
                        const r = Matter.Common.random(10, 20);
                        let texture_path = "./images/popcorn.png"
                        let scale = r * 0.02
                        if (Matter.Common.random(0, 2) > 1) {
                            texture_path = "./images/poteto.png";
                            scale = r * 0.02
                        }
                        return Matter.Bodies.circle(x, y, r, {
                            friction: 0.00001, restitution: 0.5, density: 0.001, render: {
                                sprite: {
                                    xScale: scale,
                                    yScale: scale,
                                    texture: texture_path
                                },


                            }, label: "sand", collisionFilter: {
                                group: 0,
                                category: ObjectType.Sand,
                                mask: ObjectType.Wall + ObjectType.Sand // 衝突対象
                            }
                        });
                    });

                    Matter.Composite.add(world, stack);
                }
            })
        }


        const gameover_image = Matter.Bodies.rectangle(800, 400, 1, 1, {
            isStatic: true, render: {
                sprite: {
                    xScale: 1.5,
                    yScale: 1.5,
                    texture: "./images/gameover.png"
                }
            }
        })
        let is_gameover = this.is_gameover
        Matter.Events.on(this.engine, "afterUpdate", function () {
            const bodies = Matter.Composite.allBodies(world);
            const sand_num = bodies.filter((v) => (v.label === "sand" && (v.position.y > borderline))).length;
            if (sand_num >= 120) {//144
                if (!is_gameover) {
                    is_gameover = true
                    console.log("gameover")
                    Matter.World.add(world, gameover_image)
                    bakuhatsu.play()
                }
            }
        });
    }
}
