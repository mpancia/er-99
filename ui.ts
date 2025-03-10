var screenDiv:HTMLDivElement;
let clicking:Boolean = false;
let clickedTarget:HTMLButtonElement;
let clickedInstrument:Instrument;
let clickedParam:string;
let clickedMaster:boolean = false;

var keymap = {
    49 : 'bd',  //   1
    50 : 'sd',  //   2
    51 : 'lt',  //   3
    52 : 'mt',  //   4
    53 : 'ht',  //   5
    54 : 'rs',  //   6
    55 : 'hc',  //   7
    56 : 'chh', //   9
    57 : 'ohh', //   0
    48 : 'rc',  //   0
    192 : 'cr',  // ` backtick
    
    96  : 'bd',  //   numpad 0
    97  : 'sd',  //   numpad 1
    100  : 'lt',  //   numpad 4
    101 : 'mt',  //   numpad 5
    102 : 'ht',  //   numpad 6
    99  : 'rs',  //   numpad 3
    98  : 'hc',  //   numpad 2
    104 : 'chh', //   numpad 8
    105 : 'ohh', //   numpad 9
    103 : 'rc',  //   numpad 7
    110 : 'cr'  // ` numpad .
}

function notePlayed(instrument_id){
    playNote(instrument_id, false)
    active_instrument_id = instrument_id;
    screenDiv.innerText  = instrument_id.padStart(3, ' ');
    selectInstrument();
    updateSequenceDisplay();
}

function notePressed(event){
    var instrument_id = event.currentTarget.getAttribute('data-id');
    notePlayed(instrument_id);
}

function keyPressed(event){
    if (!running) setupAudio();

    if (keymap[event.which]) {
        notePlayed(keymap[event.which]);

    } else if (event.which == 32) {
        toggleSequence();
    }
    return false;
}


function clickKnob(event) {
    if (!running) setupAudio();

    clickedInstrument = instruments_table[event.currentTarget.getAttribute('data-instrument')];
    clickedMaster = event.target.getAttribute('data-control') == 'master';
    if (clickedInstrument || clickedMaster) {
        clickedParam = event.currentTarget.getAttribute('data-param');
    } 
    clickedTarget = event.currentTarget;
    clicking = true;
}

function onMouseUp(event) {
    clicking = false;
    clickedTarget = null;
}

function onMouseMove(event) {
    if (clicking && clickedTarget) {
        var min = parseFloat(clickedTarget.getAttribute('data-range-min') || '0') || 0.0;
        var max = parseFloat(clickedTarget.getAttribute('data-range-max') || '100') || 100.0;
        var increment = (max - min) / 100.0;
        var newValue = Math.min(max, Math.max(min, parseFloat(clickedTarget.value) + (increment * (-1 * event.movementY + event.movementX))));
        var rotation = 0;
        rotation = (newValue - min) / max * 280.0 - 140;

        clickedTarget.style.transform = 'rotate(' + rotation.toString() + 'deg)';
        clickedTarget.value = newValue.toString();

        var scalar = 1.0;
        if (clickedTarget.getAttribute('data-scaling') == 'exp') {
            scalar = (newValue / max - min);
        }

        if (clickedInstrument) {
            clickedInstrument[clickedParam] = newValue * scalar;
        } else if (clickedMaster) {
            globalParams[clickedParam] = newValue * scalar;
            switch (clickedParam) {
                case 'volume' : mainGainNode.gain.value = newValue; break;
                case 'tempo'  : tempo = newValue; tempoInMs = 60 * 1000 / (4 * tempo); break;
                case 'compression' : compressor.threshold.value = newValue * -1; makeup.gain.value = 1.0 + (newValue / 40); console.log(makeup.gain.value); break;
            }
        } 

        if (clickedTarget.getAttribute('data-show-actual-value') == 'yes') {
            var display_value = newValue;
        } else {
            var display_value = 100.0 * (newValue / max);
        }
        var s = Math.floor(display_value).toString();
        var display_string = s.padStart(3, '0');
        screenDiv.innerText =display_string; 

    }
}

function setup(){
    document.addEventListener("mousedown", setupAudio);
    document.addEventListener("keydown", setupAudio);

    document.addEventListener("keydown", keyPressed);
    // document.addEventListener("keyup", keyUp, false);

    var controls = document.querySelectorAll("button.knob");
    for (let i = 0; i < controls.length; i++) {
        controls[i].addEventListener("mousedown", clickKnob);
    }

    var instruments = document.querySelectorAll(".instrument_name");
    for (let i = 0; i < instruments.length; i++) {
        instruments[i].addEventListener("mousedown", notePressed);
    }

    screenDiv = document.querySelector('#screen');

    document.body.addEventListener('mousemove', onMouseMove);
    document.body.addEventListener('mouseup', onMouseUp);

    // volumeControl = document.querySelector("input[name='volume']");
    // volumeControl.addEventListener("change", changeVolume, false);

    sequencerSetup();
    

    active_instrument_id = 'bd';
    selectInstrument();
}
