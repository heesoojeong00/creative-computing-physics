const { Engine, Render, Runner, World, Bodies, Events, Mouse, MouseConstraint } = Matter;

const engine = Engine.create();
const { world } = engine;
const render = Render.create({
    element: document.body,
    engine: engine,
    canvas: document.getElementById("matter-canvas"),
    options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: 'white'
    }
});

Render.run(render);
Runner.run(Runner.create(), engine);

const fallenShapes = [];

const stickyBar = Bodies.rectangle(window.innerWidth / 2, window.innerHeight / 2, 1200, 90, { 
    isStatic: true, 
    render: { fillStyle: 'red' },
    chamfer: { radius: 30 }
});
World.add(world, stickyBar);

const ground = Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 50, window.innerWidth + 100, 100, { 
    isStatic: true,
    render: {
        visible: false
    }
});
World.add(world, ground);

let colors = ['red', 'yellow', 'blue'];
let currentColorIndex = 0;
setInterval(() => {
    currentColorIndex = (currentColorIndex + 1) % colors.length;
    stickyBar.render.fillStyle = colors[currentColorIndex];
}, 4000);

Events.on(engine, 'beforeUpdate', function(event) {
    if (Math.random() < 0.04) {
        let shape;
        const randomShape = Math.floor(Math.random() * 3);
        const x = Math.random() * window.innerWidth;
        const size = Math.random() * 70 + 50;
        switch (randomShape) {
            case 0:
                shape = Bodies.circle(x, -30, size, {
                    render: {
                        fillStyle: 'white',
                        strokeStyle: 'grey',
                        lineWidth: 4
                    },
                    restitution: 0.5
                });
                break;
            case 1:
                shape = Bodies.polygon(x, -30, 3, size, {
                    render: {
                        fillStyle: 'white',
                        strokeStyle: 'grey',
                        lineWidth: 4
                    },
                    restitution: 0.5
                });
                break;
            case 2:
                shape = Bodies.rectangle(x, -30, size, size, {
                    render: {
                        fillStyle: 'white',
                        strokeStyle: 'grey',
                        lineWidth: 4
                    },
                    restitution: 0.5
                });
                break;
        }
        World.add(world, shape);
    }
});

Events.on(engine, 'collisionStart', function(event) {
    event.pairs.forEach(function(pair) {
        if (pair.bodyA === stickyBar || pair.bodyB === stickyBar) {
            const shape = pair.bodyA === stickyBar ? pair.bodyB : pair.bodyA;
            shape.render.fillStyle = stickyBar.render.fillStyle;
        }
    });
});

Events.on(engine, 'collisionActive', function(event) {
    event.pairs.forEach(function(pair) {
        if (pair.bodyA === stickyBar || pair.bodyB === stickyBar) {
            const otherBody = pair.bodyA === stickyBar ? pair.bodyB : pair.bodyA;
            otherBody.frictionAir = 0.01;
        }
    });
});

Events.on(engine, 'collisionStart', function(event) {
    event.pairs.forEach(function(pair) {
        if (pair.bodyA === ground) {
            const shape = pair.bodyB;
            fallenShapes.push(shape);
        } else if (pair.bodyB === ground) {
            const shape = pair.bodyA;
            fallenShapes.push(shape);
        }
    });
});

Events.on(engine, 'collisionActive', function(event) {
    event.pairs.forEach(function(pair) {
        if (pair.bodyA === stickyBar || pair.bodyB === stickyBar) {
            const otherBody = pair.bodyA === stickyBar ? pair.bodyB : pair.bodyA;
            otherBody.frictionAir = 0.01;
        }
    });
});

Events.on(engine, 'collisionStart', function(event) {
    event.pairs.forEach(function(pair) {
        if ((pair.bodyA === stickyBar && pair.bodyB !== ground) || (pair.bodyB === stickyBar && pair.bodyA !== ground)) {
            pair.isActive = false;
        }
    });
});

World.add(world, MouseConstraint.create(engine, {
    mouse: Mouse.create(render.canvas),
    constraint: {
        render: {
            visible: false
        }
    }
}));

window.addEventListener('resize', () => {
    Render.setPixelRatio(render, window.devicePixelRatio);
    Render.lookAt(render, {
        min: { x: 0, y: 0 },
        max: { x: window.innerWidth, y: window.innerHeight }
    });
    Engine.update(engine, render.bounds);
});
