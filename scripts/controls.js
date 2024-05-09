
import { settings } from "./settings.js";
import { resetMovement } from "./main.js";


const controls = {};

export function initControls() {
    Hooks.on("getSceneControlButtons", (_controls) => {
        const choices = settings.get('choices with perms');
        const needsButton = Object.values(choices).some(Boolean);
        const button = {
            name: 'reset-movement.button',
            title: "Reset Movement",
            icon: "fas fa-sync-alt",
            onClick: () => resetMovement(),
            button: true,
            active: needsButton,
            visible: needsButton,
        };
        _controls.find(c => c.name === "token").tools.push(button);
        controls.button = button;
    });
}

export function updateControls () {
    const choices = settings.get('choices with perms');
    const needsButton = Object.values(choices).some(Boolean);
    if (needsButton) { 
        controls.button.active = true;
        controls.button.visible = true;
    } else { 
        controls.button.active = false;
        controls.button.visible = false;
    }
    ui.controls.render();
}
