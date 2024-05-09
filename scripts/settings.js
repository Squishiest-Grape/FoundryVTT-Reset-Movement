
import { updateControls } from "./controls.js";


const tokenOptions = {
    selected: 'Selected Token',
    user: 'Main User Token',
    turn: 'Token with Current Turn',
    combat: 'All Tokens in Combat',
    all: 'All Tokens on Scene',
};

export const settings = new DynamicSettings.ModuleSettings('reset-movement');

export function initSettings() {

    settings.register('animation', {
        name: "Animate Movement",
        hint: "Movement is animated on reset.",
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
    });

    settings.register('playerPerms', {
        name: "Player Permisions",
        hint: "What players are allowed to reset.",
        scope: "world",
        config: false,
        type: Object,
        default: {history: false, position: false},
        requiresReload: true,
    });

    settings.register('playerPerms.history', {
        name: "History",
        hint: "Players can reset their movement history.",
        scope: "world",
        config: true,// ()=>true,
        type: Boolean,
        get: () => {
            return settings.d_get('playerPerms').history;
        },
        set: (v) => {
            const obj = settings.d_get('playerPerms');
            obj.history = v;
            settings.set('playerPerms', obj);
        },
    });

    settings.register('playerPerms.position', {
        name: "Position",
        hint: "Players can reset their position.",
        scope: "world",
        config: true,
        type: Boolean,
        get: () => {
            return settings.d_get('playerPerms').position;
        },
        set: (v) => {
            const obj = settings.d_get('playerPerms');
            obj.position = v;
            settings.set('playerPerms', obj);
        },
    });

    settings.register('choices', {
        name: "User Choices",
        scope: "client",
        config: false,
        type: Object,
        default: {history: true, position: true},
        onChange: () => { updateControls(); },
    });

    settings.register('choices.history', {
        name: "History",
        hint: "Reset movement history on reset.",
        scope: "client",
        config: true,// () => (game.user.isGM || settings.d_get('perms').history),
        type: Boolean,
        get: () => {
            return settings.d_get('choices').history;
        },
        set: (v) => {
            const obj = settings.d_get('choices');
            obj.history = v;
            settings.d_set('choices', obj);
        },
        instant: true,
    });

    settings.register('choices.position', {
        name: "Position",
        hint: "Reset position on reset.",
        scope: "client",
        config: true,// () => game.user.isGM || settings.d_get('perms').positon,
        type: Boolean,
        get: () => {
            return settings.d_get('choices').position;
        },
        set: (v) => {
            const obj = settings.d_get('choices');
            obj.position = v;
            settings.d_set('choices', obj);
        },
        instant: true,
    });

    settings.register('choices with perms', {
        name: "Choices with Permisions",
        scope: "client",
        config: false,
        type: Object,
        get: () => {
            const C = settings.d_get('choices');
            if (!game.user.isGM) {
                const P = settings.d_get('playerPerms');
                for (const [k,v] of Object.entries(C)) {
                    C[k] = v && P[k];
                } 
            }
            return C;
        },
        onChange: () => { settings.sheet.render(); },
    });

    settings.register('tokens', {
        name: "Tokens to Reset",
        hint: "Control which tokens are reset.",
        scope: "client",
        config: () => {
            const C = settings.d_get('choices with perms');
            return Object.values(C).some(Boolean);
        },
        type: String,
        choices: tokenOptions,
        default: 'selected',
    });

}




// game.settings.register(moduleName, 'tokensFallback', {
//     name: "Fallback Tokens Selection",
//     scope: "client",
//     config: false,
//     type: Array,
//     default: [],
//     onChange: verifyFallback,
// });

// game.settings.register(moduleName, 'tokensFallbackEnabled', {
//     name: "Enable Fallback",
//     hint: "Tokens to reset if main selection is empty.",
//     scope: "client",
//     config: false,
//     type: Boolean,
//     default: false,
//     onChange: (val) => { 
//         const tokens = game.settings.get(moduleName, 'tokensFallback');
//         if (val && tokens.length<=0) {
//             const main_token = game.settings.get(moduleName, 'tokens');
//             game.settings.set(moduleName, 'tokensFallback', [Object.keys(tokenOptions).filter(o=>o!=main_token)[0]]);
//         }
//     },
// });

// for (let i=0; i<Object.keys(tokenOptions).length-1; i++) {
//     game.settings.register(moduleName, `tokensFallback${i+1}`, {
//         name: `Fallback ${i+1}`,
//         scope: "client",
//         config: false,
//         type: String,
//         choices: {},
//         onChange: (val) => {
//             const tokens = game.settings.get(moduleName, 'tokensFallback');
//             tokens[i] = val;
//             game.settings.set(moduleName, 'tokensFallback', tokens);                
//         },
//     });
// }




// export function getSelectionOrder () {
//     return [game.settings.get(moduleName, 'tokens'), ...game.settings.get(moduleName, 'tokensFallback')];
// }

// function verifyFallback () {
//     const tokens = getSelectionOrder().reduce((acc, cur) => {
//         if (!acc.includes(cur) && cur in tokenOptions) { acc.push(cur); }
//         return acc;
//     }, []);
//     game.settings.set(moduleName, 'tokensFallback', tokens.slice(1));
//     updateSettings();
// }


// function updateFallbackSettings () {
    
//     const show = Object.values(getChoices()).some(Boolean);
//     const tokens = game.settings.get(moduleName, 'tokensFallback');
//     const main_token = game.settings.get(moduleName, 'tokens');

//     game.settings.settings.get()

//     game.settings.register(moduleName, 'tokensFallbackEnabled', {
//         name: "Enable Fallback",
//         hint: "Tokens to reset if main selection is empty.",
//         scope: "client",
//         config: show && tokens.length <= 0,
//         type: Boolean,
//         default: false,
//         onChange: (val) => { 
//             if (val && tokens.length<=0) {
//                 const main_token = game.settings.get(moduleName, 'tokens');
//                 game.settings.set(moduleName, 'tokensFallback', [Object.keys(tokenOptions).filter(o=>o!=main_token)[0]]);
//             }
//         },
//     });
//     if (tokens.length<=0) { game.settings.set(moduleName, 'tokensFallbackEnabled', false); }

//     let rem_tokens = Object.fromEntries(Object.entries(tokenOptions).filter(([k,v])=>k!==main_token));
//     // let rem_tokens = {...tokenOptions};

//     for (let i=0; i<Object.keys(tokenOptions).length-1; i++) {

//         game.settings.register(moduleName, `tokensFallback${i+1}`, {
//             name: `Fallback ${i+1}`,
//             scope: "client",
//             config: show && (i<=tokens.length && tokens.length>0),
//             type: String,
//             choices: {...rem_tokens, none:'~None~'},
//             default: 'none',
//             onChange: (val) => {
//                 const tokens = game.settings.get(moduleName, 'tokensFallback');
//                 tokens[i] = val;
//                 game.settings.set(moduleName, 'tokensFallback', tokens);                
//             },
//         });

//         if (i<tokens.length) {
//             game.settings.set(moduleName, `tokensFallback${i+1}`, tokens[i]);
//             delete rem_tokens[tokens[i]];
//         } else if (i===tokens.length) {
//             game.settings.set(moduleName, `tokensFallback${i+1}`, 'none');
//         }

//     }
// }


