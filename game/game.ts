import kaboom, {AreaComp, ColorComp, GameObj, OriginComp, OutlineComp, PosComp, RectComp, TextComp, Vec2} from "kaboom";

const cleverbot = (stimulus: string, context: string[] = []) => fetch(`http://localhost:8192/clever?stimulus=${encodeURIComponent(stimulus)}${context.length > 0 ? `"&context=${encodeURIComponent(context.join(","))}` : ""}`).then(r => r.text());

const users = [
    "elf",
    "L403",
    "nyx",
    "Tiny",
    "Glack",
    "Bidoof",
    "Pepe",
    "sadface",
    "Olzie-12",
    "sabshilli",
    "MightyThunderHQ_",
    "fVenom",
    "TabbyRaider67",
    "iWillBanU",
    "cnce",
    "RyanKBolts"
]

let kbm = kaboom({
    background: [0, 0, 0],
    global: false
});

const rx = (x: number) => kbm.width() / 100 * x;
const ry = (y: number) => kbm.height() / 100 * y;

let buttonsDisabled = false;
let playerName: string;

function button(text: string, pos: Vec2, click: () => any): [GameObj<RectComp | OutlineComp | ColorComp | AreaComp | PosComp | OriginComp>, GameObj<TextComp | PosComp | OriginComp>] {
    let bg = kbm.add([
        kbm.rect(256, 64),
        kbm.outline(5, kbm.BLACK),
        kbm.color(kbm.WHITE),
        kbm.area(),
        kbm.pos(pos),
        kbm.origin("center")
    ]);

    let txt = kbm.add([
        kbm.text(text, {size: 30, font: "sinko"}),
        kbm.pos(pos),
        kbm.origin("center")
    ]);

    bg.onClick(() => {
        if (buttonsDisabled) return;
        bg.color = kbm.WHITE;
        click();
    });

    bg.onHover(() => {
        if (buttonsDisabled) return;
        bg.color = kbm.CYAN;
    }, () => {
        if (buttonsDisabled) return;
        bg.color = kbm.WHITE;
    });

    return [bg, txt];
}

function textInput(input: GameObj<TextComp>): Promise<string> {
    return new Promise(resolve => {
        let inputText = "";
        onkeydown = function (e) {
            if (e.key.length === 1) {
                inputText += e.key;
                input.text = inputText + "_";
            } else if (e.key === "Backspace") {
                inputText = inputText.substring(0, inputText.length - 1);
                input.text = inputText + "_";
            } else if (e.key === "Enter") {
                resolve(inputText);
            }
        }
    });
}

async function promptText(message: string): Promise<string> {
    buttonsDisabled = true;

    let fade = kbm.add([
        kbm.rect(kbm.width(), kbm.height()),
        kbm.color(kbm.BLACK),
        kbm.opacity(0.5),
        kbm.z(97)
    ]);

    let box = kbm.add([
        kbm.rect(500, 250),
        kbm.outline(5, kbm.BLACK),
        kbm.color(kbm.WHITE),
        kbm.origin("center"),
        kbm.pos(kbm.center()),
        kbm.z(98)
    ]);

    let label = kbm.add([
        kbm.text(message, {size: 30}),
        kbm.pos(kbm.center().sub(0, 75)),
        kbm.z(99),
        kbm.origin("center")
    ]);

    let input = kbm.add([
        kbm.text("_", {size: 25, font: "sinko"}),
        kbm.pos(kbm.center().add(0, 25)),
        kbm.z(99),
        kbm.origin("center")
    ]);

    let inputText = await textInput(input);

    fade.destroy();
    box.destroy();
    label.destroy();
    input.destroy();
    buttonsDisabled = false;

    return inputText;
}

kbm.loadSprite("logo", "sprites/logo.png").catch(console.error);
kbm.loadSprite("bg", "sprites/bg.png").catch(console.error);
kbm.loadSprite("mask", "sprites/mask.png").catch(console.error);

for (const user of users.concat(["user"])) kbm.loadSprite(`avatar-${user}`, `sprites/avatars/${user}.png`).catch(console.error);

kbm.loadSound("bg", "audio/bg.mp3").catch(console.error);

kbm.scene("splash", async () => {
    kbm.play("bg");

    let txt = kbm.add([
        kbm.text("For Warmpigman#0359\n\nZyphon Network Secret Santa 2021", {size: 30}),
        kbm.origin("center"),
        kbm.pos(kbm.center()),
        kbm.opacity(0)
    ]);

    await kbm.wait(1);

    for (let i = 0; i < 40; i++) {
        txt.opacity += 0.025;
        await kbm.wait(0);
    }

    await kbm.wait(2.5);

    for (let i = 0; i < 40; i++) {
        txt.opacity -= 0.025;
        await kbm.wait(0);
    }

    await kbm.wait(0.5);
    kbm.go("title");
});

kbm.scene("title", async () => {
    let bg = kbm.add([
        kbm.rect(kbm.width(), kbm.height()),
        kbm.pos(0,0),
        kbm.color(kbm.WHITE),
        kbm.opacity(0)
    ]);

    let logo = kbm.add([
        kbm.sprite("logo", {
            width: 256,
            height: 256
        }),
        kbm.origin("center"),
        kbm.pos(kbm.center().sub(0, 200)),
        kbm.opacity(0)
    ]);

    for (let i = 0; i < 40; i++) {
        bg.opacity += 0.025;
        logo.opacity += 0.025;
        await kbm.wait(0);
    }

    let playButton = button("Play", kbm.center(), async () => {
        playerName = await promptText("Please enter your name.");
        playButton[0].destroy();
        playButton[1].destroy();
        quitButton[0].destroy();
        quitButton[1].destroy();
        for (let i = 0; i < 40; i++) {
            bg.opacity -= 0.025;
            logo.opacity -= 0.025;
            await kbm.wait(0);
        }
        kbm.go("game");
    });

    let quitButton = button("Quit", kbm.center().add(0, 100), window.close);

});

kbm.scene("game", async () => {
    const bg = kbm.add([
        kbm.sprite("bg", {width: kbm.width(), height: kbm.height()}),
        kbm.opacity(0)
    ]);

    const hint = kbm.add([
        kbm.text("Type something and press Enter to send the message. Press Ctrl+W to exit.", {size: 15}),
        kbm.opacity(0),
        kbm.origin("topright"),
        kbm.pos(kbm.width() - 5, 5)
    ]);

    for (let i = 0; i < 40; i++) {
        bg.opacity += 0.025;
        hint.opacity += 0.025;
        await kbm.wait(0);
    }

    const chosenUsers = [];
    for (let i = 0; i < 3; i++) {
        let user;
        do {
            user = users[Math.floor(Math.random() * users.length)];
        } while (chosenUsers.includes(user) || user === playerName);
        chosenUsers.push(user);
    }

    const messages = [];
    let currentUser = 0;
    const text = kbm.add([
        kbm.text("_", {font: "sinko", size: 20}),
        kbm.pos(rx(28), ry(92.85))
    ]);

    async function renderMessage(message: string, user: string) {
        for (const obj of kbm.get("messageComponent")) {
            obj.moveBy(0, -100);
            if (obj.pos.y < ry(10)) obj.destroy();
        }

        if (message.length > 55) message = `${message.slice(0, 55)}\n${message.slice(55)}`;

        kbm.add([
            kbm.text(user === "user" ? playerName : user, {font: "sinko", size: 20}),
            kbm.pos(rx(30), ry(80)),
            "messageComponent"
        ]);

        kbm.add([
            kbm.text(message, {font: "sinko", size: 15}),
            kbm.pos(rx(30), ry(85)),
            "messageComponent"
        ]);

        kbm.add([
            kbm.sprite(`avatar-${user}`, {width: 64, height: 64}),
            kbm.pos(rx(24.25), ry(79)),
            "messageComponent"
        ]);
        kbm.add([
            kbm.sprite(`mask`, {width: 64, height: 64}),
            kbm.pos(rx(24.25), ry(79)),
            "messageComponent"
        ]);
    }

    async function promptMessage() {
        let msg = await textInput(text);
        messages.push(msg);
        await renderMessage(msg, "user");
        text.text = "_";
        await promptMessage();
    }

    kbm.onUpdate(async () => {
        if (messages.length === 0) return;
        if (Math.random() > 0.99) {
            messages.push(await cleverbot(messages[messages.length - 1], messages.filter((v, i) => i !== messages.length - 1)));
            await renderMessage(messages[messages.length - 1], chosenUsers[currentUser]);
            currentUser = ++currentUser % 3;
        }
    });

    promptMessage().catch(console.error);
})

kbm.go("splash");