/*
 * SCHEME PLUGIN
 *
 * Support for writing Scheme in Waterbear
 */

(function(wb, Event){
 'use strict';
    var bscheme = new BiwaScheme.Interpreter(function(e, state) {
        console.error(e.message);
    });
    wb.runScript = function(script){
        var run = function(){
            wb.script = script;
            bscheme.evaluate(script, function(result) {
                if (result !== undefined && result !== BiwaScheme.undef) {
                    console.log(BiwaScheme.to_write(result));
                }
            });
        }
        run();
    }

    wb.writeScript = function(elements, view){
        var script = elements.map(function(elem){
            return wb.codeFromBlock(elem);
        }).join('');
        view.innerHTML = '<pre class="language-scheme">' + script + '</pre>';
    };

    wb.wrap = function(script){
        return "";
    }
    
    function runCurrentScripts(force){
        // console.log('runCurrentScripts: %s', runCurrentScripts.caller.name);
        if (!(wb.autorun || force)){
            // false alarm, we were notified of a script change, but user hasn't asked us to restart script
            return;
        }
        document.body.classList.add('running');
        if (!wb.scriptLoaded){
            console.log('not ready to run script yet, waiting');
            Event.on(document.body, 'wb-script-loaded', null, wb.runCurrentScripts);
            return;
        }else{
            console.log('ready to run script, let us proceed to the running of said script');
        }
        var blocks = wb.findAll(document.body, '.workspace .scripts_workspace');
        wb.runScript( wb.prettyScript(blocks) );
    }
    wb.runCurrentScripts = runCurrentScripts;
 
    function clearStage(event){
        wb.iframeReady = false;
        document.body.classList.remove('running');
        document.querySelector('.stageframe').contentWindow.postMessage(JSON.stringify({command: 'reset'}), '*');
    }
    wb.clearStage = clearStage;

    //TODO: add extra block types: In Scheme, everything is a value, and these need to be able to exist on their own
    // expose these globally so the Block/Label methods can find them
     wb.choiceLists = {
        boolean: ['#t', '#f'],
        keys: 'abcdefghijklmnopqrstuvwxyz0123456789*+-./'
            .split('').concat(['up', 'down', 'left', 'right',
            'backspace', 'tab', 'return', 'shift', 'ctrl', 'alt',
            'pause', 'capslock', 'esc', 'space', 'pageup', 'pagedown',
            'end', 'home', 'insert', 'del', 'numlock', 'scroll', 'meta']),
        blocktypes: ['step', 'expression', 'context', 'eventhandler', 'asset'],
        types: ['string', 'number', 'boolean', 'array', 'object', 'function', 'any'],
        rettypes: ['none', 'string', 'number', 'boolean', 'array', 'object', 'function', 'any']
    };
    
     wb.prettyScript = function(elements){
        return elements.map(function(elem){
            return wb.codeFromBlock(elem);
        }).join('');
    };
})(wb, Event);
