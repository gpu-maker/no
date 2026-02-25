// =======================
// Game State
// =======================
const gameState = {
    day: 1,
    health: 100,
    water: 50,
    food: 50,
    sanity: 100,
    inventory: {
        "SAS Survival Handbook": 1,
        "Victorinox Multi-tool": 1,
        "Metal Pot": 1
    },
    location: "beach",
    events: [],
};

// =======================
// Terminal Output
// =======================
const output = document.getElementById('output');
const commandInput = document.getElementById('command');

function print(text) {
    output.innerHTML += text + "<br>";
    output.scrollTop = output.scrollHeight;
}

function printStatus() {
    print(`<strong>Day ${gameState.day}</strong> | Health: ${gameState.health} | Water: ${gameState.water} | Food: ${gameState.food} | Sanity: ${gameState.sanity}`);
}

// =======================
// Game Functions
// =======================
function showInventory() {
    print("Inventory:");
    for (let item in gameState.inventory) {
        print(`- ${item} x${gameState.inventory[item]}`);
    }
}

function explore() {
    const locations = ["forest", "river", "cave", "cliff"];
    const found = locations[Math.floor(Math.random() * locations.length)];
    print(`You explore the island and find yourself near a ${found}.`);

    // Random events
    const rand = Math.random();
    if (rand < 0.3) {
        const foodFound = Math.floor(Math.random() * 10 + 5);
        gameState.food += foodFound;
        print(`You gather ${foodFound} units of food.`);
    } else if (rand < 0.5) {
        const waterFound = Math.floor(Math.random() * 10 + 5);
        gameState.water += waterFound;
        print(`You collect ${waterFound} units of fresh water.`);
    } else if (rand < 0.6) {
        const damage = Math.floor(Math.random() * 15 + 5);
        gameState.health -= damage;
        print(`A wild animal attacks you! You lose ${damage} health.`);
    } else {
        print("Nothing significant happens.");
    }

    gameState.day++;
    gameState.sanity -= 2; // isolation effect
    printStatus();
}

function useItem(item) {
    if (!(item in gameState.inventory)) {
        print("You don't have that item.");
        return;
    }

    switch(item.toLowerCase()) {
        case "sas survival handbook":
            print("You read the survival handbook. You feel more confident.");
            gameState.sanity += 5;
            break;
        case "victorinox multi-tool":
            print("You inspect your multi-tool. Very handy for survival.");
            break;
        case "metal pot":
            print("You can use this to boil water or cook food.");
            break;
        default:
            print("Nothing happens.");
    }
    printStatus();
}

function combine(item1, item2) {
    if (!(item1 in gameState.inventory) || !(item2 in gameState.inventory)) {
        print("You don't have the necessary items to combine.");
        return;
    }
    // Simple combination example
    if ((item1.toLowerCase() === "metal pot" && item2.toLowerCase() === "victorinox multi-tool") ||
        (item2.toLowerCase() === "metal pot" && item1.toLowerCase() === "victorinox multi-tool")) {
        print("You attach the multi-tool to the pot to create a makeshift fishing trap!");
        gameState.inventory["Fishing Trap"] = 1;
    } else {
        print("These items cannot be combined.");
    }
}

function rest() {
    print("You rest and regain some health and sanity.");
    gameState.health = Math.min(gameState.health + 10, 100);
    gameState.sanity = Math.min(gameState.sanity + 5, 100);
    gameState.day++;
    gameState.water -= 5;
    gameState.food -= 5;
    printStatus();
}

// =======================
// Command Handling
// =======================
function handleCommand(cmd) {
    const args = cmd.trim().split(" ");
    const command = args.shift().toLowerCase();

    switch(command) {
        case "help":
            print("Commands: explore, use [item], combine [item1] [item2], inventory, rest, status, help");
            break;
        case "explore":
            explore();
            break;
        case "use":
            useItem(args.join(" "));
            break;
        case "combine":
            combine(args[0], args[1]);
            break;
        case "inventory":
            showInventory();
            break;
        case "rest":
            rest();
            break;
        case "status":
            printStatus();
            break;
        default:
            print("Unknown command. Type 'help' for a list of commands.");
    }
}

// =======================
// Event Listener
// =======================
commandInput.addEventListener("keydown", function(e){
    if(e.key === "Enter") {
        const cmd = commandInput.value;
        print(`> ${cmd}`);
        handleCommand(cmd);
        commandInput.value = "";
    }
});

// =======================
// Game Start
// =======================
print("Welcome to Stranded: No Escape.");
print("You are trapped on a deserted island. Survive as long as you can.");
print("Type 'help' for a list of commands.");
printStatus();
