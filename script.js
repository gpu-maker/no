// =======================
// Game State
// =======================
const gridSize = 10;
let playerPos = { x: 0, y: 0 };

const gameState = {
    day: 1,
    health: 100,
    water: 50,
    food: 50,
    inventory: {
        "SAS Survival Handbook": 1,
        "Victorinox Multi-tool": 1,
        "Metal Pot": 1
    },
    weather: "clear",
    journal: [],
    map: [],
};

const pixelScreen = document.getElementById("pixel-screen");

// =======================
// Initialize Map
// =======================
function initMap() {
    gameState.map = [];
    for (let y = 0; y < gridSize; y++) {
        const row = [];
        for (let x = 0; x < gridSize; x++) {
            // Random terrain: water, forest, cave, beach
            const rand = Math.random();
            if (rand < 0.1) row.push("water");
            else if (rand < 0.4) row.push("forest");
            else if (rand < 0.5) row.push("cave");
            else row.push("beach");
        }
        gameState.map.push(row);
    }
    playerPos = { x: Math.floor(gridSize / 2), y: Math.floor(gridSize / 2) };
}

// =======================
// Terminal Output
// =======================
const output = document.getElementById('output');
const commandInput = document.getElementById('command');

function print(text, color="#00FF00") {
    output.innerHTML += `<span style="color:${color}">${text}</span><br>`;
    output.scrollTop = output.scrollHeight;
}

function printStatus() {
    print(`Day ${gameState.day} | Health: ${gameState.health} | Water: ${gameState.water} | Food: ${gameState.food}`, "#00FFFF");
}

// =======================
// Pixel Screen Rendering
// =======================
function renderPixelScreen() {
    pixelScreen.innerHTML = "";
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const pixel = document.createElement("div");
            pixel.classList.add("pixel");
            if (playerPos.x === x && playerPos.y === y) pixel.style.backgroundColor = "#FFFF00"; // player
            else switch(gameState.map[y][x]) {
                case "water": pixel.style.backgroundColor = "#0000FF"; break;
                case "forest": pixel.style.backgroundColor = "#008000"; break;
                case "cave": pixel.style.backgroundColor = "#888888"; break;
                case "beach": pixel.style.backgroundColor = "#FFD700"; break;
                default: pixel.style.backgroundColor = "#000"; break;
            }
            pixelScreen.appendChild(pixel);
        }
    }
}

// =======================
// Game Mechanics
// =======================
function randomWeather() {
    const options = ["clear", "storm", "rain"];
    gameState.weather = options[Math.floor(Math.random() * options.length)];
    print(`Weather today: ${gameState.weather}`, "#FF4500");
}

function movePlayer(direction) {
    let moved = false;
    if (direction === "north" && playerPos.y > 0) { playerPos.y--; moved = true; }
    if (direction === "south" && playerPos.y < gridSize - 1) { playerPos.y++; moved = true; }
    if (direction === "west" && playerPos.x > 0) { playerPos.x--; moved = true; }
    if (direction === "east" && playerPos.x < gridSize - 1) { playerPos.x++; moved = true; }

    if (moved) {
        print(`You move ${direction}. You are now at (${playerPos.x},${playerPos.y})`);
        exploreTile();
    } else {
        print("You can't move further in that direction.");
    }
    renderPixelScreen();
}

function exploreTile() {
    const tile = gameState.map[playerPos.y][playerPos.x];
    print(`You explore a ${tile}.`);
    const rand = Math.random();
    if (tile === "forest" && rand < 0.5) { const foodFound = Math.floor(Math.random()*10+5); gameState.food += foodFound; print(`You gather ${foodFound} food.`, "#ADFF2F"); }
    if (tile === "water" && rand < 0.5) { const waterFound = Math.floor(Math.random()*10+5); gameState.water += waterFound; print(`You collect ${waterFound} water.`, "#00BFFF"); }
    if (tile === "cave" && rand < 0.3) { const damage = Math.floor(Math.random()*10+5); gameState.health -= damage; print(`You are hurt exploring the cave! Lose ${damage} health.`, "#FF0000"); }
    gameState.day++; gameState.water -= 5; gameState.food -= 5;
    randomWeather(); printStatus();
}

// =======================
// Item Handling
// =======================
function useItem(item) {
    if (!(item in gameState.inventory)) { print("You don't have that item."); return; }
    switch(item.toLowerCase()) {
        case "sas survival handbook": print("You read the handbook and gain survival knowledge.", "#ADFF2F"); break;
        case "victorinox multi-tool": print("Inspecting multi-tool.", "#ADFF2F"); break;
        case "metal pot": print("You can boil water or cook food.", "#ADFF2F"); break;
        case "fishing trap": const fish = Math.floor(Math.random()*10+5); gameState.food += fish; print(`You catch ${fish} fish!`, "#00BFFF"); break;
        default: print("Nothing happens."); break;
    }
    printStatus();
}

function combine(item1,item2){
    if(!(item1 in gameState.inventory)||!(item2 in gameState.inventory)){print("Missing items.");return;}
    if((item1.toLowerCase()==="metal pot"&&item2.toLowerCase()==="victorinox multi-tool")||(item2.toLowerCase()==="metal pot"&&item1.toLowerCase()==="victorinox multi-tool")){gameState.inventory["Fishing Trap"]=1;print("Created fishing trap!", "#FF8C00");}
    else print("Cannot combine these items.");
}

function rest() { print("Resting...", "#ADFF2F"); gameState.health=Math.min(gameState.health+10,100); gameState.day++; gameState.water-=5; gameState.food-=5; randomWeather(); printStatus(); }

function showInventory(){ print("Inventory:"); for(let i in gameState.inventory){print(`- ${i} x${gameState.inventory[i]}`);} }

function journalEntry(entry){ gameState.journal.push(`Day ${gameState.day}: ${entry}`); localStorage.setItem("stranded_journal",JSON.stringify(gameState.journal)); print("Journal saved.", "#ADFF2F"); }
function showJournal(){ print("Journal:"); gameState.journal.forEach(e=>print("- "+e)); }

// =======================
// Command Handling
// =======================
function handleCommand(cmd){
    const args=cmd.trim().split(" ");
    const command=args.shift().toLowerCase();
    switch(command){
        case "help": print("Commands: move [north/south/east/west], use [item], combine [item1] [item2], inventory, rest, status, journal [entry], viewjournal, help"); break;
        case "move": movePlayer(args[0]); break;
        case "use": useItem(args.join(" ")); break;
        case "combine": combine(args[0],args[1]); break;
        case "inventory": showInventory(); break;
        case "rest": rest(); break;
        case "status": printStatus(); break;
        case "journal": journalEntry(args.join(" ")); break;
        case "viewjournal": showJournal(); break;
        default: print("Unknown command."); break;
    }
}

// =======================
// Event Listener
// =======================
commandInput.addEventListener("keydown",function(e){if(e.key==="Enter"){const cmd=commandInput.value;print(`> ${cmd}`);handleCommand(cmd);commandInput.value="";}});

// =======================
// Game Start
// =======================
initMap(); renderPixelScreen();
print("Welcome to Stranded: No Escape. Explore and survive!");
print("Type 'help' for commands.");
randomWeather(); printStatus();
