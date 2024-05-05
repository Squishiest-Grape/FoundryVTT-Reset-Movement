
import { initControls } from './controls.js';
import { initSettings, getChoices } from './settings.js';

const moduleName = 'reset-movement';

Hooks.once("init", () => {
    initSettings();
    initControls();
});

/**
 * TO DO
 * 
 * hide 'tokens' setting as well and make it dynamic and push changes
 * make functional
 * 
 * 
 */







export function resetMovement () {
    const choices = getChoices();
    const animate = game.settings.get(moduleName, 'animation');
    const tokens = getTokens();
    console.log(`Reset Movement: ${Object.keys(choices).filter(k=>choices[k])}\n  for tokens: ${tokens.map(t=>t.id)}\n  with animation = ${animate}`);


}

function getTokens () {
    let tokens = getTokens0(game.settings.get(moduleName, 'tokens'));
    // if (tokens.length > 0) { return tokens; }
    // return getTokens0(game.settings.get(moduleName, 'tokens2'));
    return tokens;
}

function getTokens0 (tokenChoice) {
    let tokens = game.canvas.tokens.ownedTokens;
    switch (tokenChoice) {
        case 'all':
            return tokens;
        case 'user':
            return tokens.filter(t=>t.actor==game.user.character);
        case 'turn':
            return tokens.filter(t=>t.id==game.combat.current.tokenId);
        case 'combat':
            return tokens.filter(t=>t.inCombat);
        case 'selected':
            return tokens.filter(t=>t.controlled);
        case 'none':
            return [];
        default:
            throw new Error(`Reset Movement unknown token selection choice: ${tokenChoice}`);
    }
}


// async function resetMovement() {
//     const currentToken = canvas.tokens.get(game.combat.combatant.token.id);
//     const startPosition = currentToken.document.getFlag("reset-movement", "startPosition");
//     await currentToken.document.update({
//         x: startPosition.x,
//         y: startPosition.y,
//         rotation: startPosition.rotation
//     }, { animate: game.settings.get("reset-movement", "animationEnabled") });

//     if (game.modules.get("drag-ruler")?.active) dragRuler.resetMovementHistory(game.combat, game.combat.current.combatantId);

// }


// Hooks.once("ready", () => {
//     Hooks.on("updateCombat", async (combat, changed, options, userId) => {
//         if ((game.settings.get("reset-movement", "gmOnly") && !game.user.isGM) || !combat.combatant) return;
//         const currentToken = canvas.tokens.get(combat.combatant.token.id);
//         if (game.user.id === game.users.find(u => u.active && u.isGM)?.id) {
//             await currentToken.document.setFlag("reset-movement", "startPosition", { x: currentToken.x, y: currentToken.y, rotation: currentToken.rotation });
//             await currentToken.document.setFlag("reset-movement", "positionHistory", [currentToken.document.getFlag("reset-movement", "startPosition")]);
//         }
//     });

//     Hooks.on("deleteCombat", async () => {
//         if (game.settings.get("reset-movement", "gmOnly") && !game.user.isGM) return;
//         for (let tkn of canvas.tokens.placeables) {
//             if (game.user.id === game.users.find(u => u.active && u.isGM)?.id) {
//                 await tkn.document.unsetFlag("reset-movement", "startPosition");
//                 await tkn.document.unsetFlag("reset-movement", "positionHistory");
//             }
//         }
//     });
// })
