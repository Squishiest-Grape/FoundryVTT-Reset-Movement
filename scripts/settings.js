
import { updateControls } from "./controls.js";
import { addDynamicSettings, dynamicSettings } from "./dynamicSettings.js";


const moduleName = 'reset-movement';
const playerPerms = {
    none: 'None',
    history: 'History Only',
    position: 'Position Only',
    all: 'History & Position',
};
const tokenOptions = {
    selected: 'Selected Token',
    user: 'Main User Token',
    turn: 'Token with Current Turn',
    combat: 'All Tokens in Combat',
    all: 'All Tokens on Scene',
};


export function initSettings() {

    game.settings.register(moduleName, 'animation', {
        name: "Animate Movement",
        hint: "Movement is animated on reset.",
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
    });

    game.settings.register(moduleName, 'playerPerms', {
        name: "Player Permisions",
        hint: "What players are allowed to reset.",
        scope: "world",
        config: true,
        type: String,
        choices: playerPerms,
        default: 'none',
        requiresReload: true,
    });

    game.settings.register(moduleName, 'perms', {
        name: "User Permisions",
        scope: "client",
        config: false,
        type: Object,
    });

    game.settings.register(moduleName, 'history', {
        name: "Reset History",
        hint: "Reset Drag-Ruler history during reset.",
        scope: "client",
        config: false,
        type: Boolean,
        default: true,
        onChange: ()=>{updateControls(); updateSettings();},
    });

    game.settings.register(moduleName, 'position', {
        name: "Reset Position",
        hint: "Reset token to last turn position during reset.",
        scope: "client",
        config: false,
        type: Boolean,
        default: true,
        onChange: ()=>{updateControls(); updateSettings();},
    });

    game.settings.register(moduleName, 'tokens', {
        name: "Tokens to Reset",
        hint: "Control which tokens are reset.",
        scope: "client",
        config: false,
        type: String,
        choices: tokenOptions,
        default: 'selected',
        onChange: updateSettings,
    });

    game.settings.register(moduleName, 'tokensFallback', {
        name: "Fallback Tokens Selection",
        scope: "client",
        config: false,
        type: Array,
        default: [],
        onChange: verifyFallback,
    });

    game.settings.register(moduleName, 'tokensFallbackEnabled', {
        name: "Enable Fallback",
        hint: "Tokens to reset if main selection is empty.",
        scope: "client",
        config: false,
        type: Boolean,
        default: false,
        onChange: (val) => { 
            const tokens = game.settings.get(moduleName, 'tokensFallback');
            if (val && tokens.length<=0) {
                const main_token = game.settings.get(moduleName, 'tokens');
                game.settings.set(moduleName, 'tokensFallback', [Object.keys(tokenOptions).filter(o=>o!=main_token)[0]]);
            }
        },
    });

    for (let i=0; i<Object.keys(tokenOptions).length-1; i++) {
        game.settings.register(moduleName, `tokensFallback${i+1}`, {
            name: `Fallback ${i+1}`,
            scope: "client",
            config: false,
            type: String,
            choices: {},
            onChange: (val) => {
                const tokens = game.settings.get(moduleName, 'tokensFallback');
                tokens[i] = val;
                game.settings.set(moduleName, 'tokensFallback', tokens);                
            },
        });
    }

}

function preRender () {
    

}






function getPerms () {
    const isGM = game.user.isGM;
    const playerPerms = game.settings.get(moduleName, 'playerPerms');
    const options =  {history: false, position:false }
    if (isGM || playerPerms==='all') { for (const k in options) { options[k]=true; } }
    else if (playerPerms==='history') { options.history = true; }
    else if (playerPerms==='position') { options.position = true; }
    else if (playerPerms==='none') {} 
    else { throw new Error(`Unknown player permision for Reset Movement: ${playerPerms}`); }
    return options;
}

export function getChoices () {
    const perms = game.settings.get(moduleName,'perms');
    const options = {};
    for (const [k,v] of Object.entries(perms)) {
        options[k] = v && game.settings.get(moduleName,k);
    }
    return options;
}


export function readySettings() {

    const perms = getPerms();
    game.settings.set(moduleName,'perms',perms);

    const show = Object.values(perms).some(Boolean);

    game.settings.register(moduleName, 'tokens', {
        name: "Tokens to Reset",
        hint: "Control which tokens are reset.",
        scope: "client",
        config: false,
        type: String,
        choices: tokenOptions,
        default: 'selected',
        onChange: updateSettings,
    });

    game.settings.register(moduleName, 'tokensFallback', {
        name: "Fallback Tokens Selection",
        scope: "client",
        config: false,
        type: Array,
        default: [],
        onChange: verifyFallback,
    });
    verifyFallback();

}

export function getSelectionOrder () {
    return [game.settings.get(moduleName, 'tokens'), ...game.settings.get(moduleName, 'tokensFallback')];
}

function verifyFallback () {
    const tokens = getSelectionOrder().reduce((acc, cur) => {
        if (!acc.includes(cur) && cur in tokenOptions) { acc.push(cur); }
        return acc;
    }, []);
    game.settings.set(moduleName, 'tokensFallback', tokens.slice(1));
    updateSettings();
}

function updateSettings () {
    updateFallbackSettings();
    if (game.settings.sheet.rendered) { game.settings.sheet.render(); }
}


















function updateFallbackSettings () {
    
    const show = Object.values(getChoices()).some(Boolean);
    const tokens = game.settings.get(moduleName, 'tokensFallback');
    const main_token = game.settings.get(moduleName, 'tokens');

    game.settings.settings.get()

    game.settings.register(moduleName, 'tokensFallbackEnabled', {
        name: "Enable Fallback",
        hint: "Tokens to reset if main selection is empty.",
        scope: "client",
        config: show && tokens.length <= 0,
        type: Boolean,
        default: false,
        onChange: (val) => { 
            if (val && tokens.length<=0) {
                const main_token = game.settings.get(moduleName, 'tokens');
                game.settings.set(moduleName, 'tokensFallback', [Object.keys(tokenOptions).filter(o=>o!=main_token)[0]]);
            }
        },
    });
    if (tokens.length<=0) { game.settings.set(moduleName, 'tokensFallbackEnabled', false); }

    let rem_tokens = Object.fromEntries(Object.entries(tokenOptions).filter(([k,v])=>k!==main_token));
    // let rem_tokens = {...tokenOptions};

    for (let i=0; i<Object.keys(tokenOptions).length-1; i++) {

        game.settings.register(moduleName, `tokensFallback${i+1}`, {
            name: `Fallback ${i+1}`,
            scope: "client",
            config: show && (i<=tokens.length && tokens.length>0),
            type: String,
            choices: {...rem_tokens, none:'~None~'},
            default: 'none',
            onChange: (val) => {
                const tokens = game.settings.get(moduleName, 'tokensFallback');
                tokens[i] = val;
                game.settings.set(moduleName, 'tokensFallback', tokens);                
            },
        });

        if (i<tokens.length) {
            game.settings.set(moduleName, `tokensFallback${i+1}`, tokens[i]);
            delete rem_tokens[tokens[i]];
        } else if (i===tokens.length) {
            game.settings.set(moduleName, `tokensFallback${i+1}`, 'none');
        }

    }
}

const dynamic_settings = ['history','position','tokens','tokensFallbackEnabled'];
for (let i=0; i<Object.keys(tokenOptions).length-1; i++) {
    dynamic_settings.push(`tokensFallback${i+1}`);
}


addDynamicSettings(moduleName, dynamic_settings);

