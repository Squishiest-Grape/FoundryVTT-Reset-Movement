
export const dynamicSettings = {};

export function addDynamicSettings (moduleName, settings=[]) {
    console.log(`Attached Dynamic Settings ${moduleName}[${settings}]`)
    if (!(moduleName in dynamicSettings)) { dynamicSettings[moduleName] = new Set(); }
    for (const setting of settings) {
        dynamicSettings[moduleName].add(setting);
    }
}
export function delDynamicSettings (moduleName, settings=[]) {
    console.log(`Removed Dynamic Settings ${moduleName}[${settings}]`)
    if (!(moduleName in dynamicSettings)) { return; }
    for (const setting of settings) {
        dynamicSettings[moduleName].delete(setting);
    }
}

function getVal (e) {
    if (e.type==='checkbox') { return e.checked; }
    return e.value;
}

function attachFormWatcher () {
    console.log('Started new form watcher')
    for (const moduleName of Object.keys(dynamicSettings)) {
        const form = $(game.settings.sheet.form).find(`.tab.category.active[data-tab=${moduleName}]`)
        for (const s of dynamicSettings[moduleName]) {
            const e = form.find(`[name='${moduleName}.${s}']`);
            e.on('change',()=>{
                const v = getVal(e[0]);
                game.settings.set(moduleName,s,v);
                console.log(`Form Watcher: ${moduleName}.${s}=${v}`);
                console.log(v);
            });
        }
    }
}

Hooks.on('renderSettingsConfig',attachFormWatcher);