"use strict";
gsap.registerPlugin(Draggable);
lucide.createIcons();
const CURSOR_START_POSITION = 11;
const CURSOR_STEP = 12;
let cursorX = CURSOR_START_POSITION;
let FULLSCREEN_TOGGLE = false;
function initializeTerminal() {
    const $terminalInput = $(".terminal input");
    $terminalInput.on("focus", cursorBlink);
    $terminalInput.focus();
    $(document).on("click", (event) => {
        $terminalInput.focus();
        event.preventDefault();
    });
    $terminalInput.on("keydown", handleKeyDown);
    Draggable.create(".window", {
        handle: ".header",
        type: "x,y",
        edgeResistance: 0.65,
        bounds: window
    });
    revealCustomText("Ask me anything!");
    $(".close").on("click", () => revealCustomText("I am eternal"));
    $(".minimize").on("click", () => revealCustomText(`error: code-${Math.round(Math.random() * 1000)}`));
    $(".expand").on("click", () => {
        if (FULLSCREEN_TOGGLE) {
            $(".arrows-in").css("display", "none");
            $(".arrows-out").css("display", "block");
            gsap.to(".window", {
                width: 500,
                height: 350,
                transform: "translate(10%, 20%)",
                ease: "elastic.out(0.1, 1)"
            });
        }
        else {
            $(".arrows-in").css("display", "block");
            $(".arrows-out").css("display", "none");
            gsap.to(".window", {
                top: 0,
                left: 0,
                transform: "translate(0,0)",
                height: "100%",
                width: "100%",
                ease: "elastic.out(0.1, 1)"
            });
        }
        FULLSCREEN_TOGGLE = !FULLSCREEN_TOGGLE;
    });
}
function cursorBlink() {
    gsap.fromTo(".cursor", { opacity: 0 }, { opacity: 1, repeat: -1, yoyo: true, ease: "elastic.inOut(0.8, 0.8)" });
}
function cursorBlinkReverse() {
    gsap.fromTo(".cursor", { opacity: 1 }, { opacity: 0, repeat: -1, yoyo: true, ease: "elastic.inOut(0.8, 0.8)" });
}
function handleKeyDown(event) {
    var _a;
    const input = event.target;
    const key = event.key;
    const cursorPosition = (_a = input.selectionStart) !== null && _a !== void 0 ? _a : 0;
    const inputLength = input.value.length;
    if (isResetCommand(event)) {
        resetInput(input);
    }
    else if (isFarLeftCommand(event)) {
        if (cursorPosition > 0) {
            moveCursorFarLeft();
        }
    }
    else if (isFarRightCommand(event)) {
        if (cursorPosition < inputLength) {
            moveCursorFarRight(inputLength);
        }
    }
    else if (key === "Enter") {
        const prompt = input.value;
        resetInput(input);
        decryptText(prompt);
    }
    else if (key === "Backspace") {
        if (cursorPosition > 0) {
            moveCursorLeft();
        }
    }
    else if (key === "ArrowLeft") {
        if (cursorPosition > 0) {
            moveCursorLeft();
        }
    }
    else if (key === "ArrowRight") {
        if (cursorPosition < inputLength) {
            moveCursorRight();
        }
    }
    else if (isRegularInput(event)) {
        moveCursorRight();
    }
    updateCursorPosition();
    cursorBlinkReverse();
}
function moveCursorLeft() {
    cursorX = Math.max(CURSOR_START_POSITION, cursorX - CURSOR_STEP);
}
function moveCursorRight() {
    cursorX += CURSOR_STEP;
}
function moveCursorFarLeft() {
    cursorX = CURSOR_START_POSITION;
}
function moveCursorFarRight(inputLen) {
    cursorX = CURSOR_STEP * (inputLen + 1);
}
function updateCursorPosition() {
    $(".cursor").css("left", `${cursorX}px`);
}
function isFarLeftCommand(event) {
    return ((event.metaKey || event.ctrlKey || event.altKey) &&
        event.key === "ArrowLeft");
}
function isFarRightCommand(event) {
    return ((event.metaKey || event.ctrlKey || event.altKey) &&
        event.key === "ArrowRight");
}
function isResetCommand(event) {
    return ((event.metaKey || event.ctrlKey || event.altKey) &&
        event.key === "Backspace");
}
function isRegularInput(event) {
    return !event.metaKey && !event.ctrlKey && event.key.length === 1;
}
function resetInput(input) {
    cursorX = CURSOR_START_POSITION;
    input.value = "";
}
const url = "https://magic-terminal-server.vercel.app/api/answers";
async function askGPT(prompt) {
    const res = await fetch(url, {
        method: "POST",
        body: JSON.stringify({ prompt }),
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Connection: "keep-alive",
            Mode: "no-cors"
        }
    });
    if (!res.ok) {
        $(".magic-response").text("Error: " + res.status);
    }
    const json = await res.json();
    return json;
}
async function decryptText(prompt) {
    const $decryptingElement = $(".magic-response");
    let len = 1;
    const updateInterval = setInterval(() => setRandomText(len), 15);
    const lengthInterval = setInterval(() => len++, 30);
    const response = (await askGPT(prompt));
    if (response.length > 100) {
        gsap.to(".window", {
            width: 700,
            height: 500
        });
    }
    clearInterval(updateInterval);
    clearInterval(lengthInterval);
    if (response) {
        const lengthInterval = setInterval(() => len < response.length && len++, 10);
        setTimeout(() => {
            clearInterval(lengthInterval);
        }, 11 * (response.length - len));
        let letter = 0;
        const revealInterval = setInterval(() => {
            $(".magic-response").text(response.slice(0, letter) + generateRandomString(len));
            letter++;
            if (len > 0) {
                len--;
            }
            if (letter > response.length) {
                clearInterval(updateInterval);
            }
        }, 8);
        setTimeout(() => {
            clearInterval(revealInterval);
        }, 10 * response.length);
        $decryptingElement.text(response);
        $decryptingElement.css("opacity", 0.8);
    }
}
function revealCustomText(text) {
    let len = 1;
    const updateInterval = setInterval(() => setRandomText(len), 30);
    const lengthInterval = setInterval(() => len < text.length && len++, 60);
    setTimeout(() => {
        clearInterval(updateInterval);
        clearInterval(lengthInterval);
        let letter = 0;
        const revealInterval = setInterval(() => {
            $(".magic-response").text(text.slice(0, letter) + generateRandomString(len));
            letter++;
            if (len > 0) {
                len--;
            }
            if (letter > text.length) {
                clearInterval(updateInterval);
            }
        }, 30);
        setTimeout(() => {
            clearInterval(revealInterval);
        }, 32 * text.length);
    }, 60 * text.length);
}
function generateRandomString(length) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}
function setRandomText(length) {
    const newText = generateRandomString(length);
    $(".magic-response").text(newText);
}
initializeTerminal();