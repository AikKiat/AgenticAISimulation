

import os
from typing_extensions import Dict
import httpx
from constants import SimulatorAction
SIMULATOR_URL = os.environ.get("SIMULATOR_URL", "http://localhost:4000")

#Simulator code
def get_simulator_state() -> Dict:
    with httpx.Client(timeout=10.0) as client:
        resp = client.get(f"{SIMULATOR_URL}/env/state")
        resp.raise_for_status()
        return resp.json()


def reset_simulator() -> Dict:
    with httpx.Client(timeout=10.0) as client:
        resp = client.post(f"{SIMULATOR_URL}/env/reset")
        resp.raise_for_status()
        return resp.json()


def step_simulator(action: SimulatorAction, rationale: str, past_choices_analysis : str) -> Dict:
    with httpx.Client(timeout=10.0) as client:
        payload = {**action, "rationale": rationale, "past_choices_analysis" : past_choices_analysis}
        resp = client.post(
            f"{SIMULATOR_URL}/env/step",
            json=payload,
        )
        resp.raise_for_status()
        return resp.json()

