


let envState = null;

const{appendLog} = require("./persistence");


// Deterministic gift schedule: cycles through 4 aid types
function generateGiftForDay(day) {
  const order = ['food_aid', 'medical_aid', 'peacekeeping', 'infrastructure_grant'];
  const idx = (day) % order.length;
  return { aid_type: order[idx] };
}



const AID_EFFECTS = {
  food_aid:      (country) => { country.foodInsecurity = Math.max(0, country.foodInsecurity - 15); },
  medical_aid:   (country) => { country.healthCrisis   = Math.max(0, country.healthCrisis   - 15); },
  peacekeeping:  (country) => { country.conflict       = Math.max(0, country.conflict       - 15); },
  infrastructure_grant: (country) => { country.infraDecay     = Math.max(0, country.infraDecay     - 15); }
};


function applyAid(countries, targetId, aidType) {
  const targetCountry = countries[targetId];
  
  if (!targetCountry) return;

  const chosenAidFunction = AID_EFFECTS[aidType];
  if (!chosenAidFunction) return;

  chosenAidFunction(targetCountry);
  targetCountry.recentAid.push(aidType);
}



function createInitialCountries() {
  return {
    "A" : {
      id :"A",
      name: 'Northland',
      welfare: 80,
      foodInsecurity: 40,
      healthCrisis: 30,
      conflict: 20,
      infraDecay: 35,
      recentAid: []
    },
    "B":
    {
      id :"B",
      name: 'Midria',
      welfare: 80,
      foodInsecurity: 40,
      healthCrisis: 30,
      conflict: 20,
      infraDecay: 35,
      recentAid: []
    },
    "C":
    {
      id :"C",
      name: 'Coastfall',
      welfare: 80,
      foodInsecurity: 40,
      healthCrisis: 30,
      conflict: 20,
      infraDecay: 35,
      recentAid: []
    }
  };
}

function newEpisodeId() {
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const rand = Math.random().toString(36).slice(2, 8);
  return `ep-${ts}-${rand}`;
}



function initEnv() {
  envState = {
      episodeId: newEpisodeId(),
      day: 1,
      countries: createInitialCountries(),
      done: false,
      reason: null,
      history: [],
      currentGift: generateGiftForDay(1),
      past_choices_analysis : null
  };

  appendLog({
      type: 'reset',
      episodeId: envState.episodeId,
      state: serializeState(envState)
  });
}

function serializeState(state) {
  return JSON.parse(JSON.stringify({
    episodeId: state.episodeId,
    day: state.day,
    countries: state.countries,
    done: state.done,
    reason: state.reason,
    currentGift: state.currentGift,
    past_choices_analysis : state.past_choices_analysis
  }));
}

function getEnvState() {
  return envState;
}

function setEnvState(state) {
  envState = state;
}



function stepDynamics(state, action) {
    if (state.done) return state;

    const { target_country_id, aid_type } = action;

    const countries = state.countries;

    // Snapshot of high-severity ailments BEFORE aid, for coupling logic
    const severityThreshold = 30;
    const prevSevere = {};

    for(let key of Object.keys(countries)){
        const country = countries[key];
        prevSevere[key] = {
            foodInsecurity: country.foodInsecurity >= severityThreshold,
            healthCrisis: country.healthCrisis >= severityThreshold,
            conflict: country.conflict >= severityThreshold,
            infraDecay: country.infraDecay >= severityThreshold
        };
    }

    applyAid(countries, target_country_id, aid_type);

    for(let key of Object.keys(countries)){
        countries[key].foodInsecurity = Math.min(100, countries[key].foodInsecurity + 2);
        countries[key].healthCrisis   = Math.min(100, countries[key].healthCrisis   + 2);
        countries[key].conflict       = Math.min(100, countries[key].conflict       + 3);
        countries[key].infraDecay     = Math.min(100, countries[key].infraDecay     + 1);
    }

    let hasDeadCountry = false;
    let deadCountry = null;

    for (let key of Object.keys(countries)) {
        const country = countries[key];

        let penalty = 0;

        if (country.foodInsecurity >= severityThreshold) {
            penalty += (country.foodInsecurity - severityThreshold) * 0.02;
        }
        if (country.healthCrisis >= severityThreshold) {
            penalty += (country.healthCrisis - severityThreshold) * 0.03;
        }
        if (country.conflict >= severityThreshold) {
            penalty += (country.conflict - severityThreshold) * 0.04;
        }
        if (country.infraDecay >= severityThreshold) {
            penalty += (country.infraDecay - severityThreshold) * 0.015;
        }

        country.welfare = Math.max(0, country.welfare - penalty);

        if (country.welfare <= 0) {
            hasDeadCountry = true;
            deadCountry = country;
            break;
        }
}

  const nextDay = state.day + 1;
  let done = false;
  let reason = null;

  if(hasDeadCountry === true && deadCountry !== null){
      done = true;
      reason = `Country ${deadCountry.name} collapsed (welfare <= 0)`;
  }
  
  else if (nextDay > 30) {
      done = true;
      reason = 'Survived 30 days';
  }

  return {
    ...state,
    day: nextDay,
    countries,
    done,
    reason,
    currentGift : generateGiftForDay(nextDay)
  };
}

module.exports = {generateGiftForDay, stepDynamics, initEnv, serializeState, getEnvState, setEnvState}
