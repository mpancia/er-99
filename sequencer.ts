//SEQUENCER STUFF
let sequencer = {};
let playing = false;
let tempo = 120;
let tempoInMs = 60 * 1000 / (4 * tempo);
let current_step = 0;
let sequencerTimeout:number;
let active_instrument_id:string = 'bd';
let start_button:HTMLButtonElement;
const SEQUENCE_LENGTH:number = 16;

function initSequence(id:string){
    sequencer[id] = presets[0][id]; //[0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0];
}

function toggleSequence(){
    if (playing) {
        clearTimeout(sequencerTimeout);
        playing = false;
        start_button.className = 'big_button'
    } else {
        playing = true;
        playNextStep();
        start_button.className = 'big_button active'
    }
    screenDiv.innerText = playing ? 'STA' : 'STP';
}

function selectInstrument(){
    
}

function clearTrack(){
    for (let i:number = 0; i < SEQUENCE_LENGTH; i++){
        sequencer[active_instrument_id][i] = 0;
    }
    updateSequenceDisplay();
}

function playNextStep(){
    current_step++;
    if (current_step > SEQUENCE_LENGTH-1) current_step = 0;
    for (let inst_key in sequencer) {
        if (sequencer[inst_key][current_step]) {
            playNote(inst_key, sequencer[inst_key][current_step] == 2 ? true : false);
        }
    }

    
    var nextStepInMs = tempoInMs;
    if (globalParams.swing > 0) {
        var swing_offset = tempoInMs * (1 - 16.0 / (16.0 + globalParams.swing));

        if (current_step % 2 == 1) {
            nextStepInMs = tempoInMs - swing_offset;
        } else {
            nextStepInMs = tempoInMs + swing_offset; 
        }
        
    }

    sequencerTimeout = setTimeout(playNextStep, nextStepInMs);
    updateSequenceDisplay();
}

function updateSequenceDisplay(){
    document.querySelectorAll('.sequencer_button').forEach(function(button, idx){
        if ((idx == current_step && playing) || sequencer[active_instrument_id][idx] == 2) {
            button.className = 'sequencer_button playing';
        } else if (sequencer[active_instrument_id][idx] == 1){
            button.className = 'sequencer_button active';
        } else {
            button.className = 'sequencer_button';
        }
    });
}

function onSequencerButtonClick(event){
    console.log('clicked seq button');
    var target = event.target;
    if (event.target.className == 'squareled') {
        target = event.target.parent;
    }
    if (target.getAttribute('data-step')) {
        var step = parseInt(event.target.getAttribute('data-step')) - 1;
        console.log(step);
        sequencer[active_instrument_id][step] += 1;
        if (sequencer[active_instrument_id][step] > 2) sequencer[active_instrument_id][step] = 0;
        updateSequenceDisplay();
        // console.log(step);
    }
}


function sequencerSetup(){
    document.querySelector('#sequencer').addEventListener('click', onSequencerButtonClick);

    start_button = document.querySelector('#start_button');
    start_button.addEventListener('click', toggleSequence);
    document.querySelector('#clear_button').addEventListener('click', clearTrack);
}

var presets = [
    {   //DISCO HOUSE
        'bd'  : [2,0,0,0, 2,0,0,0, 2,0,0,0, 2,0,0,0],
        'sd'  : [0,0,0,0, 1,0,0,1, 0,0,0,0, 0,0,0,0],
        'lt'  : [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
        'mt'  : [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
        'ht'  : [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
        'rs'  : [0,0,0,0, 0,0,1,0, 0,1,0,0, 1,0,0,2],
        'hc'  : [0,0,0,0, 1,0,0,0, 0,0,0,1, 0,0,0,0],
        'chh' : [0,0,2,1, 0,0,1,0, 0,0,2,1, 0,0,0,0],
        'ohh' : [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,1,0],
        'rc'  : [1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],       
        'cr'  : [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0]
    }
];
