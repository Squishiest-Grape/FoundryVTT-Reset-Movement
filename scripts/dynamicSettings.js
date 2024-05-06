
Hooks.on('getSettingsConfigEntryContext', update_settings);
Hooks.on('renderSettingsConfig', attachFormWatcher);


const dynamic_settings_list = []

export class Dynamic_Settings {
    
    #module_name;
    #settings;
    #callbacks;
    #value_list;
    #inst_list;
    #sub_val_list;

    constructor (module_name) {
        this.#module_name = module_name;
        this.#settings = {};
        this.#callbacks = [];
        this.#value_list = new Set();
        this.#inst_list = new Set();
        this.#sub_val_list = {};
        dynamic_settings_list.push(this);
    }

    register (key, data={}) {
        const [main_key, sub_key] = split_key(key);
        data.main_key = main_key;
        data.sub_key = sub_key;
        this.#settings[key] = data;
        const game_data = {}
        for (const [p,v] of Object.entries(data)) {
            if ((p!=='onChange' || p!=='type') && typeof v === 'function') {
                switch (p) {
                    case 'name': game_data[p] = ''; break;
                    case 'type': game_data[p] = {}; break;
                    case 'scope': game_data[p] = 'world'; break;
                    default: break;
                }
                this.#callbacks.push([key,p,v]);
            } else if (p==='value') { 
                this.#callbacks.push([key,p,()=>v]);
            } else {
                game_data[p] = v;
            }
        }
        if ('value' in data) { this.#value_list.add(key); }
        if ('instant' in data) { this.#inst_list.add(key); }
        if (sub_key !== null) { 
            if (!(main_key in this.#sub_val_list)) { this.#sub_val_list[main_key] = new Set(); }
            this.#sub_val_list[main_key].add(sub_key);
        }
        game.settings.register(this.#module_name,key,game_data);
    }

    set (key, val) {
        const main_key = this.#settings[key].main_key;
        const sub_key = this.#settings[key].sub_key;
        if (sub_key === null) {
            game.settings.set(this.#module_name, main_key, val);
        } else {
            eval(`game.settings.get(${this.#module_name},${main_key})${sub_key} = val`)
        }
        update_settings();
    }

    get (key) {
        const main_key = this.#settings[key].main_key;
        const sub_key = this.#settings[key].sub_key;
        if (sub_key === null) {
            return game.settings.get(this.#module_name, main_key);
        } else {
            const org_val = game.settings.get(this.#module_name, main_key);
            return eval(`org_val${sub_key}`);
        }
    }

    #get_props (key) {
        game.settings.setting.get(this.#module_name+'.'+key);
    }

    _update () {
        // handle calculated properties
        for (const [k,p,c] of this.#callbacks) {
            this.#get_props(k)[p] = c();
        }
        // handle subvalues

        // handle set values
        for (const k of this.#value_list) {
            this.set(k,this.#get_props(k));
        }
        


    }

    _prep_sheet () {
        // handle instant change calcs
        if (this.#inst_list.size>0) {
            const form = $(game.settings.sheet.form).find(`.tab.category.active[data-tab=${this.#module_name}]`)
            for (const k of this.#inst_list) {
                if (game.settings.settings[this.#module_name+'.'+k]['instant']) {
                    const e = form.find(`[name='${this.#module_name}.${k}']`);
                    e.on('change',()=>{
                        const v = getVal(e[0]);
                        this.set(k,v);
                        console.log(`Form Watcher Changed: ${this.#module_name}.${k}=${v}`);
                    });
                }
            }
        }
        // handle updating main objects


    }



}

function split_key (key) {
    const [main,...rest] = key.split(/(\.|\[)/);
    const sub = (rest.length>0) ? rest.join('') : null;
    return [main,sub];
}


export function update_settings (skip=null) {
    for (const ds of dynamic_settings_list) { ds._update(); }
}

function attachFormWatcher () {
    console.log('Started new form watcher')
    for (const ds of dynamic_settings_list) {
        ds._make_instant();
    }
}

function getVal (e) {
    if (e.type==='checkbox') { return e.checked; }
    return e.value;
}


