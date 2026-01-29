


const { stepDynamics, initEnv, serializeState, getEnvState, setEnvState } = require("./simulator");
const {appendLog} = require("./persistence");

const express = require("express");
const router = express.Router();



router.post('/reset', (req, res) => {
  initEnv();
  res.json(serializeState(getEnvState()));
});

router.get('/state', (req, res) => {
  if (getEnvState() == null) {
    initEnv();
  }
  const state = getEnvState();
  res.json(serializeState(state));
});

router.post('/step', (req, res) => {
  if (getEnvState() == null) {
    initEnv();
  }
  const currentState = getEnvState();

  if (currentState.done) {
    return res.status(400).json({
      error: 'Episode already finished',
      state: serializeState(currentState)
    });
  }

  const { target_country_id, aid_type, rationale, past_choices_analysis } = req.body || {};

  if (!target_country_id || !['A', 'B', 'C'].includes(target_country_id)) {
    return res.status(400).json({ error: 'Invalid or missing target_country_id' });
  }

  if (!aid_type) {
    return res.status(400).json({ error: 'Invalid or missing aid_type' });
  }

  const prevState = serializeState(currentState);
  const nextState = stepDynamics(currentState, { target_country_id, aid_type });

  nextState.reason = rationale;
  nextState.past_choices_analysis = past_choices_analysis;

  nextState.history.push({
    day: nextState.day,
    action: { target_country_id, aid_type },
    state: serializeState(nextState),
    past_choices_analysis : past_choices_analysis,
    rationale : rationale
  });

  setEnvState(nextState);

  appendLog({
    type: 'step',
    episodeId: nextState.episodeId,
    action: { target_country_id, aid_type },
    prevState,
    nextState: serializeState(nextState)
  });

  res.json(serializeState(nextState));
});

router.get('/history', (req, res) => {
  let state = getEnvState();
  if (!state) {
    initEnv();
    state = getEnvState();
  }
  res.json({
    episodeId: state.episodeId,
    history: state.history,
  });
});


module.exports = router;